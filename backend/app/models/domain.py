from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class User(BaseModel):
    id: str
    name: str
    role: str
    skills: List[str] = []
    experience_years: int = 0
    projects: List[str] = []

class WorkItem(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    assignee_id: Optional[str] = None
    days_delayed: int = 0
    component_id: Optional[str] = None

class FileInfo(BaseModel):
    path: str
    language: str
    complexity: str
    coverage: int
    lines: int
    recent_changes: int
    component_id: Optional[str] = None
    tags: List[str] = []

class Dependency(BaseModel):
    id: str
    name: str
    version: str
    status: str
    used_in: List[str]
    affected_services: List[str]

class ArchitectureComponent(BaseModel):
    id: str
    name: str
    type: str
    description: str
    responsibilities: List[str]
    dependencies: List[str] = []
    dependents: List[str] = []
    files: List[str] = []
    coverage: int = 0
    recent_changes: int = 0
    risk: Optional[str] = None

class Risk(BaseModel):
    id: str
    title: str
    severity: str
    description: str
    evidence: List[str]
    impact: str
    action: str

class Project(BaseModel):
    id: str
    name: str
    client: str
    status: str
    health: int
    team: List[User]
    work_items: List[WorkItem]
    files: List[FileInfo]
    dependencies: List[Dependency]
    components: List[ArchitectureComponent]
    risks: List[Risk]

class Evidence(BaseModel):
    text: str
    source: str
    reference: Optional[str] = None

class Insight(BaseModel):
    title: str
    summary: str
    severity: str = "info"
    impact: str = ""
    action: str = ""
    evidence: List[Evidence] = []

class Opportunity(Insight):
    match: int
    effort: str
    relevant_files: List[str] = []
    relevant_work_items: List[str] = []
    why_you: List[str] = []

class Expert(BaseModel):
    user: User
    relevance: int
    reason: str
    relevant_projects: List[str]
    relevant_skills: List[str]

class AskRequest(BaseModel):
    question: str
    developer_id: str = "dev-sam"

class AskResponse(BaseModel):
    answer: str
    evidence: List[Evidence]
    suggested_actions: List[str] = []
