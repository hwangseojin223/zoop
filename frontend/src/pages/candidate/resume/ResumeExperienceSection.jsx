import React, { useState } from 'react';
import { FaPlus, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import './ResumeSubmissionPage.css';

const ResumeExperienceSection = ({ form, setForm }) => {
  const [newExperience, setNewExperience] = useState({
    type: '',
    organization: '',
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    description: ''
  });

  const activityTypes = [
    { value: 'education', label: '교육' },
    { value: 'activity', label: '활동' },
    { value: 'project', label: '프로젝트' },
    { value: 'volunteer', label: '봉사활동' },
    { value: 'internship', label: '인턴십' },
    { value: 'research', label: '연구활동' }
  ];

  const months = [
    { value: '01', label: '1월' },
    { value: '02', label: '2월' },
    { value: '03', label: '3월' },
    { value: '04', label: '4월' },
    { value: '05', label: '5월' },
    { value: '06', label: '6월' },
    { value: '07', label: '7월' },
    { value: '08', label: '8월' },
    { value: '09', label: '9월' },
    { value: '10', label: '10월' },
    { value: '11', label: '11월' },
    { value: '12', label: '12월' }
  ];

  const years = Array.from({ length: 30 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  const handleAddExperience = () => {
    if (!newExperience.type || !newExperience.organization) {
      alert('활동구분과 기관/장소명을 입력해주세요.');
      return;
    }

    const experience = {
      id: Date.now(),
      ...newExperience,
      startDate: `${newExperience.startYear}-${newExperience.startMonth}`,
      endDate: newExperience.endYear && newExperience.endMonth 
        ? `${newExperience.endYear}-${newExperience.endMonth}` 
        : '현재'
    };

    setForm(prev => ({
      ...prev,
      experiences: [...(prev.experiences || []), experience]
    }));

    setNewExperience({
      type: '',
      organization: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      description: ''
    });
  };

  const handleRemoveExperience = (id) => {
    setForm(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const handleUpdateExperience = (id, field, value) => {
    setForm(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const getCharacterCount = (text) => {
    const totalChars = text.length;
    const totalBytes = new Blob([text]).size;
    const noSpaceChars = text.replace(/\s/g, '').length;
    const noSpaceBytes = new Blob([text.replace(/\s/g, '')]).size;
    
    return { totalChars, totalBytes, noSpaceChars, noSpaceBytes };
  };

  return (
    <div className="resume-section">
      <h3 className="resume-section-title">경험/활동/교육</h3>
      
      {/* 새 경험 추가 폼 */}
      <div className="experience-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              활동구분 선택 <span className="required">*</span>
            </label>
            <select
              value={newExperience.type}
              onChange={(e) => setNewExperience(prev => ({ ...prev, type: e.target.value }))}
              className="form-select"
            >
              <option value="">활동구분 선택 *</option>
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              기관/장소명 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={newExperience.organization}
              onChange={(e) => setNewExperience(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="기관/장소명 *"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">시작년월</label>
            <div className="date-input-group">
              <select
                value={newExperience.startMonth}
                onChange={(e) => setNewExperience(prev => ({ ...prev, startMonth: e.target.value }))}
                className="form-select month-select"
              >
                <option value="">월입력</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newExperience.startYear}
                onChange={(e) => setNewExperience(prev => ({ ...prev, startYear: e.target.value }))}
                placeholder="시작년월"
                className="form-input year-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">종료년월</label>
            <div className="date-input-group">
              <select
                value={newExperience.endMonth}
                onChange={(e) => setNewExperience(prev => ({ ...prev, endMonth: e.target.value }))}
                className="form-select month-select"
              >
                <option value="">월입력</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newExperience.endYear}
                onChange={(e) => setNewExperience(prev => ({ ...prev, endYear: e.target.value }))}
                placeholder="종료년월"
                className="form-input year-input"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">활동 설명</label>
          <textarea
            value={newExperience.description}
            onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
            placeholder="경험/활동 상세내용 입력"
            className="form-textarea"
            rows="4"
          />
          <div className="character-count">
            <span>총 글자수 {getCharacterCount(newExperience.description).totalChars}자 / {getCharacterCount(newExperience.description).totalBytes} byte</span>
            <span>공백제외 {getCharacterCount(newExperience.description).noSpaceChars}자 / {getCharacterCount(newExperience.description).noSpaceBytes} byte</span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleAddExperience}
            className="btn btn-primary"
          >
            <FaPlus style={{ marginRight: 8 }} />
            추가
          </button>
        </div>
      </div>

      {/* 기존 경험 목록 */}
      {form.experiences && form.experiences.length > 0 && (
        <div className="experience-list">
          {form.experiences.map((experience) => (
            <div key={experience.id} className="experience-item">
              <div className="experience-header">
                <div className="experience-type">
                  {activityTypes.find(t => t.value === experience.type)?.label || experience.type}
                </div>
                <div className="experience-organization">{experience.organization}</div>
                <div className="experience-dates">
                  {experience.startDate} ~ {experience.endDate}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(experience.id)}
                  className="btn-remove"
                >
                  <FaTrash />
                </button>
              </div>
              {experience.description && (
                <div className="experience-description">
                  {experience.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeExperienceSection; 