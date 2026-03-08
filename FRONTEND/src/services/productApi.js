import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hardcoded fallback so the frontend works even when the backend is offline.
 * Fields match the backend DB schema (image_url, popularity_score, color, category)
 * plus fallback `image` field for backward compatibility.
 */
const FALLBACK_PRODUCTS = [
    { id: 1, name: 'Streetwear Jacket', style: 'streetwear', category: 'jacket', color: '#FF6B35', image: '/images/jacket.jpg', image_url: null, popularity: 8, popularity_score: 8 },
    { id: 2, name: 'Casual Hoodie', style: 'casual', category: 'hoodie', color: '#4ECDC4', image: '/images/hoodie.jpg', image_url: null, popularity: 6, popularity_score: 6 },
    { id: 3, name: 'Formal Blazer', style: 'formal', category: 'blazer', color: '#2D3436', image: '/images/blazer.jpg', image_url: null, popularity: 9, popularity_score: 9 },
    { id: 4, name: 'Sportswear Track Pants', style: 'sportswear', category: 'pants', color: '#6C5CE7', image: '/images/track_pants.jpg', image_url: null, popularity: 7, popularity_score: 7 },
    { id: 5, name: 'Vintage Denim', style: 'vintage', category: 'jeans', color: '#FDCB6E', image: '/images/denim.jpg', image_url: null, popularity: 8, popularity_score: 8 },
    { id: 6, name: 'Summer Shorts', style: 'summer', category: 'shorts', color: '#E17055', image: '/images/shorts.jpg', image_url: null, popularity: 5, popularity_score: 5 },
    { id: 7, name: 'Elegant Evening Gown', style: 'formal', category: 'dress', color: '#636E72', image: '/images/gown.jpg', image_url: null, popularity: 10, popularity_score: 10 },
    { id: 8, name: 'Retro Sunglasses', style: 'vintage', category: 'accessory', color: '#E8A87C', image: '/images/sunglasses.jpg', image_url: null, popularity: 7, popularity_score: 7 },
    { id: 9, name: 'Active Sneakers', style: 'sportswear', category: 'shoes', color: '#A29BFE', image: '/images/sneakers.jpg', image_url: null, popularity: 9, popularity_score: 9 },
    { id: 10, name: 'Denim Jacket', style: 'casual', category: 'jacket', color: '#74B9FF', image: '/images/denim_jacket.jpg', image_url: null, popularity: 8, popularity_score: 8 },
    { id: 11, name: 'Graphic Tee', style: 'streetwear', category: 'tshirt', color: '#FD79A8', image: '/images/graphic_tee.jpg', image_url: null, popularity: 9, popularity_score: 9 },
    { id: 12, name: 'Beach Shirt', style: 'summer', category: 'shirt', color: '#55EFC4', image: '/images/beach_shirt.jpg', image_url: null, popularity: 6, popularity_score: 6 },
];

/**
 * Fetch the full product catalog.
 * Falls back to hardcoded data on failure.
 */
export async function getProducts() {
    try {
        const { data } = await axios.get(`${API_BASE}/api/products`);
        return data;
    } catch (err) {
        console.warn('productApi — backend unreachable, using fallback data', err.message);
        return FALLBACK_PRODUCTS;
    }
}

/**
 * Fetch a single product by ID.
 * Looks through the full catalog (API or fallback).
 */
export async function getProductById(productId) {
    const products = await getProducts();
    return products.find((p) => String(p.id) === String(productId)) || null;
}

export default { getProducts, getProductById };
