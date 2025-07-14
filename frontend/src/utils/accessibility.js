// 접근성 검증 및 개선 유틸리티

// 색상 대비 검사
export const checkColorContrast = (foreground, background) => {
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

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio,
    isAA: ratio >= 4.5, // WCAG AA 기준
    isAAA: ratio >= 7,  // WCAG AAA 기준
    level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
  };
};

// 포커스 관리
export const manageFocus = {
  // 포커스 트랩 설정
  setFocusTrap: (container, firstFocusable, lastFocusable) => {
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  },

  // 첫 번째 포커스 가능한 요소로 포커스 이동
  focusFirstElement: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },

  // 포커스 복원
  restoreFocus: (element) => {
    if (element) {
      element.focus();
    }
  }
};

// 키보드 네비게이션
export const keyboardNavigation = {
  // 화살표 키 네비게이션
  handleArrowKeys: (items, currentIndex, onSelect) => {
    return (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          onSelect(nextIndex);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          onSelect(prevIndex);
          break;
        case 'Home':
          e.preventDefault();
          onSelect(0);
          break;
        case 'End':
          e.preventDefault();
          onSelect(items.length - 1);
          break;
        default:
          break;
      }
    };
  },

  // Enter/Space 키 처리
  handleActivation: (onActivate) => {
    return (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    };
  }
};

// 스크린 리더 지원
export const screenReaderSupport = {
  // 상태 변경 알림
  announce: (message, priority = 'polite') => {
    const announcer = document.getElementById('sr-announcer') || createAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;
    
    // 메시지 초기화
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  },

  // 페이지 제목 업데이트
  updatePageTitle: (title) => {
    document.title = title;
  },

  // 랜드마크 역할 설정
  setLandmarkRole: (element, role) => {
    element.setAttribute('role', role);
  }
};

// 접근성 검증
export const validateAccessibility = {
  // 이미지 alt 텍스트 검사
  checkImageAlt: (container) => {
    const images = container.querySelectorAll('img');
    const issues = [];
    
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push(`이미지 ${index + 1}: alt 텍스트가 없습니다.`);
      }
    });
    
    return issues;
  },

  // 버튼 aria-label 검사
  checkButtonLabels: (container) => {
    const buttons = container.querySelectorAll('button');
    const issues = [];
    
    buttons.forEach((button, index) => {
      if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
        issues.push(`버튼 ${index + 1}: aria-label이 없습니다.`);
      }
    });
    
    return issues;
  },

  // 링크 텍스트 검사
  checkLinkText: (container) => {
    const links = container.querySelectorAll('a');
    const issues = [];
    
    links.forEach((link, index) => {
      if (!link.textContent.trim() && !link.getAttribute('aria-label')) {
        issues.push(`링크 ${index + 1}: 텍스트나 aria-label이 없습니다.`);
      }
    });
    
    return issues;
  },

  // 색상 대비 검사
  checkColorContrast: (container) => {
    const elements = container.querySelectorAll('*');
    const issues = [];
    
    elements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = checkColorContrast(color, backgroundColor);
        if (!contrast.isAA) {
          issues.push(`${element.tagName}: 색상 대비가 부족합니다 (${contrast.ratio.toFixed(2)}:1)`);
        }
      }
    });
    
    return issues;
  }
};

// 헬퍼 함수들
const createAnnouncer = () => {
  const announcer = document.createElement('div');
  announcer.id = 'sr-announcer';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  document.body.appendChild(announcer);
  return announcer;
};

// 접근성 개선 제안
export const getAccessibilitySuggestions = (container) => {
  const suggestions = [];
  
  // 이미지 alt 텍스트 제안
  const images = container.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    suggestions.push(`${images.length}개의 이미지에 alt 텍스트를 추가하세요.`);
  }
  
  // 버튼 aria-label 제안
  const buttons = container.querySelectorAll('button:not([aria-label]):not(:has(*))');
  if (buttons.length > 0) {
    suggestions.push(`${buttons.length}개의 버튼에 aria-label을 추가하세요.`);
  }
  
  // 색상 대비 제안
  const lowContrastElements = validateAccessibility.checkColorContrast(container);
  if (lowContrastElements.length > 0) {
    suggestions.push(`${lowContrastElements.length}개의 요소의 색상 대비를 개선하세요.`);
  }
  
  return suggestions;
};

// 접근성 점수 계산
export const calculateAccessibilityScore = (container) => {
  const totalChecks = 4;
  let passedChecks = 0;
  
  if (validateAccessibility.checkImageAlt(container).length === 0) passedChecks++;
  if (validateAccessibility.checkButtonLabels(container).length === 0) passedChecks++;
  if (validateAccessibility.checkLinkText(container).length === 0) passedChecks++;
  if (validateAccessibility.checkColorContrast(container).length === 0) passedChecks++;
  
  const score = (passedChecks / totalChecks) * 100;
  
  return {
    score,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F',
    passedChecks,
    totalChecks
  };
}; 