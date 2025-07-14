import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import CompanySidebar from './CompanySidebar';
import CandidateModal from '../../components/CandidateModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompanyDashboard() {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyAdminId, setCompanyAdminId] = useState(0);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [loadingPostDetail, setLoadingPostDetail] = useState(false);
  const [githubCandidates, setGithubCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'candidates'
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [candidateFilter, setCandidateFilter] = useState('전체');
  const [interviewScheduledCandidates, setInterviewScheduledCandidates] = useState([]);
  const [showDirectApplicants, setShowDirectApplicants] = useState(false);
  const [directApplicants, setDirectApplicants] = useState([]);
  const [loadingDirectApplicants, setLoadingDirectApplicants] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState(new Set());
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [currentPortfolioUrl, setCurrentPortfolioUrl] = useState('');
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [showAiAnalysisModal, setShowAiAnalysisModal] = useState(false);
  const [currentAiAnalysis, setCurrentAiAnalysis] = useState(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  
  // 모달 상태 (팀 버전에서 추가된 기능)
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // 로딩 스피너 애니메이션을 위한 CSS
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 스타일
  const hoverBoxStyle = {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    border: '1px solid #f1f3f4'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-6px)';
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.12)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
  };

  // 회사 정보 불러오기
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch(`http://localhost:8081/api/companyadmins/info/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCompanyInfo(data);
        setCompanyAdminId(data.companyAdminId || 0);
      })
      .catch(() => setCompanyInfo(null));
  }, []);

  // 저장된 공고 불러오기
  useEffect(() => {
    // JWT 토큰이 있으면 바로 공고를 불러오도록 수정
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.log('JWT 토큰이 없습니다.');
      setLoading(false);
      return;
    }
    
    console.log('공고 목록을 불러오는 중...');
    fetch(`http://localhost:8081/api/postings/company`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log('API 응답 상태:', res.status);
        if (!res.ok) {
          throw new Error(`API 호출 실패: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('받은 공고 데이터:', data);
        // API 응답이 배열인지 확인
        if (Array.isArray(data)) {
          setPostings(data);
          console.log(`${data.length}개의 공고를 로드했습니다.`);
        } else {
          console.error('API 응답이 배열이 아님:', data);
          setPostings([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('공고 조회 오류:', error);
        setPostings([]);
        setLoading(false);
      });
  }, []); // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행

  // 디버깅을 위한 로그 추가
  useEffect(() => {
    console.log('현재 상태 - loading:', loading, 'postings 길이:', postings.length);
  }, [loading, postings]);

  // 선택된 공고의 상세 정보
  useEffect(() => {
    if (selectedPostId) {
      setLoadingPostDetail(true);
      fetch(`http://localhost:8081/api/postings/info/${selectedPostId}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setSelectedPostDetail(data);
          setLoadingPostDetail(false);
        })
        .catch(() => {
          setSelectedPostDetail(null);
          setLoadingPostDetail(false);
        });
    } else {
      setSelectedPostDetail(null);
    }
  }, [selectedPostId]);

  // GitHub 프로필 사진 URL 생성 함수
  const getGithubAvatarUrl = (githubLogin) => {
    return `https://github.com/${githubLogin}.png?size=100`;
  };

  // GitHub API를 사용해서 사용자 정보 가져오기 (선택사항)
  const fetchGithubUserInfo = async (githubLogin) => {
    try {
      const response = await fetch(`https://api.github.com/users/${githubLogin}`);
      if (response.ok) {
        const userData = await response.json();
        return {
          name: userData.name,
          bio: userData.bio,
          location: userData.location,
          company: userData.company,
          followers: userData.followers,
          publicRepos: userData.public_repos
        };
      }
    } catch (error) {
      console.error('GitHub API 호출 오류:', error);
    }
    return null;
  };

  // 후보자 목록 불러오기 (상태값 포함 API 사용)
  const fetchCandidates = async (postId, filter = '전체') => {
    setLoadingCandidates(true);
    try {
      let endpoint = '';
      switch (filter) {
        case '추가 지원자':
          // 추가 지원자는 해당 공고의 stage가 0인 지원자들을 조회
          endpoint = `http://localhost:8081/api/github-search/by-post/${postId}/additional-applicants`;
          break;
        case '전체':
          endpoint = `http://localhost:8081/api/github-search/by-post/${postId}/all`;
          break;
        case '미회신자':
          endpoint = `http://localhost:8081/api/github-search/by-post/${postId}/no-response`;
          break;
        case '회신자':
          endpoint = `http://localhost:8081/api/github-search/by-post/${postId}/response`;
          break;
        case '면접 예정자':
          endpoint = `http://localhost:8081/api/github-search/by-post/${postId}/interview-scheduled`;
          break;
        case '면접 완료자':
          endpoint = `http://localhost:8081/api/github-search/by-post/${postId}/interview-completed`;
          break;
        default:
          endpoint = `http://localhost:8081/api/github-search/by-post/${postId}/all`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('후보자 데이터 조회 실패');
      const data = await response.json();
      console.log('API 응답:', data);
      
      // API 응답 구조에 맞게 매핑 (모든 필터 동일한 구조)
      const mapped = data.map(item => ({
        ...item.candidate,
        jobCandCurrStage: item.candidate.jobCandCurrStage,
        jobCandidateId: item.jobCandidateId,
        aiAnalysis: item.aiAnalysis || null
      }));
      console.log('매핑된 후보자:', mapped);
      setGithubCandidates(mapped);
    } catch (e) {
      console.error('후보자 조회 오류:', e);
      setGithubCandidates([]);
    } finally {
      setLoadingCandidates(false);
    }
  };

  // 후보자 목록 탭 진입 시 fetchCandidates(selectedPostId) 호출하도록 useEffect 등에서 연결
  useEffect(() => {
    if (selectedPostId) {
      fetchCandidates(selectedPostId, candidateFilter);
    }
  }, [selectedPostId, candidateFilter]);

  const handlePostClick = (postId) => {
    // 직접 지원자 화면이 활성화되어 있으면 먼저 종료
    if (showDirectApplicants) {
      setShowDirectApplicants(false);
    }
    
    setSelectedPostId(postId);
    setActiveTab('details'); // 클릭하면 무조건 첫 탭부터
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activePostings = postings?.filter(post => post.postStatus === 'ACTIVE') || [];

  // 탭 변경
  const handleTabChange = (tab) => setActiveTab(tab);

  // Feather 스타일 SVG 아이콘
  const EditIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
    </svg>
  );
  const TrashIcon = () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
  // 진행중인 채용 SVG 아이콘
  const LocationIcon = () => (
    <svg width="18" height="18" fill="none" stroke="#30c59b" strokeWidth="2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 3 }}>
      <path d="M12 21s8-7.58 8-12A8 8 0 1 0 4 9c0 4.42 8 12 8 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
  const PeopleIcon = () => (
    <svg width="18" height="18" fill="none" stroke="#30c59b" strokeWidth="2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 3 }}>
      <circle cx="9" cy="7" r="4" />
      <path d="M17 11c1.66 0 3 1.34 3 3v3H7v-3c0-1.66 1.34-3 3-3h7z" />
    </svg>
  );
  const CalendarIcon = () => (
    <svg width="18" height="18" fill="none" stroke="#30c59b" strokeWidth="2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: 3 }}>
      <rect x="3" y="5" width="18" height="16" rx="4" />
      <path d="M16 3v4M8 3v4M3 9h18" />
    </svg>
  );

  // 수정 모달 열기
  const openEditModal = () => {
    setEditTitle(selectedPostDetail?.postTitle || '');
    setEditDesc(selectedPostDetail?.postDescription || '');
    setShowEditModal(true);
  };
  // 삭제 모달 열기
  const openDeleteModal = () => setShowDeleteModal(true);

  // 수정 저장
  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/api/postings/${selectedPostId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({ postTitle: editTitle, postDescription: editDesc })
      });
      if (res.ok) {
        setShowEditModal(false);
        // 상세 정보 갱신
        const detailRes = await fetch(`http://localhost:8081/api/postings/info/${selectedPostId}`);
        setSelectedPostDetail(await detailRes.json());
      } else {
        alert('수정에 실패했습니다.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // 삭제 실행
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/api/postings/${selectedPostId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (res.ok) {
        setShowDeleteModal(false);
        setSelectedPostId(null);
        // 목록 갱신
        const listRes = await fetch(`http://localhost:8081/api/postings/company`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        });
        setPostings(await listRes.json());
      } else {
        alert('삭제에 실패했습니다.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // 후보자 상태 라벨 변환 함수 (StatePage 참고)
  const getStageLabel = (code) => {
    switch (code) {
      case '1n': return '필터링';
      case '2n': return '메일발송';
      case '2y': return '회신';
      case '3n': return '면접 예정자';
      case '3y': return '면접 완료자';
      case '4n': return '불합격';
      case '4y': return '합격';
      default: return '필터링';
    }
  };

  // 상태별 색상 반환 함수
  const getStageColor = (code) => {
    switch (code) {
      case '1n': return { bg: '#e6fffa', text: '#319795', border: '#b2f5ea' }; // 필터링 - 청록색
      case '2n': return { bg: '#fef5e7', text: '#d69e2e', border: '#fbd38d' }; // 메일발송 - 주황색
      case '2y': return { bg: '#f0fff4', text: '#38a169', border: '#9ae6b4' }; // 회신 - 초록색
      case '3n': return { bg: '#e6f3ff', text: '#3182ce', border: '#90cdf4' }; // 면접 예정자 - 파란색
      case '3y': return { bg: '#faf5ff', text: '#805ad5', border: '#d6bcfa' }; // 면접 완료자 - 보라색
      case '4n': return { bg: '#fed7d7', text: '#e53e3e', border: '#fc8181' }; // 불합격 - 빨간색
      case '4y': return { bg: '#c6f6d5', text: '#38a169', border: '#68d391' }; // 합격 - 진한 초록색
      default: return { bg: '#e6fffa', text: '#319795', border: '#b2f5ea' };
    }
  };

  // 메일 발송 함수
  const sendEmailToCandidate = async (candidate) => {
    if (!candidate.candidateEmail) {
      alert('이 후보자의 이메일 정보가 없습니다.');
      return;
    }

    const confirmed = window.confirm(
      `${candidate.githubLogin}님에게 메일을 발송하시겠습니까?\n\n` +
      `이메일: ${candidate.candidateEmail}`
    );

    if (!confirmed) return;

    try {
      const payload = {
        postId: selectedPostId,
        githubLogin: candidate.githubLogin,
        companyAdminId: companyAdminId,
        candidateEmail: candidate.candidateEmail
      };

      const response = await fetch("http://localhost:8081/api/invitations/send-multiple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([payload]),
      });

      if (response.ok) {
        alert("📨 메일이 성공적으로 발송되었습니다!");
        // 후보자 목록 새로고침
        fetchCandidates(selectedPostId, candidateFilter);
      } else {
        alert("❌ 메일 발송에 실패했습니다.");
      }
    } catch (error) {
      console.error("메일 발송 오류:", error);
      alert("⚠️ 서버 오류로 메일 발송에 실패했습니다.");
    }
  };

  // 면접 예정자 전체 불러오기 (모든 공고에 대해)
  useEffect(() => {
    const fetchInterviewScheduledCandidates = async () => {
      try {
        let allCandidates = [];
        for (const post of postings) {
          if (!post.postId) continue;
          const res = await fetch(`http://localhost:8081/api/github-search/by-post/${post.postId}/interview-scheduled`);
          if (res.ok) {
            const data = await res.json();
            // API 응답 구조에 따라 candidate 정보 추출
            const mapped = data.map(item => ({
              ...item.candidate,
              postTitle: post.postTitle,
              interviewDate: item.candidate.interviewDate || null // 필요시
            }));
            allCandidates = allCandidates.concat(mapped);
          }
        }
        setInterviewScheduledCandidates(allCandidates);
      } catch (e) {
        setInterviewScheduledCandidates([]);
      }
    };
    if (postings.length > 0) fetchInterviewScheduledCandidates();
  }, [postings]);

  const fetchDirectApplicants = async (specificPostId = null) => {
    setLoadingDirectApplicants(true);
    try {
      const allApplicants = [];
      
      if (specificPostId) {
        // 특정 공고의 직접 지원자만 조회
        const post = postings.find(p => p.postId === specificPostId);
        if (post) {
          const response = await fetch(`http://localhost:8081/api/portfolios/by-post/${post.postId}`);
          if (response.ok) {
            const applicants = await response.json();
            const applicantsWithPostInfo = applicants.map(applicant => ({
              ...applicant,
              postTitle: post.postTitle,
              postLocation: post.postLocation,
              postProgrammingLanguage: post.postProgrammingLanguage
            }));
            allApplicants.push(...applicantsWithPostInfo);
          }
        }
      } else {
        // 모든 공고의 직접 지원자를 조회
        for (const post of postings) {
          const response = await fetch(`http://localhost:8081/api/portfolios/by-post/${post.postId}`);
          if (response.ok) {
            const applicants = await response.json();
            const applicantsWithPostInfo = applicants.map(applicant => ({
              ...applicant,
              postTitle: post.postTitle,
              postLocation: post.postLocation,
              postProgrammingLanguage: post.postProgrammingLanguage
            }));
            allApplicants.push(...applicantsWithPostInfo);
          }
        }
      }
      
      setDirectApplicants(allApplicants);
    } catch (error) {
      console.error('직접 지원자 조회 오류:', error);
      setDirectApplicants([]);
    } finally {
      setLoadingDirectApplicants(false);
    }
  };

  const handleDirectApplicantsClick = () => {
    if (showDirectApplicants) {
      // 이미 직접 지원자 화면이면 기업정보 화면으로 돌아가기
      setShowDirectApplicants(false);
      setSelectedApplicants(new Set()); // 선택 상태 초기화
    } else {
      // 기업정보 화면이면 직접 지원자 화면으로 전환
      setShowDirectApplicants(true);
      setSelectedPostId(null); // 선택된 공고 해제
      setSelectedApplicants(new Set()); // 선택 상태 초기화
      fetchDirectApplicants();
    }
  };

  // 지원자 수락 처리
  const handleAcceptApplicants = async () => {
    if (selectedApplicants.size === 0) return;

    const confirmed = window.confirm(`선택한 ${selectedApplicants.size}명의 지원자를 수락하시겠습니까?`);
    if (!confirmed) return;

    try {
      // 현재 표시 중인 지원자 목록에 따라 다른 배열 사용
      const currentApplicants = showDirectApplicants ? directApplicants : githubCandidates;
      
      // 선택된 지원자들의 candidateId와 postId를 모두 수집
      const candidateData = Array.from(selectedApplicants).map(index => ({
        candidateId: currentApplicants[index].candidateId,
        postId: currentApplicants[index].postId
      }));
      
      const response = await fetch('http://localhost:8081/api/progress/update-stage-multiple', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({
          candidateData: candidateData,
          newStage: '2y' // 회신자로 변경
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${result.updatedCount}명의 지원자가 수락되어 회신자로 이동했습니다.`);
        // 선택 해제 및 목록 새로고침
        setSelectedApplicants(new Set());
        if (showDirectApplicants) {
          fetchDirectApplicants();
        } else if (candidateFilter === '추가 지원자') {
          fetchCandidates(selectedPostId, '추가 지원자');
        }
      } else {
        alert('수락 처리 중 오류가 발생했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('수락 처리 오류:', error);
      alert('수락 처리 중 오류가 발생했습니다.');
    }
  };

  // 지원자 거절 처리
  const handleRejectApplicants = async () => {
    if (selectedApplicants.size === 0) return;

    const confirmed = window.confirm(`선택한 ${selectedApplicants.size}명의 지원자를 거절하시겠습니까?`);
    if (!confirmed) return;

    try {
      // 현재 표시 중인 지원자 목록에 따라 다른 배열 사용
      const currentApplicants = showDirectApplicants ? directApplicants : githubCandidates;
      
      // 선택된 지원자들의 candidateId와 postId를 모두 수집
      const candidateData = Array.from(selectedApplicants).map(index => ({
        candidateId: currentApplicants[index].candidateId,
        postId: currentApplicants[index].postId
      }));
      
      const response = await fetch('http://localhost:8081/api/progress/update-stage-multiple', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({
          candidateData: candidateData,
          newStage: '0n' // 거절 상태로 변경
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${result.updatedCount}명의 지원자가 거절 처리되었습니다.`);
        // 선택 해제 및 목록 새로고침
        setSelectedApplicants(new Set());
        if (showDirectApplicants) {
          fetchDirectApplicants();
        } else if (candidateFilter === '추가 지원자') {
          fetchCandidates(selectedPostId, '추가 지원자');
        }
      } else {
        alert('거절 처리 중 오류가 발생했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('거절 처리 오류:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    }
  };

  // 개별 지원자 수락 처리
  const handleAcceptSingleApplicant = async (candidate, index) => {
    const confirmed = window.confirm(`${candidate.candidateName}님을 수락하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch('http://localhost:8081/api/responder/update-stage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({
          candidateIds: [candidate.candidateId],
          newStage: '1n', // 수락 상태로 변경
          postId: candidate.postId || selectedPostId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${candidate.candidateName}님이 수락되었습니다.`);
        
        // 선택에서 제거
        const newSelected = new Set(selectedApplicants);
        newSelected.delete(index);
        setSelectedApplicants(newSelected);
        
        // 목록 새로고침
        if (candidateFilter === '추가 지원자') {
          fetchCandidates(selectedPostId, '추가 지원자');
        }
        if (showDirectApplicants) {
          fetchDirectApplicants();
        }
      } else {
        alert('수락 처리 중 오류가 발생했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('수락 처리 오류:', error);
      alert('수락 처리 중 오류가 발생했습니다.');
    }
  };

  // 개별 지원자 거절 처리
  const handleRejectSingleApplicant = async (candidate, index) => {
    const confirmed = window.confirm(`${candidate.candidateName}님을 거절하시겠습니까?`);
    if (!confirmed) return;

    try {
      const response = await fetch('http://localhost:8081/api/responder/update-stage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
        body: JSON.stringify({
          candidateIds: [candidate.candidateId],
          newStage: '0n', // 거절 상태로 변경
          postId: candidate.postId || selectedPostId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`${candidate.candidateName}님이 거절되었습니다.`);
        
        // 선택에서 제거
        const newSelected = new Set(selectedApplicants);
        newSelected.delete(index);
        setSelectedApplicants(newSelected);
        
        // 목록 새로고침
        if (candidateFilter === '추가 지원자') {
          fetchCandidates(selectedPostId, '추가 지원자');
        }
        if (showDirectApplicants) {
          fetchDirectApplicants();
        }
      } else {
        alert('거절 처리 중 오류가 발생했습니다: ' + result.message);
      }
    } catch (error) {
      console.error('거절 처리 오류:', error);
      alert('거절 처리 중 오류가 발생했습니다.');
    }
  };

  const closedPostings = postings?.filter(post => post.postStatus === 'CLOSED') || [];

  // 후보자 목록 필터 버튼 부분
  const filterLabels = ['추가 지원자', '전체', '미회신자', '회신자', '면접 예정자', '면접 완료자'];
  const [indicatorProps, setIndicatorProps] = useState({ left: 0, width: 0 });
  const btnRefs = useRef([]);
  const groupRef = useRef(null);

  useEffect(() => {
    const idx = filterLabels.indexOf(candidateFilter);
    if (btnRefs.current[idx]) {
      const btn = btnRefs.current[idx];
      const groupRect = groupRef.current?.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setIndicatorProps({
        left: btnRect.left - (groupRect?.left || 0),
        width: btnRect.width
      });
    }
  }, [candidateFilter]);

  // AI 분석 결과 가져오기
  const fetchAiAnalysis = async (jobCandidateId) => {
    setAiAnalysisLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/ai-analysis-results/portfolio/${jobCandidateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setCurrentAiAnalysis(analysis);
        setShowAiAnalysisModal(true);
      } else {
        alert('AI 분석 결과를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('AI 분석 결과 조회 오류:', error);
      alert('AI 분석 결과를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  return (
    <div className="company-dashboard" style={{ fontFamily: 'SUIT, Apple SD Gothic Neo, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-container" style={{ display: 'flex', marginTop: '6rem', alignItems: 'flex-start' }}>
        <CompanySidebar
          postings={postings}
          loading={loading}
          selectedPostId={selectedPostId}
          onPostClick={handlePostClick}
          onDirectApplicantsClick={handleDirectApplicantsClick}
          showDirectApplicants={showDirectApplicants}
        />

        <main style={{ flex: 1, padding: '4rem 3rem', backgroundColor: '#ffffff' }}>
          {showDirectApplicants ? (
            <div style={{ marginTop: '0.5rem', padding: '0 2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                 {/* 제목과 액션 바를 한 줄에 배치 */}
                 <div style={{
                   display: 'flex',
                   justifyContent: 'space-between',
                   alignItems: 'center',
                   marginBottom: '1.5rem'
                 }}>
                   <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2d3748', margin: 0 }}>
                     직접 지원자 목록 ({directApplicants.length}명)
                   </h2>
                   
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <span style={{ color: '#4a5568', fontWeight: '600', fontSize: '0.95rem' }}>
                         {selectedApplicants.size}명 선택됨
                       </span>
                       {selectedApplicants.size > 0 && (
                         <button
                           onClick={() => setSelectedApplicants(new Set())}
                           style={{
                             background: 'none',
                             border: 'none',
                             color: '#718096',
                             fontSize: '0.85rem',
                             cursor: 'pointer',
                             textDecoration: 'underline'
                           }}
                         >
                           선택 해제
                         </button>
                       )}
                     </div>
                     
                     <div style={{ display: 'flex', gap: '0.8rem' }}>
                       <button
                         disabled={selectedApplicants.size === 0}
                         style={{
                           background: selectedApplicants.size === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                           color: selectedApplicants.size === 0 ? '#a0aec0' : 'white',
                           padding: '0.6rem 1.2rem',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '0.85rem',
                           fontWeight: '600',
                           cursor: selectedApplicants.size === 0 ? 'not-allowed' : 'pointer',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.4rem',
                           transition: 'all 0.2s ease'
                         }}
                                                onClick={() => handleAcceptApplicants()}
                       >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                           <path d="M20 6L9 17l-5-5"/>
                         </svg>
                         수락
                       </button>
                       
                       <button
                         disabled={selectedApplicants.size === 0}
                         style={{
                           background: selectedApplicants.size === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                           color: selectedApplicants.size === 0 ? '#a0aec0' : 'white',
                           padding: '0.6rem 1.2rem',
                           border: 'none',
                           borderRadius: '8px',
                           fontSize: '0.85rem',
                           fontWeight: '600',
                           cursor: selectedApplicants.size === 0 ? 'not-allowed' : 'pointer',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.4rem',
                           transition: 'all 0.2s ease'
                         }}
                                                onClick={() => handleRejectApplicants()}
                       >
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                           <path d="M18 6L6 18"/>
                           <path d="M6 6l12 12"/>
                         </svg>
                         거절
                       </button>
                     </div>
                   </div>
                 </div>
              </div>

              {loadingDirectApplicants ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                  직접 지원자 목록을 불러오는 중...
                </div>
              ) : directApplicants.length === 0 ? (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center', 
                  padding: '4rem', 
                  color: '#666',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  minHeight: '260px',
                }}>
                  <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#cbd5e0" strokeWidth="1.5" style={{ marginBottom: '2rem' }}>
                    <circle cx="12" cy="8.5" r="4.5" stroke="#b5c6d6" strokeWidth="1.5"/>
                    <rect x="3.5" y="15" width="17" height="6" rx="3" stroke="#b5c6d6" strokeWidth="1.5"/>
                  </svg>
                  <div style={{ fontSize: '1.08rem', color: '#7b8794', fontWeight: 500 }}>
                    아직 직접 지원한 지원자가 없습니다.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {directApplicants.map((applicant, index) => {
                    const isSelected = selectedApplicants.has(index);
                    return (
                    <div
                      key={index}
                      style={{
                        background: isSelected ? '#f0fff4' : '#ffffff',
                        border: isSelected ? '2px solid #48bb78' : '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: isSelected ? '0 8px 30px rgba(72,187,120,0.15)' : '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => {
                        const newSelected = new Set(selectedApplicants);
                        if (newSelected.has(index)) {
                          newSelected.delete(index);
                        } else {
                          newSelected.add(index);
                        }
                        setSelectedApplicants(newSelected);
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                        }
                      }}
                    >

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#2d3748', margin: 0 }}>
                              {applicant.candidateName}
                            </h3>
                                                         <span style={{
                               background: applicant.careerType === '경력' ? '#e6fffa' : '#edf2f7',
                               color: applicant.careerType === '경력' ? '#00b894' : '#4a5568',
                               padding: '0.3rem 0.8rem',
                               borderRadius: '20px',
                               fontSize: '0.8rem',
                               fontWeight: '600'
                             }}>
                               {applicant.careerType || '신입'} ({applicant.totalCareerPeriod || '0'}년)
                             </span>
                          </div>
                          
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ color: '#4a5568', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                              </svg>
                              {applicant.candidateEmail}
                            </div>
                            <div style={{ color: '#4a5568', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                              {applicant.candidatePhoneNumber}
                            </div>
                            <div style={{ color: '#4a5568', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                              </svg>
                              {applicant.postTitle}
                            </div>
                            {applicant.githubLogin && (
                              <div style={{ color: '#4a5568', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2">
                                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                                </svg>
                                GitHub: {applicant.githubLogin}
                              </div>
                            )}
                          </div>
                          
                          <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            지원일: {new Date(applicant.portfolioSubmissionDate).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          {applicant.portfolioFilePath && (
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setCurrentPortfolioUrl(applicant.portfolioFilePath);
                                setShowPortfolioModal(true);
                                setPortfolioLoading(true);
                              }}
                              style={{
                                background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                                color: 'white',
                                padding: '0.7rem 1.5rem',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)';
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                              </svg>
                              포트폴리오 보기
                            </button>
                          )}
                          
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              // JobCandProgress의 jobCandidateId를 사용해야 함
                              // 직접 지원자의 경우 JobCandProgress에서 jobCandidateId를 찾아야 함
                              if (applicant.jobCandidateId) {
                                fetchAiAnalysis(applicant.jobCandidateId);
                              } else {
                                alert('AI 분석 결과를 찾을 수 없습니다. 지원자가 아직 포트폴리오를 제출하지 않았을 수 있습니다.');
                              }
                            }}
                            style={{
                              background: 'linear-gradient(135deg, #30c59b 0%, #2dc997 100%)',
                              color: 'white',
                              padding: '0.7rem 1.5rem',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #2dc997 0%, #2DC100 100%)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #30c59b 0%, #2dc997 100%)';
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 12l2 2 4-4"/>
                              <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
                              <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
                              <path d="M12 3c0 1-1 2-2 2s-2-1-2-2 1-2 2-2 2 1 2 2z"/>
                              <path d="M12 21c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z"/>
                            </svg>
                            AI 분석 결과 보기
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : selectedPostId ? (
            <div style={{ marginTop: '2.1rem' }}>
              {/* 탭 헤더 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '2.5rem',
                  marginBottom: '1.2rem',
                  marginTop: 0
                }}
              >
                <button
                  onClick={() => handleTabChange('details')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: activeTab === 'details' ? '1.6rem' : '1.1rem',
                    fontWeight: 700,
                    color: activeTab === 'details' ? '#2d3748' : '#bcc6d3',
                    marginRight: '0.2rem',
                    cursor: activeTab === 'details' ? 'default' : 'pointer',
                    transition: 'color 0.3s, font-size 0.3s',
                    lineHeight: 1.1,
                  }}
                  disabled={activeTab === 'details'}
                >
                  공고 상세 정보
                </button>
                <button
                  onClick={() => handleTabChange('candidates')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: activeTab === 'candidates' ? '1.6rem' : '1.1rem',
                    fontWeight: 700,
                    color: activeTab === 'candidates' ? '#2d3748' : '#bcc6d3',
                    cursor: activeTab === 'candidates' ? 'default' : 'pointer',
                    transition: 'color 0.3s, font-size 0.3s',
                    lineHeight: 1.1,
                  }}
                  disabled={activeTab === 'candidates'}
                >
                  후보자 목록
                </button>
              </div>

              {/* 탭 본문 */}
              <div style={{ opacity: 1, transition: 'opacity 0.3s ease' }}>
                {activeTab === 'details' ? (
                  <div>
                    <section
                      style={{ ...hoverBoxStyle, background: '#ffffff' }}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {loadingPostDetail || !selectedPostDetail ? (
                        <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>공고 정보를 불러오는 중...</p>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                          gap: '1.5rem',
                          color: '#4a5568',
                          fontSize: '0.95rem'
                        }}>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>공고 제목</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568', fontSize: '1rem' }}>{selectedPostDetail.postTitle}</div>
                          </div>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>상태</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>
                              <span style={{
                                background: selectedPostDetail.postStatus === 'ACTIVE' ? '#48bb78' : '#ed8936',
                                color: 'white',
                                padding: '0.3rem 0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                {selectedPostDetail.postStatus === 'ACTIVE' ? '진행중' : '마감'}
                              </span>
                            </div>
                          </div>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>지역</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{selectedPostDetail.postLocation || '지역 미정'}</div>
                          </div>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>모집 인원</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{selectedPostDetail.postHeadcount || 0}명</div>
                          </div>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>연봉</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>
                              {selectedPostDetail.postSalaryStart || '0'} ~ {selectedPostDetail.postSalaryEnd || '0'}
                            </div>
                          </div>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>프로그래밍 언어</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{selectedPostDetail.postProgrammingLanguage || '미정'}</div>
                          </div>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>공고일</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{formatDate(selectedPostDetail.postPostedDate)}</div>
                          </div>
                          <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <strong style={{ color: '#2d3748', fontSize: '1.1rem' }}>마감일</strong>
                            <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{formatDate(selectedPostDetail.postExpiryDate)}</div>
                          </div>
                        </div>
                      )}
                    </section>
                    {/* 공고 설명 */}
                    {selectedPostDetail && !loadingPostDetail && selectedPostDetail.postDescription && (
                      <section style={{ ...hoverBoxStyle, marginTop: '2rem' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>공고 설명</h3>
                        <div style={{
                          padding: '1.5rem',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {selectedPostDetail.postDescription}
                        </div>
                      </section>
                    )}
                    {/* 인재상 */}
                    {selectedPostDetail && !loadingPostDetail && selectedPostDetail.postIdealCandidate && (
                      <section style={{ ...hoverBoxStyle, marginTop: '2rem' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem', color: '#2d3748' }}>인재상</h3>
                        <div style={{
                          padding: '1.5rem',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap',
                          color: '#222',
                          fontSize: '1.1rem',
                          fontFamily: 'inherit'
                        }}>
                          {selectedPostDetail.postIdealCandidate
                            .replace(/<EXAMPLES>[\s\S]*?<END>/g, '')
                            .split('\n')
                            .map((line, idx) => {
                              const trimmed = line.trim().replace(/^- /, '');
                              if (!trimmed) return null;
                              if (trimmed.includes(':')) {
                                const [left, ...right] = trimmed.split(':');
                                return (
                                  <div key={idx} style={{ margin: '0.2em 0' }}>
                                    <span style={{ fontWeight: 700, color: '#222' }}>{left}:</span>
                                    <span style={{ fontWeight: 400, color: '#222', marginLeft: 4 }}>{right.join(':')}</span>
                                  </div>
                                );
                              }
                              return <div key={idx} style={{ color: '#222', margin: '0.2em 0' }}>{trimmed}</div>;
                            })}
                        </div>
                      </section>
                    )}

                    {/* 수정/삭제 버튼 */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2.5rem' }}>
                      <button
                        onClick={openEditModal}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.7rem',
                          background: 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '0.85rem 2.2rem',
                          fontWeight: 700,
                          fontSize: '1.08rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 18px rgba(104, 211, 145, 0.13)',
                          transition: 'background 0.25s, box-shadow 0.25s, transform 0.18s',
                          letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(72, 187, 120, 0.18)';
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)';
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(104, 211, 145, 0.13)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <EditIcon /> 수정하기
                      </button>
                      <button
                        onClick={openDeleteModal}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.7rem',
                          background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '0.85rem 2.2rem',
                          fontWeight: 700,
                          fontSize: '1.08rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 18px rgba(245, 101, 101, 0.13)',
                          transition: 'background 0.25s, box-shadow 0.25s, transform 0.18s',
                          letterSpacing: '0.01em',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
                          e.currentTarget.style.boxShadow = '0 8px 32px rgba(229, 62, 62, 0.18)';
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
                          e.currentTarget.style.boxShadow = '0 4px 18px rgba(245, 101, 101, 0.13)';
                          e.currentTarget.style.transform = 'none';
                        }}
                      >
                        <TrashIcon /> 삭제하기
                      </button>
                    </div>
                  </div>
                ) : (
                  <section style={{ ...hoverBoxStyle }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    {loadingCandidates ? (
                      <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>후보자 정보를 불러오는 중...</p>
                    ) : activeTab === 'candidates' && (
                      <div ref={groupRef} style={{ position: 'relative', display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                        {/* 슬라이딩 인디케이터 */}
                        <motion.div
                          layout
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: indicatorProps.left,
                            width: indicatorProps.width,
                            height: 5,
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #30c59b 0%, #6be8c8 100%)',
                            zIndex: 2,
                            pointerEvents: 'none',
                          }}
                        />
                        {filterLabels.map((label, i) => {
                          // 추가 지원자 버튼 특별 스타일
                          const isAdditionalApplicant = label === '추가 지원자';
                          const isActiveFilter = label === candidateFilter;
                          
                          return (
                          <motion.button
                            key={label}
                            ref={el => btnRefs.current[i] = el}
                            type="button"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              position: 'relative',
                              overflow: 'hidden',
                              padding: '0.6rem 1.5rem',
                              borderRadius: '999px',
                              border: '1.5px solid',
                              fontWeight: 700,
                              fontSize: '1.05rem',
                                cursor: isActiveFilter ? 'default' : 'pointer',
                                boxShadow: isAdditionalApplicant 
                                  ? '0 0 15px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.1)' 
                                  : 'none',
                              outline: 'none',
                                color: isActiveFilter ? '#30c59b' : '#30c59b',
                              background: '#fff',
                                borderColor: isActiveFilter ? '#30c59b' : '#e2e8f0',
                              zIndex: 3,
                              transition: 'all 0.2s',
                            }}
                            onClick={() => {
                              if (candidateFilter !== label) {
                                setCandidateFilter(label);
                                fetchCandidates(selectedPostId, label);
                              }
                            }}
                            disabled={candidateFilter === label}
                          >
                              <span style={{ position: 'relative', zIndex: 4 }}>
                                {label}
                              </span>
                          </motion.button>
                          );
                        })}
                      </div>
                    )}
                    {activeTab === 'candidates' && (
                      <AnimatePresence mode="wait">
                        {candidateFilter === '추가 지원자' && githubCandidates.length === 0 ? (
                          <motion.div
                            key="empty-additional"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.32, type: 'spring', stiffness: 60 }}
                            style={{
                              padding: '2rem',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              textAlign: 'center',
                              color: '#4a5568'
                            }}
                          >
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👥</div>
                            <p>아직 직접 지원한 지원자가 없습니다.</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#718096' }}>
                              지원자가 포트폴리오를 제출하면 여기에 표시됩니다.
                            </p>
                          </motion.div>
                        ) : candidateFilter === '추가 지원자' ? (
                          <motion.div
                            key="additional-applicants"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.32, type: 'spring', stiffness: 60 }}
                            style={{ display: 'grid', gap: '1rem' }}
                          >
                            {/* 추가 지원자 일괄 처리 버튼 */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '1rem',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              marginBottom: '1rem'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: '#4a5568', fontWeight: '600', fontSize: '0.95rem' }}>
                                  {selectedApplicants.size}명 선택됨
                                </span>
                                {selectedApplicants.size > 0 && (
                                  <button
                                    onClick={() => setSelectedApplicants(new Set())}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#718096',
                                      fontSize: '0.85rem',
                                      cursor: 'pointer',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    선택 해제
                                  </button>
                                )}
                              </div>
                              
                              <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button
                                  disabled={selectedApplicants.size === 0}
                                  style={{
                                    background: selectedApplicants.size === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                    color: selectedApplicants.size === 0 ? '#a0aec0' : 'white',
                                    padding: '0.6rem 1.2rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: selectedApplicants.size === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={() => handleAcceptApplicants()}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M20 6L9 17l-5-5"/>
                                  </svg>
                                  수락
                                </button>
                                
                                <button
                                  disabled={selectedApplicants.size === 0}
                                  style={{
                                    background: selectedApplicants.size === 0 ? '#e2e8f0' : 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                                    color: selectedApplicants.size === 0 ? '#a0aec0' : 'white',
                                    padding: '0.6rem 1.2rem',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    cursor: selectedApplicants.size === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={() => handleRejectApplicants()}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M18 6L6 18"/>
                                    <path d="M6 6l12 12"/>
                                  </svg>
                                  거절
                                </button>
                              </div>
                            </div>
                            {githubCandidates.map((candidate, index) => {
                              const isSelected = selectedApplicants.has(index);
                              return (
                              <motion.div
                                key={candidate.candidateId || index}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                transition={{ duration: 0.28, type: 'spring', stiffness: 70 }}
                                style={{
                                  padding: '1.5rem',
                                  border: isSelected ? '2px solid #48bb78' : '1px solid #e2e8f0',
                                  borderRadius: '14px',
                                  background: isSelected ? 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                  transition: 'all 0.3s ease',
                                  position: 'relative',
                                  cursor: 'pointer',
                                  boxShadow: isSelected ? '0 8px 30px rgba(72,187,120,0.15)' : '0 4px 20px rgba(0,0,0,0.08)'
                                }}
                                onClick={() => {
                                  const newSelected = new Set(selectedApplicants);
                                  if (newSelected.has(index)) {
                                    newSelected.delete(index);
                                  } else {
                                    newSelected.add(index);
                                  }
                                  setSelectedApplicants(newSelected);
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                                  }
                                }}
                              >
                                {/* 직접 지원 뱃지 */}
                                <div style={{
                                  position: 'absolute',
                                  top: '1rem',
                                  right: '1rem',
                                  background: 'linear-gradient(135deg, #4299e1, #3182ce)',
                                  color: 'white',
                                  padding: '0.3rem 0.8rem',
                                  borderRadius: '12px',
                                  fontSize: '0.8rem',
                                  fontWeight: '600'
                                }}>
                                  직접 지원
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                  <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #68d391, #48bb78)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    color: 'white',
                                    flexShrink: 0
                                  }}>
                                    👤
                                  </div>
                                  
                                  <div style={{ flex: 1 }}>
                                    <h4 style={{
                                      fontSize: '1.1rem',
                                      fontWeight: '600',
                                      color: '#2d3748',
                                      margin: '0 0 0.5rem 0'
                                    }}>
                                      {candidate.githubName || candidate.candidateName || candidate.name || '이름 미공개'}
                                    </h4>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                                      {/* 이메일 */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#4a5568' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                        {candidate.githubEmail || candidate.candidateEmail || candidate.email || '이메일 미공개'}
                                      </div>
                                      {/* 전화번호 */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#4a5568' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><path d="M22 16.92V21a2 2 0 0 1-2.18 2A19.72 19.72 0 0 1 3 5.18 2 2 0 0 1 5 3h4.09a2 2 0 0 1 2 1.72c.13 1.13.37 2.24.72 3.32a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.29 6.29l1.27-1.27a2 2 0 0 1 2.11-.45c1.08.35 2.19.59 3.32.72A2 2 0 0 1 21 18.91V21z"/></svg>
                                        {candidate.candidatePhoneNumber || '전화번호 미공개'}
                                      </div>
                                      {/* GitHub 아이디 */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#4a5568' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.115 2.51.337 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.73 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
                                        {candidate.githubLogin || 'GitHub 미공개'}
                                      </div>
                                      {/* 공고 정보 (추가 지원자 필터에서만 표시) */}
                                      {candidateFilter === '추가 지원자' && candidate.postId && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#4a5568' }}>
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                          공고 #{candidate.postId}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                            })}
                          </motion.div>
                        ) : githubCandidates.length === 0 ? (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.32, type: 'spring', stiffness: 60 }}
                            style={{
                              padding: '2rem',
                              background: '#f8fafc',
                              borderRadius: '12px',
                              border: '1px solid #e2e8f0',
                              textAlign: 'center',
                              color: '#4a5568'
                            }}
                          >
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
                            <p>아직 깃허브 검색이 실행되지 않았습니다.</p>
                            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#718096' }}>
                              깃허브 검색을 실행하면 이 공고에 적합한 후보자들이 표시됩니다.
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.38, type: 'spring', stiffness: 60 }}
                            style={{ display: 'grid', gap: '1rem' }}
                          >
                            {githubCandidates
                              .slice()
                              .sort((a, b) => {
                                const getScore = c => {
                                  if (c.aiAnalysis && typeof c.aiAnalysis.analysisScore === 'number') return c.aiAnalysis.analysisScore;
                                  if (typeof c.analysisScore === 'number') return c.analysisScore;
                                  return 0;
                                };
                                return getScore(b) - getScore(a);
                              })
                              .map((candidate, index) => (
                                <motion.div
                                  key={candidate.githubSearchResultId}
                                  initial={{ opacity: 0, y: 16 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -16 }}
                                  transition={{ duration: 0.28, type: 'spring', stiffness: 70 }}
                                  style={{
                                    padding: '1.5rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  {/* 순위 뱃지 */}
                                  <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: index < 3 ? 'linear-gradient(135deg, #f6ad55, #ed8936)' : 'linear-gradient(135deg, #a0aec0, #718096)',
                                    color: 'white',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                  }}>
                                    {index + 1}위
                                  </div>
                                  {/* 메일 발송 버튼 (우측 하단) */}
                                  {(candidate.jobCandCurrStage === '1n' || candidate.jobCandCurrStage === '2n') && candidate.candidateEmail && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '1rem',
                                      right: '1rem'
                                    }}>
                                      <button
                                        onClick={() => sendEmailToCandidate(candidate)}
                                        style={{
                                          background: 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '50%',
                                          width: '40px',
                                          height: '40px',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 2px 8px rgba(104, 211, 145, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(104, 211, 145, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(104, 211, 145, 0.3)';
                                        }}
                                        title="메일 발송"
                                      >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M22 2L11 13"/>
                                          <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                  {/* 면접 평가 버튼 (우측 하단) */}
                                  {candidate.jobCandCurrStage === '3y' && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '1rem',
                                      right: '1rem'
                                    }}>
                                      <button
                                        onClick={() => {
                                          // 면접 평가 페이지로 이동
                                          window.location.href = `/company/interview-evaluation/${selectedPostId}/${candidate.jobCandidateId}`;
                                        }}
                                        style={{
                                          background: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '50%',
                                          width: '40px',
                                          height: '40px',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: '0 2px 8px rgba(128, 90, 213, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(128, 90, 213, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(128, 90, 213, 0.3)';
                                        }}
                                        title="면접 평가"
                                      >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M9 12l2 2 4-4"/>
                                          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                  {/* 상태 라벨 */}
                                  {candidate.jobCandCurrStage && (
                                    <div style={{
                                      position: 'absolute',
                                      top: '1rem',
                                      left: '1rem',
                                      background: getStageColor(candidate.jobCandCurrStage).bg,
                                      color: getStageColor(candidate.jobCandCurrStage).text,
                                      padding: '0.3rem 0.8rem',
                                      borderRadius: '12px',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      border: `1px solid ${getStageColor(candidate.jobCandCurrStage).border}`,
                                      letterSpacing: '0.01em'
                                    }}>
                                      {getStageLabel(candidate.jobCandCurrStage)}
                                    </div>
                                  )}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                    <div style={{
                                      width: '60px',
                                      height: '60px',
                                      borderRadius: '50%',
                                      background: 'linear-gradient(135deg, #68d391, #48bb78)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '1.5rem',
                                      color: 'white',
                                      flexShrink: 0,
                                      overflow: 'hidden',
                                      border: '2px solid #e2e8f0'
                                    }}>
                                      <img 
                                        src={getGithubAvatarUrl(candidate.githubLogin)}
                                        alt={`${candidate.githubLogin}의 프로필`}
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                          borderRadius: '50%'
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                      />
                                      <div style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'none',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        color: 'white'
                                      }}>
                                        👤
                                      </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                                        <h4 style={{
                                          fontSize: '1.1rem',
                                          fontWeight: '600',
                                          color: '#2d3748',
                                          margin: 0
                                        }}>
                                          {candidate.githubLogin}
                                        </h4>
                                        <button
                                          onClick={() => window.open(candidate.githubProfileUrl, '_blank')}
                                          style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0.3rem',
                                            borderRadius: '6px',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f7fafc';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                          }}
                                          title="GitHub 프로필 보기"
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#4a5568' }}>
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.115 2.51.337 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.73 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSelectedCandidate(candidate);
                                            setModalOpen(true);
                                          }}
                                          style={{
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.3rem 0.6rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                          }}
                                          title="상세보기"
                                        >
                                          상세보기
                                        </button>
                                        {candidate.aiAnalysis && (
                                          <button
                                            onClick={() => {
                                              setCurrentAiAnalysis(candidate.aiAnalysis);
                                              setShowAiAnalysisModal(true);
                                            }}
                                            style={{
                                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                              color: 'white',
                                              border: 'none',
                                              padding: '0.3rem 0.6rem',
                                              borderRadius: '6px',
                                              cursor: 'pointer',
                                              fontSize: '0.8rem',
                                              fontWeight: '500',
                                              transition: 'all 0.2s',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.transform = 'translateY(-1px)';
                                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.transform = 'translateY(0)';
                                              e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            title="AI 분석 결과"
                                          >
                                            AI 분석
                                          </button>
                                        )}
                                      </div>
                                      <div style={{ marginBottom: '0.8rem' }}>
                                        <span style={{
                                          background: candidate.analysisScore >= 80 ? '#48bb78' : 
                                                     candidate.analysisScore >= 60 ? '#f6ad55' : '#e53e3e',
                                          color: 'white',
                                          padding: '0.3rem 0.8rem',
                                          borderRadius: '8px',
                                          fontSize: '0.8rem',
                                          fontWeight: '600'
                                        }}>
                                          분석 점수: {candidate.analysisScore ? candidate.analysisScore.toFixed(1) : 'N/A'}
                                        </span>
                                      </div>
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '0.8rem',
                                        fontSize: '0.9rem',
                                        color: '#4a5568'
                                      }}>
                                        <div>
                                          <strong>검색일:</strong> {formatDateTime(candidate.githubSearchDate)}
                                        </div>
                                        {candidate.candidateEmail && (
                                          <div>
                                            <strong>이메일:</strong> {candidate.candidateEmail}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </section>
                )}
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginTop: '1.2rem' }}></div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '1.2rem', color: '#2d3748' }}>기업 정보</h2>
              <section
                style={{ ...hoverBoxStyle, background: '#ffffff' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {companyInfo ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    color: '#4a5568',
                    fontSize: '0.95rem'
                  }}>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#2d3748' }}>기업 이름</strong>
                      <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{companyInfo.companyName}</div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#2d3748' }}>사업자번호</strong>
                      <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{companyInfo.businessNumber}</div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#2d3748' }}>대표자명</strong>
                      <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{companyInfo.ceoName}</div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#2d3748' }}>관리자명</strong>
                      <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{companyInfo.adminName}</div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#2d3748' }}>이메일</strong>
                      <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{companyInfo.email}</div>
                    </div>
                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#2d3748' }}>주소</strong>
                      <div style={{ marginTop: '0.5rem', color: '#4a5568' }}>{companyInfo.address}</div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>기업 정보를 불러오는 중...</p>
                )}
              </section>

              <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1.2rem', color: '#2d3748' }}>진행 중인 채용</h2>
              <section style={{ ...hoverBoxStyle }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {loading ? (
                  <p style={{ color: '#4a5568', textAlign: 'center', padding: '2rem' }}>공고 정보를 불러오는 중...</p>
                ) : activePostings.length === 0 ? (
                  <p style={{ color: '#4a5568', textAlign: 'center', padding: '2rem' }}>진행 중인 채용이 없습니다.</p>
                ) : (
                  <div>
                    <p style={{ color: '#4a5568', marginBottom: '1.5rem', fontSize: '1rem' }}>
                      현재 <strong style={{ color: '#68d391' }}>{activePostings.length}개</strong>의 공고가 진행 중입니다.
                    </p>
                    <div style={{ display: 'grid', gap: '1.2rem' }}>
                      {activePostings.slice(0, 3).map((post) => (
                        <div key={post.postId} style={{
                          padding: '1.5rem',
                          border: '1px solid #e2e8f0',
                          borderRadius: '14px',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          transition: 'all 0.3s ease',
                        }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '0.8rem', color: '#2d3748', fontSize: '1.1rem' }}>{post.postTitle}</div>
                          <div style={{ fontSize: '0.9rem', color: '#4a5568', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <span><LocationIcon /> {post.postLocation}</span>
                            <span><PeopleIcon /> {post.postHeadcount}명 모집</span>
                            <span><CalendarIcon /> {formatDate(post.postPostedDate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1.2rem', color: '#2d3748' }}>면접 예정자</h2>
              <section style={{ ...hoverBoxStyle }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {interviewScheduledCandidates.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>면접 예정자가 없습니다.</div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {interviewScheduledCandidates.map((cand, idx) => (
                      <div key={cand.githubLogin + idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#2d3748' }}>{cand.githubLogin}</strong>
                        {cand.interviewDate && (
                          <span> – {new Date(cand.interviewDate).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        <span style={{ color: '#30c59b', marginLeft: 8, fontWeight: 500, fontSize: '0.98em' }}>({cand.postTitle})</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <h2 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1.2rem', color: '#2d3748' }}>과거 채용 내역</h2>
              <section style={{ ...hoverBoxStyle }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {closedPostings.length === 0 ? (
                  <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>과거 채용 내역이 없습니다.</div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {closedPostings.map((post, idx) => (
                      <div key={post.postId} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        {formatDate(post.postPostedDate)} - {post.postTitle}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      {/* 포트폴리오 모달 */}
      <Modal 
        open={showPortfolioModal} 
        onClose={() => {
          setShowPortfolioModal(false);
          setPortfolioLoading(false);
        }}
        isPortfolio={true}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: '#2d3748' }}>포트폴리오</h2>
        <div style={{ 
          width: '100%', 
          height: '70vh', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {portfolioLoading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e2e8f0',
                  borderTop: '4px solid #4299e1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#718096', fontSize: '0.9rem' }}>포트폴리오를 불러오는 중...</p>
              </div>
            </div>
          )}
          {currentPortfolioUrl && (
            <iframe
              src={currentPortfolioUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="포트폴리오"
              onLoad={() => setPortfolioLoading(false)}
              onError={() => {
                setPortfolioLoading(false);
                alert('포트폴리오를 불러올 수 없습니다.');
              }}
            />
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.2rem' }}>
          <button 
            onClick={() => window.open(currentPortfolioUrl, '_blank')}
            style={{ 
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              padding: '0.7rem 1.5rem', 
              fontWeight: 600, 
              fontSize: '1rem', 
              cursor: 'pointer' 
            }}
          >
            새 탭에서 열기
          </button>
          <button 
            onClick={() => {
              setShowPortfolioModal(false);
              setPortfolioLoading(false);
            }} 
            style={{ 
              background: '#e2e8f0', 
              color: '#444', 
              border: 'none', 
              borderRadius: 8, 
              padding: '0.7rem 1.5rem', 
              fontWeight: 600, 
              fontSize: '1rem', 
              cursor: 'pointer' 
            }}
          >
            닫기
          </button>
        </div>
      </Modal>

      {/* AI 분석 결과 모달 */}
      <Modal 
        open={showAiAnalysisModal} 
        onClose={() => {
          setShowAiAnalysisModal(false);
          setCurrentAiAnalysis(null);
        }}
        isAiAnalysis={true}
      >
        <div style={{
          background: 'linear-gradient(135deg, #9ae6b4 0%, #68d391 50%, #48bb78 100%)',
          margin: '-2.2rem -2rem 2rem -2rem',
          padding: '2rem',
          borderRadius: '16px 16px 0 0',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(154, 230, 180, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(154, 230, 180, 0.1) 30%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-30%',
            width: '160%',
            height: '160%',
            background: 'radial-gradient(circle, rgba(104, 211, 145, 0.1) 0%, transparent 60%)',
            animation: 'pulse 6s ease-in-out infinite reverse'
          }}></div>
                      <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: 'white', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              position: 'relative',
              zIndex: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1), 0 0 20px rgba(255,255,255,0.3)'
            }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 21H5V3H13V9H19V21Z" fill="currentColor"/>
              <path d="M8 12H16V14H8V12ZM8 16H16V18H8V16Z" fill="currentColor"/>
            </svg>
            AI 포트폴리오 분석 결과
          </h2>
        </div>
        
        {aiAnalysisLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '3rem 2rem'
          }}>
            <div style={{
              position: 'relative',
              width: '60px',
              height: '60px'
            }}>
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="26" stroke="#e2e8f0" strokeWidth="4" fill="none"/>
                <circle cx="30" cy="30" r="26" stroke="#48bb78" strokeWidth="4" fill="none" 
                  strokeDasharray="163" strokeDashoffset="163"
                  style={{
                    animation: 'spin 1.5s linear infinite',
                    transformOrigin: 'center'
                  }}
                />
              </svg>
                              <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  background: '#48bb78',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
            </div>
            <div style={{
              textAlign: 'center'
            }}>
              <p style={{ 
                color: '#4a5568', 
                fontSize: '1rem', 
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                AI가 포트폴리오를 분석하고 있습니다
              </p>
              <p style={{ 
                color: '#718096', 
                fontSize: '0.9rem',
                margin: 0
              }}>
                잠시만 기다려주세요...
              </p>
            </div>
          </div>
        )}
        
        {currentAiAnalysis && !aiAnalysisLoading && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {/* 분석 점수 카드 */}
            {currentAiAnalysis.analysisScore && (
              <div style={{
                background: 'linear-gradient(135deg, #9ae6b4 0%, #68d391 50%, #48bb78 100%)',
                color: 'white',
                padding: '2rem',
                borderRadius: '16px',
                marginBottom: '1.5rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(154, 230, 180, 0.4), 0 0 20px rgba(104, 211, 145, 0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '50%'
                }}></div>
                
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 3H18V1H16V3H8V1H6V3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z" fill="currentColor"/>
                  </svg>
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  marginBottom: '0.5rem',
                  position: 'relative',
                  zIndex: 1,
                  textShadow: '0 2px 8px rgba(0,0,0,0.2), 0 0 30px rgba(255,255,255,0.5)'
                }}>
                  {currentAiAnalysis.analysisScore}점
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  opacity: 0.9,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {currentAiAnalysis.analysisDate ? new Date(currentAiAnalysis.analysisDate).toLocaleString('ko-KR') : '분석 일시 없음'}
                </div>
              </div>
            )}
            
            {/* 상세 분석 내용 */}
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '16px',
              boxShadow: '0 8px 25px rgba(154, 230, 180, 0.13), 0 2px 8px rgba(0, 0, 0, 0.06)',
              marginBottom: '1.5rem',
              border: 'none'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                marginBottom: '1.5rem', 
                color: '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#9ae6b4', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#48bb78', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 12H16V14H8V12ZM8 16H12V18H8V16Z" fill="url(#iconGradient)"/>
                </svg>
                상세 분석 내용
              </h3>
              <div style={{
                whiteSpace: 'pre-wrap',
                lineHeight: '1.8',
                color: '#4a5568',
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fff4 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #c6f6d5',
                boxShadow: '0 2px 8px rgba(154, 230, 180, 0.1), inset 0 1px 0 rgba(255,255,255,0.9)'
              }}>
                {currentAiAnalysis.analysisData || '분석 데이터가 없습니다.'}
              </div>
            </div>
            
            {/* 분석 정보 */}
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              color: '#718096',
              marginTop: '1rem',
              boxShadow: '0 4px 12px rgba(154, 230, 180, 0.10)',
              border: 'none'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.5rem' 
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#718096"/>
                  <path d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z" fill="#718096"/>
                </svg>
                <strong>분석 타입:</strong> {currentAiAnalysis.analysisType || 'portfolio'}
              </div>
              {currentAiAnalysis.analysisDate && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V8H19V19Z" fill="#718096"/>
                    <path d="M7 10H9V12H7V10ZM11 10H13V12H11V10ZM15 10H17V12H15V10Z" fill="#718096"/>
                  </svg>
                  <strong>분석 일시:</strong> {new Date(currentAiAnalysis.analysisDate).toLocaleString('ko-KR')}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          marginRight: '-2rem',
          borderTop: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => {
              setShowAiAnalysisModal(false);
              setCurrentAiAnalysis(null);
            }}
            style={{
              background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
              color: 'white',
              padding: '0.875rem 2rem',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3), 0 0 20px rgba(245, 101, 101, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(245, 101, 101, 0.4), 0 0 30px rgba(245, 101, 101, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.3), 0 0 20px rgba(245, 101, 101, 0.2)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
            닫기
          </button>
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        `}</style>
      </Modal>

      {/* 수정 모달 */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: '#2d3748' }}>공고 수정</h2>
        <div style={{ marginBottom: '1.1rem' }}>
          <label style={{ fontWeight: 600, color: '#444', fontSize: '1rem' }}>제목</label>
          <input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            style={{ width: '100%', marginTop: 6, marginBottom: 12, padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '1rem' }}
            maxLength={100}
          />
          <label style={{ fontWeight: 600, color: '#444', fontSize: '1rem' }}>설명</label>
          <textarea
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            style={{ width: '100%', marginTop: 6, minHeight: 90, padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
            maxLength={2000}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.2rem' }}>
          <button onClick={() => setShowEditModal(false)} style={{ background: '#e2e8f0', color: '#444', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>취소</button>
          <button onClick={handleEditSave} disabled={editLoading} style={{ background: 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)', color: 'white', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: editLoading ? 'not-allowed' : 'pointer', opacity: editLoading ? 0.7 : 1 }}>저장</button>
        </div>
      </Modal>
      {/* 삭제 모달 */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.2rem', color: '#e53e3e' }}>공고 삭제</h2>
        <div style={{ color: '#444', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
          정말 이 공고를 삭제하시겠습니까?<br />삭제하면 복구할 수 없습니다.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={() => setShowDeleteModal(false)} style={{ background: '#e2e8f0', color: '#444', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>취소</button>
          <button onClick={handleDelete} disabled={deleteLoading} style={{ background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)', color: 'white', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', fontWeight: 600, fontSize: '1rem', cursor: deleteLoading ? 'not-allowed' : 'pointer', opacity: deleteLoading ? 0.7 : 1 }}>삭제</button>
        </div>
      </Modal>
      
      {/* CandidateModal */}
      {isModalOpen && selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCandidate(null);
          }}
          postId={selectedPostId}
          avatarUrl={getGithubAvatarUrl(selectedCandidate.githubLogin)}
        />
      )}
    </div>
  );
}

// 모달 컴포넌트
function Modal({ open, onClose, children, isPortfolio = false, isAiAnalysis = false }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', 
        borderRadius: 16, 
        minWidth: isPortfolio ? '80vw' : isAiAnalysis ? '50vw' : 340, 
        maxWidth: isPortfolio ? '90vw' : isAiAnalysis ? '65vw' : 420, 
        maxHeight: isPortfolio ? '90vh' : isAiAnalysis ? '80vh' : 'auto',
        padding: '2.2rem 2rem 1.5rem 2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.13)', 
        position: 'relative',
        overflow: isPortfolio ? 'hidden' : 'visible'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#aaa', cursor: 'pointer' }}>&times;</button>
        {children}
      </div>
    </div>
  );
}
