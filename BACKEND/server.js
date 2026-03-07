const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

// Connect routes
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const userRoutes = require('./routes/userRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for images)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/recommend', recommendationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/interactions', interactionRoutes);

// Static files for 3D assets (PRD virtual try-on)
app.use('/assets', express.static('assets'));

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
