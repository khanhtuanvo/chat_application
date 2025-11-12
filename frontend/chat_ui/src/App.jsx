import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import Register from './components/Register';
import { isAuthenticated } from './services/authService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleRegisterSuccess = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />
        <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
      </Routes>
    );
  }

  return (
    <div className="h-screen">
      <Routes>
        <Route path="/:conversationId?" element={<ChatInterface />} />
      </Routes>
    </div>
  );
}

export default App;