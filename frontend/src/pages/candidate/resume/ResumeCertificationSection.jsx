import React, { useState } from 'react';
import { FaPlus, FaTrash, FaCalendarAlt } from 'react-icons/fa';
import './ResumeSubmissionPage.css';

const ResumeCertificationSection = ({ form, setForm }) => {
  const [newCertification, setNewCertification] = useState({
    type: '',
    name: '',
    organization: '',
    score: '',
    issueDate: '',
    expiryDate: '',
    description: ''
  });

  const certificationTypes = [
    { value: 'certificate', label: '자격증·면허증' },
    { value: 'language', label: '어학시험' },
    { value: 'award', label: '수상내역·공모전' }
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

  const handleAddCertification = () => {
    if (!newCertification.type || !newCertification.name) {
      alert('구분과 자격/어학/수상명을 입력해주세요.');
      return;
    }

    const certification = {
      id: Date.now(),
      ...newCertification,
      issueDate: newCertification.issueDate ? newCertification.issueDate : '',
      expiryDate: newCertification.expiryDate ? newCertification.expiryDate : ''
    };

    setForm(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), certification]
    }));

    setNewCertification({
      type: '',
      name: '',
      organization: '',
      score: '',
      issueDate: '',
      expiryDate: '',
      description: ''
    });
  };

  const handleRemoveCertification = (id) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const handleUpdateCertification = (id, field, value) => {
    setForm(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
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
      <h3 className="resume-section-title">자격/어학/수상</h3>
      
      {/* 새 자격 추가 폼 */}
      <div className="certification-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              구분 <span className="required">*</span>
            </label>
            <select
              value={newCertification.type}
              onChange={(e) => setNewCertification(prev => ({ ...prev, type: e.target.value }))}
              className="form-select"
            >
              <option value="">구분 *</option>
              {certificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">
              자격/어학/수상명 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={newCertification.name}
              onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
              placeholder="자격/어학/수상명 *"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">발급기관</label>
            <input
              type="text"
              value={newCertification.organization}
              onChange={(e) => setNewCertification(prev => ({ ...prev, organization: e.target.value }))}
              placeholder="발급기관명"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">점수/등급</label>
            <input
              type="text"
              value={newCertification.score}
              onChange={(e) => setNewCertification(prev => ({ ...prev, score: e.target.value }))}
              placeholder="점수 또는 등급"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">취득일</label>
            <div className="date-input-group">
              <select
                value={newCertification.issueDate.split('-')[1] || ''}
                onChange={(e) => {
                  const year = newCertification.issueDate.split('-')[0] || '';
                  const newDate = year ? `${year}-${e.target.value}` : `2024-${e.target.value}`;
                  setNewCertification(prev => ({ ...prev, issueDate: newDate }));
                }}
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
                value={newCertification.issueDate.split('-')[0] || ''}
                onChange={(e) => {
                  const month = newCertification.issueDate.split('-')[1] || '';
                  const newDate = month ? `${e.target.value}-${month}` : e.target.value;
                  setNewCertification(prev => ({ ...prev, issueDate: newDate }));
                }}
                placeholder="취득년도"
                className="form-input year-input"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">만료일</label>
            <div className="date-input-group">
              <select
                value={newCertification.expiryDate.split('-')[1] || ''}
                onChange={(e) => {
                  const year = newCertification.expiryDate.split('-')[0] || '';
                  const newDate = year ? `${year}-${e.target.value}` : `2024-${e.target.value}`;
                  setNewCertification(prev => ({ ...prev, expiryDate: newDate }));
                }}
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
                value={newCertification.expiryDate.split('-')[0] || ''}
                onChange={(e) => {
                  const month = newCertification.expiryDate.split('-')[1] || '';
                  const newDate = month ? `${e.target.value}-${month}` : e.target.value;
                  setNewCertification(prev => ({ ...prev, expiryDate: newDate }));
                }}
                placeholder="만료년도"
                className="form-input year-input"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">상세 설명</label>
          <textarea
            value={newCertification.description}
            onChange={(e) => setNewCertification(prev => ({ ...prev, description: e.target.value }))}
            placeholder="자격/어학/수상 상세내용 입력"
            className="form-textarea"
            rows="4"
          />
          <div className="character-count">
            <span>총 글자수 {getCharacterCount(newCertification.description).totalChars}자 / {getCharacterCount(newCertification.description).totalBytes} byte</span>
            <span>공백제외 {getCharacterCount(newCertification.description).noSpaceChars}자 / {getCharacterCount(newCertification.description).noSpaceBytes} byte</span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleAddCertification}
            className="btn btn-primary"
          >
            <FaPlus style={{ marginRight: 8 }} />
            추가
          </button>
        </div>
      </div>

      {/* 기존 자격 목록 */}
      {form.certifications && form.certifications.length > 0 && (
        <div className="certification-list">
          {form.certifications.map((certification) => (
            <div key={certification.id} className="certification-item">
              <div className="certification-header">
                <div className="certification-type">
                  {certificationTypes.find(t => t.value === certification.type)?.label || certification.type}
                </div>
                <div className="certification-name">{certification.name}</div>
                {certification.organization && (
                  <div className="certification-organization">{certification.organization}</div>
                )}
                {certification.score && (
                  <div className="certification-score">{certification.score}</div>
                )}
                <div className="certification-dates">
                  {certification.issueDate && `취득: ${certification.issueDate}`}
                  {certification.expiryDate && ` / 만료: ${certification.expiryDate}`}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(certification.id)}
                  className="btn-remove"
                >
                  <FaTrash />
                </button>
              </div>
              {certification.description && (
                <div className="certification-description">
                  {certification.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeCertificationSection; 