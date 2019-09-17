import React, { useRef, useState, useEffect } from 'react';
import {
  ZoomableVideo,
  withZoomableContext,
  ZoomableContextType,
} from '../dist';

interface AppProps {
  zoomContext: ZoomableContextType;
}

const VideoApp = withZoomableContext((props: AppProps) => {
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

  useEffect(() => {
    const video = videoRef.current as HTMLVideoElement;
    const {
      zoomContext: { onVideoLoad },
    } = props;
    video.onloadeddata = onVideoLoad;
  });

  return (
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
        <ZoomableVideo>
          <video
            style={{
              height: 'auto',
              width: '100%',
            }}
            ref={videoRef}
            src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"
            // src="http://127.0.0.1:8080/video.mp4"
          />
        </ZoomableVideo>
        <button onClick={togglePlay}>{isPlay ? 'Pause' : 'Play'}</button>
      </div>
    </div>
  );
});

export default VideoApp;
