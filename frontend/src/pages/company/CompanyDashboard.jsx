import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../../components/Navbar';
import CompanySidebar from './CompanySidebar';
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
    fetch(`http://localhost:8081/api/posts/all`, {
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
      fetch(`http://localhost:8081/api/posts/info/${selectedPostId}`, {
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
      
      // API 응답 구조에 맞게 매핑
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
      const res = await fetch(`http://localhost:8081/api/posts/${selectedPostId}`, {
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
        const detailRes = await fetch(`http://localhost:8081/api/posts/info/${selectedPostId}`);
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
      const res = await fetch(`http://localhost:8081/api/posts/${selectedPostId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      if (res.ok) {
        setShowDeleteModal(false);
        setSelectedPostId(null);
        // 목록 갱신
        const listRes = await fetch(`http://localhost:8081/api/posts/all`, {
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

  const closedPostings = postings?.filter(post => post.postStatus === 'CLOSED') || [];

  // 후보자 목록 필터 버튼 부분
  const filterLabels = ['전체', '미회신자', '회신자', '면접 예정자', '면접 완료자'];
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

  return (
    <div className="company-dashboard" style={{ fontFamily: 'SUIT, Apple SD Gothic Neo, sans-serif', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-container" style={{ display: 'flex', marginTop: '6rem', alignItems: 'flex-start' }}>
        <CompanySidebar
          postings={postings}
          loading={loading}
          selectedPostId={selectedPostId}
          onPostClick={handlePostClick}
        />

        <main style={{ flex: 1, padding: '4rem 3rem', backgroundColor: '#ffffff' }}>
          {selectedPostId ? (
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
                        {filterLabels.map((label, i) => (
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
                              cursor: label === candidateFilter ? 'default' : 'pointer',
                              boxShadow: 'none',
                              outline: 'none',
                              color: label === candidateFilter ? '#30c59b' : '#30c59b',
                              background: '#fff',
                              borderColor: label === candidateFilter ? '#30c59b' : '#e2e8f0',
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
                            <span style={{ position: 'relative', zIndex: 4 }}>{label}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                    {activeTab === 'candidates' && (
                      <AnimatePresence mode="wait">
                        {githubCandidates.length === 0 ? (
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
                                  
                                  {/* 면접 점수 매기기 버튼 (면접 완료자) */}
                                  {candidate.jobCandCurrStage === '3y' && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '1rem',
                                      right: '1rem'
                                    }}>
                                      <button
                                        onClick={() => window.open(`/company/interview-evaluation/${candidate.jobCandidateId}`, '_blank')}
                                        style={{
                                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                                        }}
                                        title="면접 점수 매기기"
                                      >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                          </svg>
                                        </button>
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
    </div>
  );
}

// 모달 컴포넌트
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, minWidth: 340, maxWidth: 420, padding: '2.2rem 2rem 1.5rem 2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.13)', position: 'relative',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#aaa', cursor: 'pointer' }}>&times;</button>
        {children}
      </div>
    </div>
  );
}
