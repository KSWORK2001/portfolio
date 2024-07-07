import React from 'react';
import './Navbar.css';
import { ReactComponent as LampIcon } from './lamp.svg'; // Use your lamp SVG

const Navbar = ({ toggleTheme }) => {
  return (
    <nav className="navbar">
      <a href="#home">Home</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
      <a href="#work">Work</a>
      <div className="lamp" onClick={toggleTheme}>
        <LampIcon className="lamp-icon" />
      </div>
    </nav>
  );
};

export default Navbar;
