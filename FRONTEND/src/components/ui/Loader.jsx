import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ message = "ANALYZING STYLE..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative w-48 h-48 mb-8 border border-chrome-600 rounded-xl overflow-hidden glass-panel">
        {/* Scanning Line Animation */}
        <motion.div
          animate={{ y: [0, 192, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-1 bg-neon-cyan shadow-neon-cyan z-10"
        />
        
        {/* Abstract Grid Background */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.5) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>

        {/* Pulse Circle */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-neon-purple blur-xl"
        />
      </div>
      
      <p className="font-orbitron text-neon-cyan animate-pulse tracking-widest">{message}</p>
    </div>
  );
};

export default Loader;
