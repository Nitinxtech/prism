from abc import ABC, abstractmethod
from app.models.domain import Project

class ProjectConnector(ABC):
    @abstractmethod
    def get_project(self, project_id: str) -> Project:
        raise NotImplementedError
