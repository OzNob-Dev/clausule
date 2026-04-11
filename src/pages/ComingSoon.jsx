import React from 'react';
import '../styles/coming-soon.css'; // Make sure the path matches where you save the CSS

export default function ComingSoon() {
  return (
    <div className="coming-soon-wrapper">
      <main>
        <div className="eyebrow">
          In development · Built for managers and their teams
        </div>
        
        <h1>
          The file note tool<br />
          that does <em>the heavy<br />lifting</em> for you.
        </h1>
        
        <p className="sub">
          Write a plain note after a 1:1. Clausule handles the rest — tagging, pattern detection, performance thresholds, and a brag doc that follows your team wherever their careers take them.
        </p>
      </main>

      <footer>
        <div className="logo">
          CLAU<span>SULE</span>
        </div>
        <div className="footer-note">© 2026</div>
      </footer>
    </div>
  );
}