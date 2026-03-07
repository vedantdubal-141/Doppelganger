import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full glass-panel rounded-none border-x-0 border-b-0 mt-auto px-8 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-cyan" />
          <span className="font-orbitron font-bold text-lg tracking-wider chrome-text">DOPPELGANGER</span>
        </div>

        {/* Links */}
        <div className="flex gap-6 font-space text-xs uppercase tracking-widest text-chrome-500">
          <Link to="/" className="hover:text-neon-cyan transition-colors">Home</Link>
          <Link to="/analyze" className="hover:text-neon-cyan transition-colors">Upload</Link>
          <Link to="/recommendations" className="hover:text-neon-cyan transition-colors">Recommendations</Link>
          <Link to="/try-on" className="hover:text-neon-cyan transition-colors">Try-On</Link>
        </div>

        {/* Copyright */}
        <p className="text-chrome-700 text-xs font-inter">
          © 2026 Doppelganger — AI Fashion Lab
        </p>
      </div>
    </footer>
  );
};

export default Footer;
