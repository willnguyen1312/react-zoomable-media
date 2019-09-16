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

import { Zoomable, ZoomableImage } from '../.';

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
          <ZoomableImage imageUrl={zoomImageUrl} />
        </Zoomable>
      </Outer>
    </Wrapper>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
