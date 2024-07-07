import React, { useEffect, useState } from 'react';
import './App.css';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Work from './pages/Work';
import Certifications from './pages/Certifications';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

const App = () => {
  const [isDay, setIsDay] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours >= 7 && hours <= 17) {
      setIsDay(true);
    } else {
      setIsDay(false);
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={isDay ? 'day-background' : 'night-background'}>
      <Router>
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/work">Work</Link>
          <Link to="/certifications">Certifications</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/work" element={<Work />} />
          <Route path="/certifications" element={<Certifications />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
