from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.developer import router

app=FastAPI(title="PRISM Project Intelligence API",version="0.1.0")
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:3000"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(router)
@app.get("/health")
def health(): return {"status":"ok","service":"prism-api"}
