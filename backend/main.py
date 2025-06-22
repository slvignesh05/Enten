from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scanner import scan_workflows
from fixer import fix_and_create_pr

app = FastAPI()

# Enable CORS for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://enten-alpha.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepoInput(BaseModel):
    url: str

@app.post("/scan")
def scan_repo(data: RepoInput):
    try:
        issues = scan_workflows(data.url)
        return {"issues": issues}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/fix")
def fix_repo(data: RepoInput):
    try:
        pr_url = fix_and_create_pr(data.url)
        return {"pr_url": pr_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
