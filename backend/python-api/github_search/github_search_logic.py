import requests, re, os, base64
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import difflib
from bs4.element import Tag
import openai

load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

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
            if email_li and isinstance(email_li, Tag):
                email_a = email_li.find("a", href=True) if hasattr(email_li, 'find') else None
                if email_a and isinstance(email_a, Tag):
                    href = email_a.get("href")
                    if href and isinstance(href, str) and href.startswith("mailto:"):
                        email = href.replace("mailto:", "").strip()
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



def get_user_bio(username):
    try:
        user_url = f"https://api.github.com/users/{username}"
        user_res = requests.get(user_url, headers=get_headers())
        if user_res.status_code != 200:
            return ""
        user_info = user_res.json()
        return user_info.get("bio", "") or ""
    except Exception as e:
        print(f"❌ Failed to get bio for {username}: {e}")
        return ""

def get_user_readme(username):
    try:
        repo_url = f"https://api.github.com/users/{username}/repos?sort=stars&per_page=1"
        repo_res = requests.get(repo_url, headers=get_headers())
        if repo_res.status_code != 200:
            return ""
        repos = repo_res.json()
        if not repos:
            return ""
        repo_name = repos[0]["name"]
        readme_url = f"https://api.github.com/repos/{username}/{repo_name}/readme"
        readme_res = requests.get(readme_url, headers=get_headers())
        if readme_res.status_code != 200:
            return ""
        content = readme_res.json().get("content", "")
        decoded_readme = base64.b64decode(content).decode("utf-8", errors="ignore")
        return decoded_readme
    except Exception as e:
        print(f"❌ Error reading README for {username}: {e}")
        return ""

def calc_similarity(ideal, text):
    if not ideal or not text:
        return 0.0
    # 간단한 유사도: 단어 집합의 겹치는 비율 + fuzzy ratio
    ideal_words = set(ideal.lower().split())
    text_words = set(text.lower().split())
    overlap = len(ideal_words & text_words) / (len(ideal_words) + 1e-6)
    fuzzy = difflib.SequenceMatcher(None, ideal, text).ratio()
    return 0.5 * overlap + 0.5 * fuzzy

def enhanced_search_github_candidates(filters, post_id=None):
    locations = expand_locations(filters)
    email_results = []
    headcount = getattr(filters, 'headcount', 5)
    ideal = getattr(filters, 'idealCandidate', None)
    for location in locations:
        for language in filters.languages:
            page = 1
            while len(email_results) < headcount and page <= 10:  # 최대 10페이지(500명)까지 반복
                query = f"language:{language} location:{location}"
                url = f"https://api.github.com/search/users?q={query}&per_page=50&page={page}"
                resp = requests.get(url, headers=get_headers())
                users = resp.json().get("items", [])
                if not users:
                    break

                for user in users:
                    login = user.get("login")
                    profile_url = f"https://github.com/{login}"
                    email = extract_user_email(login)
                    followers = None
                    public_repos = None
                    # Get followers and public_repos for prompt
                    try:
                        user_url = f"https://api.github.com/users/{login}"
                        user_res = requests.get(user_url, headers=get_headers())
                        if user_res.status_code == 200:
                            user_info = user_res.json()
                            followers = user_info.get("followers", "불명")
                            public_repos = user_info.get("public_repos", "불명")
                    except Exception:
                        pass
                    if email and email != "not_found@example.com":
                        # 상세 정보 수집
                        details = get_github_candidate_details(login)
                        # 분석 및 점수/근거/요약 생성
                        candidate_obj = {
                            "login": login,
                            "profile_url": profile_url,
                            "email": email,
                            "followers": followers,
                            "public_repos": public_repos
                        }
                        print(f"[DEBUG] OpenAI 분석 시작: {candidate_obj['login']}")
                        try:
                            analysis = analyze_candidate_with_prompt(candidate_obj, details)
                        except Exception as e:
                            analysis = f"OpenAI 분석 실패: {e}"
                        print(f"[DEBUG] OpenAI 분석 결과: {analysis}")
                        # LLM 점수 파싱 (예: (점수: 92점))
                        llm_score = 0
                        analysis_str = str(analysis) if analysis is not None else ""
                        m = re.search(r"\(점수: (\d+)점\)", analysis_str)
                        if m:
                            llm_score = int(m.group(1))
                        candidate_result = {
                            **candidate_obj,
                            "details": details,
                            "analysis": analysis,
                            "llm_score": llm_score,
                            "score": llm_score  # 기존 호환성을 위해 score도 추가
                        }
                        
                        analysis_preview = str(analysis)[:100] if analysis else "분석 없음"
                        print(f"[DEBUG] 최종 결과: {login} - 점수: {llm_score}, 분석: {analysis_preview}...")
                        
                        # Spring Boot에서 자동으로 DB에 저장됨 (post_id는 Spring Boot에서 처리)
                        
                        email_results.append(candidate_result)
                        if len(email_results) >= headcount:
                            break
                page += 1
            if len(email_results) >= headcount:
                break
        if len(email_results) >= headcount:
            break
    # LLM 점수순 정렬
    email_results = sorted(email_results, key=lambda x: x["llm_score"], reverse=True)[:headcount]
    return email_results

openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

def call_openai_chat(messages, max_tokens=800, temperature=0.3):
    try:
        response = openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        return (
            response.choices[0].message.content
            if response.choices and hasattr(response.choices[0], "message")
            else "AI가 응답하지 않았습니다."
        )
    except Exception as e:
        print(f"[OpenAI API Error] {e}")
        return {"answer": "AI 서버 연결에 문제가 발생했습니다."}

def get_github_candidate_details(username):
    """
    Fetches detailed info for a GitHub user: top language, language list, recent events, repo descriptions, and readme.
    """
    details = {
        'top_language': None,
        'languages': [],
        'recent_events': [],
        'repo_descriptions': [],
        'repo_readmes': []
    }
    try:
        # Get repos
        repo_url = f"https://api.github.com/users/{username}/repos?per_page=100"
        repo_res = requests.get(repo_url, headers=get_headers())
        if repo_res.status_code == 200:
            repos = repo_res.json()
            language_count = {}
            for repo in repos:
                lang = repo.get('language')
                if lang:
                    language_count[lang] = language_count.get(lang, 0) + 1
                desc = repo.get('description')
                if desc:
                    details['repo_descriptions'].append(desc)
                # Get README for top 2 starred repos
            sorted_repos = sorted(repos, key=lambda r: r.get('stargazers_count', 0), reverse=True)[:2]
            for repo in sorted_repos:
                repo_name = repo['name']
                readme_url = f"https://api.github.com/repos/{username}/{repo_name}/readme"
                readme_res = requests.get(readme_url, headers=get_headers())
                if readme_res.status_code == 200:
                    content = readme_res.json().get("content", "")
                    decoded_readme = base64.b64decode(content).decode("utf-8", errors="ignore")
                    details['repo_readmes'].append(decoded_readme[:500])  # Only first 500 chars
            # Top language
            if language_count:
                details['top_language'] = max(language_count, key=lambda k: language_count[k])
                details['languages'] = list(language_count.keys())
        # Get recent events
        events_url = f"https://api.github.com/users/{username}/events/public"
        events_res = requests.get(events_url, headers=get_headers())
        if events_res.status_code == 200:
            events = events_res.json()
            for event in events[:5]:
                event_type = event.get('type')
                repo_name = event.get('repo', {}).get('name')
                details['recent_events'].append(f"{event_type} on {repo_name}")
    except Exception as e:
        print(f"[Error fetching details for {username}] {e}")
    return details

def analyze_candidate_with_prompt(candidate, details):
    """
    Uses OpenAI to analyze a candidate using the provided prompt and details.
    """
    prompt = f"""
아래는 한 깃허브 개발자의 데이터입니다.

닉네임: {candidate.get('login')}
프로필 URL: {candidate.get('profile_url')}
이메일: {candidate.get('email')}
팔로워 수: {candidate.get('followers', '불명')}
공개 저장소 수: {candidate.get('public_repos', '불명')}
대표 언어: {details['top_language']}
가장 많이 사용한 언어 리스트: {details['languages']}
최근 활동: {', '.join(details['recent_events'])}
주요 레포 설명: {'; '.join(details.get('repo_descriptions', []))}
대표 레포 README 일부: {'; '.join(details.get('repo_readmes', []))}

이 정보를 바탕으로 다음을 분석해주세요:

1. **주요 언어와 기술스택** - 어떤 언어와 기술을 주로 사용하는지
2. **최근 활동/커밋/오픈소스 기여 등 활동성** - 얼마나 활발하게 활동하는지
3. **대표 프로젝트/특징/강점** - 어떤 프로젝트가 대표적인지, 어떤 강점이 있는지

4. **100점 만점 기준 점수 부여** - 다음 기준으로 정확히 평가해주세요:
   - 팔로워 수 (10점): 100명 이상=10점, 50-99명=8점, 20-49명=6점, 20명 미만=4점
   - 공개 저장소 수 (15점): 50개 이상=15점, 20-49개=12점, 10-19개=8점, 10개 미만=5점
   - 언어 다양성 (15점): 5개 이상=15점, 3-4개=12점, 2개=8점, 1개=5점
   - 최근 활동성 (20점): 최근 1개월 내 활동=20점, 3개월 내=15점, 6개월 내=10점, 1년 내=5점
   - 프로젝트 품질 (20점): 스타가 많은 프로젝트=20점, 실용적인 프로젝트=15점, 학습용 프로젝트=10점
   - 기술적 깊이 (20점): 복잡한 프로젝트=20점, 중간 수준=15점, 기본 수준=10점

반드시 아래 형식으로 출력해주세요:
이유: [구체적인 평가 근거와 각 항목별 점수] (점수: [총점]점)
종합요약: [3-4줄 요약]
"""
    messages = [
        {"role": "system", "content": "너는 깃허브 개발자를 정확하고 공정하게 평가하는 AI 전문가야. 각 개발자의 실제 데이터를 바탕으로 객관적으로 점수를 매겨줘."},
        {"role": "user", "content": prompt}
    ]
    return call_openai_chat(messages, max_tokens=800, temperature=0.7)


