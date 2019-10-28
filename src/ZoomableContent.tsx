import React, { FC, useRef, useEffect, useContext } from 'react';
import { zoomableContext, ZoomableContextType } from './ZoomableContext';

export const ZoomableContent: FC = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    onWheel,
    handlePointerDown,
    handlePointerMove,
    width,
    height,
    positionX,
    handlePointerUp,
    positionY,
    currentZoom,
    enable,
  } = useContext(zoomableContext) as ZoomableContextType;

  useEffect(() => {
    const wrapper = wrapperRef.current as HTMLDivElement;
    const preventDefault = (event: WheelEvent) => event.preventDefault();
    wrapper.addEventListener('wheel', preventDefault);

    return () => wrapper.removeEventListener('wheel', preventDefault);
  }, []);

  return (
    <div
      ref={wrapperRef}
      onWheel={onWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        width: width !== 1 ? width : '100%',
        height: height !== 1 ? height : '100%',
        transform: `translate(${positionX}px, ${positionY}px) scale(${currentZoom})`,
        cursor: enable ? 'move' : 'default',
        transformOrigin: '0 0',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  );
};
