from app.connectors.base import ProjectConnector
from app.models.domain import Project

class ContextEngine:
    def __init__(self, connector: ProjectConnector):
        self.connector = connector

    def get_project_context(self, project_id: str) -> Project:
        # Foundation for ingest -> normalize -> enrich -> index -> retrieve.
        # Current implementation uses normalized connector output directly.
        return self.connector.get_project(project_id)
