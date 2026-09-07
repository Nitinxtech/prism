from fastapi import APIRouter, HTTPException
from app.models.domain import AskRequest
from app.ai.services import OpportunityFinder, CodebaseAnalyzer, DependencyAnalyzer, ArchitectureAnalyzer, ExpertFinder, AskPrism
from app.context.engine import ContextEngine
from app.connectors.mock import MockConnector

router=APIRouter(prefix="/api/developer",tags=["developer"])
ctx=ContextEngine(MockConnector())
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
