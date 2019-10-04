import React, { useState, useEffect, useContext, useRef } from 'react';
import { ZoomableContextType, zoomableContext } from './ZoomableContext';

interface ImageProps {
  imageUrl: string;
  loading?: React.ReactNode;
}

export default function({ imageUrl, loading }: ImageProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const {
    onImageLoad,
    onWheel,
    width,
    height,
    wrapperRef,
    currentZoom,
    sliderRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    positionX,
    positionY,
  } = useContext(zoomableContext) as ZoomableContextType;

  const handleOnImageLoad = () => {
    onImageLoad(imageRef);
    setIsLoading(true);
  };

  useEffect(() => {
    const slider = sliderRef.current as HTMLDivElement;
    slider.addEventListener('wheel', event => event.preventDefault());
  }, []);

  return (
    <div
      style={{
        zIndex: 1312,
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
      ref={wrapperRef}
    >
      <div
        ref={sliderRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
        onWheel={onWheel}
        style={{
          transformOrigin: '0 0',
          cursor: 'move',
          willChange: 'transform',
          touchAction: 'none',
          width,
          height,
          transform: `translate(${positionX}px, ${positionY}px) scale(${currentZoom})`,
        }}
      >
        <img
          onLoad={handleOnImageLoad}
          style={{
            width,
            height,
          }}
          ref={imageRef}
          src={imageUrl}
        />
      </div>
      {isLoading && loading}
    </div>
  );
}
