# Candidate 폴더 구조

이 폴더는 지원자(candidate) 관련 페이지와 컴포넌트들을 포함합니다.

## 폴더 구조

```
candidate/
├── Interview/                    # 면접 관련 컴포넌트
│   ├── InterviewPage.jsx        # 면접 시작 페이지
│   ├── InterviewPage.css
│   ├── InterviewSession.jsx     # 면접 세션 페이지
│   ├── InterviewEnvironmentCheck.jsx  # 면접 환경 체크
│   ├── InterviewEnvironmentCheck.css
│   ├── InterviewSchedulerModal.jsx    # 면접 일정 모달
│   ├── InterviewSchedulerModal.css
│   └── index.js                 # Export 파일
├── Portfolio/                   # 포트폴리오 관련 컴포넌트
│   ├── PortfolioSubmissionPage.jsx  # 포트폴리오 제출 페이지
│   ├── PortfolioSubmissionPage.css
│   ├── PortfolioNavbar.jsx      # 포트폴리오 네비게이션
│   ├── PortfolioNavbar.css
│   └── index.js                 # Export 파일
├── Dashboard/                   # 대시보드 관련 컴포넌트
│   ├── CandidateDashboard.jsx   # 지원자 대시보드
│   ├── CandidateDashboard.css
│   └── index.js                 # Export 파일
├── Sidebar/                     # 사이드바 및 레이아웃 컴포넌트
│   ├── Sidebar.jsx              # 메인 사이드바
│   ├── Sidebar.css
│   ├── Header.jsx               # 헤더 컴포넌트
│   ├── Header.css
│   └── index.js                 # Export 파일
├── Modals/                      # 모달 컴포넌트들
│   ├── BenefitSelectionModal.jsx    # 복리후생 선택 모달
│   ├── BenefitSelectionModal.css
│   ├── CommuteTimeSelectionModal.jsx # 출근시간 선택 모달
│   ├── CommuteTimeSelectionModal.css
│   ├── CompanySizeSelectionModal.jsx # 회사규모 선택 모달
│   ├── CompanySizeSelectionModal.css
│   ├── JobSelectionModal.jsx        # 직무 선택 모달
│   ├── JobSelectionModal.css
│   ├── RegionSelectionModal.jsx     # 지역 선택 모달
│   ├── RegionSelectionModal.css
│   ├── SalarySelectionModal.jsx     # 연봉 선택 모달
│   ├── SalarySelectionModal.css
│   └── index.js                     # Export 파일
└── Common/                      # 공통 유틸리티 및 컴포넌트
    └── README.md                # 이 파일
```

## 사용법

### Import 예시

```javascript
// 개별 컴포넌트 import
import { CandidateDashboard } from './pages/candidate/Dashboard';
import { InterviewPage, InterviewSession } from './pages/candidate/Interview';
import { PortfolioSubmissionPage } from './pages/candidate/Portfolio';
import { Sidebar } from './pages/candidate/Sidebar';
import { 
  BenefitSelectionModal,
  JobSelectionModal 
} from './pages/candidate/Modals';
```

### 폴더별 역할

- **Interview**: 면접 관련 모든 기능 (환경체크, 세션, 스케줄링)
- **Portfolio**: 포트폴리오 제출 및 관리
- **Dashboard**: 지원자 메인 대시보드
- **Sidebar**: 레이아웃 관련 컴포넌트
- **Modals**: 사용자 설정 관련 모달들
- **Common**: 공통 유틸리티, 훅, 작은 컴포넌트들

## 주의사항

- 각 폴더의 `index.js` 파일을 통해 컴포넌트를 export합니다.
- CSS 파일은 해당 컴포넌트와 같은 폴더에 위치합니다.
- 새로운 컴포넌트 추가 시 적절한 폴더에 배치하고 `index.js`에 export를 추가하세요. 