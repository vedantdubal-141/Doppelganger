import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../ui/GlassCard';
import { ChromeButton } from '../ui/ChromeButton';
import { Shirt, Sparkles } from 'lucide-react';

const ProductCard = ({ product }) => {
  // Use placeholder image if backend image is not found or mock provided
  const imgSource = product.image ? `http://localhost:5000${product.image}` : '/api/placeholder/300/400';

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
        {product.score && (
          <div className="flex items-center gap-1 text-neon-pink text-xs font-orbitron mb-4">
             <Sparkles className="w-3 h-3" /> MATCH SCORE: {(product.score * 100).toFixed(0)}%
          </div>
        )}
        
        <div className="mt-auto pt-4">
            {/* The Critical Handshake Link to Vinit's Domain */}
            <Link to={`/try-on?productId=${product.id || product._id || 1}`} className="block w-full">
              <ChromeButton className="w-full py-2 text-sm flex items-center justify-center gap-2">
                <Shirt className="w-4 h-4" /> VIRTUAL TRY-ON
              </ChromeButton>
            </Link>
        </div>
      </div>
    </GlassCard>
  );
};

export default ProductCard;
