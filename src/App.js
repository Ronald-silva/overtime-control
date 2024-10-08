import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';  // Ajuste o caminho conforme necessário
import About from './About';  // Ajuste o caminho conforme necessário

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}

export default App;
