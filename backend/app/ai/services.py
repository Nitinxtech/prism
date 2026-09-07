from app.models.domain import *

class OpportunityFinder:
    def run(self, p: Project, developer_id: str):
        dev = next(u for u in p.team if u.id == developer_id)
        opps = []
        payment = next(f for f in p.files if f.path.endswith("PaymentService.ts"))
        opps.append(Opportunity(title="Improve Payment Service Test Coverage", summary="Increase coverage around payment processing and API error handling.", severity="high", impact="Reduce regression risk in a high-change service.", action="Add focused unit/integration tests before the next payment milestone.", match=92, effort="Medium", relevant_files=[payment.path,"src/api/payment.ts"], relevant_work_items=["US-102","US-118"], why_you=["You have Node.js experience.","You previously contributed to the payment module.","The service is currently an engineering focus area."], evidence=[Evidence(text="Payment Service test coverage is 61%.",source="Codebase",reference=payment.path),Evidence(text="Payment integration is 4 days delayed.",source="Work item",reference="US-102"),Evidence(text="Payment Service has 8 recent changes.",source="Repository activity",reference=payment.path)]))
        opps.append(Opportunity(title="Migrate deprecated Axios dependency", summary="Replace the deprecated Axios version used by payment and order paths.", severity="high", impact="Reduce dependency risk and unblock a cleaner payment path.", action="Migrate the shared API client wrapper, then update dependents.", match=87, effort="Low", relevant_files=["src/services/PaymentService.ts","src/api/payment.ts","src/services/OrderService.ts"], relevant_work_items=["US-102"], why_you=["Your TypeScript and Node.js skills match the affected services.","The work is adjacent to your current payment task."], evidence=[Evidence(text="axios 0.27.2 is marked deprecated.",source="Dependency inventory",reference="axios"),Evidence(text="The dependency is used in 3 core paths.",source="Dependency inventory",reference="axios")]))
        opps.append(Opportunity(title="Improve API documentation", summary="Document authentication and payment API behavior for faster onboarding and support.", severity="medium", impact="Reduce knowledge gaps and improve handoffs.", action="Document the gateway authentication flow and payment endpoints.", match=81, effort="Low", relevant_files=["src/middleware/auth.ts","src/api/payment.ts"], relevant_work_items=["US-140"], why_you=["You work across the API layer.","Documentation is currently an open project need."], evidence=[Evidence(text="API documentation work item is still To Do.",source="Work management",reference="US-140"),Evidence(text="Authentication middleware has 73% coverage and high complexity.",source="Codebase",reference="src/middleware/auth.ts")]))
        return opps

class CodebaseAnalyzer:
    def run(self,p:Project):
        return [Insight(title=f.path,summary=f"{f.complexity} complexity · {f.coverage}% test coverage · {f.recent_changes} recent changes",severity="high" if f.coverage<70 else "medium" if f.coverage<80 else "info",impact="Potential engineering attention area.",action="Review tests, recent changes, and dependent components.",evidence=[Evidence(text=f"Test coverage is {f.coverage}%.",source="Codebase",reference=f.path),Evidence(text=f"{f.recent_changes} recent changes were detected.",source="Repository activity",reference=f.path)]) for f in p.files]

class DependencyAnalyzer:
    def run(self,p:Project):
        return p.dependencies
    def impact(self,p:Project,dep_id:str):
        d=next(d for d in p.dependencies if d.id==dep_id)
        effort="2–3 days" if d.id=="axios" else "1 day"
        return Insight(title=f"Migration impact: {d.name}",summary=f"{len(d.used_in)} files and {len(d.affected_services)} services are affected.",severity="high" if d.status=="Deprecated" else "medium",impact="Changes may affect shared API behavior and dependent services.",action="Update the dependency behind a shared wrapper, run focused tests, then migrate dependent modules.",evidence=[Evidence(text=f"Used in {len(d.used_in)} files.",source="Dependency inventory",reference=d.id),Evidence(text=f"Affected services: {', '.join(d.affected_services)}.",source="Dependency graph",reference=d.id),Evidence(text=f"Estimated effort: {effort}.",source="PRISM estimate",reference=d.id)])

class ArchitectureAnalyzer:
    def component(self,p,component_id): return next(c for c in p.components if c.id==component_id)
    def graph(self,p):
        nodes=[{"id":c.id,"data":{"label":c.name,"type":c.type,"risk":c.risk},"position":{"x":0,"y":0}} for c in p.components]
        edges=[]
        for c in p.components:
            for dep in c.dependencies: edges.append({"id":f"{c.id}-{dep}","source":c.id,"target":dep})
        return {"nodes":nodes,"edges":edges}

class ExpertFinder:
    def run(self,p:Project,query:str):
        terms=set(query.lower().replace("?","").split())
        results=[]
        for u in p.team:
            if u.id=="dev-sam": continue
            matched=[s for s in u.skills if any(t in s.lower() or s.lower() in t for t in terms)]
            project_bonus=20 if "Phoenix" in u.projects else 0
            relevance=min(98,40+len(matched)*20+project_bonus)
            if matched or any(t in " ".join(u.skills).lower() for t in terms):
                results.append(Expert(user=u,relevance=relevance,reason=f"Relevant skills: {', '.join(matched or u.skills[:2])}. Has project experience that overlaps with Phoenix.",relevant_projects=u.projects,relevant_skills=matched or u.skills[:3]))
        return sorted(results,key=lambda x:x.relevance,reverse=True)

class AskPrism:
    def run(self,p:Project,q:str,developer_id:str="dev-sam"):
        ql=q.lower()
        if "payment" in ql and ("risk" in ql or "risky" in ql):
            r=p.risks[0]
            return AskResponse(answer=f"Payment Service is a high-priority risk because {r.description} The strongest evidence is the 4-day delay on US-102, 61% test coverage, a deprecated axios dependency, and a blocked payment work item. The recommended action is to prioritize dependency migration and focused test coverage.",evidence=[Evidence(text=x,source="Project evidence",reference="Phoenix") for x in r.evidence],suggested_actions=[r.action])
        if "work on next" in ql or "contribute" in ql:
            o=OpportunityFinder().run(p,developer_id)[0]
            return AskResponse(answer=f"Your highest-confidence opportunity is '{o.title}' with a {o.match}% match. It aligns with your skills and current project needs.",evidence=o.evidence,suggested_actions=[o.action])
        if "expert" in ql or "help" in ql or "oauth" in ql or "authentication" in ql:
            ex=ExpertFinder().run(p,"oauth authentication")
            if ex: return AskResponse(answer=f"{ex[0].user.name} is the strongest match for authentication help because of {', '.join(ex[0].relevant_skills)} experience and prior Phoenix work.",evidence=[Evidence(text=ex[0].reason,source="Team expertise",reference=ex[0].user.name)],suggested_actions=[f"Reach out to {ex[0].user.name}."])
        if "dependency" in ql:
            d=next(d for d in p.dependencies if d.status!="Current")
            return AskResponse(answer=f"{d.name} {d.version} needs attention because it is {d.status.lower()} and is used across {len(d.used_in)} files.",evidence=[Evidence(text=f"{d.name} {d.version} is {d.status}.",source="Dependency inventory",reference=d.id),Evidence(text=f"Used in: {', '.join(d.used_in)}",source="Dependency inventory",reference=d.id)],suggested_actions=["Open Dependency Intelligence and review migration impact."])
        return AskResponse(answer="I can answer questions about Phoenix using project work, codebase, dependencies, architecture, risks, and team expertise. Try asking about Payment Service, your next contribution, dependencies, architecture, or an expert.",evidence=[],suggested_actions=[])
