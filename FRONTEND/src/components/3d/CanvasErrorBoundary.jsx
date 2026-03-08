import React from 'react';
import { Shirt, RotateCcw, AlertTriangle } from 'lucide-react';

/**
 * CanvasErrorBoundary — React class component that catches
 * WebGL / R3F rendering errors and displays a styled 2D fallback
 * showing the product image instead of a broken 3D canvas.
 */
class CanvasErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('CanvasErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            const { productImage, productName } = this.props;

            return (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8"
                    style={{ background: 'linear-gradient(135deg, rgba(11,11,15,0.95), rgba(18,18,24,0.95))' }}>
                    {/* Warning Header */}
                    <div className="flex items-center gap-3 text-neon-pink">
                        <AlertTriangle className="w-6 h-6" />
                        <span className="font-orbitron text-sm tracking-wider">3D ENGINE UNAVAILABLE</span>
                    </div>

                    {/* 2D Product Image Fallback */}
                    <div className="relative w-72 h-96 rounded-xl overflow-hidden border border-chrome-600
                          shadow-[0_0_30px_rgba(123,97,255,0.2)]">
                        {productImage && !productImage.includes('placeholder') ? (
                            <img
                                src={productImage}
                                alt={productName || 'Product'}
                                className="w-full h-full object-cover object-top"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-background-secondary">
                                <Shirt className="w-24 h-24 text-chrome-600 opacity-50" />
                            </div>
                        )}

                        {/* Scan-line overlay for style */}
                        <div className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.03) 2px, rgba(0,240,255,0.03) 4px)',
                            }} />
                    </div>

                    <p className="font-space text-chrome-400 text-sm text-center max-w-xs">
                        WebGL could not initialize. Displaying 2D preview instead.
                    </p>

                    <button
                        onClick={this.handleRetry}
                        className="chrome-button flex items-center gap-2 px-6 py-3 text-sm"
                    >
                        <RotateCcw className="w-4 h-4" />
                        RETRY 3D ENGINE
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default CanvasErrorBoundary;
