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
      {isVideo ? <Video /> : <Image />}
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
