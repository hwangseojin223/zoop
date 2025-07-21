import React, { useState } from 'react';

const ResumeSelfIntroSection = ({ form, setForm }) => {
  const [coreSkills, setCoreSkills] = useState([]);
  const [urls, setUrls] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const maxLen = 1000;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, selfIntro: e.target.value }));
  };

  const handleAICareer = () => {
    setAiLoading(true);
    setTimeout(() => {
      setForm((prev) => ({ ...prev, selfIntro: 'AI가 생성한 커리어 소개 예시입니다. 실제 API 연동 시 이 부분이 자동 입력됩니다.' }));
      setAiLoading(false);
    }, 1200);
  };

  const addCoreSkill = () => {
    const skill = prompt('핵심역량을 입력하세요');
    if (skill) setCoreSkills([...coreSkills, skill]);
  };
  const addUrl = () => {
    const url = prompt('URL을 입력하세요');
    if (url) setUrls([...urls, url]);
  };

  return (
    <section className="resume-section">
      <div className="selfintro-card" style={{ background: 'white', border: 'none', borderRadius: 20, padding: 0, boxShadow: 'none', margin: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ color: '#222', fontSize: '1.5rem', fontWeight: 700, paddingBottom: '0.75rem', borderBottom: '2px solid #e2e8f0', flex: 1, position: 'relative' }}>
            커리어 소개
            <span style={{
              content: "''",
              position: 'absolute',
              bottom: -2,
              left: 0,
              width: 60,
              height: 2,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: 1,
              display: 'inline-block',
            }} />
          </div>
        </div>
        <div className="selfintro-tip">
          <b>ChatGPT API 기반!</b> TIP. 이력서를 구체적으로 작성할수록 AI 생성 결과의 퀄리티가 올라가요!
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="selfintro-btns" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="selfintro-sub-btn" onClick={addCoreSkill}>+ 핵심역량</button>
            <button className="selfintro-sub-btn" onClick={addUrl}>+ URL</button>
          </div>
          <button className="ai-career-btn" onClick={handleAICareer} disabled={aiLoading} style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {aiLoading ? '생성 중...' : 'AI 커리어 소개생성'}
          </button>
        </div>
        <div className="selfintro-inputs">
          {coreSkills.length > 0 && (
            <div className="core-skills-list">
              {coreSkills.map((s, i) => <span key={i} className="core-skill-chip">{s}</span>)}
            </div>
          )}
          {urls.length > 0 && (
            <div className="urls-list">
              {urls.map((u, i) => <span key={i} className="url-chip">{u}</span>)}
            </div>
          )}
          <textarea
            value={form.selfIntro || ''}
            onChange={handleChange}
            rows={7}
            maxLength={maxLen}
            placeholder="경력, 프로젝트, 역량, 성과 등 본인의 커리어를 자유롭게 소개해 주세요. (예: Python, 데이터 분석, 리더십 등)"
          />
          <div className="selfintro-footer">
            <span className="selfintro-count">{(form.selfIntro || '').length} / {maxLen}자</span>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ResumeSelfIntroSection; 