from fastapi.testclient import TestClient
from app.main import app
c=TestClient(app)
def test_all():
    for path in ["/health","/api/developer/home","/api/developer/opportunities","/api/developer/codebase-insights","/api/developer/dependencies","/api/developer/dependencies/axios/impact","/api/developer/system/graph","/api/developer/system/components/payment","/api/developer/collaborate/find-experts?q=oauth"]:
        assert c.get(path).status_code==200
    r=c.post('/api/developer/ask',json={'question':'Why is Payment Service risky?'})
    assert r.status_code==200 and r.json()['evidence']

def test_azure_inventory_requires_connection():
    assert c.get('/api/developer/integrations/azure/inventory').status_code==401

def test_azure_devops_requires_connection():
    assert c.get('/api/developer/integrations/azure-devops/inventory').status_code==401
    assert c.get('/api/developer/integrations/azure-devops/insights').status_code==401
    assert c.get('/api/developer/integrations/azure-devops/organizations/example/projects/example/repositories/example/file?path=/README.md').status_code==401
