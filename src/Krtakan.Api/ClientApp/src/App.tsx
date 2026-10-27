import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';

export default function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </ThemeProvider>
    </HashRouter>
  );
}

