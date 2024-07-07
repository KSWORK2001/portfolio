import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Hi, I'm Karan. A Designer.</h1>
      <p>I'm passionate about crafting experiences that are engaging, accessible, and user-centric.</p>

      <div className="featured-projects">
        <div className="project-card">
          <h3>FitFirst</h3>
          <p>HealthTech mobile application</p>
        </div>
        <div className="project-card">
          <h3>Zapp</h3>
          <p>Media platform using Discord's API</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
