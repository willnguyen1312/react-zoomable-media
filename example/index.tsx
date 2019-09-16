import 'react-app-polyfill/ie11';
import 'flexibility';
import React from 'react';
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

import { Zoomable, ZoomableVideo } from '../.';

// const zoomImageUrl = 'https://picsum.photos/id/1037/5000/800';
const zoomImageUrl = 'https://picsum.photos/id/1037/1024/768';
// const zoomImageUrl = 'https://picsum.photos/id/1037/800/5000';

const App = () => {
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
          <ZoomableVideo
            renderVideoWrapper={videoWrapperRef => {
              return (
                <div ref={videoWrapperRef}>
                  <video
                    style={{
                      height: 'auto',
                      width: '100%',
                    }}
                    controls
                    // src="https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_5MB.mp4"
                    src="http://127.0.0.1:8080/video.mp4"
                  />
                </div>
              );
            }}
          />
        </Zoomable>
      </Outer>
    </Wrapper>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
