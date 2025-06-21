import yaml
import requests
import os

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"}

def scan_workflows(repo_url):
    owner, repo = repo_url.strip("/").split("/")[-2:]
    res = requests.get(f"https://api.github.com/repos/{owner}/{repo}/contents/.github/workflows", headers=HEADERS)
    res.raise_for_status()
    files = res.json()
    issues = []

    for f in files:
        if not f['name'].endswith(".yml") and not f['name'].endswith(".yaml"):
            continue
        content = requests.get(f['download_url'], headers=HEADERS).text
        parsed = yaml.safe_load(content)
        if 'jobs' in parsed:
            for job_name, job in parsed['jobs'].items():
                for step in job.get('steps', []):
                    if isinstance(step, dict) and 'uses' in step:
                        if '@' in step['uses'] and not step['uses'].split('@')[-1].startswith('sha256:'):
                            issues.append({
                                'file': f['name'],
                                'job': job_name,
                                'issue': f"Action not pinned to commit: {step['uses']}"
                            })
                    if 'run' in step and 'curl' in step['run']:
                        issues.append({
                            'file': f['name'],
                            'job': job_name,
                            'issue': "Usage of curl in run command without checksum verification"
                        })
    return issues
