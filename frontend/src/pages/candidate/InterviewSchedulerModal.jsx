import React, { useState } from 'react';
import './InterviewSchedulerModal.css';

function InterviewSchedulerModal({ isOpen, onClose, onSchedule, postId, candidateId }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 오늘 날짜
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // 시간대 옵션들 (9시부터 18시까지, 1시간 간격)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // 달력 관련 함수들
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
    
    console.log('월 정보:', {
      year,
      month: month + 1,
      firstDay: firstDay.toLocaleDateString('ko-KR'),
      lastDay: lastDay.toLocaleDateString('ko-KR'),
      daysInMonth,
      startingDayOfWeek,
      startingDayName: ['일', '월', '화', '수', '목', '금', '토'][startingDayOfWeek]
    });
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시작 시간으로 설정
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return targetDate < today;
  };

  const isDateSelected = (date) => {
    return formatDate(date) === selectedDate;
  };

  const isToday = (date) => {
    const today = new Date();
    const todayFormatted = formatDate(today);
    const dateFormatted = formatDate(date);
    return dateFormatted === todayFormatted;
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      const formattedDate = formatDate(date);
      console.log('선택된 날짜:', formattedDate);
      setSelectedDate(formattedDate);
    }
  };

  const handleMonthChange = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      console.log('월 변경:', direction, newMonth.toLocaleDateString('ko-KR'));
      return newMonth;
    });
    
    // 월이 변경되면 선택된 날짜 초기화
    setSelectedDate('');
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    console.log('달력 렌더링:', {
      currentMonth: currentMonth.toLocaleDateString('ko-KR'),
      daysInMonth,
      startingDayOfWeek,
      startingDayName: ['일', '월', '화', '수', '목', '금', '토'][startingDayOfWeek]
    });
    
    const days = [];
    
    // 이전 달의 마지막 날짜들
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    
    // 이전 달의 날짜들을 올바르게 계산 (일요일부터 시작)
    for (let i = 0; i < startingDayOfWeek; i++) {
      const day = prevMonthDays - startingDayOfWeek + i + 1;
      if (day > 0) { // 음수 방지
        days.push(
          <div key={`prev-${day}`} className="calendar-day prev-month">
            {day}
          </div>
        );
      }
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date);
      const isTodayDate = isToday(date);
      
      console.log(`날짜 ${day}일:`, {
        date: date.toLocaleDateString('ko-KR'),
        isDisabled,
        isSelected,
        isTodayDate
      });
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''}`}
          onClick={() => handleDateClick(date)}
        >
          {day}
        </div>
      );
    }
    
    // 다음 달의 첫 날짜들 (6주 * 7일 = 42개 셀을 맞추기 위해)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div key={`next-${day}`} className="calendar-day next-month">
          {day}
        </div>
      );
    }
    
    return days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      setError('날짜와 시간을 모두 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // 선택된 날짜와 시간을 ISO 형식으로 변환
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      
      const requestData = {
        postId: postId,
        candidateId: candidateId,
        scheduledTime: scheduledDateTime.toISOString()
      };

      console.log('면접 일정 등록 요청:', requestData);

      const response = await fetch('http://localhost:8081/api/interview-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('API 성공 응답:', result);
      
      if (result.success) {
        // 성공 시 부모 컴포넌트에 알림
        onSchedule(postId, {
          date: selectedDate,
          time: selectedTime,
          link: result.interviewLink
        });
      } else {
        throw new Error(result.message || '면접 일정 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('면접 일정 등록 오류:', error);
      setError(error.message || '면접 일정 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedDate('');
      setSelectedTime('');
      setError('');
      onClose();
    }
  };

  const handleTimeSlotClick = (time) => {
    setSelectedTime(time);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>면접 일정 정하기</h2>
          <button 
            className="close-button" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="scheduler-form">
          <div className="scheduler-layout">
            {/* 왼쪽: 달력 */}
            <div className="calendar-section">
              <h3>날짜 선택</h3>
              <div className="calendar-container">
                <div className="calendar-header">
                  <button 
                    type="button" 
                    className="month-nav-btn"
                    onClick={() => handleMonthChange('prev')}
                    disabled={isSubmitting}
                  >
                    ‹
                  </button>
                  <h4 className="current-month">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </h4>
                  <button 
                    type="button" 
                    className="month-nav-btn"
                    onClick={() => handleMonthChange('next')}
                    disabled={isSubmitting}
                  >
                    ›
                  </button>
                </div>
                
                <div className="calendar-grid">
                  <div className="calendar-weekdays">
                    <div>일</div>
                    <div>월</div>
                    <div>화</div>
                    <div>수</div>
                    <div>목</div>
                    <div>금</div>
                    <div>토</div>
                  </div>
                  <div className="calendar-days">
                    {renderCalendar()}
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 시간대 선택 */}
            <div className="time-section">
              <h3>시간 선택</h3>
              <div className="time-slots-scroll">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                    onClick={() => handleTimeSlotClick(time)}
                    disabled={isSubmitting}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* 선택된 정보 행 */}
          {(selectedDate || selectedTime) && (
            <div className="selected-info-row">
              {selectedDate && (
                <div className="selected-date-info">
                  <p>선택된 날짜: {(() => {
                    const [year, month, day] = selectedDate.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    return date.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    });
                  })()}</p>
                </div>
              )}
              {selectedTime && (
                <div className="selected-time-info">
                  <p>선택된 시간: {selectedTime}</p>
                </div>
              )}
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="cancel-button"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting || !selectedDate || !selectedTime}
            >
              {isSubmitting ? '등록 중...' : '일정 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InterviewSchedulerModal; 