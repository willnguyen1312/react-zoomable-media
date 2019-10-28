import React, { useRef, useState, useEffect } from 'react';
import { ZoomableVideo, Zoomable } from '../dist';

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
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ width: 810, height: 450 }}>
          <ZoomableVideo
            render={({ onMediaReady }) => {
              return (
                <video
                  onLoadedMetadata={() => onMediaReady(videoRef)}
                  style={{
                    height: 'auto',
                    width: '100%',
                  }}
                  ref={videoRef}
                  src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"
                  // src="http://127.0.0.1:8080/video.mp4"
                />
              );
            }}
          ></ZoomableVideo>
          <button onClick={togglePlay}>{isPlay ? 'Pause' : 'Play'}</button>
        </div>
      </div>
    </Zoomable>
  );
};

export default VideoApp;
