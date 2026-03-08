import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Scan, Sparkles } from 'lucide-react';
import { uploadImage } from '../services/uploadApi';
import Loader from '../components/ui/Loader';
import { ChromeButton } from '../components/ui/ChromeButton';
import { GlassCard } from '../components/ui/GlassCard';

const UploadZone = ({ title, description, files, setFiles }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setFiles(prev => [
        ...prev,
        ...selectedFiles.map(f => ({ file: f, url: URL.createObjectURL(f) }))
      ]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      setFiles(prev => [
        ...prev,
        ...droppedFiles.map(f => ({ file: f, url: URL.createObjectURL(f) }))
      ]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-orbitron text-xl text-neon-cyan mb-2 text-center">{title}</h3>
      <p className="font-space text-chrome-400 text-sm mb-6 text-center lg:h-10">{description}</p>

      <GlassCard hoverEffect={false} className="border-neon-cyan/20 shadow-[0_0_15px_rgba(0,240,255,0.05)] flex-1 flex flex-col p-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-chrome-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-neon-cyan hover:bg-neon-cyan/5 transition-all cursor-pointer min-h-[160px] mb-6"
        >
          <Upload className="w-8 h-8 text-chrome-100 mb-3" />
          <p className="font-orbitron text-sm text-chrome-300">DRAG & DROP OR CLICK</p>
          <p className="font-space text-xs text-chrome-500 mt-2">Multiple JPG, PNG allowed</p>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-auto">
            {files.map((fileObj, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-chrome-600 aspect-square">
                <img src={fileObj.url} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500 rounded-full text-white backdrop-blur transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg, image/png, image/jpg"
          multiple
          className="hidden"
        />
      </GlassCard>
    </div>
  );
};

const StyleAnalyzer = () => {
  const [inspirations, setInspirations] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const startAnalysis = async (e) => {
    e.preventDefault();
    if (inspirations.length === 0 && purchases.length === 0) {
      setError("Please upload at least one image in either category.");
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      // Send arrays to updated backend service
      const data = await uploadImage(inspirations, purchases);

      // Navigate to recommendations passing tags via query param
      setTimeout(() => {
        setIsScanning(false);
        const tags = data?.tags || ['futuristic', 'cyberpunk', 'y2k']; // Fallback for testing
        const tagQuery = tags.join(',');
        navigate(`/recommendations?tags=${encodeURIComponent(tagQuery)}`);
      }, 2000);

    } catch (err) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return (
      <div className="pt-32 px-8 min-h-screen flex flex-col items-center">
        <h1 className="font-orbitron text-4xl mb-4 chrome-text text-center">AI PROCESSING</h1>
        <p className="font-space text-chrome-400 mb-12 text-center max-w-lg">
          Extracting multi-dimensional aesthetic vectors from your curated inspirations and past wardrobe selections...
        </p>
        <Loader message="CALCULATING COSINE SIMILARITY" />
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-8 min-h-screen pb-12">
      <h1 className="font-orbitron text-3xl md:text-5xl mb-4 chrome-text text-center flex justify-center items-center gap-4">
        <Sparkles className="hidden md:block w-8 h-8 text-neon-cyan" />
        STYLE ANALYZER
        <Sparkles className="hidden md:block w-8 h-8 text-neon-purple" />
      </h1>
      <p className="text-center font-space text-chrome-400 mb-12 max-w-2xl mx-auto">
        Upload multiple photos of your past purchases and style inspirations. Our AI will analyze the combined
        dataset to generate highly accurate, personalized aesthetic embeddings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-10 text-left">
        <UploadZone
          title="STYLE INSPIRATIONS"
          description="Vibes, aesthetics, and clothing concepts you want the AI to learn from."
          files={inspirations}
          setFiles={setInspirations}
        />

        <UploadZone
          title="PAST PURCHASES"
          description="Clothes you already own. We'll use these to anchor recommendations to your reality."
          files={purchases}
          setFiles={setPurchases}
        />
      </div>

      <div className="flex flex-col items-center max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 p-4 w-full max-w-md bg-red-900/20 border border-red-500 text-red-500 font-space text-center rounded">
            ERROR: {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4">
          {(inspirations.length > 0 || purchases.length > 0) && (
            <button
              onClick={() => { setInspirations([]); setPurchases([]); setError(null); }}
              className="px-6 py-4 sm:py-3 border border-chrome-600 rounded-lg font-space text-chrome-400 hover:text-white hover:border-chrome-400 hover:bg-white/5 transition-colors w-full sm:w-auto"
            >
              CLEAR ALL
            </button>
          )}
          <ChromeButton
            onClick={startAnalysis}
            className={`px-10 py-4 sm:py-3 flex justify-center items-center gap-3 w-full sm:w-auto ${(inspirations.length === 0 && purchases.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Scan className="w-5 h-5 text-neon-cyan" />
            COMMENCE DATA SCAN
          </ChromeButton>
        </div>
      </div>
    </div>
  );
};

export default StyleAnalyzer;
