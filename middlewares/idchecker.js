const mongoose = require('mongoose')

const idCheck = async (req, res, next) => {
    try {
        console.log(req.params);
        if (!req.params.id) {
            return res.status(400).json({
                message: 'ID not present'
            });
        }

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Not a valid ID'
            });
        }

        next();
    } catch (err) {
        console.error('Error inside idCheck middleware:', err);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};


module.exports = {
    idCheck
}