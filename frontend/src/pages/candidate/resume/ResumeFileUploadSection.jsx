import React, { useRef } from 'react';
import { FaUpload, FaFileAlt, FaTimes } from 'react-icons/fa';

const ResumeFileUploadSection = ({ form, setForm }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, file }));
    }
  };

  const handleFileRemove = () => {
    setForm((prev) => ({ ...prev, file: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, file }));
    }
  };

  return (
    <section className="resume-section">
      <h3>이력서 파일 첨부</h3>
      <div className="file-upload-container">
        <div 
          className="file-upload-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
          />
          
          {!form.file ? (
            <div className="file-upload-placeholder">
              <FaUpload className="upload-icon" />
              <div className="upload-text">
                <span className="upload-title">파일을 선택하거나 여기에 드래그하세요</span>
                <span className="upload-subtitle">PDF, DOC, DOCX, TXT 파일만 지원됩니다 (최대 10MB)</span>
              </div>
            </div>
          ) : (
            <div className="file-upload-preview">
              <FaFileAlt className="file-icon" />
              <div className="file-info">
                <span className="file-name">{form.file.name}</span>
                <span className="file-size">{formatFileSize(form.file.size)}</span>
              </div>
              <button 
                type="button" 
                className="file-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileRemove();
                }}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
        
        {form.file && (
          <div className="file-upload-actions">
            <button 
              type="button" 
              className="file-change-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              다른 파일 선택
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResumeFileUploadSection; 