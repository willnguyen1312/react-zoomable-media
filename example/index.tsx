import 'react-app-polyfill/ie11';
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

import { Zoomable } from '../.';

const App = () => {
  return (
    <Wrapper>
      <Outer>
        <Zoomable />
      </Outer>
    </Wrapper>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
