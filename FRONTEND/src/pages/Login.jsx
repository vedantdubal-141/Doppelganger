import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { ChromeButton } from '../components/ui/ChromeButton';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const { login, authLoading, authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by context but we can log it here
      console.error("Login Error:", err);
    }
  };

  return (
    <div className="pt-24 px-4 sm:px-8 pb-24 min-h-screen w-full flex items-center justify-center">
      <GlassCard className="w-full max-w-md p-8 border-neon-cyan/30 flex flex-col items-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/20 blur-[50px] -z-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-purple/20 blur-[50px] -z-10 rounded-full"></div>

        <div className="w-16 h-16 rounded-full border-2 border-neon-cyan/50 bg-background-secondary flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          <LogIn className="w-8 h-8 text-chrome-400" />
        </div>

        <h1 className="font-orbitron font-bold text-3xl chrome-text mb-2 text-center uppercase">
          Neural Uplink
        </h1>
        <p className="font-space text-chrome-400 text-sm mb-8 text-center">
          Authenticate to access the StyleForge network
        </p>

        {(authError || localError) && (
          <div className="w-full mb-6 p-4 border border-neon-pink/50 bg-neon-pink/10 rounded-lg flex items-center gap-3">
             <AlertCircle className="w-5 h-5 text-neon-pink flex-shrink-0" />
             <p className="font-space text-neon-pink text-sm">{localError || authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2 relative">
            <Mail className="w-5 h-5 text-chrome-500 absolute top-[38px] left-3" />
            <label className="font-space text-xs text-neon-cyan uppercase tracking-wider">Email Sequence</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background-secondary/80 border border-chrome-700 rounded-md p-3 pl-10 text-chrome-100 placeholder:text-chrome-600 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
              placeholder="operator@network.com"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <Lock className="w-5 h-5 text-chrome-500 absolute top-[38px] left-3" />
            <label className="font-space text-xs text-neon-cyan uppercase tracking-wider">Access Code</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background-secondary/80 border border-chrome-700 rounded-md p-3 pl-10 text-chrome-100 placeholder:text-chrome-600 focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
              placeholder="••••••••"
            />
          </div>

          <ChromeButton 
            type="submit" 
            className="w-full mt-2 py-4 flex items-center justify-center"
            disabled={authLoading}
          >
            {authLoading ? 'ESTABLISHING CONNECTION...' : 'INITIALIZE LINK'}
          </ChromeButton>
        </form>

        <div className="mt-8 pt-6 border-t border-chrome-800 w-full text-center">
           <p className="font-space text-sm text-chrome-400">
             Not a registered operator? <Link to="/signup" className="text-neon-cyan hover:text-white transition-colors">Apply for Access</Link>
           </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Login;
