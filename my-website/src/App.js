import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Make sure this is here
import MyNavbar from './components/MyNavbar';
import BlogsPage from './pages/BlogsPage';
import BlogPostPage from './pages/BlogPostPage';
// Import other components as needed

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  // Your other state and functions

  // HomePage Component (extract your current main page content)
  const HomePage = () => (
    <div className={darkMode ? 'dark-mode' : 'light-mode'}>
      <MyNavbar activeSection={activeSection} />
      
      {/* Header Container */}
      <div className="header-container">
        {/* Your existing header content */}
      </div>

      {/* Rest of your existing sections */}
      {/* About, Skills, Education, Experience, Projects, Hobbies, Resume, Contact */}
      
      <footer className="footer">
        {/* Your existing footer */}
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/blogs/:slug" element={<BlogPostPage />} />
      </Routes>
    </Router>
  );
}

export default App;