import React, { useEffect, useContext } from 'react';
import { ZoomableContextType, zoomableContext } from './ZoomableContext';

interface VideoProps {
  children: React.ReactNode;
}

export default function({ children }: VideoProps) {
  const {
    wrapperRef,
    currentZoom,
    sliderRef,
    handlePointerDown: handleMouseDown,
    handlePointerMove: handleMouseMove,
    handlePointerUp: handleMouseUp,
    positionX,
    positionY,
    onWheel,
  } = useContext(zoomableContext) as ZoomableContextType;

  useEffect(() => {
    const slider = sliderRef.current as HTMLDivElement;

    slider.addEventListener('wheel', event => event.preventDefault());
  }, []);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }} ref={wrapperRef}>
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onWheel={onWheel}
        style={{
          transformOrigin: '0 0',
          cursor: 'move',
          width: '100%',
          touchAction: 'none',
          willChange: 'transform',
          transform: `translate(${positionX}px, ${positionY}px) scale(${currentZoom})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
