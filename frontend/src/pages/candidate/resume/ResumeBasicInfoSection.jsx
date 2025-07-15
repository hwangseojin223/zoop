import React from 'react';

const ResumeBasicInfoSection = ({ form, setForm }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="resume-section basic-info-section">
      <h2 className="section-title">기본 정보</h2>
      <div className="form-group">
        <label htmlFor="name">이름</label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">전화번호</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={form.phone || ''}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );
};

export default ResumeBasicInfoSection; 