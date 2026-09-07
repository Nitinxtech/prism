from app.connectors.base import ProjectConnector
from app.models.domain import *

class MockConnector(ProjectConnector):
    def get_project(self, project_id: str) -> Project:
        sam = User(id="dev-sam", name="Sam", role="Developer", skills=["Node.js","TypeScript","React","REST APIs"], experience_years=3, projects=["Phoenix","Atlas"])
        aman = User(id="expert-aman", name="Aman Khan", role="Senior Engineer", skills=["OAuth","Azure AD","Authentication","Node.js"], experience_years=7, projects=["Phoenix","Identity Platform","Customer Portal"])
        priya = User(id="expert-priya", name="Priya Sharma", role="Staff Engineer", skills=["System Design","Architecture","React","Microservices"], experience_years=9, projects=["Phoenix","Payments Platform"])
        rohit = User(id="expert-rohit", name="Rohit Mehta", role="SRE", skills=["Observability","Azure","Performance","Node.js"], experience_years=6, projects=["Phoenix","Commerce Platform"])
        files = [
            FileInfo(path="src/services/PaymentService.ts", language="TypeScript", complexity="High", coverage=61, lines=486, recent_changes=8, component_id="payment", tags=["payments","api","hotspot"]),
            FileInfo(path="src/services/OrderService.ts", language="TypeScript", complexity="Medium", coverage=78, lines=312, recent_changes=5, component_id="order", tags=["orders"]),
            FileInfo(path="src/services/UserService.ts", language="TypeScript", complexity="Low", coverage=89, lines=201, recent_changes=3, component_id="user", tags=["auth"]),
            FileInfo(path="src/api/payment.ts", language="TypeScript", complexity="Medium", coverage=67, lines=168, recent_changes=6, component_id="payment", tags=["payments"]),
            FileInfo(path="src/middleware/auth.ts", language="TypeScript", complexity="High", coverage=73, lines=144, recent_changes=4, component_id="gateway", tags=["oauth","auth"]),
        ]
        components = [
            ArchitectureComponent(id="web", name="Web App", type="frontend", description="Customer-facing web application.", responsibilities=["UI rendering","Client-side routing","API consumption"], dependencies=["gateway"], dependents=[], files=["src/app"], coverage=82, recent_changes=12),
            ArchitectureComponent(id="gateway", name="API Gateway", type="gateway", description="Entry point for API traffic and authentication.", responsibilities=["Routing","Authentication","Request validation"], dependencies=["order","payment","user"], dependents=["web"], files=["src/middleware/auth.ts"], coverage=73, recent_changes=4, risk="Medium"),
            ArchitectureComponent(id="order", name="Order Service", type="service", description="Manages order lifecycle and orchestration.", responsibilities=["Order creation","Order state","Checkout orchestration"], dependencies=["payment","user"], dependents=["gateway"], files=["src/services/OrderService.ts"], coverage=78, recent_changes=5),
            ArchitectureComponent(id="payment", name="Payment Service", type="service", description="Processes payment intents and provider integrations.", responsibilities=["Payment processing","Provider integration","Payment status"], dependencies=["user"], dependents=["order","gateway"], files=["src/services/PaymentService.ts","src/api/payment.ts"], coverage=61, recent_changes=8, risk="High"),
            ArchitectureComponent(id="user", name="User Service", type="service", description="Manages identity and user profiles.", responsibilities=["User profiles","Identity mapping","Access context"], dependencies=[], dependents=["gateway","order","payment"], files=["src/services/UserService.ts"], coverage=89, recent_changes=3),
            ArchitectureComponent(id="db", name="PostgreSQL", type="database", description="Primary transactional data store.", responsibilities=["Persistence","Transactions"], dependencies=[], dependents=["order","payment","user"], files=["src/db"], coverage=90, recent_changes=2),
        ]
        work = [
            WorkItem(id="US-102", title="Payment integration", status="In Progress", priority="High", assignee_id="dev-sam", days_delayed=4, component_id="payment"),
            WorkItem(id="US-118", title="Payment provider error handling", status="Blocked", priority="High", assignee_id=None, days_delayed=2, component_id="payment"),
            WorkItem(id="US-121", title="Checkout flow", status="In Progress", priority="High", assignee_id="dev-sam", days_delayed=1, component_id="order"),
            WorkItem(id="US-131", title="OAuth hardening", status="In Progress", priority="Medium", assignee_id="expert-aman", days_delayed=0, component_id="gateway"),
            WorkItem(id="US-140", title="API documentation", status="To Do", priority="Medium", assignee_id=None, days_delayed=0, component_id="gateway"),
        ]
        deps = [
            Dependency(id="axios", name="axios", version="0.27.2", status="Deprecated", used_in=["src/services/PaymentService.ts","src/api/payment.ts","src/services/OrderService.ts"], affected_services=["Payment Service","Order Service","API Gateway"]),
            Dependency(id="lodash", name="lodash", version="4.17.20", status="Outdated", used_in=["src/services/OrderService.ts","src/utils/format.ts"], affected_services=["Order Service"]),
            Dependency(id="react", name="react", version="18.3.1", status="Current", used_in=["src/app"], affected_services=["Web App"]),
        ]
        risks = [Risk(id="risk-payment", title="Payment integration may delay release", severity="High", description="Payment work is delayed while a deprecated dependency is used in the payment path.", evidence=["US-102 is 4 days delayed","Payment Service coverage is 61%","axios 0.27.2 is deprecated","US-118 is blocked"], impact="October release readiness", action="Prioritize payment dependency migration and add focused test coverage.")]
        return Project(id=project_id, name="Project Phoenix", client="ABC Retail", status="On Track", health=82, team=[sam, aman, priya, rohit], work_items=work, files=files, dependencies=deps, components=components, risks=risks)
