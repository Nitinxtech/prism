import base64
import json
import os
import secrets
import time
import urllib.error
import urllib.parse
import urllib.request

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
from app.models.domain import AskRequest
from app.ai.services import OpportunityFinder, CodebaseAnalyzer, DependencyAnalyzer, ArchitectureAnalyzer, ExpertFinder, AskPrism, AzureDevOpsAnalyzer
from app.context.engine import ContextEngine
from app.connectors.mock import MockConnector

router=APIRouter(prefix="/api/developer",tags=["developer"])
ctx=ContextEngine(MockConnector())
azure_oauth_state: dict[str, tuple[float, str]] = {}
azure_connection_status = {
    "connected": False,
    "devops_connected": False,
    "connected_at": None,
    "account_name": None,
    "tenant_id": None,
}
azure_access_token: str | None = None
azure_token_expires_at: float = 0
azure_devops_access_token: str | None = None
azure_devops_token_expires_at: float = 0
azure_devops_inventory_cache = None


def _azure_config():
    return {
        "tenant_id": os.getenv("AZURE_TENANT_ID", "common"),
        "client_id": os.getenv("AZURE_CLIENT_ID", ""),
        "client_secret": os.getenv("AZURE_CLIENT_SECRET", ""),
        "redirect_uri": os.getenv(
            "AZURE_REDIRECT_URI",
            "http://localhost:8000/api/developer/integrations/azure/callback",
        ),
        "scopes": os.getenv(
            "AZURE_SCOPES",
            "openid profile email offline_access https://management.azure.com/user_impersonation",
        ),
        "devops_scopes": os.getenv(
            "AZURE_DEVOPS_SCOPES",
            "openid profile email offline_access 499b84ac-1321-427f-aa17-267ca6975798/user_impersonation",
        ),
    }


def _decode_jwt_payload(token: str):
    parts = token.split(".")
    if len(parts) < 2:
        return {}
    payload = parts[1]
    padded = payload + "=" * (-len(payload) % 4)
    try:
        decoded = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
        return json.loads(decoded)
    except Exception:
        return {}


def _azure_get_all(url: str, access_token: str):
    values = []
    while url:
        req = urllib.request.Request(
            url,
            headers={"Authorization": f"Bearer {access_token}"},
            method="GET",
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            raise HTTPException(502, f"Azure Resource Manager request failed ({exc.code})")
        except Exception:
            raise HTTPException(502, "Azure Resource Manager request failed")

        values.extend(payload.get("value", []))
        url = payload.get("nextLink")
    return values


def _azure_devops_request(
    url: str,
    access_token: str,
    method: str = "GET",
    body=None,
    allow_not_found: bool = False,
    operation: str = "request",
):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if allow_not_found and exc.code == 404:
            return {}
        raise HTTPException(502, f"Azure DevOps {operation} failed ({exc.code})")
    except Exception:
        raise HTTPException(502, f"Azure DevOps {operation} failed")


def _azure_devops_inventory(organization: str | None = None):
    if not azure_devops_access_token or azure_devops_token_expires_at <= time.time():
        raise HTTPException(401, "Azure DevOps connection has expired. Connect Azure DevOps again.")

    if organization:
        organization_name = organization.strip()
        accounts = [{
            "accountId": organization_name,
            "accountName": organization_name,
            "accountUri": f"https://dev.azure.com/{urllib.parse.quote(organization_name)}",
        }]
    else:
        profile = _azure_devops_request(
            "https://app.vssps.visualstudio.com/_apis/profile/profiles/me?api-version=7.1",
            azure_devops_access_token,
            operation="profile lookup",
        )
        accounts = _azure_devops_request(
            f"https://app.vssps.visualstudio.com/_apis/accounts?memberId={urllib.parse.quote(profile['id'])}&api-version=7.1",
            azure_devops_access_token,
            operation="organization discovery",
        ).get("value", [])
    organizations = []
    for account in accounts:
        organization_name = account["accountName"]
        organization_url = f"https://dev.azure.com/{urllib.parse.quote(organization_name)}"
        projects = _azure_devops_request(
            f"{organization_url}/_apis/projects?api-version=7.1",
            azure_devops_access_token,
            operation="project discovery",
        ).get("value", [])
        project_data = []
        for project_item in projects:
            project_id = urllib.parse.quote(project_item["id"])
            repositories = _azure_devops_request(
                f"{organization_url}/{project_id}/_apis/git/repositories?api-version=7.1",
                azure_devops_access_token,
                operation="repository discovery",
            ).get("value", [])
            wiql = _azure_devops_request(
                f"{organization_url}/{project_id}/_apis/wit/wiql?api-version=7.1",
                azure_devops_access_token,
                "POST",
                {"query": "SELECT [System.Id] FROM WorkItems ORDER BY [System.ChangedDate] DESC"},
                operation="work item query",
            )
            work_item_ids = [item["id"] for item in wiql.get("workItems", [])[:200]]
            work_items = []
            if work_item_ids:
                ids = ",".join(str(item_id) for item_id in work_item_ids)
                work_items = _azure_devops_request(
                    f"{organization_url}/{project_id}/_apis/wit/workitems?ids={ids}&$expand=Fields&api-version=7.1",
                    azure_devops_access_token,
                    operation="work item retrieval",
                ).get("value", [])
            repository_data = []
            for repository in repositories:
                repository_id = urllib.parse.quote(repository["id"])
                branches = _azure_devops_request(
                    f"{organization_url}/{project_id}/_apis/git/repositories/{repository_id}/refs?filter=heads/&api-version=7.1",
                    azure_devops_access_token,
                    allow_not_found=True,
                    operation="branch discovery",
                ).get("value", [])
                files = _azure_devops_request(
                    f"{organization_url}/{project_id}/_apis/git/repositories/{repository_id}/items?recursionLevel=Full&includeContentMetadata=true&api-version=7.1",
                    azure_devops_access_token,
                    allow_not_found=True,
                    operation="repository file listing",
                ).get("value", [])
                repository_data.append(
                    {
                        "id": repository["id"],
                        "name": repository["name"],
                        "web_url": repository.get("webUrl"),
                        "default_branch": repository.get("defaultBranch"),
                        "branches": [
                            {"name": str(branch.get("name") or "").removeprefix("refs/heads/"), "object_id": branch.get("objectId")}
                            for branch in branches
                        ],
                        "files": [
                            {
                                "path": file_item.get("path", ""),
                                "is_folder": file_item.get("isFolder", False),
                                "size": (file_item.get("contentMetadata") or {}).get("fileSize"),
                            }
                            for file_item in files
                        ],
                    }
                )
            project_data.append(
                {
                    "id": project_item["id"],
                    "name": project_item["name"],
                    "state": project_item.get("state"),
                    "work_items": [
                        {
                            "id": item["id"],
                            "title": item.get("fields", {}).get("System.Title"),
                            "type": item.get("fields", {}).get("System.WorkItemType"),
                            "state": item.get("fields", {}).get("System.State"),
                            "assigned_to": (
                                item.get("fields", {}).get("System.AssignedTo", {}).get("displayName")
                                if isinstance(item.get("fields", {}).get("System.AssignedTo"), dict)
                                else item.get("fields", {}).get("System.AssignedTo")
                            ),
                        }
                        for item in work_items
                    ],
                    "repositories": repository_data,
                }
            )
        organizations.append({"id": account["accountId"], "name": organization_name, "projects": project_data})
    return {"organizations": organizations}


def project(): return ctx.get_project_context("phoenix")

@router.get("/home")
def home():
    p=project(); opps=OpportunityFinder().run(p,"dev-sam")
    return {"developer":{"id":"dev-sam","name":"Sam"},"project":{"id":p.id,"name":p.name,"client":p.client},"stats":{"opportunities":len(opps),"open_tasks":len([w for w in p.work_items if w.status!="Done"]),"attention_areas":2,"experts_available":len(p.team)-1},"opportunities":opps[:3],"dependency_alerts":[d for d in p.dependencies if d.status!="Current"],"focus":["Payment Service","API authentication","Dependency migration"]}

@router.get("/opportunities")
def opportunities(): return OpportunityFinder().run(project(),"dev-sam")
@router.get("/codebase-insights")
def codebase(): return CodebaseAnalyzer().run(project())
@router.get("/dependencies")
def dependencies(): return DependencyAnalyzer().run(project())
@router.get("/dependencies/{dep_id}/impact")
def dep_impact(dep_id:str):
    try:return DependencyAnalyzer().impact(project(),dep_id)
    except StopIteration: raise HTTPException(404,"Dependency not found")
@router.get("/system/graph")
def system_graph(): return ArchitectureAnalyzer().graph(project())
@router.get("/system/components/{component_id}")
def component(component_id:str):
    try:return ArchitectureAnalyzer().component(project(),component_id)
    except StopIteration: raise HTTPException(404,"Component not found")
@router.get("/collaborate/find-experts")
def experts(q:str="authentication"): return ExpertFinder().run(project(),q)
@router.post("/ask")
def ask(req:AskRequest): return AskPrism().run(project(),req.question,req.developer_id)


@router.get("/integrations/azure/connect")
def azure_connect(service: str = "management"):
    cfg = _azure_config()
    if not cfg["client_id"]:
        raise HTTPException(500, "AZURE_CLIENT_ID is not configured")
    if service not in {"management", "devops"}:
        raise HTTPException(400, "Unsupported Azure connection service")

    state = secrets.token_urlsafe(24)
    azure_oauth_state[state] = (time.time() + 600, service)
    query = urllib.parse.urlencode(
        {
            "client_id": cfg["client_id"],
            "response_type": "code",
            "redirect_uri": cfg["redirect_uri"],
            "response_mode": "query",
            "scope": cfg["devops_scopes"] if service == "devops" else cfg["scopes"],
            "state": state,
        }
    )
    auth_url = f"https://login.microsoftonline.com/{cfg['tenant_id']}/oauth2/v2.0/authorize?{query}"
    return {"auth_url": auth_url, "state": state}


@router.get("/integrations/azure/callback", response_class=HTMLResponse)
def azure_callback(code: str | None = None, state: str | None = None, error: str | None = None):
    global azure_access_token, azure_token_expires_at, azure_devops_access_token, azure_devops_token_expires_at
    if error:
        return HTMLResponse(
            f"<html><body><h3>Azure connection failed</h3><p>{error}</p><script>window.close();</script></body></html>",
            status_code=400,
        )

    if not code or not state:
        return HTMLResponse(
            "<html><body><h3>Missing OAuth parameters.</h3></body></html>",
            status_code=400,
        )

    exp, service = azure_oauth_state.pop(state, (0, ""))
    if exp < time.time():
        return HTMLResponse(
            "<html><body><h3>Invalid or expired OAuth state.</h3></body></html>",
            status_code=400,
        )

    cfg = _azure_config()
    if not cfg["client_id"] or not cfg["client_secret"]:
        return HTMLResponse(
            "<html><body><h3>Azure credentials are not configured on server.</h3></body></html>",
            status_code=500,
        )

    token_url = f"https://login.microsoftonline.com/{cfg['tenant_id']}/oauth2/v2.0/token"
    body = urllib.parse.urlencode(
        {
            "client_id": cfg["client_id"],
            "client_secret": cfg["client_secret"],
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": cfg["redirect_uri"],
            "scope": cfg["devops_scopes"] if service == "devops" else cfg["scopes"],
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        token_url,
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8") if exc.fp else ""
        return HTMLResponse(
            f"<html><body><h3>Token exchange failed.</h3><pre>{details}</pre></body></html>",
            status_code=502,
        )
    except Exception as exc:
        return HTMLResponse(
            f"<html><body><h3>Token exchange failed.</h3><p>{exc}</p></body></html>",
            status_code=502,
        )

    id_claims = _decode_jwt_payload(payload.get("id_token", ""))
    token_expires_at = time.time() + int(payload.get("expires_in", 0))
    if service == "devops":
        azure_devops_access_token = payload.get("access_token")
        azure_devops_token_expires_at = token_expires_at
        azure_connection_status["devops_connected"] = True
    else:
        azure_access_token = payload.get("access_token")
        azure_token_expires_at = token_expires_at
        azure_connection_status["connected"] = True
    azure_connection_status["connected_at"] = int(time.time())
    azure_connection_status["account_name"] = id_claims.get("name") or id_claims.get("preferred_username")
    azure_connection_status["tenant_id"] = id_claims.get("tid") or cfg["tenant_id"]

    return HTMLResponse(
        "<html><body><h3>Azure account connected. You can close this window.</h3><script>window.close();</script></body></html>"
    )


@router.get("/integrations/azure/status")
def azure_status():
    return azure_connection_status


@router.get("/integrations/azure-devops/inventory")
def azure_devops_inventory(organization: str | None = None):
    global azure_devops_inventory_cache
    azure_devops_inventory_cache = _azure_devops_inventory(organization)
    return azure_devops_inventory_cache


@router.get("/integrations/azure-devops/insights")
def azure_devops_insights():
    global azure_devops_inventory_cache
    if not azure_devops_access_token or azure_devops_token_expires_at <= time.time():
        raise HTTPException(401, "Azure DevOps connection has expired. Connect Azure DevOps again.")
    if azure_devops_inventory_cache is None:
        azure_devops_inventory_cache = _azure_devops_inventory()
    return AzureDevOpsAnalyzer().run(azure_devops_inventory_cache)


@router.get("/integrations/azure-devops/organizations/{organization}/projects/{project}/repositories/{repository}/file")
def azure_devops_file(organization: str, project: str, repository: str, path: str):
    if not azure_devops_access_token or azure_devops_token_expires_at <= time.time():
        raise HTTPException(401, "Azure DevOps connection has expired. Connect Azure DevOps again.")
    organization_part = urllib.parse.quote(organization)
    project_part = urllib.parse.quote(project)
    repository_part = urllib.parse.quote(repository)
    path_part = urllib.parse.quote(path, safe="/")
    return _azure_devops_request(
        f"https://dev.azure.com/{organization_part}/{project_part}/_apis/git/repositories/{repository_part}/items?path={path_part}&includeContent=true&api-version=7.1",
        azure_devops_access_token,
    )


@router.get("/integrations/azure/inventory")
def azure_inventory():
    if not azure_access_token or azure_token_expires_at <= time.time():
        raise HTTPException(401, "Azure connection has expired. Connect Azure again.")

    subscriptions = _azure_get_all(
        "https://management.azure.com/subscriptions?api-version=2022-12-01",
        azure_access_token,
    )
    inventory = []
    total_resource_groups = 0
    total_resources = 0
    for subscription in subscriptions:
        subscription_id = subscription["subscriptionId"]
        resource_groups = _azure_get_all(
            f"https://management.azure.com/subscriptions/{subscription_id}/resourcegroups?api-version=2021-04-01",
            azure_access_token,
        )
        resources = _azure_get_all(
            f"https://management.azure.com/subscriptions/{subscription_id}/resources?api-version=2021-04-01",
            azure_access_token,
        )
        total_resource_groups += len(resource_groups)
        total_resources += len(resources)
        inventory.append(
            {
                "id": subscription_id,
                "name": subscription.get("displayName", subscription_id),
                "state": subscription.get("state"),
                "resource_groups": [
                    {"name": group["name"], "location": group.get("location")}
                    for group in resource_groups
                ],
                "resources": [
                    {
                        "id": resource["id"],
                        "name": resource["name"],
                        "type": resource["type"],
                        "location": resource.get("location"),
                        "resource_group": resource.get("resourceGroup"),
                    }
                    for resource in resources
                ],
            }
        )

    return {
        "summary": {
            "subscriptions": len(inventory),
            "resource_groups": total_resource_groups,
            "resources": total_resources,
        },
        "subscriptions": inventory,
    }
