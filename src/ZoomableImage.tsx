import React, { useState, useLayoutEffect } from 'react';
import { ZoomableContextType, withZoomableContext } from './ZoomableContext';

interface ImageProps {
  imageUrl: string;
  loading?: React.ReactNode;
  zoomContext: ZoomableContextType;
}

export default withZoomableContext(
  ({
    imageUrl,
    loading,
    zoomContext: {
      onImageLoad,
      onWheel,
      width,
      height,
      imageRef,
      wrapperRef,
      currentZoom,
      sliderRef,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      positionX,
      positionY,
    },
  }: ImageProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useLayoutEffect(() => {
      const image = imageRef.current as HTMLImageElement;
      const slider = sliderRef.current as HTMLDivElement;

      image.onload = () => {
        onImageLoad();
        setIsLoading(true);
      };

      slider.addEventListener('wheel', onWheel);
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
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{
            transformOrigin: '0 0',
            cursor: 'move',
            width,
            height,
            transform: `translate(${positionX}px, ${positionY}px) scale(${currentZoom})`,
          }}
        >
          <img
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
);
