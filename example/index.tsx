import 'react-app-polyfill/ie11';
import 'flexibility';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Video from './Video';
import Image from './Image';
import { Zoomable } from '../dist';

const App = () => {
  const [isVideo, setIsVideo] = useState(false);

  const toggleSelectVideo = () => setIsVideo(!isVideo);

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
        }}
      >
        <button onClick={toggleSelectVideo}>Image</button>
        <button onClick={toggleSelectVideo}>Video</button>
      </nav>
      {isVideo ? (
        <Zoomable
          enable={true}
          maxZoom={4}
          moveStep={50}
          wheelZoomRatio={0.1}
          zoomStep={10}
        >
          <Video />
        </Zoomable>
      ) : (
        <Image />
      )}
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
