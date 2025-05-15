import requests, re, os, base64
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def get_headers():
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

EMAIL_PATTERN = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"

def is_valid_email(email):
    return email and not any([
        email.endswith("@users.noreply.github.com"),
        email == "git@github.com",
        email.startswith("noreply")
    ])

def extract_email_from_profile_html(username):
    url = f"https://github.com/{username}"
    try:
        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
        print(f"🌐 Fetching profile page: {url}")
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, "html.parser")
            email_li = soup.find("li", {"itemprop": "email"})
            if email_li:
                email_a = email_li.find("a", href=True)
                if email_a and email_a["href"].startswith("mailto:"):
                    email = email_a["href"].replace("mailto:", "").strip()
                    if is_valid_email(email):
                        print(f"📧 Found email in profile: {email}")
                        return email

            emails = re.findall(EMAIL_PATTERN, res.text)
            for email in emails:
                if is_valid_email(email):
                    print(f"📬 Backup email from HTML: {email}")
                    return email
    except Exception as e:
        print(f"❌ Error fetching profile for {username}: {e}")
    return None

def extract_email_from_readme(username):
    try:
        repo_url = f"https://api.github.com/users/{username}/repos?sort=stars&per_page=1"
        repo_res = requests.get(repo_url, headers=get_headers())
        if repo_res.status_code != 200:
            return None

        repos = repo_res.json()
        if not repos:
            return None

        repo_name = repos[0]["name"]
        readme_url = f"https://api.github.com/repos/{username}/{repo_name}/readme"
        readme_res = requests.get(readme_url, headers=get_headers())
        if readme_res.status_code != 200:
            return None

        content = readme_res.json().get("content", "")
        decoded_readme = base64.b64decode(content).decode("utf-8", errors="ignore")
        emails = re.findall(EMAIL_PATTERN, decoded_readme)
        for email in emails:
            if is_valid_email(email):
                print(f"📘 Found email in README: {email}")
                return email
    except Exception as e:
        print(f"❌ Error reading README for {username}: {e}")
    return None

def extract_user_email(username):
    email = extract_email_from_profile_html(username)
    if email:
        return email
    return extract_email_from_readme(username) or "not_found@example.com"

REGION_KEYWORDS = {
    "서울": ["서울", "seoul"],
    "부산": ["부산", "busan"],
    "대구": ["대구", "daegu"],
    "경기": ["경기", "gyeonggi"],
    "인천": ["인천", "incheon"],
    "광주": ["광주", "gwangju"],
    "대전": ["대전", "daejeon"],
    "세종": ["세종", "sejong"],
    "울산": ["울산", "ulsan"],
    "강원": ["강원", "gangwon"],
    "충북": ["충북", "chungbuk"],
    "충남": ["충남", "chungnam"],
    "전북": ["전북", "jeonbuk"],
    "전남": ["전남", "jeonnam"],
    "경북": ["경북", "gyeongbuk"],
    "경남": ["경남", "gyeongnam"],
    "제주": ["제주", "jeju"]
}

NATIONWIDE_KEYWORDS = ["대한민국", "한국", "korea", "south korea"]

def expand_locations(filters):
    if filters.nationwide:
        return NATIONWIDE_KEYWORDS
    expanded = []
    for region in filters.regions:
        expanded.extend(REGION_KEYWORDS.get(region, [region]))
    return expanded

def get_user_score(username):
    try:
        user_url = f"https://api.github.com/users/{username}"
        user_res = requests.get(user_url, headers=get_headers())
        if user_res.status_code != 200:
            return 0

        user_info = user_res.json()
        public_repos = user_info.get("public_repos", 0)
        followers = user_info.get("followers", 0)

        repo_url = f"https://api.github.com/users/{username}/repos?per_page=100"
        repo_res = requests.get(repo_url, headers=get_headers())
        if repo_res.status_code != 200:
            return 0

        repos = repo_res.json()
        total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
        total_forks = sum(repo.get("forks_count", 0) for repo in repos)

        score = (
            public_repos * 1 +
            followers * 2 +
            total_stars * 3 +
            total_forks * 1.5
        )
        return round(score, 1)
    except Exception as e:
        print(f"❌ Failed to calculate score for {username}: {e}")
        return 0

def enhanced_search_github_candidates(filters):
    locations = expand_locations(filters)
    results = []

    for location in locations:
        for language in filters.languages:
            query = f"language:{language} location:{location}"
            url = f"https://api.github.com/search/users?q={query}&per_page=5"
            resp = requests.get(url, headers=get_headers())
            users = resp.json().get("items", [])

            for user in users:
                login = user.get("login")
                profile_url = f"https://github.com/{login}"
                email = extract_user_email(login)
                score = get_user_score(login)
                results.append({
                    "login": login,
                    "profile_url": profile_url,
                    "email": email,
                    "score": score
                })

    email_users = [u for u in results if u["email"] != "not_found@example.com"]
    no_email_users = [u for u in results if u["email"] == "not_found@example.com"]

    email_users.sort(key=lambda x: x["score"], reverse=True)
    no_email_users.sort(key=lambda x: x["score"], reverse=True)

    return email_users + no_email_users