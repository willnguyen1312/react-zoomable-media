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
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    positionX,
    positionY,
    onWheel,
  } = useContext(zoomableContext) as ZoomableContextType;

  useEffect(() => {
    const slider = sliderRef.current as HTMLDivElement;

    slider.addEventListener('wheel', onWheel);
  }, []);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }} ref={wrapperRef}>
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          transformOrigin: '0 0',
          cursor: 'move',
          width: '100%',
          transform: `translate(${positionX}px, ${positionY}px) scale(${currentZoom})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
