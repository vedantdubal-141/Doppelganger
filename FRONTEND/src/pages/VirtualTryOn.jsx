import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shirt, BarChart3, Ruler, Weight, Maximize2,
  ChevronRight, RotateCcw, Sparkles, Eye, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productApi';
import { GlassCard } from '../components/ui/GlassCard';
import Loader from '../components/ui/Loader';
import Scene from '../components/3d/Scene';
import Avatar from '../components/3d/Avatar';
import ClothingMesh from '../components/3d/ClothingMesh';
import CanvasErrorBoundary from '../components/3d/CanvasErrorBoundary';

/* ── Fallback style → color map (used when product has no `color` field) ── */
const STYLE_COLORS = {
  streetwear: '#FF6B35',
  casual: '#4ECDC4',
  formal: '#2D3436',
  sportswear: '#6C5CE7',
  vintage: '#FDCB6E',
  summer: '#E17055',
  default: '#7B61FF',
};

const VirtualTryOn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClothing, setShowClothing] = useState(true);

  const productId = searchParams.get('productId');

  /* ── Fetch products on mount ── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const products = await getProducts();
        setAllProducts(products);

        if (productId) {
          const found = products.find(p => String(p.id) === String(productId));
          setSelectedProduct(found || products[0] || null);
        } else if (products.length > 0) {
          setSelectedProduct(products[0]);
        }
      } catch (err) {
        console.error('VirtualTryOn: failed to load products', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  /* ── Measurements from AuthContext ── */
  const measurements = useMemo(() => {
    if (!user?.biometrics) return {};
    return {
      height: user.biometrics.height,
      weight: user.biometrics.weight,
      shoulderWidth: user.biometrics.shoulderWidth,
      waist: user.biometrics.waist,
    };
  }, [user?.biometrics]);

  // Use product's own color, or fall back to style-based color
  const clothingColor = selectedProduct
    ? (selectedProduct.color || STYLE_COLORS[selectedProduct.style] || STYLE_COLORS.default)
    : STYLE_COLORS.default;

  const productImage = selectedProduct
    ? (selectedProduct.image_url || selectedProduct.image || '')
    : '';

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <Loader message="INITIALIZING SMART MIRROR..." />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-8 px-4 min-h-screen flex flex-col">
      {/* ── Header ── */}
      <div className="text-center mb-4">
        <h1 className="font-orbitron text-2xl sm:text-3xl chrome-text mb-1">
          SMART MIRROR
        </h1>
        <p className="font-space text-chrome-400 text-xs sm:text-sm tracking-wider">
          VIRTUAL TRY-ON ENGINE • BIOMETRIC SYNC ACTIVE
        </p>
      </div>

      {/* ── Main Layout: Side Panel | 3D Canvas | Analytics ── */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">

        {/* ── LEFT: Clothing Options Panel ── */}
        <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 order-2 lg:order-1">
          <GlassCard className="p-4 h-full border-chrome-600" hoverEffect={false}>
            <h2 className="font-orbitron text-sm text-neon-cyan flex items-center gap-2 mb-4">
              <Shirt className="w-4 h-4" /> CLOTHING OPTIONS
            </h2>

            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[calc(100vh-280px)] pb-2">
              {allProducts.map((product) => {
                const isActive = selectedProduct?.id === product.id;
                const pColor = product.color || STYLE_COLORS[product.style] || STYLE_COLORS.default;

                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`flex-shrink-0 w-44 lg:w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-left ${isActive
                        ? 'bg-neon-cyan/10 border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                        : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                      }`}
                  >
                    {/* Color swatch */}
                    <div
                      className="w-9 h-9 rounded-lg flex-shrink-0 border border-white/15 shadow-inner"
                      style={{ backgroundColor: pColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`font-space text-xs font-semibold truncate ${isActive ? 'text-neon-cyan' : 'text-chrome-200'}`}>
                        {product.name}
                      </p>
                      <p className="font-space text-[10px] text-chrome-500 uppercase">
                        {product.style || 'unknown'}
                      </p>
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 text-neon-cyan ml-auto flex-shrink-0 hidden lg:block" />}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* ── CENTER: 3D Canvas ── */}
        <div className="flex-1 order-1 lg:order-2 min-h-[450px] lg:min-h-0 relative">
          <GlassCard className="p-0 h-full overflow-hidden border-neon-purple/20 relative" hoverEffect={false}>
            {/* Canvas controls overlay */}
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button
                onClick={() => setShowClothing(!showClothing)}
                title={showClothing ? 'Hide clothing' : 'Show clothing'}
                className={`p-2.5 rounded-lg backdrop-blur-md transition-all duration-300 border ${showClothing
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : 'bg-black/40 border-white/10 text-chrome-400 hover:text-chrome-200'
                  }`}
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Status bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 backdrop-blur-md px-4 py-2.5 flex items-center justify-between border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={selectedProduct?.id || 'none'}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="font-space text-[11px] text-chrome-300"
                  >
                    {selectedProduct ? selectedProduct.name.toUpperCase() : 'NO PRODUCT SELECTED'}
                  </motion.span>
                </AnimatePresence>
              </div>
              <span className="font-space text-[10px] text-chrome-500 hidden sm:inline">
                DRAG TO ROTATE • SCROLL TO ZOOM
              </span>
            </div>

            {/* 3D Scene with Error Boundary */}
            <CanvasErrorBoundary
              productImage={productImage}
              productName={selectedProduct?.name}
            >
              <Scene>
                {/* Avatar = STABLE body that never changes on product swap */}
                <Avatar measurements={measurements} />

                {/* ClothingMesh = DYNAMIC overlay that changes per product */}
                {showClothing && selectedProduct && (
                  <ClothingMesh
                    style={selectedProduct.style || 'default'}
                    color={clothingColor}
                    measurements={measurements}
                    visible={true}
                  />
                )}
              </Scene>
            </CanvasErrorBoundary>
          </GlassCard>
        </div>

        {/* ── RIGHT: Style Analytics Panel ── */}
        <div className="w-full lg:w-64 xl:w-72 flex-shrink-0 order-3">
          <GlassCard className="p-4 h-full border-chrome-600" hoverEffect={false}>
            <h2 className="font-orbitron text-sm text-neon-purple flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" /> STYLE ANALYTICS
            </h2>

            {/* Current Product Info — animated swap */}
            <AnimatePresence mode="wait">
              {selectedProduct && (
                <motion.div
                  key={selectedProduct.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="mb-6 p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/20"
                >
                  <p className="font-space text-xs text-chrome-400 uppercase mb-1">Active Garment</p>
                  <p className="font-orbitron text-sm text-chrome-100 mb-2">{selectedProduct.name}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md border border-white/20 shadow-inner"
                      style={{ backgroundColor: clothingColor }}
                    />
                    <span className="font-space text-xs text-chrome-400 uppercase">
                      {selectedProduct.style || 'N/A'}
                    </span>
                    {selectedProduct.category && (
                      <span className="font-space text-[10px] text-chrome-500 ml-1">
                        / {selectedProduct.category}
                      </span>
                    )}
                  </div>
                  {selectedProduct.score && (
                    <div className="flex items-center gap-1 mt-2 text-neon-pink">
                      <Sparkles className="w-3 h-3" />
                      <span className="font-orbitron text-xs">
                        MATCH: {(selectedProduct.score * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                  {(selectedProduct.popularity_score || selectedProduct.popularity) && (
                    <div className="flex items-center gap-1 mt-1 text-neon-purple">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-orbitron text-xs">
                        POP: {selectedProduct.popularity_score || selectedProduct.popularity}/10
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Biometric Data Display */}
            <div className="space-y-3">
              <p className="font-space text-xs text-chrome-500 uppercase tracking-wider">
                Body Vector
              </p>

              <div className="flex items-center justify-between p-2 rounded-md bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="font-space text-xs text-chrome-300">Height</span>
                </div>
                <span className="font-orbitron text-xs text-chrome-100">
                  {measurements.height || '—'} cm
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Weight className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="font-space text-xs text-chrome-300">Weight</span>
                </div>
                <span className="font-orbitron text-xs text-chrome-100">
                  {measurements.weight || '—'} kg
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3.5 h-3.5 text-neon-purple" />
                  <span className="font-space text-xs text-chrome-300">Shoulders</span>
                </div>
                <span className="font-orbitron text-xs text-chrome-100">
                  {measurements.shoulderWidth || '—'} cm
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-neon-purple" />
                  <span className="font-space text-xs text-chrome-300">Waist</span>
                </div>
                <span className="font-orbitron text-xs text-chrome-100">
                  {measurements.waist || '—'} cm
                </span>
              </div>
            </div>

            {/* Fit Summary */}
            <div className="mt-6 p-3 rounded-lg border border-neon-cyan/20 bg-neon-cyan/5">
              <p className="font-orbitron text-xs text-neon-cyan mb-1">FIT ANALYSIS</p>
              <p className="font-space text-[11px] text-chrome-400 leading-relaxed">
                {measurements.height && selectedProduct
                  ? `Garment calibrated for ${measurements.height}cm frame with ${measurements.waist}cm waist. Style profile: ${(selectedProduct.style || 'custom').toUpperCase()}.`
                  : 'Enter biometric data in your profile to receive fit analysis.'}
              </p>
            </div>

            {/* Recalibrate Button */}
            <button
              onClick={() => navigate('/profile')}
              className="w-full mt-4 py-2.5 rounded-lg border border-chrome-600 text-chrome-400
                         hover:border-neon-purple hover:text-neon-purple hover:bg-neon-purple/5
                         transition-all duration-300 font-space text-xs uppercase tracking-wider"
            >
              Recalibrate Biometrics
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
