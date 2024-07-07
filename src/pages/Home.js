import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div classname="scrollable-content">
        <div className="home-container">
        <h1>Hey, I'm Karan!</h1>
        <h1>A Full Stack Developer!!</h1>
        <p>I'm passionate about crafting experiences that are engaging, accessible, and user-centric.</p>

        <div className="featured-projects">
            <div className="project-card">
            <h3>FitFirst</h3>
            <p>FitFirst is an innovative and completely offline-capable fitness application developed in Python. It offers precise tracking of Body Mass Index (BMI) and Body Fat Percentage (BFP), along with comprehensive logging of daily calorie and water intake. FitFirst also tracks macronutrient consumption and crafts personalized workout plans tailored to individual fitness goals. Users can choose from three different workout settings—Aggressive (Fastest), Moderate (Medium Pace), and Easy (Slow but Comfortable)—to match their preferred pace and intensity.</p>
            </div>
            <div className="project-card">
            <h3>Zapp</h3>
            <p>Zapp is a sophisticated Discord web companion developed in Java that bridges distances by enabling a seamless experience of watching shows and movies together. It empowers all users to control the video player, including functionalities like pause, fast forward, and skip. Additionally, Zapp enhances interaction by allowing users to play games together through combined inputs. By leveraging the Discord API, Zapp ensures smooth and synchronized entertainment experiences for remote groups.</p>
            </div>
        </div>
        </div>
    </div>
  );
};

export default Home;
