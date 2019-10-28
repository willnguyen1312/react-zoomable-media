import React, { useState, useContext, useRef, FC } from 'react';
import { ZoomableContextType, zoomableContext } from './ZoomableContext';
import { ZoomableWrapper } from './ZoomableWrapper';
import { ZoomableContent } from './ZoomableContent';

interface ImageProps {
  imageUrl: string;
  loading?: React.ReactNode;
}

export const ZoomableImage: FC<ImageProps> = ({ imageUrl, loading }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const { onMediaReady, width, height } = useContext(
    zoomableContext
  ) as ZoomableContextType;

  const handleOnImageLoad = () => {
    onMediaReady(imageRef);
    setIsLoading(false);
  };

  return (
    <ZoomableWrapper>
      <ZoomableContent>
        <img
          onLoad={handleOnImageLoad}
          style={{
            width,
            height,
          }}
          ref={imageRef}
          src={imageUrl}
        />
      </ZoomableContent>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loading}
        </div>
      )}
    </ZoomableWrapper>
  );
};
