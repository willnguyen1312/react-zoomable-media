import 'react-app-polyfill/ie11';
import 'flexibility';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Video from './Video';
import Image from './Image';
import PDF from './PDF';

const App = () => {
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'pdf'>('pdf');

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 10,
          left: 10,
        }}
      >
        <button onClick={() => setMediaType('image')}>Image</button>
        <button onClick={() => setMediaType('video')}>Video</button>
        <button onClick={() => setMediaType('pdf')}>PDF</button>
      </nav>
      {(() => {
        switch (mediaType) {
          case 'image':
            return <Image />;

          case 'video':
            return <Video />;

          case 'pdf':
            return <PDF />;

          default:
            return null;
        }
      })()}
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
