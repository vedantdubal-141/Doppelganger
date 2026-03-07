import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, CheckCircle2, Scan } from 'lucide-react';
import { uploadImage } from '../services/uploadApi';
import Loader from '../components/ui/Loader';
import { ChromeButton } from '../components/ui/ChromeButton';
import { GlassCard } from '../components/ui/GlassCard';

const StyleAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      setError(null);
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      // Send to Backend
      const data = await uploadImage(file);
      
      // Delay slightly for effect
      setTimeout(() => {
        setIsScanning(false);
        // Navigate to recommendations passing tags via query param
        const tagQuery = data.tags.join(',');
        navigate(`/recommendations?tags=${encodeURIComponent(tagQuery)}`);
      }, 1500);
      
    } catch (err) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  if (isScanning) {
    return (
      <div className="pt-32 px-8 min-h-screen flex flex-col items-center">
         <h1 className="font-orbitron text-4xl mb-4 chrome-text">AI PROCESSING</h1>
         <p className="font-space text-chrome-400 mb-12">Extracting embedded style components and body vectors...</p>
         <Loader message="CALCULATING COSINE SIMILARITY" />
      </div>
    );
  }

  return (
    <div className="pt-24 px-8 min-h-screen pb-12">
      <h1 className="font-orbitron text-3xl md:text-5xl mb-4 chrome-text text-center">STYLE ANALYZER</h1>
      <p className="text-center font-space text-chrome-400 mb-12 max-w-2xl mx-auto">
        Upload a full-body or upper-body photo. Our AI will generate specialized embeddings 
        to detect your aesthetic and map your proportions.
      </p>
      
      <div className="max-w-3xl mx-auto">
        <GlassCard hoverEffect={false} className="border-neon-cyan/30 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
          {!previewUrl ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-chrome-600 rounded-xl p-16 flex flex-col items-center justify-center text-center hover:border-neon-cyan hover:bg-neon-cyan/5 transition-all cursor-pointer min-h-[400px]"
            >
              <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mb-6 shadow-black/50 shadow-lg">
                <Upload className="w-8 h-8 text-chrome-100" />
              </div>
              <h3 className="font-orbitron text-xl text-chrome-100 mb-2">DRAG & DROP IMAGE HERE</h3>
              <p className="font-space text-chrome-500 mb-8">JPG, PNG up to 5MB</p>
              
              <ChromeButton onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} type="button">
                BROWSE FILES
              </ChromeButton>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md h-96 rounded-xl overflow-hidden mb-8 border border-chrome-500">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-background-primary/80 backdrop-blur px-3 py-1 rounded text-neon-cyan font-orbitron text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> UPLOADED
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(''); }}
                  className="px-6 py-3 font-space text-chrome-400 hover:text-white transition-colors"
                >
                  RESELECT
                </button>
                <ChromeButton onClick={startAnalysis} className="px-10 flex items-center gap-2">
                  <Scan className="w-5 h-5 border-blue-500" /> COMMENCE SCAN
                </ChromeButton>
              </div>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/jpeg, image/png, image/jpg" 
            className="hidden" 
          />
        </GlassCard>

        {error && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-500 text-red-500 font-space text-center rounded">
            ERROR: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleAnalyzer;
