import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CommunityFeed from './pages/CommunityFeed';
import Profile from './pages/Profile';
import StyleAnalyzer from './pages/StyleAnalyzer';
import Recommendations from './pages/Recommendations';
import VirtualTryOn from './pages/VirtualTryOn';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { BiometricGuard } from './components/layout/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-primary w-full text-chrome-100 flex flex-col">
        <Navbar />
        <main className="flex-1 w-full flex flex-col pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<CommunityFeed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analyze" element={<StyleAnalyzer />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/try-on" element={
              <BiometricGuard>
                <VirtualTryOn />
              </BiometricGuard>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
