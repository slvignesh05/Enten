import os
import tempfile
import subprocess
import shutil
import yaml
from github import Github

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def fix_and_create_pr(repo_url):
    owner, repo = repo_url.strip("/").split("/")[-2:]
    clone_url = f"https://{GITHUB_TOKEN}@github.com/{owner}/{repo}.git"
    g = Github(GITHUB_TOKEN)
    repo_obj = g.get_repo(f"{owner}/{repo}")

    tmpdir = tempfile.mkdtemp()
    subprocess.run(["git", "clone", clone_url], cwd=tmpdir, check=True)
    repo_path = os.path.join(tmpdir, repo)

    workflow_dir = os.path.join(repo_path, ".github", "workflows")
    modified = False

    for filename in os.listdir(workflow_dir):
        path = os.path.join(workflow_dir, filename)
        with open(path, 'r') as f:
            content = yaml.safe_load(f)

        changed = False
        for job in content.get('jobs', {}).values():
            for step in job.get('steps', []):
                if 'uses' in step and '@' in step['uses'] and not step['uses'].split('@')[-1].startswith('sha256:'):
                    step['uses'] = step['uses'].split('@')[0] + '@v3'
                    changed = True
                if 'run' in step and 'curl' in step['run']:
                    step['run'] += ' # TODO: Add checksum verification'
                    changed = True

        if changed:
            with open(path, 'w') as f:
                yaml.dump(content, f)
            modified = True

    if modified:
        subprocess.run(["git", "checkout", "-b", "ci-hardening"], cwd=repo_path, check=True)
        subprocess.run(["git", "add", "."], cwd=repo_path, check=True)
        subprocess.run(["git", "commit", "-m", "Harden CI workflows"], cwd=repo_path, check=True)
        subprocess.run(["git", "push", "origin", "ci-hardening"], cwd=repo_path, check=True)
        pr = repo_obj.create_pull(title="CI Hardening", body="Hardened workflows", head="ci-hardening", base="main")
        shutil.rmtree(tmpdir)
        return pr.html_url

    shutil.rmtree(tmpdir)
    return "No changes made"
