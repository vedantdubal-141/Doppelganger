const db = require('../config/db');

const getProducts = async (req, res, next) => {
  try {
    const { style, category } = req.query;

    let queryStr = 'SELECT * FROM products';
    const queryParams = [];
    const conditions = [];

    if (style) {
      conditions.push('style = ?');
      queryParams.push(style);
    }

    if (category) {
      conditions.push('category = ?');
      queryParams.push(category);
    }

    if (conditions.length > 0) {
      queryStr += ' WHERE ' + conditions.join(' AND ');
    }

    const [products] = await db.query(queryStr, queryParams);

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts };
