import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const ResumeEducationSection = ({ form, setForm }) => {
  const handleChange = (idx, field, value) => {
    const newEducation = [...(form.education || [])];
    // 날짜 필드 처리: YYYY-MM → 연,월 분리
    if (field === 'admissionDate' && value) {
      const [year, month] = value.split('-');
      newEducation[idx]['admissionYear'] = year;
      newEducation[idx]['admissionMonth'] = month;
      newEducation[idx]['admissionDate'] = value;
    } else if (field === 'graduationDate' && value) {
      const [year, month] = value.split('-');
      newEducation[idx]['graduationYear'] = year;
      newEducation[idx]['graduationMonth'] = month;
      newEducation[idx]['graduationDate'] = value;
    } else if (field === 'isGraduated') {
      newEducation[idx]['graduationStatus'] = value ? '졸업' : '재학';
      newEducation[idx]['isGraduated'] = value;
    } else {
      newEducation[idx][field] = value;
    }
    setForm((prev) => ({ ...prev, education: newEducation }));
  };

  const addEducation = () => {
    setForm((prev) => ({ 
      ...prev, 
      education: [...(prev.education || []), { 
        schoolType: '대학교', // 기본값 설정
        school: '', 
        major: '', 
        admissionDate: '', 
        admissionYear: '',
        admissionMonth: '',
        graduationDate: '',
        graduationYear: '',
        graduationMonth: '',
        graduationStatus: '',
        region: '',
        isGraduated: true 
      }] 
    }));
  };

  const removeEducation = (idx) => {
    const newEducation = [...(form.education || [])];
    newEducation.splice(idx, 1);
    setForm((prev) => ({ ...prev, education: newEducation }));
  };

  return (
    <section className="resume-section">
      <h3>학력</h3>
      {(form.education || []).map((edu, idx) => (
        <div className="education-card" key={idx}>
          <div className="education-form-row">
            <div className="education-field">
              <label>학교유형</label>
              <select 
                value={edu.schoolType || '대학교'} 
                onChange={e => handleChange(idx, 'schoolType', e.target.value)}
              >
                <option value="고등학교">고등학교</option>
                <option value="전문대학">전문대학</option>
                <option value="대학교">대학교</option>
                <option value="대학원">대학원</option>
              </select>
            </div>
            
            <div className="education-field">
              <label>학교명</label>
              <input 
                type="text" 
                value={edu.school} 
                onChange={e => handleChange(idx, 'school', e.target.value)}
                placeholder="학교명을 입력하세요"
              />
            </div>
            
            <div className="education-field">
              <label>전공</label>
              <input 
                type="text" 
                value={edu.major} 
                onChange={e => handleChange(idx, 'major', e.target.value)}
                placeholder="전공을 입력하세요"
              />
            </div>
            
            <div className="education-field">
              <label>입학년월</label>
              <input 
                type="month"
                value={edu.admissionYear && edu.admissionMonth ? `${edu.admissionYear}-${edu.admissionMonth}` : ''}
                onChange={e => handleChange(idx, 'admissionDate', e.target.value)}
                placeholder="입학년월 선택"
              />
            </div>
            <div className="education-field">
              <label>졸업년월</label>
              <input 
                type="month"
                value={edu.graduationYear && edu.graduationMonth ? `${edu.graduationYear}-${edu.graduationMonth}` : ''}
                onChange={e => handleChange(idx, 'graduationDate', e.target.value)}
                placeholder="졸업년월 선택"
              />
            </div>
            <div className="education-field">
              <label>졸업상태</label>
              <select
                value={edu.graduationStatus || ''}
                onChange={e => handleChange(idx, 'graduationStatus', e.target.value)}
              >
                <option value="">선택</option>
                <option value="졸업">졸업</option>
                <option value="재학">재학</option>
                <option value="중퇴">중퇴</option>
                <option value="휴학">휴학</option>
              </select>
            </div>
            <div className="education-field">
              <label>지역</label>
              <input 
                type="text"
                value={edu.region}
                onChange={e => handleChange(idx, 'region', e.target.value)}
                placeholder="지역을 입력하세요"
              />
            </div>
            
            <div className="education-field">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={edu.isGraduated} 
                  onChange={e => handleChange(idx, 'isGraduated', e.target.checked)}
                />
                <span className="checkbox-text">졸업</span>
              </label>
            </div>
            
            <button 
              type="button" 
              className="remove-education-btn" 
              onClick={() => removeEducation(idx)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="add-education-btn" onClick={addEducation}>
        <FaPlus /> 학력 추가
      </button>
    </section>
  );
};

export default ResumeEducationSection; 