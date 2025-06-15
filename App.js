import React from 'react';
import WelcomeScreen from './src/components/WelcomeScreen/WelcomeScreen';
import { GlobalStyle } from './src/components/WelcomeScreen/styles';

function App() {
  return (
    <>
      <GlobalStyle />
      <WelcomeScreen />
    </>
  );
}

export default App;
