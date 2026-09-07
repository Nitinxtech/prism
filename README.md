# PRISM — Project Intelligence Platform

PRISM is an intelligence layer over project data that turns context into role-specific insights and actions. Phase 1 implements the Developer experience while preserving the architecture for Executive Manager and Team Lead experiences.

## Current Phase 1
- Developer Home
- My Opportunities
- Codebase Insights
- Dependency Intelligence + migration impact
- Interactive System Map
- Collaborate / Find Experts
- Ask PRISM

## Architecture
`connectors → context → AI services → API → Next.js UI`

The current `MockConnector` provides Project Phoenix data. Future `GitHubConnector` and `AzureDevOpsConnector` implementations can replace it without changing AI or UI layers.

## Run backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000.

Set `NEXT_PUBLIC_API_URL` if the backend is not at `http://localhost:8000/api/developer`.

## Future roadmap
1. Replace/mock alongside real GitHub + Azure DevOps ingestion.
2. Add PostgreSQL + pgvector persistence and document RAG.
3. Add real code parsing/dependency scanning.
4. Add Executive: Overview, Kickoff, Headstart, Client Reports.
5. Add Team Lead: Project Health, Impact, System Design, AI Development Studio, Dependency Intelligence.
6. Add organizational experience/knowledge reuse.
