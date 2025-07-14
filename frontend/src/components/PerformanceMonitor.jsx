import React, { useEffect, useState, useRef } from 'react';

const PerformanceMonitor = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: null,
    loadTime: 0,
    renderTime: 0
  });
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // FPS 측정
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      animationId.current = requestAnimationFrame(measureFPS);
    };

    // 메모리 사용량 측정
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = performance.memory;
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          }
        }));
      }
    };

    // 페이지 로드 시간 측정
    const measureLoadTime = () => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    // 렌더링 시간 측정
    const measureRenderTime = () => {
      const start = performance.now();
      return () => {
        const end = performance.now();
        setMetrics(prev => ({ ...prev, renderTime: end - start }));
      };
    };

    // 측정 시작
    measureFPS();
    measureMemory();
    measureLoadTime();

    const interval = setInterval(measureMemory, 1000);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      clearInterval(interval);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      minWidth: '200px'
    }}>
      <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>Performance Monitor</div>
      <div>FPS: {metrics.fps}</div>
      {metrics.memory && (
        <div>
          Memory: {metrics.memory.used}MB / {metrics.memory.total}MB
        </div>
      )}
      {metrics.loadTime > 0 && (
        <div>Load Time: {metrics.loadTime}ms</div>
      )}
      {metrics.renderTime > 0 && (
        <div>Render Time: {metrics.renderTime.toFixed(2)}ms</div>
      )}
    </div>
  );
};

// 성능 측정 훅
export const usePerformanceMeasure = (componentName) => {
  const renderStart = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    renderCount.current++;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
    
    renderStart.current = performance.now();
  });

  return {
    renderCount: renderCount.current
  };
};

// 성능 최적화 훅
export const usePerformanceOptimization = (dependencies, callback) => {
  const lastCall = useRef(0);
  const timeoutId = useRef(null);

  useEffect(() => {
    const now = performance.now();
    
    // 디바운싱: 100ms 이내의 연속 호출 방지
    if (now - lastCall.current < 100) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      
      timeoutId.current = setTimeout(() => {
        callback();
        lastCall.current = performance.now();
      }, 100);
    } else {
      callback();
      lastCall.current = now;
    }

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, dependencies);
};

export default PerformanceMonitor; 