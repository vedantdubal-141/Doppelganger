import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VirtualTryOn from './pages/VirtualTryOn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vinit's domain — Virtual Try-On smart mirror */}
        <Route path="/try-on" element={<VirtualTryOn />} />

        {/* Default root — placeholder until Rishab builds Home */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
              <h1 className="text-4xl md:text-6xl font-orbitron font-bold neon-text-primary mb-4 tracking-wider">
                DOPPELGANGER
              </h1>
              <p className="text-chrome-500 font-space text-lg tracking-widest uppercase mb-8">
                AI Fashion Lab — Loading...
              </p>
              <a
                href="/try-on"
                className="chrome-button"
              >
                ENTER VIRTUAL TRY-ON
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
