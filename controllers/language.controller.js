const Language = require('../models/language.model');

// Function to create a new language
const createLanguage = async function (req, res) {
    try {
        let obj = {
            language: req.body.language ? req.body.language : undefined
        }

        if (!obj.language) {
            return res.status(400).json({ error_code: 400,message: "Language name is required" });
        }
        const language = await Language.create({ name: obj.language });

        res.status(200).json({  error_code: 200,message: "Language created successfully", language });
    } catch (error) {
        console.error('Error creating language:', error);
        res.status(500).json({ error_code: 500,message: 'Failed to create language' });
    }
};

const updateLanguage = async function (req, res) {
    try {
        const languageId = req.params.id;
        const { name } = req.body;

        // Check if languageId is provided
        if (!languageId) {
            return res.status(400).json({ error_code: 400,error: "Language ID is required" });
        }

        // Find the language by ID and update its name
        const language = await Language.findByIdAndUpdate(languageId, { name }, { new: true });

        if (!language) {
            return res.status(404).json({ error_code: 404,message: "Language not found" });
        }

        res.status(200).json({ error_code: 200,message: "Language updated successfully", language });
    } catch (error) {
        console.error('Error updating language:', error);
        res.status(500).json({ error: 'Failed to update language' });
    }
};

const deleteLanguage = async function (req, res) {
    try {
        const languageId = req.params.id;

        if (!languageId) {
            return res.status(400).json({ error_code: 400,message: "Language ID is required" });
        }
        const language = await Language.findByIdAndDelete(languageId);

        if (!language) {
            return res.status(404).json({error_code: 404, message: "Language not found" });
        }

        res.json({ message: "Language deleted successfully" });
    } catch (error) {
        console.error('Error deleting language:', error);
        res.status(500).json({ error_code: 500,message: 'Failed to delete language' });
    }
};

const getLanguage = async function (req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const searchQuery = req.query.search || '';


        const languages = await Language.find({
            name: { $regex: searchQuery, $options: 'i' }
        })
        .skip(skip)
        .limit(limit);

        const totalCount = await Language.countDocuments({
            name: { $regex: searchQuery, $options: 'i' }
        });

        res.json({
            error_code: 200,
            message: 'Languages retrieved successfully',
            languages,
            total_count: totalCount,
            page,
            limit
        });
    } catch (error) {
        console.error('Error getting languages:', error);
        res.status(500).json({ error_code: 500,message: 'Failed to get languages' });
    }
};

const changeLanguageStatus = async function (req, res) {
    try {
        const { id } = req.params;
        const languageData = await Language.findById(id);
        if (!languageData) {
            return res.status(400).send({
                error_code: 400,
                message: 'Ads not found'
            });
        }

        languageData.status = languageData.status === 'activate' ? 'deactivate' : 'activate';

        await languageData.save();
        res.status(200).send({
            error_code: 200,
            message: `ads status toggled successfully to ${languageData.status}`,
            user: languageData
        });
    } catch (err) {
        console.error('Error inside update admin', err);
        res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};

//get alllanguage without pegination

const getAllLanguage = async function (req, res) {
    try {
        const languages = await Language.find();
        res.json({
            error_code: 200,
            message: 'Languages retrieved successfully',
            languages
        });
    } catch (error) {
        console.error('Error getting languages:', error);
        res.status(500).json({ error_code: 500,message: 'Failed to get languages' });
    }
};

module.exports = {
    createLanguage,
    updateLanguage,
    deleteLanguage,
    changeLanguageStatus,
    getLanguage,
    getAllLanguage
};
