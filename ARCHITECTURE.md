# PRISM Architecture — Phase 1 Developer Experience

## Product boundary
PRISM is an intelligence layer over project systems. Phase 1 implements the Developer perspective while retaining extension points for Executive Manager and Team Lead perspectives.

## Runtime flow
```text
Connectors → Context Engine → Specialized AI → Developer API → Next.js UI
```

## Backend modules
- `connectors/`: source abstraction and `MockConnector` for Project Phoenix.
- `context/`: normalized project context; later adds enrichment, indexing and retrieval.
- `ai/`: specialized services for opportunities, codebase, dependencies, architecture, expertise and project Q&A.
- `api/`: role-specific API surface.
- `models/`: Pydantic domain contracts.

## Data source strategy
The connector interface prevents AI/API code from depending on GitHub or Azure DevOps. Replace `MockConnector` with real implementations later.

## Evidence model
Insights expose `WHAT / WHY / EVIDENCE / IMPACT / ACTION`. This gives the UI a consistent way to explain recommendations and reduces opaque AI output.

## Phase 1 routes
- `GET /api/developer/home`
- `GET /api/developer/opportunities`
- `GET /api/developer/codebase-insights`
- `GET /api/developer/dependencies`
- `GET /api/developer/dependencies/{id}/impact`
- `GET /api/developer/system/graph`
- `GET /api/developer/system/components/{id}`
- `GET /api/developer/collaborate/find-experts?q=...`
- `POST /api/developer/ask`

## Future expansion
```text
/api/executive
  overview
  kickoff
  headstart
  reports

/api/lead
  health
  impact
  system-design
  dependencies
  ai-studio
```

## Production evolution
1. PostgreSQL repositories replace in-memory/mock data.
2. pgvector indexes project documents and organizational experience.
3. GitHub and Azure DevOps connectors ingest real work, repository and team signals.
4. Repository parsers build a richer code/architecture graph.
5. LLM-backed services replace deterministic demo reasoning while retaining evidence contracts.
