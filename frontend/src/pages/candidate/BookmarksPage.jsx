import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import CompactJobCard from '../../components/CompactJobCard';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './BookmarksPage.css';

// Constants for filters
const LANGUAGES = ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Ruby', 'Kotlin'];
const LOCATIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

export default function BookmarksPage() {
  const { authState } = useAuth();
  const candidateId = authState.userId;
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [languageFilter, setLanguageFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchBookmarks = async () => {
    if (!candidateId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8081/api/bookmarks/candidate/${candidateId}`);
      if (res.ok) {
        const data = await res.json();
        console.log('북마크 API 응답:', data);
        
        // BookmarkDto 구조에 맞게 데이터 변환
        const posts = data.map(bookmark => ({
          postId: bookmark.postId,
          postTitle: bookmark.postTitle,
          postDescription: bookmark.postDescription,
          postLocation: bookmark.postLocation,
          postSalaryStart: bookmark.postSalaryStart,
          postSalaryEnd: bookmark.postSalaryEnd,
          postStatus: bookmark.postStatus,
          postPostedDate: bookmark.postPostedDate,
          companyName: bookmark.companyName || 'ZOOP',
          postProgrammingLanguage: bookmark.postProgrammingLanguage || 'Python',
          postExpiryDate: bookmark.postExpiryDate || bookmark.postPostedDate,
          postHeadcount: bookmark.postHeadcount ? bookmark.postHeadcount.toString() : '1'
        }));
        
        setBookmarkedPosts(posts);
        setBookmarkedPostIds(posts.map(p => p.postId));
      } else {
        setError('북마크 정보를 불러오지 못했습니다.');
      }
    } catch (e) {
      console.error('북마크 로딩 오류:', e);
      setError('북마크 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (post) => {
    if (!candidateId) {
      alert('로그인이 필요합니다.');
      return;
    }
    const isBookmarked = bookmarkedPostIds.includes(post.postId);
    // Optimistic UI update
    if (isBookmarked) {
      setBookmarkedPostIds(prev => prev.filter(id => id !== post.postId));
      setBookmarkedPosts(prev => prev.filter(p => p.postId !== post.postId));
    } else {
      setBookmarkedPostIds(prev => [...prev, post.postId]);
      setBookmarkedPosts(prev => [...prev, post]);
    }
    // API call
    if (isBookmarked) {
      await fetch(`http://localhost:8081/api/bookmarks?candidateId=${candidateId}&postId=${post.postId}`, { method: 'DELETE' });
    } else {
      await fetch('http://localhost:8081/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ candidateId, postId: post.postId })
      });
    }
    fetchBookmarks();
  };

  useEffect(() => {
    if (!candidateId) return;
    fetchBookmarks();
  }, [candidateId]);

  const handleJobTitleClick = (postId) => {
    navigate(`/job/${postId}`);
  };

  // Filter posts based on search and filters
  const filteredPosts = bookmarkedPosts.filter(post => {
    const matchesLanguage = !languageFilter || 
      (post.postProgrammingLanguage && 
       post.postProgrammingLanguage.toLowerCase().includes(languageFilter.toLowerCase()));
    
    const matchesLocation = !locationFilter || 
      (post.postLocation && post.postLocation.includes(locationFilter));
    
    const matchesSearch = !search || 
      (post.postTitle && post.postTitle.toLowerCase().includes(search.toLowerCase())) ||
      (post.companyName && post.companyName.toLowerCase().includes(search.toLowerCase()));

    return matchesLanguage && matchesLocation && matchesSearch;
  });

  return (
    <div className="bookmarks-page">
      {/* Header */}
      <div className="bookmarks-header">
        <h1>스크랩/관심기업</h1>
        <p>저장한 채용 공고를 한눈에 확인하세요</p>
      </div>

      {/* Filter Bar */}
      <section className="bookmarks-filter-bar">
        <div className="filter-group">
          <select value={languageFilter} onChange={e => setLanguageFilter(e.target.value)} className="filter-select">
            <option value="">언어 선택</option>
            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="filter-select">
            <option value="">지역 선택</option>
            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <div className="search-box">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="검색어 입력" 
            />
            <FaSearch className="search-icon" />
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="bookmarks-job-listings-grid">
        <div className="bookmarks-job-grid">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner" />
              <p>북마크를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <CompactJobCard
                key={post.postId}
                post={post}
                isBookmarked={bookmarkedPostIds.includes(post.postId)}
                onBookmarkToggle={handleBookmarkToggle}
                onClick={() => handleJobTitleClick(post.postId)}
              />
            ))
          ) : bookmarkedPosts.length > 0 ? (
            <div className="no-jobs">조건에 맞는 북마크가 없습니다.</div>
          ) : (
            <div className="no-jobs">스크랩한 공고가 없습니다.</div>
          )}
        </div>
      </section>
    </div>
  );
} 