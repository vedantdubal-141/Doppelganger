import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hardcoded fallback so the frontend works even when the backend is offline.
 * Fields match the backend DB schema (image_url, popularity_score, color, category)
 * plus `modelType` to control which 3D clothing model renders.
 *
 * modelType values:
 *   'shirt_glb'          — uses the real shirt_baked.glb mesh
 *   'procedural_jacket'  — shirt_glb scaled larger + collar/pocket details
 *   'procedural_hoodie'  — shirt_glb + hood geometry
 *   'procedural_pants'   — tapered leg cylinders
 *   'procedural_shorts'  — shorter leg cylinders
 *   'procedural_sneakers'— rounded shoe shapes
 *   'procedural_boots'   — taller boot shapes
 *   'procedural_dress'   — extended torso flowing to knees
 *   'procedural_accessory'— sunglasses / visor
 */
const FALLBACK_PRODUCTS = [
    // ── OUTERWEAR ──
    {
        _id: 'fallback_1', id: 1,
        name: 'Streetwear Jacket',
        category: 'outerwear', style: 'streetwear',
        modelType: 'procedural_jacket',
        color: '#FF6B35',
        price: 89.99,
        description: 'Bold urban jacket with tech-inspired details.',
        image_url: '/images/jacket.jpg',
        tags: ['streetwear', 'urban', 'outerwear'],
        aesthetic_vector: [0.8, 0.2, 0.1, 0.5],
        popularity_score: 8,
    },
    {
        _id: 'fallback_2', id: 2,
        name: 'Casual Hoodie',
        category: 'outerwear', style: 'casual',
        modelType: 'procedural_hoodie',
        color: '#4ECDC4',
        price: 64.99,
        description: 'Relaxed-fit hoodie for everyday comfort.',
        image_url: '/images/hoodie.jpg',
        tags: ['casual', 'comfortable', 'hoodie'],
        aesthetic_vector: [0.3, 0.4, 0.2, 0.1],
        popularity_score: 6,
    },
    {
        _id: 'fallback_3', id: 3,
        name: 'Formal Blazer',
        category: 'outerwear', style: 'formal',
        modelType: 'procedural_jacket',
        color: '#2D3436',
        price: 149.99,
        description: 'Tailored blazer for sharp professional looks.',
        image_url: '/images/blazer.jpg',
        tags: ['formal', 'classic', 'office'],
        aesthetic_vector: [0.1, 0.9, 0.2, 0.3],
        popularity_score: 9,
    },
    {
        _id: 'fallback_10', id: 10,
        name: 'Denim Jacket',
        category: 'outerwear', style: 'casual',
        modelType: 'procedural_jacket',
        color: '#5B7DB1',
        price: 79.99,
        description: 'Classic washed denim for layered casual fits.',
        image_url: '/images/denim_jacket.jpg',
        tags: ['denim', 'casual', 'classic'],
        aesthetic_vector: [0.4, 0.4, 0.3, 0.5],
        popularity_score: 8,
    },

    // ── SHIRTS ──
    {
        _id: 'fallback_11', id: 11,
        name: 'Graphic Tee',
        category: 'shirt', style: 'streetwear',
        modelType: 'shirt_glb',
        color: '#E84393',
        price: 34.99,
        description: 'Statement graphic tee with bold prints.',
        image_url: '/images/graphic_tee.jpg',
        tags: ['graphic', 'streetwear', 'urban'],
        aesthetic_vector: [0.7, 0.2, 0.2, 0.6],
        popularity_score: 9,
    },
    {
        _id: 'fallback_12', id: 12,
        name: 'Beach Shirt',
        category: 'shirt', style: 'summer',
        modelType: 'shirt_glb',
        color: '#E17055',
        price: 29.99,
        description: 'Lightweight linen shirt for warm days.',
        image_url: '/images/beach_shirt.jpg',
        tags: ['summer', 'beach', 'casual'],
        aesthetic_vector: [0.2, 0.3, 0.6, 0.4],
        popularity_score: 6,
    },
    {
        _id: 'fallback_13', id: 13,
        name: 'Oxford Button-Down',
        category: 'shirt', style: 'formal',
        modelType: 'shirt_glb',
        color: '#DFE6E9',
        price: 54.99,
        description: 'Crisp cotton oxford for smart casual outfits.',
        image_url: '/images/oxford.jpg',
        tags: ['formal', 'office', 'classic'],
        aesthetic_vector: [0.1, 0.8, 0.1, 0.3],
        popularity_score: 7,
    },
    {
        _id: 'fallback_14', id: 14,
        name: 'Oversized Vintage Tee',
        category: 'shirt', style: 'vintage',
        modelType: 'shirt_glb',
        color: '#FDCB6E',
        price: 39.99,
        description: 'Washed-out oversized tee with retro vibes.',
        image_url: '/images/vintage_tee.jpg',
        tags: ['vintage', 'retro', 'oversized'],
        aesthetic_vector: [0.5, 0.3, 0.2, 0.7],
        popularity_score: 8,
    },

    // ── PANTS ──
    {
        _id: 'fallback_4', id: 4,
        name: 'Sportswear Track Pants',
        category: 'pants', style: 'sportswear',
        modelType: 'procedural_pants',
        color: '#6C5CE7',
        price: 49.99,
        description: 'Performance track pants with tapered fit.',
        image_url: '/images/track_pants.jpg',
        tags: ['sport', 'active', 'pants'],
        aesthetic_vector: [0.2, 0.1, 0.7, 0.6],
        popularity_score: 7,
    },
    {
        _id: 'fallback_5', id: 5,
        name: 'Vintage Denim',
        category: 'pants', style: 'vintage',
        modelType: 'procedural_pants',
        color: '#3D6CB9',
        price: 69.99,
        description: 'Stone-washed denim jeans with classic cut.',
        image_url: '/images/denim.jpg',
        tags: ['vintage', 'denim', 'classic'],
        aesthetic_vector: [0.4, 0.5, 0.3, 0.8],
        popularity_score: 8,
    },
    {
        _id: 'fallback_6', id: 6,
        name: 'Summer Shorts',
        category: 'pants', style: 'summer',
        modelType: 'procedural_shorts',
        color: '#00B894',
        price: 34.99,
        description: 'Lightweight chino shorts for hot weather.',
        image_url: '/images/shorts.jpg',
        tags: ['summer', 'beach', 'casual'],
        aesthetic_vector: [0.1, 0.2, 0.5, 0.4],
        popularity_score: 5,
    },
    {
        _id: 'fallback_15', id: 15,
        name: 'Cargo Joggers',
        category: 'pants', style: 'streetwear',
        modelType: 'procedural_pants',
        color: '#636E72',
        price: 59.99,
        description: 'Utility cargo joggers with zippered pockets.',
        image_url: '/images/cargo_joggers.jpg',
        tags: ['streetwear', 'utility', 'cargo'],
        aesthetic_vector: [0.6, 0.2, 0.4, 0.5],
        popularity_score: 7,
    },

    // ── FOOTWEAR ──
    {
        _id: 'fallback_9', id: 9,
        name: 'Active Sneakers',
        category: 'footwear', style: 'sportswear',
        modelType: 'procedural_sneakers',
        color: '#0984E3',
        price: 119.99,
        description: 'High-performance sneakers with cushioned sole.',
        image_url: '/images/sneakers.jpg',
        tags: ['sport', 'active', 'footwear'],
        aesthetic_vector: [0.2, 0.1, 0.9, 0.5],
        popularity_score: 9,
    },
    {
        _id: 'fallback_16', id: 16,
        name: 'Chelsea Boots',
        category: 'footwear', style: 'formal',
        modelType: 'procedural_boots',
        color: '#2D1B0E',
        price: 139.99,
        description: 'Sleek leather Chelsea boots for polished looks.',
        image_url: '/images/chelsea_boots.jpg',
        tags: ['formal', 'leather', 'boots'],
        aesthetic_vector: [0.1, 0.8, 0.2, 0.4],
        popularity_score: 8,
    },
    {
        _id: 'fallback_17', id: 17,
        name: 'Retro High-Tops',
        category: 'footwear', style: 'vintage',
        modelType: 'procedural_sneakers',
        color: '#D63031',
        price: 89.99,
        description: 'Classic high-top sneakers with vintage colorway.',
        image_url: '/images/high_tops.jpg',
        tags: ['retro', 'vintage', 'sneakers'],
        aesthetic_vector: [0.5, 0.3, 0.5, 0.7],
        popularity_score: 8,
    },

    // ── DRESS ──
    {
        _id: 'fallback_7', id: 7,
        name: 'Evening Gown',
        category: 'dress', style: 'formal',
        modelType: 'procedural_dress',
        color: '#6C5CE7',
        price: 199.99,
        description: 'Elegant floor-length gown for special occasions.',
        image_url: '/images/gown.jpg',
        tags: ['elegant', 'formal', 'night'],
        aesthetic_vector: [0.05, 0.95, 0.1, 0.2],
        popularity_score: 10,
    },

    // ── ACCESSORY ──
    {
        _id: 'fallback_8', id: 8,
        name: 'Retro Sunglasses',
        category: 'accessory', style: 'vintage',
        modelType: 'procedural_accessory',
        color: '#FDCB6E',
        price: 44.99,
        description: 'Round-frame sunglasses with UV protection.',
        image_url: '/images/sunglasses.jpg',
        tags: ['retro', 'vintage', 'summer'],
        aesthetic_vector: [0.5, 0.3, 0.2, 0.7],
        popularity_score: 7,
    },
    {
        _id: 'fallback_18', id: 18,
        name: 'Cyber Visor',
        category: 'accessory', style: 'streetwear',
        modelType: 'procedural_accessory',
        color: '#00F0FF',
        price: 59.99,
        description: 'Futuristic visor with reflective coating.',
        image_url: '/images/cyber_visor.jpg',
        tags: ['cyber', 'futuristic', 'streetwear'],
        aesthetic_vector: [0.8, 0.1, 0.3, 0.6],
        popularity_score: 7,
    },
];

/**
 * Fetch the full product catalog.
 * Falls back to hardcoded data on failure.
 */
export async function getProducts() {
    try {
        const { data } = await axios.get(`${API_BASE}/api/products`);
        // Ensure modelType exists even for server-returned products
        return data.map(p => ({
            ...p,
            modelType: p.modelType || guessModelType(p),
        }));
    } catch (err) {
        console.warn('productApi — backend unreachable, using fallback data', err.message);
        return FALLBACK_PRODUCTS;
    }
}

/**
 * Guess the modelType based on category/style when the backend doesn't provide one.
 */
function guessModelType(product) {
    const cat = (product.category || '').toLowerCase();
    const style = (product.style || '').toLowerCase();

    if (cat === 'shirt') return 'shirt_glb';
    if (cat === 'outerwear') {
        if (style === 'casual' && (product.name || '').toLowerCase().includes('hoodie')) return 'procedural_hoodie';
        return 'procedural_jacket';
    }
    if (cat === 'pants') {
        if (style === 'summer' || (product.name || '').toLowerCase().includes('short')) return 'procedural_shorts';
        return 'procedural_pants';
    }
    if (cat === 'footwear') {
        if ((product.name || '').toLowerCase().includes('boot')) return 'procedural_boots';
        return 'procedural_sneakers';
    }
    if (cat === 'dress') return 'procedural_dress';
    if (cat === 'accessory') return 'procedural_accessory';
    return 'shirt_glb';
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
