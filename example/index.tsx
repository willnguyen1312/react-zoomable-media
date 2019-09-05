import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';

import { Zoomable } from '../.';

const App = () => {
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
      <div
        style={{
          width: 810,
        }}
      >
        <Zoomable />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
