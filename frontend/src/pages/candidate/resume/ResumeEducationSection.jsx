import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ResumeEducationSection = ({ form, setForm }) => {
  const handleChange = (idx, field, value) => {
    const newEducation = [...(form.education || [])];
    if (field === 'admissionDate' && value) {
      // value: Date 객체
      const year = value.getFullYear();
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      newEducation[idx]['admissionYear'] = year;
      newEducation[idx]['admissionMonth'] = month;
      newEducation[idx]['admissionDate'] = `${year}-${month}`;
    } else if (field === 'graduationDate' && value) {
      const year = value.getFullYear();
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      newEducation[idx]['graduationYear'] = year;
      newEducation[idx]['graduationMonth'] = month;
      newEducation[idx]['graduationDate'] = `${year}-${month}`;
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

  // YYYY-MM 문자열을 Date 객체로 변환
  const parseYearMonth = (str) => {
    if (!str) return null;
    const [year, month] = str.split('-');
    if (!year || !month) return null;
    return new Date(Number(year), Number(month) - 1);
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
              <DatePicker
                selected={parseYearMonth(edu.admissionDate)}
                onChange={date => handleChange(idx, 'admissionDate', date)}
                dateFormat="yyyy-MM"
                showMonthYearPicker
                showFullMonthYearPicker
                placeholderText="입학년월 선택"
                className="datepicker-input"
                maxDate={new Date()}
                isClearable
              />
            </div>
            <div className="education-field">
              <label>졸업년월</label>
              <DatePicker
                selected={parseYearMonth(edu.graduationDate)}
                onChange={date => handleChange(idx, 'graduationDate', date)}
                dateFormat="yyyy-MM"
                showMonthYearPicker
                showFullMonthYearPicker
                placeholderText="졸업년월 선택"
                className="datepicker-input"
                maxDate={new Date()}
                isClearable
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
      <button type="button" className="add-education-btn" onClick={addEducation} style={{ background: '#30C59B', color: '#fff' }}>
        <FaPlus /> 학력 추가
      </button>
    </section>
  );
};

export default ResumeEducationSection; 