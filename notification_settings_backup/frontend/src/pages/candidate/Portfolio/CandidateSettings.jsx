import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CandidateSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    autoMatching: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // 설정 저장 로직
    alert('설정이 저장되었습니다.');
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      marginTop: '6rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f1f3f4'
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#111',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#19b47a" strokeWidth="2">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          개인 설정
        </h1>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            color: '#333',
            marginBottom: '1rem'
          }}>
            알림 설정
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '0.3rem' }}>
                  이메일 알림
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                  새로운 매칭 및 면접 일정을 이메일로 받습니다
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.emailNotifications ? '#19b47a' : '#ccc',
                  transition: '.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%',
                    transform: settings.emailNotifications ? 'translateX(26px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '0.3rem' }}>
                  푸시 알림
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                  브라우저에서 실시간 알림을 받습니다
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.pushNotifications ? '#19b47a' : '#ccc',
                  transition: '.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%',
                    transform: settings.pushNotifications ? 'translateX(26px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#333', marginBottom: '0.3rem' }}>
                  자동 매칭
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
                  AI가 자동으로 적합한 공고를 추천합니다
                </p>
              </div>
              <label style={{
                position: 'relative',
                display: 'inline-block',
                width: '50px',
                height: '24px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.autoMatching}
                  onChange={(e) => handleSettingChange('autoMatching', e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.autoMatching ? '#19b47a' : '#ccc',
                  transition: '.4s',
                  borderRadius: '24px'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '18px',
                    width: '18px',
                    left: '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%',
                    transform: settings.autoMatching ? 'translateX(26px)' : 'translateX(0)'
                  }} />
                </span>
              </label>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          borderTop: '1px solid #e9ecef',
          paddingTop: '2rem'
        }}>
          <button
            onClick={() => navigate('/candidate/dashboard')}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              color: '#666',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(104, 211, 145, 0.3)'
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
} 