import { Link } from 'react-router-dom';
import { Sparkles, Scan, LayoutGrid, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel border-b-0 rounded-none bg-[rgba(11,11,15,0.8)] px-8 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <Sparkles className="w-6 h-6 text-neon-cyan group-hover:text-neon-pink transition-colors duration-300" />
        <span className="font-orbitron font-bold text-xl tracking-wider chrome-text">
          DOPPELGANGER
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8 font-space text-sm uppercase tracking-widest text-chrome-400">
        <Link to="/" className="hover:text-neon-cyan transition-colors duration-300">Home</Link>
        <Link to="/analyze" className="hover:text-neon-cyan transition-colors duration-300 flex items-center gap-1">
          <Scan className="w-4 h-4" /> Upload Style
        </Link>
        <Link to="/recommendations" className="hover:text-neon-cyan transition-colors duration-300 flex items-center gap-1">
          <LayoutGrid className="w-4 h-4" /> Recommendations
        </Link>
        <Link to="/try-on" className="hover:text-neon-cyan transition-colors duration-300">Virtual Try-On</Link>
      </div>

      {/* Action Area */}
      <div className="flex items-center gap-4">
        <button className="chrome-button text-xs py-2 px-4 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <User className="w-4 h-4 inline-block mr-2" />
          Profile
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
