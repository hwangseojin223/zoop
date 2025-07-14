import React, { memo, useMemo, useCallback } from 'react';

// 메모이제이션된 카드 컴포넌트
export const MemoizedCard = memo(({ title, content, onClick, isSelected }) => {
  const handleClick = useCallback(() => {
    onClick && onClick();
  }, [onClick]);

  const cardStyle = useMemo(() => ({
    padding: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: isSelected ? '#f0f8ff' : 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
  }), [isSelected]);

  return (
    <div style={cardStyle} onClick={handleClick}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ margin: 0, color: '#666' }}>{content}</p>
    </div>
  );
});

// 메모이제이션된 리스트 컴포넌트
export const MemoizedList = memo(({ items, renderItem, keyExtractor }) => {
  const memoizedItems = useMemo(() => 
    items.map(item => ({
      key: keyExtractor(item),
      component: renderItem(item)
    })), [items, renderItem, keyExtractor]
  );

  return (
    <div>
      {memoizedItems.map(({ key, component }) => (
        <div key={key}>{component}</div>
      ))}
    </div>
  );
});

// 메모이제이션된 버튼 컴포넌트
export const MemoizedButton = memo(({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = '',
  ...props 
}) => {
  const handleClick = useCallback((e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  }, [onClick, disabled]);

  const buttonStyle = useMemo(() => {
    const baseStyle = {
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      opacity: disabled ? 0.6 : 1
    };

    switch (variant) {
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: '#f8f9fa',
          color: '#495057',
          border: '1px solid #dee2e6'
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#dc3545',
          color: 'white'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#007bff',
          color: 'white'
        };
    }
  }, [variant, disabled]);

  return (
    <button
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
});

// 메모이제이션된 모달 컴포넌트
export const MemoizedModal = memo(({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium' 
}) => {
  const modalStyle = useMemo(() => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: isOpen ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }), [isOpen]);

  const contentStyle = useMemo(() => {
    const baseStyle = {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative'
    };

    switch (size) {
      case 'small':
        return { ...baseStyle, width: '400px' };
      case 'large':
        return { ...baseStyle, width: '800px' };
      default:
        return { ...baseStyle, width: '600px' };
    }
  }, [size]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div style={modalStyle} onClick={handleBackdropClick}>
      <div style={contentStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '0.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
});

// 성능 최적화된 스켈레톤 컴포넌트
export const SkeletonLoader = memo(({ 
  type = 'text', 
  lines = 3, 
  className = '' 
}) => {
  const skeletonItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < lines; i++) {
      items.push(
        <div 
          key={i}
          className={`skeleton skeleton-text ${className}`}
          style={{ 
            width: i === lines - 1 ? '60%' : '100%',
            height: type === 'avatar' ? '50px' : '1em'
          }}
        />
      );
    }
    return items;
  }, [lines, type, className]);

  if (type === 'avatar') {
    return (
      <div className={`skeleton skeleton-avatar ${className}`} />
    );
  }

  return (
    <div>
      {skeletonItems}
    </div>
  );
});

// 성능 최적화된 무한 스크롤 훅
export const useInfiniteScroll = (callback, hasMore, loading) => {
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
      callback();
    }
  }, [callback, hasMore, loading]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}; 