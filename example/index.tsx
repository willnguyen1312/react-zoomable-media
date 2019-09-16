import 'react-app-polyfill/ie11';
import 'flexibility';
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Outer = styled.div`
  width: 810px;
  height: 450px;
`;

import { Zoomable, ZoomableVideo, ZoomableImage } from '../.';

// const zoomImageUrl = 'https://picsum.photos/id/1037/5000/800';
const zoomImageUrl = 'https://picsum.photos/id/1037/1024/768';
// const zoomImageUrl = 'https://picsum.photos/id/1037/800/5000';

const App = () => {
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
    <Wrapper>
      <Outer>
        <Zoomable
          enable={true}
          maxZoom={4}
          moveStep={50}
          wheelZoomRatio={0.1}
          zoomStep={10}
        >
          {/* <ZoomableVideo>
            <video
              style={{
                height: 'auto',
                width: '100%',
              }}
              ref={videoRef}
              // src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"
              src="http://127.0.0.1:8080/video.mp4"
            />
          </ZoomableVideo>
          <button onClick={togglePlay}>{isPlay ? 'Pause' : 'Play'}</button> */}

          <ZoomableImage imageUrl={zoomImageUrl} />
        </Zoomable>
      </Outer>
    </Wrapper>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
