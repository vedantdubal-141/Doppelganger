import React from 'react';

const Home = () => {
  return (
    <div className="pt-24 px-8 min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="font-orbitron font-bold text-5xl md:text-7xl mb-6 chrome-text max-w-4xl mx-auto leading-tight">
        DISCOVER YOUR <br />
        <span className="text-neon-cyan drop-shadow-neon-cyan">FUTURE</span> STYLE
      </h1>
      <p className="font-space text-chrome-400 text-lg md:text-xl max-w-2xl mb-12">
        Upload your photo and let our AI analyze your aesthetic. We'll generate a personalized fashion
        profile and let you virtually try on your new looks.
      </p>
      
      <div className="flex gap-6">
        <button 
          onClick={() => window.location.href='/analyze'}
          className="chrome-button px-8 py-4 text-sm"
        >
          START ANALYSIS
        </button>
      </div>
    </div>
  );
};

export default Home;
