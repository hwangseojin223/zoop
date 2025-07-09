// src/pages/Careers.jsx
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar';
import CompactJobCard from '../../components/CompactJobCard';
import { FaSearch } from 'react-icons/fa';
import ApplyForm from '../../components/ApplyForm';
import './Careers.css';
import '../../components/ApplyForm.css';
import '../../components/CompactJobCard.css';

const LANGUAGES = [
  'Python', 'JavaScript', 'Java', 'C++', 'Go', 'Ruby', 'Kotlin', 'TypeScript', '기타'
];
const LOCATIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '기타'
];

function Careers() {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [languageFilter, setLanguageFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');
  const [videoPhase, setVideoPhase] = useState(0); // 0=video, 1=image
  const [showText, setShowText] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef(null);

  // Fetch postings once
  useEffect(() => { fetchPublicPostings(); }, []);

  // Set video playback rate when video loads
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, [videoPhase]);

  // Toggle media every 7s with smooth transition
  useEffect(() => {
    setShowText(false);
    const textTimer = setTimeout(() => setShowText(true), 600);
    const mediaTimer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setVideoPhase(v => 1 - v);
        setIsTransitioning(false);
      }, 500); // 0.5초 페이드 전환
    }, 7000);
    return () => {
      clearTimeout(textTimer);
      clearTimeout(mediaTimer);
    };
  }, [videoPhase]);

  const fetchPublicPostings = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/postings/public');
      if (res.ok) {
        const data = await res.json();
        setPostings(data.map(p => ({ ...p, companyName: p.companyName || 'ZOOP' })));
      } else setPostings([]);
    } catch {
      setPostings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = post => { setSelectedPost(post); setShowApplyModal(true); };
  const handleCancelApplication = () => setShowApplyModal(false);
  const handleSubmitApplication = async formData => {
    console.log('=== 프론트엔드에서 전송하는 데이터 ===');
    console.log('전체 formData:', formData);
    console.log('GitHub Login:', formData.githubLogin);
    console.log('Email:', formData.email);
    console.log('Name:', formData.name);
    console.log('Phone:', formData.phone);
    console.log('=====================================');
    
    try {
      const res = await fetch('http://localhost:8081/api/applications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowApplyModal(false);
        setShowSuccessModal(true);
      } else {
        const err = await res.json();
        alert(`지원 신청 실패: ${err.error || '알 수 없는 오류'}`);
      }
    } catch {
      alert('지원 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // Filter logic
  const filtered = postings.filter(post => {
    if (post.postExpiryDate && new Date(post.postExpiryDate) < new Date()) return false;
    if (languageFilter && !post.postProgrammingLanguage?.includes(languageFilter)) return false;
    if (locationFilter && !post.postLocation?.includes(locationFilter)) return false;
    if (search && !(post.postTitle?.includes(search) || post.companyName?.includes(search))) return false;
    return true;
  });

  return (
    <div className="careers-page">
      <Navbar />

      {/* Slider Section */}
      <section className="careers-video-section">
        <video
          key="video"
          className={`careers-media ${videoPhase === 0 ? 'active' : 'inactive'} ${isTransitioning ? 'transitioning' : ''}`}
          ref={videoRef}
          autoPlay 
          muted 
          loop={true}
          src="/careers_video.mp4"
          onError={(e) => {
            console.warn('Video loading error:', e);
          }}
        />
        
        <img
          key="image"
          className={`careers-media ${videoPhase === 1 ? 'active' : 'inactive'} ${isTransitioning ? 'transitioning' : ''}`}
          src="/careers1.png"
          alt="채용 이미지"
          onError={(e) => {
            console.warn('Image loading error:', e);
          }}
        />

        <div className="video-overlay">
          {showText && (
            <h1 className="video-title">
              {videoPhase === 0
                ? '최고의 기업들이 당신을 기다리고 있습니다'
                : '지금 바로 지원해보세요!'}
            </h1>
          )}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="careers-filter-bar">
        <div className="filter-group">
          <select value={languageFilter} onChange={e=>setLanguageFilter(e.target.value)} className="filter-select">
            <option value="">언어 선택</option>
            {LANGUAGES.map(lang=> <option key={lang} value={lang}>{lang}</option>)}
          </select>
          <select value={locationFilter} onChange={e=>setLocationFilter(e.target.value)} className="filter-select">
            <option value="">지역 선택</option>
            {LOCATIONS.map(loc=> <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <div className="search-box">
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="검색어 입력" />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="careers-job-listings-grid">
        <div className="careers-job-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>채용 공고를 불러오는 중...</p>
            </div>
          ) : filtered.length===0 ? (
            <div className="no-jobs">조건에 맞는 채용 공고가 없습니다.</div>
          ) : filtered.map(post=> (
            <CompactJobCard key={post.postId} post={post} onClick={()=>handleApply(post)} />
          ))}
        </div>
      </section>

      {/* Modals */}
      {showApplyModal && (
        <div className="modal-overlay modal-enter" onClick={()=>setShowApplyModal(false)}>
          <div className="apply-modal modal-enter" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedPost?.postTitle} 지원하기</h2>
              <button className="close-button" onClick={()=>setShowApplyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <ApplyForm post={selectedPost} onSubmit={handleSubmitApplication} onCancel={handleCancelApplication} />
            </div>
          </div>
        </div>
      )}
      
      {showSuccessModal && (
        <div className="modal-overlay modal-enter" onClick={()=>setShowSuccessModal(false)}>
          <div className="success-modal modal-enter" onClick={e=>e.stopPropagation()}>
            <div className="success-content">
              <div className="success-icon">✓</div>
              <h2>지원이 완료되었습니다!</h2>
              <p>입력해주신 정보가 담당자에게 전달되었습니다.</p>
              <button className="success-button" onClick={()=>setShowSuccessModal(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Careers;
