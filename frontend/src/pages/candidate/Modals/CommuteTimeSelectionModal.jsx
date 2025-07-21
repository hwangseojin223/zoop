// CommuteTimeSelectionModal.jsx
import React, { useState } from 'react';
import './CommuteTimeSelectionModal.css';

function CommuteTimeSelectionModal({ onClose, onSelectCommuteTime }) {
  const commuteTimes = [
    '30분 이내',
    '1시간 이내',
    '1시간 30분 이내',
    '상관없음'
  ];

  const [selectedTime, setSelectedTime] = useState('');

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleConfirm = () => {
    if (onSelectCommuteTime) {
      onSelectCommuteTime(selectedTime);
    }
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="commute-time-modal-content">
        <div className="commute-time-modal-header">
          <h3>출근소요시간</h3>
        </div>
        <div className="commute-time-modal-body">
          <ul className="commute-time-list">
            {commuteTimes.map((time) => (
              <li
                key={time}
                className={selectedTime === time ? 'selected' : ''}
                onClick={() => handleTimeClick(time)}
              >
                {time}
              </li>
            ))}
          </ul>
        </div>
        <div className="commute-time-modal-footer">
          <button className="cancel-button" onClick={onClose}>취소</button>
          <button className="confirm-button" onClick={handleConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}

export default CommuteTimeSelectionModal;