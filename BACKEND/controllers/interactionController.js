const Interaction = require('../models/interactionModel');

const logInteraction = async (req, res, next) => {
    try {
        const { user_id, product_id, liked, viewed, purchased } = req.body;

        if (!user_id || !product_id) {
            res.status(400);
            throw new Error('user_id and product_id are required');
        }

        const interactionId = await Interaction.log({
            user_id,
            product_id,
            liked,
            viewed,
            purchased
        });

        res.status(201).json({
            message: 'Interaction logged successfully',
            interactionId
        });
    } catch (error) {
        next(error);
    }
};

const getUserHistory = async (req, res, next) => {
    try {
        const history = await Interaction.getUserHistory(req.params.userId);
        res.status(200).json(history);
    } catch (error) {
        next(error);
    }
};

module.exports = { logInteraction, getUserHistory };
