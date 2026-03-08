import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { getRecommendations } from '../services/recommendApi';
import ProductCard from '../components/shared/ProductCard';
import Loader from '../components/ui/Loader';
import { ChromeButton } from '../components/ui/ChromeButton';
import { GlassCard } from '../components/ui/GlassCard';
import { Sparkles, Palette, Layers, Tag } from 'lucide-react';

const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data passed from StyleAnalyzer via router state
  const generatedDesign = location.state?.generatedDesign || null;
  const analysisResult = location.state?.analysisResult || null;
  const passedRecommendations = location.state?.recommendations || null;

  const fetchRecommendations = async () => {
    setIsLoading(true);
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : [];

    if (!tags.length) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getRecommendations(tags);
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Use recommendations passed from StyleAnalyzer if available
    if (passedRecommendations && passedRecommendations.length > 0) {
      setRecommendations(passedRecommendations);
    } else {
      fetchRecommendations();
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="pt-32 min-h-screen">
        <Loader message="CALCULATING COSINE SIMILARITY..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 px-8 min-h-screen text-center">
        <h1 className="font-orbitron text-red-500 text-3xl mb-4">SYSTEM ERROR</h1>
        <p className="font-space text-chrome-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-8 pb-24 min-h-screen">
      <h1 className="font-orbitron text-3xl md:text-5xl mb-4 chrome-text text-center uppercase">
        RECOMMENDED FOR YOU
      </h1>
      <p className="text-center font-space text-chrome-400 mb-12 max-w-2xl mx-auto flex items-center justify-center gap-2 flex-wrap">
        Based on detected styles vector:
        {searchParams.get('tags')?.split(',').map(tag => (
          <span key={tag} className="text-neon-cyan border border-neon-cyan/50 px-2 py-1 rounded text-xs uppercase bg-neon-cyan/10">
            {tag.trim()}
          </span>
        ))}
      </p>

      {/* ── AI Generated Design Hero ── */}
      {generatedDesign && (
        <div className="max-w-5xl mx-auto mb-16">
          <GlassCard className="p-0 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Generated Image */}
              <div className="relative aspect-square md:aspect-auto bg-background-secondary">
                {generatedDesign.image_url && !generatedDesign.mock ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${generatedDesign.image_url}`}
                    alt="AI Generated Design"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center text-chrome-500 p-8">
                    <Sparkles className="w-16 h-16 mb-4 text-neon-purple animate-pulse" />
                    <p className="font-orbitron text-sm text-chrome-400">AI DESIGN PREVIEW</p>
                    <p className="font-space text-xs text-chrome-600 mt-2 text-center">
                      Add your TOGETHER_API_KEY in .env to generate real designs
                    </p>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-neon-purple px-3 py-1 rounded">
                  <span className="font-orbitron text-xs text-neon-purple">AI GENERATED</span>
                </div>
              </div>

              {/* Analysis Metadata */}
              <div className="p-8 flex flex-col justify-center">
                <h2 className="font-orbitron text-2xl chrome-text mb-6">YOUR DESIGN</h2>

                {analysisResult && (
                  <div className="space-y-5">
                    {/* Detected Styles */}
                    <div className="flex items-start gap-3">
                      <Tag className="w-5 h-5 text-neon-cyan mt-0.5 shrink-0" />
                      <div>
                        <p className="font-orbitron text-xs text-chrome-400 mb-2">DETECTED STYLES</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.detected_styles?.map(style => (
                            <span key={style} className="text-xs font-space px-2 py-1 rounded border border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10">
                              {style}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div className="flex items-start gap-3">
                      <Palette className="w-5 h-5 text-neon-pink mt-0.5 shrink-0" />
                      <div>
                        <p className="font-orbitron text-xs text-chrome-400 mb-2">COLOR PALETTE</p>
                        <div className="flex gap-2">
                          {analysisResult.color_palette?.map(color => (
                            <div key={color} className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-md border border-white/20" style={{ backgroundColor: color }} />
                              <span className="font-mono text-xs text-chrome-300">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Materials */}
                    {analysisResult.materials && (
                      <div className="flex items-start gap-3">
                        <Layers className="w-5 h-5 text-neon-purple mt-0.5 shrink-0" />
                        <div>
                          <p className="font-orbitron text-xs text-chrome-400 mb-2">MATERIALS</p>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.materials.map(mat => (
                              <span key={mat} className="text-xs font-space px-2 py-1 rounded border border-neon-purple/40 text-neon-purple bg-neon-purple/10">
                                {mat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generation Prompt */}
                    {generatedDesign.prompt_used && (
                      <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="font-orbitron text-xs text-chrome-500 mb-1">PROMPT USED</p>
                        <p className="font-space text-sm text-chrome-300 italic leading-relaxed">
                          "{generatedDesign.prompt_used}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── Product Recommendations Grid ── */}
      {recommendations.length > 0 && (
        <h2 className="font-orbitron text-xl chrome-text text-center mb-8 uppercase">
          Similar From Catalog
        </h2>
      )}

      {recommendations.length === 0 && !generatedDesign ? (
        <div className="text-center font-space text-chrome-500">
          No matching styles found in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {recommendations.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
