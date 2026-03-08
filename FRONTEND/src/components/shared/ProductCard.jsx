import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { ChromeButton } from '../ui/ChromeButton';
import { Shirt, Sparkles, TrendingUp, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user, saveOutfit, removeOutfit } = useAuth();
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike' | null

  // Check if this product is already in the user's saved list
  const isSaved = user.savedOutfits.some(item => item.id === product.id);

  // Using image_url from the new requirements, falling back to original image handling or placeholder
  const imgSource = product.image_url ? product.image_url : (product.image ? `http://localhost:5000${product.image}` : '/api/placeholder/300/400');

  const handleTryOn = () => {
    navigate(`/try-on?productId=${product.id}`);
  };

  const handleToggleSave = () => {
    if (isSaved) {
      removeOutfit(product.id);
    } else {
      saveOutfit(product);
    }
  };

  const handleInteraction = async (type) => {
    setFeedback(type);
    try {
      // Bonus: Send to backend for Collaborative Filtering
      await fetch('http://localhost:5000/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, type }) // type: 'like' | 'dislike'
      });
    } catch (err) {
      console.error('Failed to post interaction:', err);
    }
  };

  return (
    <GlassCard className="flex flex-col h-full overflow-hidden group p-0 pb-4">
      <div className="relative w-full h-64 overflow-hidden bg-background-secondary mb-4">
        {imgSource.includes('placeholder') ? (
          <div className="w-full h-full flex items-center justify-center text-chrome-600">
            <Shirt className="w-16 h-16 opacity-50" />
          </div>
        ) : (
          <img
            src={imgSource}
            alt={product.name}
            className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}

        {/* Style Tag Badge */}
        <div className="absolute top-2 right-2 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm border border-neon-cyan text-neon-cyan text-xs font-orbitron px-2 py-1 rounded">
          {product.style || product.category || 'UNKNOWN'}
        </div>
      </div>

      <div className="px-4 flex-1 flex flex-col">
        <h3 className="font-space text-chrome-100 font-bold text-lg mb-1 truncate">{product.name}</h3>

        <div className="flex items-center gap-4 text-xs font-orbitron mb-4">
          {product.score && (
            <div className="flex items-center gap-1 text-neon-pink">
              <Sparkles className="w-3 h-3" /> MATCH: {(product.score * 100).toFixed(0)}%
            </div>
          )}
          {product.popularity_score && (
            <div className="flex items-center gap-1 text-neon-purple">
              <TrendingUp className="w-3 h-3" /> SCORE: {product.popularity_score}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 flex items-center gap-2">
          <button
            onClick={() => handleInteraction('like')}
            title="Like for Better Recommendations"
            className={`p-2 rounded-md transition-all duration-300 border ${feedback === 'like'
                ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'border-[rgba(255,255,255,0.1)] text-chrome-400 hover:text-white hover:border-[rgba(255,255,255,0.3)]'
              }`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleInteraction('dislike')}
            title="Show Less Like This"
            className={`p-2 rounded-md transition-all duration-300 border ${feedback === 'dislike'
                ? 'border-neon-pink bg-neon-pink/20 text-neon-pink shadow-[0_0_10px_rgba(255,46,166,0.3)]'
                : 'border-[rgba(255,255,255,0.1)] text-chrome-400 hover:text-white hover:border-[rgba(255,255,255,0.3)]'
              }`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleSave}
            title={isSaved ? "Remove from Wardrobe" : "Save to Wardrobe"}
            className={`p-2 rounded-md transition-all duration-300 border ${isSaved
                ? 'border-neon-cyan bg-neon-cyan/20 text-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'border-[rgba(255,255,255,0.1)] text-chrome-400 hover:text-white hover:border-[rgba(255,255,255,0.3)]'
              }`}
          >
            {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
          <ChromeButton onClick={handleTryOn} className="flex-1 py-2 text-sm flex items-center justify-center gap-2">
            <Shirt className="w-4 h-4" /> TRY IT ON
          </ChromeButton>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;
