import React, { useRef, useState, useEffect } from 'react';
import {
  ZoomableVideo,
  Zoomable,
  zoomableContext,
  ZoomableContextType,
} from '../dist';
import { useContext } from 'react';

const Video = ({
  videoRef,
  isPlay,
  togglePlay,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  isPlay: boolean;
  togglePlay: () => void;
}) => {
  const { cropImage } = useContext(zoomableContext) as ZoomableContextType;
  const [imageData, serImageData] = useState<string>('');

  const onClickHandler = () => {
    cropImage((imageData: string) => {
      serImageData(imageData);
    });
  };

  const downloadImage = () => {
    const link = document.createElement('a');

    link.setAttribute('href', imageData);
    link.setAttribute('download', 'Cropped Image');
    link.click();
  };

  return (
    <div style={{ width: 810, height: 450, marginBottom: 150 }}>
      <ZoomableVideo
        render={({ onMediaReady }) => {
          return (
            <video
              crossOrigin="anonymous"
              onLoadedMetadata={() => onMediaReady(videoRef)}
              style={{
                height: 'auto',
                width: '100%',
              }}
              ref={videoRef}
              // src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"
              // src="http://localhost:8080/trip.mp4"
              src="/bunny.mp4"
            />
          );
        }}
      ></ZoomableVideo>
      <button onClick={togglePlay}>{isPlay ? 'Pause' : 'Play'}</button>

      <button onClick={onClickHandler}>Crop Image</button>
      {imageData && (
        <>
          <img
            style={{ width: 810, height: 450, objectFit: 'contain' }}
            src={imageData}
          />
          <button onClick={downloadImage}>Download Cropped Image</button>
        </>
      )}
    </div>
  );
};

const VideoApp = () => {
  const [isPlay, setIsPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    const video = videoRef.current as HTMLVideoElement;
    setIsPlay(!isPlay);
    if (isPlay) {
      video.pause();
    } else {
      video.play();
    }
  };

  return (
    <Zoomable
      enable
      maxZoom={4}
      moveStep={50}
      wheelZoomRatio={0.1}
      zoomStep={10}
    >
      <div
        style={{
          height: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Video isPlay={isPlay} togglePlay={togglePlay} videoRef={videoRef} />
      </div>
    </Zoomable>
  );
};

export default VideoApp;
