import React from 'react';

const Work = () => {
  return (
    <div>
      <h1>Work Experience</h1>
      <ul>
        <li>
          <h2>AWS Cloud Solutions Architect</h2>
          <p>Coursera, Remote (April 2024 - June 2024)</p>
          <p>Developed an Employee Directory Web Application using AWS services.</p>
        </li>
        <li>
          <h2>Python Backend and Scripting Intern</h2>
          <p>Nexcen Global, Duluth, GA (June 2023 - August 2023)</p>
          <p>Developed a voice AI using REST APIs for employee self-service.</p>
        </li>
        <li>
          <h2>JavaScript, Python (FastAPI) Intern</h2>
          <p>Skybridge, Sandy Springs, GA (June 2022 - August 2022)</p>
          <p>Automated the Exxon POS system for real-time server synchronization.</p>
        </li>
        {/* Add more work experiences as necessary */}
      </ul>

      <h2>Certifications</h2>
      <ul>
        <li>Cloud Computing Specialization from Georgia Institute of Technology</li>
      </ul>
    </div>
  );
};

export default Work;
