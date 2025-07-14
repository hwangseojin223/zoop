import React, { useEffect, useRef } from 'react';

// 스크린 리더 전용 텍스트 컴포넌트
export const ScreenReaderOnly = ({ children, ...props }) => (
  <span
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }}
    {...props}
  >
    {children}
  </span>
);

// 접근 가능한 버튼 컴포넌트
export const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  ariaLabel, 
  ariaDescribedBy,
  ...props 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick && onClick(e);
      }
    }}
    {...props}
  >
    {children}
  </button>
);

// 접근 가능한 링크 컴포넌트
export const AccessibleLink = ({ 
  children, 
  href, 
  ariaLabel, 
  ariaDescribedBy,
  external = false,
  ...props 
}) => (
  <a
    href={href}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    {...(external && {
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-describedby': `${ariaDescribedBy || ''} external-link`.trim()
    })}
    {...props}
  >
    {children}
    {external && (
      <ScreenReaderOnly>
        (새 창에서 열림)
      </ScreenReaderOnly>
    )}
  </a>
);

// 접근 가능한 이미지 컴포넌트
export const AccessibleImage = ({ 
  src, 
  alt, 
  decorative = false,
  ...props 
}) => (
  <img
    src={src}
    alt={decorative ? '' : alt}
    {...(decorative && { 'aria-hidden': 'true' })}
    {...props}
  />
);

// 포커스 관리 훅
export const useFocusManagement = () => {
  const focusableRefs = useRef(new Set());

  const addFocusableRef = (ref) => {
    if (ref) {
      focusableRefs.current.add(ref);
    }
  };

  const removeFocusableRef = (ref) => {
    focusableRefs.current.delete(ref);
  };

  const focusFirst = () => {
    const firstRef = Array.from(focusableRefs.current)[0];
    if (firstRef) {
      firstRef.focus();
    }
  };

  const focusLast = () => {
    const refs = Array.from(focusableRefs.current);
    const lastRef = refs[refs.length - 1];
    if (lastRef) {
      lastRef.focus();
    }
  };

  return {
    addFocusableRef,
    removeFocusableRef,
    focusFirst,
    focusLast,
  };
};

// 키보드 네비게이션 훅
export const useKeyboardNavigation = (onKeyDown) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      onKeyDown(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onKeyDown]);
};

// 스킵 링크 컴포넌트
export const SkipLink = ({ targetId, children = '메인 콘텐츠로 건너뛰기' }) => (
  <a
    href={`#${targetId}`}
    style={{
      position: 'absolute',
      top: '-40px',
      left: '6px',
      background: '#30c59b',
      color: 'white',
      padding: '8px',
      textDecoration: 'none',
      borderRadius: '4px',
      zIndex: 1000,
      transition: 'top 0.3s',
    }}
    onFocus={(e) => {
      e.target.style.top = '6px';
    }}
    onBlur={(e) => {
      e.target.style.top = '-40px';
    }}
  >
    {children}
  </a>
);

// 접근성 알림 컴포넌트
export const AccessibilityAnnouncer = ({ message, priority = 'polite' }) => {
  const announcerRef = useRef(null);

  useEffect(() => {
    if (message && announcerRef.current) {
      announcerRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={announcerRef}
      aria-live={priority}
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    />
  );
};

// 색상 대비 검사 유틸리티
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      if (c <= 0.03928) {
        return c / 12.92;
      }
      return Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// 접근성 검증 유틸리티
export const validateAccessibility = (element) => {
  const issues = [];
  
  // 이미지 alt 텍스트 검사
  const images = element.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt && !img.getAttribute('aria-hidden')) {
      issues.push(`이미지 ${index + 1}: alt 텍스트가 없습니다.`);
    }
  });
  
  // 버튼 aria-label 검사
  const buttons = element.querySelectorAll('button');
  buttons.forEach((button, index) => {
    if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
      issues.push(`버튼 ${index + 1}: aria-label이 없습니다.`);
    }
  });
  
  // 링크 텍스트 검사
  const links = element.querySelectorAll('a');
  links.forEach((link, index) => {
    if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
      issues.push(`링크 ${index + 1}: 텍스트나 aria-label이 없습니다.`);
    }
  });
  
  return issues;
}; 