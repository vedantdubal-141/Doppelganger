import React, { useState, useEffect, useCallback, Component } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, AlertTriangle, Sparkles, TrendingUp, Palette, ChevronRight, Ruler, RotateCcw, ChevronDown } from 'lucide-react';
import Scene from '../components/3d/Scene';
import Avatar from '../components/3d/Avatar';
import ClothingMesh from '../components/3d/ClothingMesh';
import { getProducts } from '../services/productApi';

/* ─── Style → Color mapping for the mannequin ─── */
const STYLE_COLORS = {
    streetwear: '#FF2EA6',
    casual: '#2D8CFF',
    formal: '#7B61FF',
    sportswear: '#00F0FF',
    vintage: '#E8A838',
    summer: '#44D7B6',
};

/* ─── ErrorBoundary for the 3D canvas ─── */
class CanvasErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('3D Canvas crashed:', error, info);
    }

    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

/* ─── Analytics mock values ─── */
function getAnalytics(product) {
    if (!product) return { match: 0, trend: 0, colorCompat: 0 };
    const seed = product.id * 7;
    return {
        match: 60 + (seed % 35),
        trend: 50 + ((seed * 3) % 45),
        colorCompat: 55 + ((seed * 5) % 40),
    };
}

/* ─── Animated stat bar ─── */
function StatBar({ label, value, icon: Icon, color }) {
    return (
        <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 text-sm font-space text-chrome-300 uppercase tracking-wider">
                    <Icon size={14} className="opacity-70" />
                    {label}
                </span>
                <span className="text-sm font-orbitron" style={{ color }}>{value}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-background-primary overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

/* ─── Default body measurements (cm) ─── */
const DEFAULT_MEASUREMENTS = {
    height: 175,
    chest: 96,
    waist: 82,
    hips: 96,
    shoulders: 46,
    armLength: 60,
    legLength: 80,
};

const MEASUREMENT_CONFIG = [
    { key: 'height', label: 'Height', min: 140, max: 210, unit: 'cm', color: '#00F0FF' },
    { key: 'chest', label: 'Chest', min: 70, max: 130, unit: 'cm', color: '#7B61FF' },
    { key: 'waist', label: 'Waist', min: 55, max: 120, unit: 'cm', color: '#FF2EA6' },
    { key: 'hips', label: 'Hips', min: 70, max: 130, unit: 'cm', color: '#2D8CFF' },
    { key: 'shoulders', label: 'Shoulders', min: 34, max: 58, unit: 'cm', color: '#44D7B6' },
    { key: 'armLength', label: 'Arm Length', min: 45, max: 80, unit: 'cm', color: '#E8A838' },
    { key: 'legLength', label: 'Leg Length', min: 60, max: 100, unit: 'cm', color: '#00F0FF' },
];

/* ─── Measurement slider component ─── */
function MeasurementSlider({ label, value, min, max, unit, color, onChange }) {
    const pct = ((value - min) / (max - min)) * 100;
    return (
        <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-space text-chrome-400 uppercase tracking-wider">{label}</span>
                <span className="text-[11px] font-orbitron" style={{ color }}>{value}{unit}</span>
            </div>
            <div className="relative w-full h-6 flex items-center">
                <div className="absolute w-full h-1.5 rounded-full bg-background-primary">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, opacity: 0.6 }} />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute w-full h-6 opacity-0 cursor-pointer"
                    style={{ zIndex: 2 }}
                />
                <div
                    className="absolute w-3.5 h-3.5 rounded-full border-2 pointer-events-none"
                    style={{
                        left: `calc(${pct}% - 7px)`,
                        borderColor: color,
                        background: '#121218',
                        boxShadow: `0 0 6px ${color}88`,
                    }}
                />
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   VirtualTryOn — The Smart Mirror Page
   ════════════════════════════════════════════════════════════ */
function VirtualTryOn() {
    const [searchParams] = useSearchParams();
    const initialProductId = searchParams.get('productId');

    const [products, setProducts] = useState([]);
    const [activeProduct, setActiveProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [canvasError, setCanvasError] = useState(false);
    const [measurements, setMeasurements] = useState({ ...DEFAULT_MEASUREMENTS });
    const [showMeasurements, setShowMeasurements] = useState(true);

    const updateMeasurement = (key, value) => {
        setMeasurements((prev) => ({ ...prev, [key]: value }));
    };
    const resetMeasurements = () => setMeasurements({ ...DEFAULT_MEASUREMENTS });

    /* Fetch catalog on mount */
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const data = await getProducts();
            if (cancelled) return;
            setProducts(data);

            /* Pre-select from URL param */
            if (initialProductId) {
                const found = data.find((p) => String(p.id) === String(initialProductId));
                setActiveProduct(found || data[0] || null);
            } else {
                setActiveProduct(data[0] || null);
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [initialProductId]);

    const clothingColor = activeProduct
        ? STYLE_COLORS[activeProduct.style] || '#00F0FF'
        : '#00F0FF';

    const analytics = getAnalytics(activeProduct);

    /* ── 2D fallback UI ── */
    const fallbackUI = (
        <div className="flex flex-col items-center justify-center h-full glass-panel p-8 text-center gap-4">
            <AlertTriangle size={48} className="text-neon-pink animate-pulse" />
            <h3 className="text-xl font-orbitron text-chrome-100">3D ENGINE UNAVAILABLE</h3>
            <p className="text-chrome-500 font-inter text-sm max-w-xs">
                WebGL could not initialize. Showing 2D preview instead.
            </p>
            {activeProduct && (
                <div className="glass-panel p-6 mt-4 glass-card-hover">
                    <div className="w-40 h-40 mx-auto rounded-lg flex items-center justify-center mb-3"
                        style={{ background: `linear-gradient(135deg, ${clothingColor}33, ${clothingColor}11)`, border: `1px solid ${clothingColor}55` }}>
                        <span className="font-orbitron text-3xl" style={{ color: clothingColor }}>
                            {activeProduct.name.charAt(0)}
                        </span>
                    </div>
                    <p className="font-space text-chrome-100 text-lg">{activeProduct.name}</p>
                    <p className="text-chrome-500 text-sm uppercase tracking-wider">{activeProduct.style}</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-background-primary p-4 md:p-6 lg:p-8">
            {/* ── Header ── */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-3xl md:text-5xl font-orbitron font-bold neon-text-primary mb-2 tracking-wider">
                    VIRTUAL TRY-ON
                </h1>
                <p className="text-chrome-500 font-space text-sm md:text-base tracking-widest uppercase">
                    Smart Mirror — Interactive 3D Preview
                </p>
            </motion.div>

            {/* ── Main grid: Sidebar | 3D Canvas | Analytics ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_260px] gap-4 lg:gap-6 max-w-[1440px] mx-auto">

                {/* ━━━ LEFT SIDEBAR — Clothing list ━━━ */}
                <motion.aside
                    className="glass-panel p-4 overflow-y-auto max-h-[75vh] lg:max-h-[calc(100vh-220px)] order-2 lg:order-1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="font-orbitron text-sm text-neon-cyan tracking-widest mb-4 uppercase flex items-center gap-2">
                        <Palette size={14} /> Wardrobe
                    </h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 rounded-lg bg-background-secondary animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {products.map((product) => {
                                const isActive = activeProduct?.id === product.id;
                                const pColor = STYLE_COLORS[product.style] || '#00F0FF';
                                return (
                                    <motion.button
                                        key={product.id}
                                        onClick={() => setActiveProduct(product)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-300 border ${isActive
                                            ? 'bg-background-secondary border-neon-cyan shadow-neon-cyan'
                                            : 'border-transparent hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.03)]'
                                            }`}
                                    >
                                        {/* Color swatch */}
                                        <div
                                            className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-orbitron"
                                            style={{
                                                background: `linear-gradient(135deg, ${pColor}44, ${pColor}11)`,
                                                border: `1px solid ${pColor}66`,
                                                color: pColor,
                                            }}
                                        >
                                            {product.id}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-space text-sm truncate ${isActive ? 'text-chrome-100' : 'text-chrome-300'}`}>
                                                {product.name}
                                            </p>
                                            <p className="text-[11px] uppercase tracking-wider text-chrome-600">{product.style}</p>
                                        </div>
                                        {isActive && <ChevronRight size={14} className="ml-auto text-neon-cyan flex-shrink-0" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Body Measurements ── */}
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <button
                            onClick={() => setShowMeasurements((v) => !v)}
                            className="w-full flex items-center justify-between mb-3"
                        >
                            <h2 className="font-orbitron text-sm text-neon-pink tracking-widest uppercase flex items-center gap-2">
                                <Ruler size={14} /> Body Scan
                            </h2>
                            <ChevronDown
                                size={14}
                                className="text-chrome-500 transition-transform duration-300"
                                style={{ transform: showMeasurements ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            />
                        </button>

                        {showMeasurements && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {MEASUREMENT_CONFIG.map((cfg) => (
                                    <MeasurementSlider
                                        key={cfg.key}
                                        label={cfg.label}
                                        value={measurements[cfg.key]}
                                        min={cfg.min}
                                        max={cfg.max}
                                        unit={cfg.unit}
                                        color={cfg.color}
                                        onChange={(v) => updateMeasurement(cfg.key, v)}
                                    />
                                ))}
                                <button
                                    onClick={resetMeasurements}
                                    className="mt-2 w-full flex items-center justify-center gap-2 text-[11px] font-space uppercase tracking-wider text-chrome-500 hover:text-neon-cyan transition-colors duration-200 py-1.5"
                                >
                                    <RotateCcw size={12} /> Reset to Default
                                </button>
                            </motion.div>
                        )}
                    </div>
                </motion.aside>

                {/* ━━━ CENTER — 3D Canvas ━━━ */}
                <motion.div
                    className="glass-panel overflow-hidden relative order-1 lg:order-2"
                    style={{ minHeight: '420px' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Active product badge */}
                    <AnimatePresence>
                        {activeProduct && (
                            <motion.div
                                key={activeProduct.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-4 left-4 z-10 glass-panel px-4 py-2 flex items-center gap-2"
                            >
                                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: clothingColor }} />
                                <span className="font-space text-sm text-chrome-200">{activeProduct.name}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Orbit hint */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 text-chrome-600 text-xs font-inter">
                        <RotateCw size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
                        Drag to orbit
                    </div>

                    {/* 3D or fallback */}
                    {canvasError ? (
                        fallbackUI
                    ) : (
                        <CanvasErrorBoundary fallback={fallbackUI}>
                            <Scene>
                                <Avatar clothingColor={clothingColor} measurements={measurements} />
                                <ClothingMesh
                                    style={activeProduct?.style}
                                    color={clothingColor}
                                    visible={!!activeProduct}
                                />
                            </Scene>
                        </CanvasErrorBoundary>
                    )}
                </motion.div>

                {/* ━━━ RIGHT SIDEBAR — Style Analytics ━━━ */}
                <motion.aside
                    className="glass-panel p-5 order-3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className="font-orbitron text-sm text-neon-purple tracking-widest mb-6 uppercase flex items-center gap-2">
                        <Sparkles size={14} /> Style Analytics
                    </h2>

                    <StatBar label="Style Match" value={analytics.match} icon={Sparkles} color="#00F0FF" />
                    <StatBar label="Trend Score" value={analytics.trend} icon={TrendingUp} color="#7B61FF" />
                    <StatBar label="Color Compatibility" value={analytics.colorCompat} icon={Palette} color="#FF2EA6" />

                    {/* Active product detail */}
                    {activeProduct && (
                        <motion.div
                            key={activeProduct.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.08)]"
                        >
                            <p className="text-[11px] uppercase tracking-widest text-chrome-600 mb-2 font-space">Active Item</p>
                            <p className="font-space text-chrome-100 text-lg">{activeProduct.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className="inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-orbitron"
                                    style={{
                                        background: `${clothingColor}22`,
                                        border: `1px solid ${clothingColor}44`,
                                        color: clothingColor,
                                    }}
                                >
                                    {activeProduct.style}
                                </span>
                                <span className="text-chrome-600 text-xs font-inter">
                                    Pop. {activeProduct.popularity}/10
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* Toggle 3D / 2D */}
                    <button
                        onClick={() => setCanvasError((prev) => !prev)}
                        className="mt-6 w-full chrome-button text-xs"
                    >
                        {canvasError ? 'ENABLE 3D' : 'SWITCH TO 2D'}
                    </button>
                </motion.aside>
            </div>
        </div>
    );
}

export default VirtualTryOn;
