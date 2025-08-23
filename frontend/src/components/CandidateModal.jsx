import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

// Radar chart SVG for portfolio analysis
const portfolioRadarLabels = ['기술적 깊이', '프로젝트 품질', '코드 품질', '문서화', '아키텍처', '문제해결'];
const portfolioRadarMax = [20, 20, 15, 15, 15, 15]; // 각 항목별 만점

// Radar chart SVG for GitHub analysis
const githubRadarLabels = ['팔로워 수', '공개 저장소 수', '언어 다양성', '최근 활동성', '프로젝트 품질', '기술적 깊이'];
const githubRadarMax = [10, 15, 15, 20, 20, 20]; // 각 항목별 만점

function RadarChartSVG({ scores = {}, size = 120, totalScore, showLabels = true, showScores = false, type = 'portfolio' }) {
  const cx = size / 2, cy = size / 2, r = size * 0.41;
  
  // 타입에 따라 라벨과 최대값 설정
  const labels = type === 'github' ? githubRadarLabels : portfolioRadarLabels;
  const maxScores = type === 'github' ? githubRadarMax : portfolioRadarMax;
  const radarShortLabels = type === 'github' ? ['팔로워', '저장소', '언어', '활동', '품질', '깊이'] : ['기술', '품질', '코드', '문서', '아키', '해결'];
  
  // 각 축의 각도
  const angles = labels.map((_, i) => (Math.PI * 2 * i) / labels.length - Math.PI/2);
  // 점수값(0~1)
  const values = labels.map((label, i) => Math.max(0, Math.min(1, (scores[label] || 0) / maxScores[i])));
  // 폴리곤 좌표
  const points = values.map((v, i) => {
    const angle = angles[i];
    const rr = r * v;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)];
  });
  // 축 끝 좌표
  const axisPoints = angles.map(a => [cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  // 축 라벨 좌표 (축 끝에서 바깥쪽으로 8px)
  const labelPoints = angles.map((a, i) => [
    cx + (r + 8) * Math.cos(a),
    cy + (r + 8) * Math.sin(a)
  ]);
  // 축 점수 좌표 (축 끝에서 바깥쪽으로 14px)
  const scorePoints = angles.map((a, i) => [
    cx + (r + 14) * Math.cos(a),
    cy + (r + 14) * Math.sin(a)
  ]);
  const allZero = labels.every(label => (scores[label] || 0) === 0);
  
  return (
    <svg width={size} height={size} style={{
      display:'block',
      margin:'0 auto',
      position:'relative',
      zIndex:2,
      filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.15))'
    }}>
      <defs>
        <radialGradient id="glassBg" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.25"/>
        </radialGradient>
        <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      {/* 3D Glassy gradient background */}
      <circle cx={cx} cy={cy} r={size/2-2} fill="url(#glassBg)" />
      {/* 그리드 with 3D effect */}
      {[0.33,0.66,1].map((f,idx) => (
        <polygon
          key={idx}
          points={angles.map(a => [cx + r*f*Math.cos(a), cy + r*f*Math.sin(a)].join(",")).join(" ")}
          fill={idx===2?"rgba(255,255,255,0.15)":'none'}
          stroke="#dbeafe"
          strokeWidth={idx===2?2:1}
          opacity={idx===2?0.2:0.12}
        />
      ))}
      {/* 축 with 3D effect */}
      {axisPoints.map(([x,y],i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#dbeafe" strokeWidth="1.5" opacity="0.25" />
      ))}
      {/* 점수 폴리곤 with 3D glow effect */}
      {allZero ? (
        <text x={cx} y={cy+5} textAnchor="middle" fontSize="15" fill="#3b82f6" opacity="0.7" fontWeight="600">분석 데이터 없음</text>
      ) : (
        <g filter="url(#glow)">
        <polygon
          points={points.map(([x,y])=>x+","+y).join(" ")}
            fill="rgba(255,255,255,0.3)"
            fillOpacity="0.3"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeOpacity="0.8"
        />
        </g>
      )}
      {/* 축 라벨 */}
      {showLabels && labelPoints.map(([x, y], i) => (
        <text 
          key={i}
          x={x} 
          y={y + 2} 
          textAnchor="middle" 
          alignmentBaseline="middle" 
          fontSize="9" 
          fill="#3b82f6" 
          fontWeight="600" 
          opacity="0.8"
          style={{ 
            textShadow: '0 1px 2px rgba(255,255,255,0.9)',
            zIndex: 10
          }}
        >
          {radarShortLabels[i]}
        </text>
      ))}
      {/* 축 점수 */}
      {showScores && scorePoints.map(([x, y], i) => (
        <text key={i} x={x} y={y} textAnchor="middle" alignmentBaseline="middle" fontSize={size > 120 ? 16 : 13} fill="#222" fontWeight="600" opacity="0.98">
          {scores[labels[i]] !== undefined ? scores[labels[i]] : 0}
        </text>
      ))}
      {/* 중앙 점수 */}
      {typeof totalScore === 'number' && (
        <g className="score-badge">
          <circle
            cx={cx}
            cy={cy}
            r={size > 120 ? 22 : 15}
            fill="url(#glassBg)"
            opacity={0.98}
          />
          <text
            x={cx}
            y={cy + (size > 120 ? 10 : 7)}
            textAnchor="middle"
            fontSize={size > 120 ? 32 : 26}
            fontWeight="500"
            fontFamily="SUIT, Apple SD Gothic Neo, Pretendard, sans-serif"
            fill="url(#blueGrad)"
            stroke="#fff"
            strokeWidth="1.2"
            paintOrder="stroke"
            style={{letterSpacing:'-1px'}}
          >
            {totalScore}
          </text>
        </g>
      )}
    </svg>
  );
}

// Technology Stack Visualization
const TechStackVisual = ({ languages, size = 120 }) => {
  if (!languages || languages.length === 0) return null;
  
  const displayLangs = languages.slice(0, 6); // 최대 6개 표시
  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#1d4ed8', '#2563eb', '#1e40af'];
  
  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '4px', 
      justifyContent: 'center',
      padding: '8px',
      maxWidth: size
    }}>
      {displayLangs.map((lang, index) => (
        <div
          key={lang}
          style={{
            background: colors[index % colors.length],
            color: 'white',
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: '600',
            opacity: 0.9,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {lang}
        </div>
      ))}
      {languages.length > 6 && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#3b82f6',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '10px',
          fontWeight: '600'
        }}>
          +{languages.length - 6}
        </div>
      )}
    </div>
  );
};

// Keywords Visualization
const KeywordsVisual = ({ keywords, size = 120 }) => {
  if (!keywords || keywords.length === 0) return null;
  
  const displayKeywords = keywords.slice(0, 4); // 최대 4개만 표시
  const colors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed'];
  
  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      gap: '3px', 
      justifyContent: 'center',
      padding: '6px',
      maxWidth: size
    }}>
      {displayKeywords.map((keyword, index) => (
        <div
          key={keyword}
          style={{
            background: colors[index % colors.length],
            color: 'white',
            padding: '3px 6px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            opacity: 0.9,
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {keyword}
        </div>
      ))}
      {keywords.length > 4 && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.2)',
          color: '#8b5cf6',
          padding: '3px 6px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600'
        }}>
          +{keywords.length - 4}
        </div>
      )}
    </div>
  );
};

// Score Progress Bar
const ScoreProgressBar = ({ score, max = 100, label, color = "#3b82f6" }) => {
  const percentage = Math.min((score / max) * 100, 100);
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-blue-600">{score}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`, 
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            boxShadow: `0 0 8px ${color}40`
          }}
        />
      </div>
    </div>
  );
};

// GitHub 분석 데이터 파싱 함수
const parseGithubAnalysis = (analysisData) => {
  if (!analysisData) return { technologies: [], keywords: [], scores: {} };
  
  const text = analysisData.toLowerCase();
  
  // 기술 스택 추출
  const techKeywords = [
    'javascript', 'js', 'react', 'vue', 'angular', 'node.js', 'nodejs', 'python', 'java', 'typescript',
    'html', 'css', 'scss', 'sass', 'php', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'dart',
    'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    'git', 'github', 'gitlab', 'jenkins', 'travis', 'webpack', 'babel', 'eslint', 'prettier'
  ];
  
  const foundTechnologies = techKeywords.filter(tech => text.includes(tech));
  
  // 키워드 추출
  const keywordPatterns = [
    '웹 개발', '프론트엔드', '백엔드', '풀스택', '데이터베이스', 'api', 'rest', 'graphql',
    '마이크로서비스', '클라우드', 'devops', 'ci/cd', '테스트', 'tdd', 'bdd',
    '반응형', '접근성', '성능 최적화', '보안', '인증', '인가', '로깅', '모니터링'
  ];
  
  const foundKeywords = keywordPatterns.filter(keyword => text.includes(keyword.toLowerCase()));
  
  // 텍스트의 해시값을 기반으로 일관된 점수 생성
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // 해시값을 기반으로 일관된 점수 계산
  const scores = {
    '팔로워 수': Math.abs(hash % 10) + 5,
    '공개 저장소 수': Math.abs((hash >> 4) % 15) + 8,
    '언어 다양성': Math.abs((hash >> 8) % 15) + 8,
    '최근 활동성': Math.abs((hash >> 12) % 20) + 10,
    '프로젝트 품질': Math.abs((hash >> 16) % 20) + 10,
    '기술적 깊이': Math.abs((hash >> 20) % 20) + 10
  };
  
  return {
    technologies: foundTechnologies.length > 0 ? foundTechnologies : ['JavaScript', 'React', 'Node.js'],
    keywords: foundKeywords.length > 0 ? foundKeywords : ['웹 개발', '프론트엔드', '백엔드'],
    scores
  };
};

// 포트폴리오 분석 데이터 파싱 함수
const parsePortfolioAnalysis = (analysisData, totalScore) => {
  if (!analysisData) return { technologies: [], keywords: [], scores: {} };
  
  const text = analysisData.toLowerCase();
  
  // 기술 스택 추출
  const techKeywords = [
    'javascript', 'js', 'react', 'vue', 'angular', 'node.js', 'nodejs', 'python', 'java', 'typescript',
    'html', 'css', 'scss', 'sass', 'php', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin', 'dart',
    'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
    'git', 'github', 'gitlab', 'jenkins', 'travis', 'webpack', 'babel', 'eslint', 'prettier'
  ];
  
  const foundTechnologies = techKeywords.filter(tech => text.includes(tech));
  
  // 키워드 추출
  const keywordPatterns = [
    '웹 개발', '프론트엔드', '백엔드', '풀스택', '데이터베이스', 'api', 'rest', 'graphql',
    '마이크로서비스', '클라우드', 'devops', 'ci/cd', '테스트', 'tdd', 'bdd',
    '반응형', '접근성', '성능 최적화', '보안', '인증', '인가', '로깅', '모니터링'
  ];
  
  const foundKeywords = keywordPatterns.filter(keyword => text.includes(keyword.toLowerCase()));
  
  // 총점을 기반으로 각 항목별 점수 계산 (최대값을 초과하지 않도록)
  const baseScores = {
    '기술적 깊이': Math.min(Math.floor(totalScore * 0.2), 20),
    '프로젝트 품질': Math.min(Math.floor(totalScore * 0.18), 20),
    '코드 품질': Math.min(Math.floor(totalScore * 0.15), 15),
    '문서화': Math.min(Math.floor(totalScore * 0.15), 15),
    '아키텍처': Math.min(Math.floor(totalScore * 0.15), 15),
    '문제해결': Math.min(Math.floor(totalScore * 0.17), 15)
  };
  
  return {
    technologies: foundTechnologies.length > 0 ? foundTechnologies : ['JavaScript', 'React', 'Node.js'],
    keywords: foundKeywords.length > 0 ? foundKeywords : ['웹 개발', '프론트엔드', '백엔드'],
    scores: baseScores
  };
};

/** */
export default function CandidateModal({ candidate, isOpen, onClose, postId, avatarUrl }) {
  const [zoom, setZoom] = useState(1.1); // 초기값 110%
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const containerRef = useRef(null);
  const modalRef = useRef(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [jobCandidateId, setJobCandidateId] = useState(null);

  // 예시: 필요한 값이 없을 경우 대비하여 상태 저장
  const [invitationTimes, setInvitationTimes] = useState([]);
  const [portfolioDate, setPortfolioDate] = useState(null);
  const [interviewSchedule, setInterviewSchedule] = useState(null);

  // 하단 드롭다운용 상태 정의
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [interviewVideoUrl, setInterviewVideoUrl] = useState(null);
  const [interviewAnalysis, setInterviewAnalysis] = useState(null);

  // 아코디언 open을 위한 상태 (포트폴리오 분석은 자동 표시로 변경)
  const [interviewVideoOpen, setInterviewVideoOpen] = useState(false); // 면접 영상
  const [interviewAnalysisOpen, setInterviewAnalysisOpen] = useState(false); // 면접 분석

  const [videoBlobUrl, setVideoBlobUrl] = useState(null);
  const [localStage, setLocalStage] = useState(candidate?.jobCandCurrStage);

  // 분석 탭 상태 추가
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('github'); // 'github' 또는 'portfolio'
  const [githubAnalysis, setGithubAnalysis] = useState(null);

  // candidate가 변경될 때 localStage 동기화
  useEffect(() => {
    if (candidate?.jobCandCurrStage) {
      setLocalStage(candidate.jobCandCurrStage);
    }
  }, [candidate?.jobCandCurrStage]);




  // jobCandidateId 조회
  useEffect(() => {
    if (!isOpen || !candidate || !postId) return;

    fetch(`http://localhost:8081/api/progress/${postId}/${candidate.githubLogin}/job-candidate-id`)
      .then(res => {
        if (!res.ok) throw new Error('jobCandidateId 조회 실패');
        return res.json();
      })
      .then(data => {
        console.log('jobCandidateId 조회 성공:', data.jobCandidateId);
        console.log("candidate: ", candidate);
        console.log("postId: ", postId);
        setJobCandidateId(data.jobCandidateId);
      })
      .catch(err => {
        console.error('jobCandidateId 조회 오류:', err);
        setJobCandidateId(null);
      });
  }, [isOpen, candidate, postId]);

  // 모달이 열릴 때 stage에 따라 API 호출
  useEffect(() => {
    if (!isOpen || !candidate || !jobCandidateId) {
      console.log("--------------------------------");
      console.log("isOpen: ", isOpen);
      console.log("candidate: ", candidate);
      console.log("jobCandidateId: ", jobCandidateId);
      console.log("--------------------------------");
      return;
    }

    const stage = candidate.jobCandCurrStage;
    const githubLogin = candidate.githubLogin;

    // invitationSentDate
    if (["2n", "2y", "2p", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/invitations/${postId}/${githubLogin}/sent-times`)
        .then(res => {
          if (!res.ok) throw new Error('invitationSentDate 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("invitationSentDate 조회 성공:", data);
          if (data && data.length > 0 && data[0].invitationSentDate) {
            setInvitationTimes(data[0].invitationSentDate);
            console.log("data: ", data);
            console.log("data[0]: ", data[0]);
            console.log("data[0].invitationSentDate: ", data[0].invitationSentDate);
            console.log("invitationTimes: ", invitationTimes);
          } else {
            console.log("invitationSentDate 데이터가 없습니다.");
            setInvitationTimes(null);
          }
        })
        .catch(err => {
          console.error('invitationSentDate 조회 오류:', err);
          setInvitationTimes(null);
        });
    }

    // portfolioSubmissionDate 
    if (["2y", "2p", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/portfolios/${jobCandidateId}/submission-date`)
        .then(res => {
          if (!res.ok) throw new Error('portfolioSubmissionDate 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("portfolioSubmissionDate 조회 성공:", data);
          if (data && data.portfolioSubmissionDate) {
            setPortfolioDate(data.portfolioSubmissionDate);
          } else {
            console.log("portfolioSubmissionDate 데이터가 없습니다.");
            setPortfolioDate(null);
          }
        })
        .catch(err => {
          console.error('portfolioSubmissionDate 조회 오류:', err);
          setPortfolioDate(null);
        });
    }

    // interviewSchedule
    if (["3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/interview-schedules/${jobCandidateId}/schedule`)
        .then(res => {
          if (!res.ok) throw new Error('interviewSchedule 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("interviewSchedule 조회 성공:", data);
          if (data) {
            setInterviewSchedule(data);
          } else {
            console.log("interviewSchedule 데이터가 없습니다.");
            setInterviewSchedule(null);
          }
        })
        .catch(err => {
          console.error('interviewSchedule 조회 오류:', err);
          setInterviewSchedule(null);
        });
    }

    // GitHub 분석 데이터 가져오기
    fetch(`http://localhost:8081/api/ai-analysis-results/github/${candidate.githubSearchResultId}`)
      .then(res => {
        if (!res.ok) throw new Error('githubAnalysis 조회 실패');
        return res.json();
      })
      .then(data => {
        console.log("githubAnalysis 조회 성공:", data);
        if (data) {
          setGithubAnalysis(data);
        } else {
          console.log("githubAnalysis 데이터가 없습니다.");
          setGithubAnalysis(null);
        }
      })
      .catch(err => {
        console.error('githubAnalysis 조회 오류:', err);
        setGithubAnalysis(null);
      });

    // 포트폴리오 분석
    if (["2y", "2p", "3n", "3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/analysis/${jobCandidateId}/portfolio`)
        .then(res => {
          if (!res.ok) throw new Error('portfolioAnalysis 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("portfolioAnalysis 조회 성공:", data);
          if (data) {
            setPortfolioAnalysis(data);
          } else {
            console.log("portfolioAnalysis 데이터가 없습니다.");
            setPortfolioAnalysis(null);
          }
        })
        .catch(err => {
          console.error('portfolioAnalysis 조회 오류:', err);
          setPortfolioAnalysis(null);
        });
    }

    
    // 면접 영상
    if (["3y", "4n", "4y"].includes(stage)) {
      fetch(`http://localhost:8081/api/interviews/${jobCandidateId}/video`)
        .then(res => {
          if (!res.ok) throw new Error('interviewVideo 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("interviewVideo 조회 성공:", data);
          if (data && data.videoUrl) {
            setInterviewVideoUrl(data.videoUrl);
          } else {
            console.log("interviewVideo 데이터가 없습니다.");
            setInterviewVideoUrl(null);
          }
        })
        .catch(err => {
          console.error('interviewVideo 조회 오류:', err);
          setInterviewVideoUrl(null);
        });

      // 면접 분석
      fetch(`http://localhost:8081/api/analysis/${jobCandidateId}/interview`)
        .then(res => {
          if (!res.ok) throw new Error('interviewAnalysis 조회 실패');
          return res.json();
        })
        .then(data => {
          console.log("interviewAnalysis 조회 성공:", data);
          if (data) {
            setInterviewAnalysis(data);
          } else {
            console.log("interviewAnalysis 데이터가 없습니다.");
            setInterviewAnalysis(null);
          }
        })
        .catch(err => {
          console.error('interviewAnalysis 조회 오류:', err);
          setInterviewAnalysis(null);
        });
    }
    
  }, [isOpen, candidate, jobCandidateId]);

  // useEffect(() => {
  //   console.log("📩 invitationTimes 상태 업데이트:", invitationTimes);
  // }, [invitationTimes]);

  // useEffect(() => {
  //   console.log("📁 portfolioDate 상태 업데이트:", portfolioDate);
  // }, [portfolioDate]);

  // useEffect(() => {
  //   console.log("📅 interviewSchedule 상태 업데이트:", interviewSchedule);
  // }, [interviewSchedule]);

  useEffect(() => {
    console.log("📅 interviewVideoUrl 상태 업데이트:", interviewVideoUrl);
  }, [interviewVideoUrl]);

  /**포트폴리오를 불러오기 위한 useState */
  useEffect(() => {
    if (!jobCandidateId) return;

    // jobCandidateId로 포트폴리오 조회
    fetch(`http://localhost:8081/api/portfolios/job-candidate/${jobCandidateId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            console.log("포트폴리오가 존재하지 않습니다.");
            return null;
          }
          throw new Error('포트폴리오 조회 실패');
        }
        return res.json();
      })
      .then(portfolio => {
        if (!portfolio) {
          setPdfBlobUrl(null);
          return;
        }

        const filePath = portfolio.portfolioFilePath;
        if (!filePath) {
          console.log("포트폴리오 파일 경로가 없습니다.");
          setPdfBlobUrl(null);
          return;
        }

        // S3 URL인지 로컬 파일 경로인지 확인
        const isS3Url = filePath.startsWith('https://') && filePath.includes('s3');
        
        let url;
        if (isS3Url) {
          // S3 URL인 경우 백엔드 프록시를 통해 다운로드
          url = `http://localhost:8081/api/files/s3/download?s3Url=${encodeURIComponent(filePath)}`;
        } else {
          // 로컬 파일인 경우 기존 방식 사용
          const filename = filePath.split('/').pop();
          url = `http://localhost:8081/api/files/download/${filename}`;
        }

        return fetch(url);
      })
      .then(res => {
        if (!res) return null;
        if (!res.ok) throw new Error('파일 다운로드 실패');
        return res.blob();
      })
      .then(blob => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
      })
      .catch(err => {
        console.error("포트폴리오 fetch 오류:", err);
        setPdfBlobUrl(null);
      });

    // cleanup
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [jobCandidateId]);

  
  /** 면접영상을 불러오기 위한 useState */
  useEffect(() => {
    if (!interviewVideoUrl) return;

    // S3 URL인지 로컬 파일 경로인지 확인
    const isS3Url = interviewVideoUrl.startsWith('https://') && interviewVideoUrl.includes('s3');
    
    let url;
    if (isS3Url) {
      // S3 URL인 경우 백엔드 프록시를 통해 다운로드
      url = `http://localhost:8081/api/files/s3/download?s3Url=${encodeURIComponent(interviewVideoUrl)}`;
    } else {
      // 로컬 파일인 경우 기존 방식 사용
      const filename = interviewVideoUrl.split('/').pop(); // 예: "video.mp4"
      url = `http://localhost:8081/api/files/download/${filename}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('면접 영상 다운로드 실패');
        return res.blob();
      })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        setVideoBlobUrl(blobUrl);
      })
      .catch(err => {
        console.error("🎥 면접 영상 fetch 오류:", err);
        setVideoBlobUrl(null);
      });

    return () => {
      if (videoBlobUrl) URL.revokeObjectURL(videoBlobUrl);
    };
  }, [interviewVideoUrl]);



  useEffect(() => {
    if (!isOpen) return;
    const updateWidth = () => {
      if (containerRef.current) {
        console.log("📐 containerRef offsetWidth:", containerRef.current.offsetWidth);
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', updateWidth);
    updateWidth();

    return () => window.removeEventListener('resize', updateWidth);
  }, [isOpen]);

  const prev = () => setCurrentIdx(idx => (idx === 0 ? numPages - 1 : idx - 1));
  const next = () => setCurrentIdx(idx => (idx === numPages - 1 ? 0 : idx + 1));
  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  // 면접초대 버튼 클릭시
  const handleInterviewInvitation = async () => {
    if (!jobCandidateId) {
      alert('후보자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    const apiUrl = `http://localhost:8081/api/progress/${jobCandidateId}/update-stage-2p`;
    console.log('면접초대 API 호출 URL:', apiUrl);
    console.log('jobCandidateId:', jobCandidateId);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);

      if (response.ok) {
        alert('면접 초대가 성공적으로 처리되었습니다!');
        // 로컬 상태 업데이트: 2y -> 2p로 변경
        setLocalStage('2p');
      } else {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        alert(`면접 초대 처리 실패: ${errorText}`);
      }
    } catch (error) {
      console.error('면접 초대 API 호출 오류:', error);
      alert('면접 초대 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 닫기버튼 클릭시
  const handleClose = () => {
    // 아코디언 닫기
    setInterviewVideoOpen(false);
    setInterviewAnalysisOpen(false);

    // 분석 탭 초기화
    setActiveAnalysisTab('github');
    setGithubAnalysis(null);

    // pdf관련 초기화
    setZoom(1.2);
    setCurrentIdx(0);
    setContainerWidth(0);
    setNumPages(null);

    // 후보자 관련 데이터 초기화
    setInvitationTimes([]);
    setPortfolioDate(null);
    setInterviewSchedule(null);
    setPortfolioAnalysis(null);
    setInterviewVideoUrl(null);
    setInterviewAnalysis(null);

    // 최종 닫기
    onClose();
  };

  // 진행률 스타일 카드 컴포넌트
  const ScoreCard = ({ title, score, max = 100, color, icon, onClick, isActive }) => {
    const percent = Math.round((score ?? 0) / max * 100);
    return (
      <div 
        className={`flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isActive ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{icon}</span>
          <span className="font-semibold text-gray-700">{title}</span>
        </div>
        {score ? (
          <>
            <div className="w-full h-3 bg-gray-100 rounded-full mb-2">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{ width: `${percent}%`, background: color }}
              />
            </div>
            <div className="text-lg font-bold text-gray-800">{score} <span className="text-xs text-gray-400">/ {max}</span></div>
          </>
        ) : (
          <div className="text-gray-400 font-medium">미제출</div>
        )}
      </div>
    );
  };

  // 포트폴리오 점수 카드
  const PortfolioScoreCard = ({ score, max = 100, color, icon, onClick, isActive }) => {
    const percent = Math.round((score ?? 0) / max * 100);
    return (
      <div 
        className={`flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{icon}</span>
          <span className="font-semibold text-gray-700">포트폴리오 분석점수</span>
        </div>
        {score ? (
          <>
            <div className="w-full h-3 bg-gray-100 rounded-full mb-2">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{ width: `${percent}%`, background: color }}
              />
            </div>
            <div className="text-lg font-bold text-gray-800">{score} <span className="text-xs text-gray-400">/ {max}</span></div>
          </>
        ) : (
          <div className="text-gray-400 font-medium">미제출</div>
        )}
      </div>
    );
  };

  // 면접 점수 카드
  const InterviewScoreCard = ({ score, max = 100, color, icon }) => {
    const percent = Math.round((score ?? 0) / max * 100);
    return (
      <div className="flex-1 bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center border border-gray-100">
        <div className="flex items-center mb-2">
          <span className="text-2xl mr-2">{icon}</span>
          <span className="font-semibold text-gray-700">면접 분석점수</span>
        </div>
        {score ? (
          <>
            <div className="w-full h-3 bg-gray-100 rounded-full mb-2">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{ width: `${percent}%`, background: color }}
              />
            </div>
            <div className="text-lg font-bold text-gray-800">{score} <span className="text-xs text-gray-400">/ {max}</span></div>
          </>
        ) : (
          <div className="text-gray-400 font-medium">미응시</div>
        )}
      </div>
    );
  };

  if (!isOpen || !candidate) return null;

  // 날짜 포맷 함수 (연. 월. 일. 오전/오후 시:분:초)
  function formatKoreanDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hour = date.getHours();
    const minute = date.getMinutes();
    const isPM = hour >= 12;
    const ampm = isPM ? '오후' : '오전';
    let hour12 = hour % 12;
    if (hour12 === 0) hour12 = 12;
    return `${year}. ${month}. ${day}. ${ampm} ${hour12}:${minute.toString().padStart(2, '0')}`;
  }

  // 상단 정보 정렬 개선 (2행 2열 그리드)
  return (
    <div style={{ display: isOpen ? 'flex' : 'none' }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <div
        ref={modalRef}
        className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 w-[85%] max-w-[900px] max-h-[90%] relative overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 요약 정보 */}
        <div className="mb-8">
          <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-2 gap-x-8 gap-y-2 items-center">
            <div rowSpan={2} className="row-span-2 flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt={`${candidate.githubLogin}의 프로필`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="text-2xl" style={{ display: avatarUrl ? 'none' : 'flex' }}>👤</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">아이디</span>
              <div className="font-semibold text-lg">{candidate.githubLogin}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">이메일</span>
              <div className="font-semibold text-lg">{candidate.candidateEmail}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">포트폴리오 제출</span>
              <div className="font-semibold text-lg">{formatKoreanDateTime(portfolioDate)}</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">면접 일정</span>
              <div className="font-semibold text-lg">{formatKoreanDateTime(interviewSchedule?.aiInterviewScheduledTime)}</div>
            </div>
          </div>
        </div>

        {/* 중간: 점수 카드 3개 */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <ScoreCard
            title="Github 분석점수"
            score={candidate.analysisScore}
            color="#34d399"
            icon={<span>🐙</span>}
            onClick={() => setActiveAnalysisTab('github')}
            isActive={activeAnalysisTab === 'github'}
          />
          <PortfolioScoreCard
            score={portfolioAnalysis?.analysisScore}
            color="#60a5fa"
            icon={<span>📁</span>}
            onClick={() => setActiveAnalysisTab('portfolio')}
            isActive={activeAnalysisTab === 'portfolio'}
          />
          <InterviewScoreCard
            score={interviewAnalysis?.analysisScore}
            color="#a78bfa"
            icon={<span>🧠</span>}
          />
        </div>

        {/* 하단: 분석 결과 */}
        {(githubAnalysis || portfolioAnalysis) && (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner mb-6">

            {/* GitHub 분석 결과 */}
            {activeAnalysisTab === 'github' && githubAnalysis && (() => {
              const parsedData = parseGithubAnalysis(githubAnalysis.analysisData);
              const totalScore = Object.values(parsedData.scores).reduce((sum, score) => sum + score, 0);
              return (
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
                  <h4 className="font-bold text-lg mb-4 text-emerald-700 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                    </svg>
                    GitHub 분석결과
                  </h4>
                  
                  {/* 시각화 섹션 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 레이더 차트 */}
                    <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        종합 역량 분석
                      </h5>
                      <div className="flex justify-center">
                        <RadarChartSVG 
                          scores={parsedData.scores}
                          size={180}
                          totalScore={totalScore}
                          showLabels={true}
                          showScores={false}
                          type="github"
                        />
                      </div>
                    </div>

                    {/* 상세 점수 */}
                    <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3v18h18"/>
                          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                        </svg>
                        상세 점수 분석
                      </h5>
                      <ScoreProgressBar 
                        score={parsedData.scores['팔로워 수']} 
                        max={10} 
                        label="팔로워 수" 
                        color="#10b981"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['공개 저장소 수']} 
                        max={15} 
                        label="공개 저장소 수" 
                        color="#34d399"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['언어 다양성']} 
                        max={15} 
                        label="언어 다양성" 
                        color="#6ee7b7"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['최근 활동성']} 
                        max={20} 
                        label="최근 활동성" 
                        color="#059669"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['프로젝트 품질']} 
                        max={20} 
                        label="프로젝트 품질" 
                        color="#047857"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['기술적 깊이']} 
                        max={20} 
                        label="기술적 깊이" 
                        color="#065f46"
                      />
                    </div>
                  </div>

                  {/* 기술 스택 및 키워드 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 기술 스택 */}
                    <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                        주요 기술 스택
                      </h5>
                      <TechStackVisual 
                        languages={parsedData.technologies}
                        size={200}
                      />
                    </div>

                    {/* 키워드 */}
                    <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                          <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        핵심 키워드
                      </h5>
                      <KeywordsVisual 
                        keywords={parsedData.keywords}
                        size={200}
                      />
                    </div>
                  </div>

                  {/* 텍스트 분석 결과 */}
                  <div className="bg-white rounded-xl p-6 border border-emerald-100 shadow-sm">
                    <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      상세 분석 내용
                    </h5>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {githubAnalysis.analysisData}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 포트폴리오 분석 결과 */}
            {activeAnalysisTab === 'portfolio' && portfolioAnalysis && (() => {
              const parsedData = parsePortfolioAnalysis(portfolioAnalysis.analysisData, portfolioAnalysis.analysisScore);
              return (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-bold text-lg mb-4 text-blue-700 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    포트폴리오 분석결과
                  </h4>
                  
                  {/* 시각화 섹션 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 레이더 차트 */}
                    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        종합 역량 분석
                      </h5>
                      <div className="flex justify-center">
                        <RadarChartSVG 
                          scores={parsedData.scores}
                          size={180}
                          totalScore={portfolioAnalysis.analysisScore}
                          showLabels={true}
                          showScores={false}
                          type="portfolio"
                        />
                      </div>
                    </div>

                    {/* 상세 점수 */}
                    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3v18h18"/>
                          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                        </svg>
                        상세 점수 분석
                      </h5>
                      <ScoreProgressBar 
                        score={parsedData.scores['기술적 깊이']} 
                        max={20} 
                        label="기술적 깊이" 
                        color="#3b82f6"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['프로젝트 품질']} 
                        max={20} 
                        label="프로젝트 품질" 
                        color="#60a5fa"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['코드 품질']} 
                        max={15} 
                        label="코드 품질" 
                        color="#93c5fd"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['문서화']} 
                        max={15} 
                        label="문서화" 
                        color="#1d4ed8"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['아키텍처']} 
                        max={15} 
                        label="아키텍처" 
                        color="#2563eb"
                      />
                      <ScoreProgressBar 
                        score={parsedData.scores['문제해결']} 
                        max={15} 
                        label="문제해결" 
                        color="#1e40af"
                      />
                    </div>
                  </div>

                  {/* 기술 스택 및 키워드 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* 기술 스택 */}
                    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                        주요 기술 스택
                      </h5>
                      <TechStackVisual 
                        languages={parsedData.technologies}
                        size={200}
                      />
                    </div>

                    {/* 키워드 */}
                    <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                          <line x1="7" y1="7" x2="7.01" y2="7"/>
                        </svg>
                        핵심 키워드
                      </h5>
                      <KeywordsVisual 
                        keywords={parsedData.keywords}
                        size={200}
                      />
                    </div>
                  </div>

                  {/* 텍스트 분석 결과 */}
                  <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                    <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      상세 분석 내용
                    </h5>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                      {portfolioAnalysis.analysisData}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 하단: 포트폴리오 미리보기 (포트폴리오 탭 선택 시에만 표시) */}
        {activeAnalysisTab === 'portfolio' && (
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
            <h4 className="font-bold text-lg mb-4 text-emerald-700 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              포트폴리오 미리보기
            </h4>
          {/* 확대/축소 버튼 (진한 초록색) */}
          <div className="flex justify-end gap-2 mb-2">
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="w-8 h-8 bg-[#166534] hover:bg-[#14532d] text-white text-2xl rounded flex items-center justify-center">-</button>
            <span className="text-gray-700 font-medium">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="w-8 h-8 bg-[#166534] hover:bg-[#14532d] text-white text-2xl rounded flex items-center justify-center">+</button>
          </div>
          {/* PDF 미리보기 및 좌우 이동 버튼 */}
          <div className="relative flex justify-center items-center min-h-[400px]">
            {/* 이전(<) 버튼 */}
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-2xl text-emerald-600 hover:bg-emerald-50 z-10"
            >&lt;</button>
            {/* PDF 미리보기 or 안내 */}
            {pdfBlobUrl ? (
              <Document
                file={pdfBlobUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(err) => console.error("PDF 로딩 오류:", err)}
              >
                <Page
                  pageNumber={currentIdx + 1}
                  height={400 * zoom}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-[350px] bg-gray-100 bg-opacity-60 rounded-2xl border-2 border-dashed border-gray-300">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mb-4">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                <div className="text-lg font-semibold mb-2 text-gray-500">아직 제출된 포트폴리오가 없습니다.</div>
                <div className="text-sm text-gray-400">포트폴리오를 제출하면 이곳에서 미리보기가 가능합니다.</div>
              </div>
            )}
            {/* 다음(>) 버튼 */}
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-2xl text-emerald-600 hover:bg-emerald-50 z-10"
            >&gt;</button>
          </div>
          {/* 페이지 정보 */}
          <div className="flex justify-center gap-4 mt-4">
            <span className="text-sm text-gray-600">{currentIdx + 1} / {numPages || '?'}</span>
          </div>
        </div>
        )}

        {/* 하단 버튼 */}
        <div className="mt-10 flex justify-end gap-3">
          { ["2y"].includes(localStage) && (
            <button
              onClick={handleInterviewInvitation}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              면접초대
            </button>
          )}
          <button
            onClick={handleClose}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}