# github_search_logic.py
import requests, re, os
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def extract_email(text):
    if not text:
        return None
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group() if match else None

def get_headers():
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

def search_github_candidates(filters):
    results = []
    for region in filters.regions:
        for language in filters.languages:
            location = region if not filters.nationwide else "korea"
            query = f"language:{language} location:{location}"
            url = f"https://api.github.com/search/users?q={query}&per_page=5"
            resp = requests.get(url, headers=get_headers())
            users = resp.json().get("items", [])

            for user in users:
                login = user.get("login")
                profile_url = f"https://github.com/{login}"
                email = extract_user_email(login)
                results.append({
                    "login": login,
                    "profile_url": profile_url,
                    "email": email
                })

    return results

def extract_user_email(login):
    try:
        user_resp = requests.get(f"https://api.github.com/users/{login}", headers=get_headers())
        data = user_resp.json()
        email = data.get("email") or extract_email(data.get("bio", ""))
        return email or "not_found@example.com"
    except:
        return "not_found@example.com"
