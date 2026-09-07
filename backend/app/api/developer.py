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
from app.ai.services import OpportunityFinder, CodebaseAnalyzer, DependencyAnalyzer, ArchitectureAnalyzer, ExpertFinder, AskPrism
from app.context.engine import ContextEngine
from app.connectors.mock import MockConnector

router=APIRouter(prefix="/api/developer",tags=["developer"])
ctx=ContextEngine(MockConnector())
azure_oauth_state: dict[str, float] = {}
azure_connection_status = {
    "connected": False,
    "connected_at": None,
    "account_name": None,
    "tenant_id": None,
}


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
def azure_connect():
    cfg = _azure_config()
    if not cfg["client_id"]:
        raise HTTPException(500, "AZURE_CLIENT_ID is not configured")

    state = secrets.token_urlsafe(24)
    azure_oauth_state[state] = time.time() + 600
    query = urllib.parse.urlencode(
        {
            "client_id": cfg["client_id"],
            "response_type": "code",
            "redirect_uri": cfg["redirect_uri"],
            "response_mode": "query",
            "scope": cfg["scopes"],
            "state": state,
        }
    )
    auth_url = f"https://login.microsoftonline.com/{cfg['tenant_id']}/oauth2/v2.0/authorize?{query}"
    return {"auth_url": auth_url, "state": state}


@router.get("/integrations/azure/callback", response_class=HTMLResponse)
def azure_callback(code: str | None = None, state: str | None = None, error: str | None = None):
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

    exp = azure_oauth_state.pop(state, 0)
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
            "scope": cfg["scopes"],
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
