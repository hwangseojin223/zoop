import React from 'react';
import { FaPlus, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ResumeCareerSection = ({ form, setForm }) => {
  const handleChange = (idx, field, value) => {
    const newCareer = [...(form.career || [])];
    if (field === 'startDate' && value) {
      const year = value.getFullYear();
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      newCareer[idx]['startYear'] = year;
      newCareer[idx]['startMonth'] = month;
      newCareer[idx]['startDate'] = `${year}-${month}`;
    } else if (field === 'endDate' && value) {
      const year = value.getFullYear();
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      newCareer[idx]['endYear'] = year;
      newCareer[idx]['endMonth'] = month;
      newCareer[idx]['endDate'] = `${year}-${month}`;
    } else if (field === 'job') {
      newCareer[idx]['jobTitle'] = value;
      newCareer[idx]['job'] = value;
    } else if (field === 'current') {
      newCareer[idx]['isCurrent'] = value;
      newCareer[idx]['current'] = value;
      if (value) newCareer[idx]['endDate'] = '';
    } else {
      newCareer[idx][field] = value;
    }
    setForm((prev) => ({ ...prev, career: newCareer }));
  };

  const addCareer = () => {
    setForm((prev) => ({ 
      ...prev, 
      career: [...(prev.career || []), { 
        company: '', 
        job: '', 
        jobTitle: '',
        department: '',
        position: '',
        startDate: '', 
        startYear: '',
        startMonth: '',
        endDate: '',
        endYear: '',
        endMonth: '',
        current: false,
        isCurrent: false,
        isCompanyHidden: false
      }] 
    }));
  };

  const removeCareer = (idx) => {
    const newCareer = [...(form.career || [])];
    newCareer.splice(idx, 1);
    setForm((prev) => ({ ...prev, career: newCareer }));
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
      <h3>경력</h3>
      {(form.career || []).map((car, idx) => (
        <div className="career-card" key={idx}>
          <div className="career-form-col">
            <div className="career-field" style={{ width: '100%' }}>
              <label>회사명</label>
              <div className="company-input-wrapper">
                <input 
                  type="text"
                  value={car.company} 
                  onChange={e => handleChange(idx, 'company', e.target.value)}
                  placeholder="회사명을 입력하세요"
                  className={car.isCompanyHidden ? 'hidden-company' : ''}
                />
                <button
                  type="button"
                  className="company-hide-toggle"
                  onClick={() => handleChange(idx, 'isCompanyHidden', !car.isCompanyHidden)}
                  title={car.isCompanyHidden ? '회사명 표시' : '회사명 숨김'}
                >
                  {car.isCompanyHidden ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="career-field" style={{ width: '100%' }}>
              <label>직무</label>
              <input 
                type="text"
                value={car.jobTitle} 
                onChange={e => handleChange(idx, 'jobTitle', e.target.value)}
                placeholder="직무를 입력하세요"
              />
            </div>
            <div className="career-field" style={{ width: '100%' }}>
              <label>부서</label>
              <input 
                type="text"
                value={car.department}
                onChange={e => handleChange(idx, 'department', e.target.value)}
                placeholder="부서를 입력하세요"
              />
            </div>
            <div className="career-field" style={{ width: '100%' }}>
              <label>직급</label>
              <input 
                type="text"
                value={car.position}
                onChange={e => handleChange(idx, 'position', e.target.value)}
                placeholder="직급을 입력하세요"
              />
            </div>
            <div className="career-field" style={{ width: '100%' }}>
              <label>시작년월</label>
              <DatePicker
                selected={parseYearMonth(car.startDate)}
                onChange={date => handleChange(idx, 'startDate', date)}
                dateFormat="yyyy-MM"
                showMonthYearPicker
                showFullMonthYearPicker
                placeholderText="시작년월 선택"
                className="datepicker-input"
                maxDate={new Date()}
                isClearable
              />
            </div>
            <div className="career-field" style={{ width: '100%' }}>
              <label>종료년월</label>
              <DatePicker
                selected={parseYearMonth(car.endDate)}
                onChange={date => handleChange(idx, 'endDate', date)}
                dateFormat="yyyy-MM"
                showMonthYearPicker
                showFullMonthYearPicker
                placeholderText="종료년월 선택"
                className="datepicker-input"
                maxDate={new Date()}
                isClearable
                disabled={car.current}
              />
            </div>
            <div className="career-field" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="career-checkbox-label" style={{ marginBottom: 0 }}>
                <input 
                  type="checkbox" 
                  checked={car.current} 
                  onChange={e => handleChange(idx, 'current', e.target.checked)}
                />
                <span className="career-checkbox-text">재직중</span>
              </label>
              <button 
                type="button" 
                className="remove-career-btn" 
                onClick={() => removeCareer(idx)}
                style={{ marginLeft: 'auto' }}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="add-career-btn" onClick={addCareer} style={{ background: '#30C59B', color: '#fff' }}>
        <FaPlus /> 경력 추가
      </button>
    </section>
  );
};

export default ResumeCareerSection; 