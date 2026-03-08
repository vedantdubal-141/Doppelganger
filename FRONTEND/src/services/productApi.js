import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hardcoded fallback so the frontend works even when the backend is offline.
 * Fields match the backend DB schema (image_url, popularity_score, color, category)
 * plus fallback `image` field for backward compatibility.
 */
const FALLBACK_PRODUCTS = [
    { _id: 'fallback_1', id: 1, name: 'Streetwear Jacket', category: 'outerwear', style: 'streetwear', image_url: '/images/jacket.jpg', tags: ['streetwear', 'urban', 'outerwear'], aesthetic_vector: [0.8, 0.2, 0.1, 0.5], popularity_score: 8 },
    { _id: 'fallback_2', id: 2, name: 'Casual Hoodie', category: 'outerwear', style: 'casual', image_url: '/images/hoodie.jpg', tags: ['casual', 'comfortable', 'hoodie'], aesthetic_vector: [0.3, 0.4, 0.2, 0.1], popularity_score: 6 },
    { _id: 'fallback_3', id: 3, name: 'Formal Blazer', category: 'outerwear', style: 'formal', image_url: '/images/blazer.jpg', tags: ['formal', 'classic', 'office'], aesthetic_vector: [0.1, 0.9, 0.2, 0.3], popularity_score: 9 },
    { _id: 'fallback_4', id: 4, name: 'Sportswear Track Pants', category: 'pants', style: 'sportswear', image_url: '/images/track_pants.jpg', tags: ['sport', 'active', 'pants'], aesthetic_vector: [0.2, 0.1, 0.7, 0.6], popularity_score: 7 },
    { _id: 'fallback_5', id: 5, name: 'Vintage Denim', category: 'pants', style: 'vintage', image_url: '/images/denim.jpg', tags: ['vintage', 'denim', 'classic'], aesthetic_vector: [0.4, 0.5, 0.3, 0.8], popularity_score: 8 },
    { _id: 'fallback_6', id: 6, name: 'Summer Shorts', category: 'pants', style: 'summer', image_url: '/images/shorts.jpg', tags: ['summer', 'beach', 'casual'], aesthetic_vector: [0.1, 0.2, 0.5, 0.4], popularity_score: 5 },
    { _id: 'fallback_7', id: 7, name: 'Elegant Evening Gown', category: 'dress', style: 'formal', image_url: '/images/gown.jpg', tags: ['elegant', 'formal', 'night'], aesthetic_vector: [0.05, 0.95, 0.1, 0.2], popularity_score: 10 },
    { _id: 'fallback_8', id: 8, name: 'Retro Sunglasses', category: 'accessory', style: 'vintage', image_url: '/images/sunglasses.jpg', tags: ['retro', 'vintage', 'summer'], aesthetic_vector: [0.5, 0.3, 0.2, 0.7], popularity_score: 7 },
    { _id: 'fallback_9', id: 9, name: 'Active Sneakers', category: 'footwear', style: 'sportswear', image_url: '/images/sneakers.jpg', tags: ['sport', 'active', 'footwear'], aesthetic_vector: [0.2, 0.1, 0.9, 0.5], popularity_score: 9 },
    { _id: 'fallback_10', id: 10, name: 'Denim Jacket', category: 'outerwear', style: 'casual', image_url: '/images/denim_jacket.jpg', tags: ['denim', 'casual', 'classic'], aesthetic_vector: [0.4, 0.4, 0.3, 0.5], popularity_score: 8 },
    { _id: 'fallback_11', id: 11, name: 'Graphic Tee', category: 'shirt', style: 'streetwear', image_url: '/images/graphic_tee.jpg', tags: ['graphic', 'streetwear', 'urban'], aesthetic_vector: [0.7, 0.2, 0.2, 0.6], popularity_score: 9 },
    { _id: 'fallback_12', id: 12, name: 'Beach Shirt', category: 'shirt', style: 'summer', image_url: '/images/beach_shirt.jpg', tags: ['summer', 'beach', 'casual'], aesthetic_vector: [0.2, 0.3, 0.6, 0.4], popularity_score: 6 },
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
    return products.find((p) => String(p._id) === String(productId) || String(p.id) === String(productId)) || null;
}

export default { getProducts, getProductById };
