// InterviewSchedulerModal.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker'; // react-datepicker 라이브러리 사용
import 'react-datepicker/dist/react-datepicker.css'; // 스타일시트 임포트
import './InterviewSchedulerModal.css'; // 필요시 별도 CSS 파일 생성

function InterviewSchedulerModal({ isOpen, onClose, onSelectDateTime, postId, candidateId }) {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());

  if (!isOpen) return null;

  const handleSave = () => {
    // 선택한 날짜/시간을 백엔드로 전송
    const scheduledTimeISOString = selectedDateTime.toISOString(); 
    fetch('/api/interview-schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: postId,
        candidateId: candidateId,
        scheduledTime: selectedDateTime.toISOString(),
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('면접 일정 저장 중 오류가 발생했습니다.');
      }
      return response.json();
    })
    .then(data => {
      onSelectDateTime(selectedDateTime, data);
      onClose();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('면접 일정 저장 중 오류가 발생했습니다: ' + error.message);
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>면접 일정 정하기</h2>
        <p>원하시는 면접 날짜와 시간을 선택해주세요.</p>
        
        <DatePicker
          selected={selectedDateTime}
          onChange={(date) => setSelectedDateTime(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30}
          timeCaption="시간"
          dateFormat="yyyy년 MM월 dd일 HH:mm"
          minDate={new Date()} // 오늘 이후 날짜만 선택 가능
          inline // 캘린더를 항상 표시
          className="interview-datepicker"
        />
        
        <div className="modal-buttons">
          <button className="save-button" onClick={handleSave}>
            일정 확정
          </button>
          <button className="cancel-button" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterviewSchedulerModal;
