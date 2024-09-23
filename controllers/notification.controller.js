
const Notification = require('../models/notification.model');
const constant = require('../util/notification.constant');
const User = require('../models/user.model');
const userConst = require('../util/constant')


// const createNotification = async (req, res) => {
//     try {
//         const { sendTo, Type, Title, message, user } = req.body;

//         // Validate sendTo value
//         if (!sendTo || !['toAll', 'host', 'specific'].includes(sendTo)) {
//             return res.status(400).json({ error_code: 400, message: 'Invalid sendTo value' });
//         }

//         let recipients = [];

//         // Determine recipients based on sendTo value
//         if (sendTo === 'toAll') {
//             recipients = await User.find().distinct('_id');
//         } else if (sendTo === 'host') {
//             const host = await User.findOne({ role: 'host' });
//             if (host) recipients = [host._id];
//         } else if (sendTo === 'specific') {
//             recipients = await User.find({ role: 'specificRole' }).distinct('_id');
//         }
//         const newNotification = new Notification({
//             sendTo,
//             Type,
//             Title,
//             message,
//             user,
//             recipients
//         });
//         const savedNotification = await newNotification.save();

//         return res.status(201).json({
//             error_code: 200,
//             message: 'Notification created successfully',
//             notification: savedNotification
//         });
//     } catch (err) {
//         console.error('Error inside createNotification controller:', err);
//         return res.status(500).json({
//             error_code: 500,
//             message: 'Internal Server Error'
//         });
//     }
// };

const createNotification = async (req, res) => {
    try {
        const { sendTo, Type, Title, message, user } = req.body;

        if (!sendTo || !['toAll', 'host', 'specific'].includes(sendTo)) {
            return res.status(400).json({ error_code: 400, message: 'Invalid sendTo value' });
        }

        let recipients = [];
        if (sendTo === 'toAll') {
            recipients = await User.find().distinct('_id');
            await Promise.all(recipients.map(async (userId) => {
                const newNotification = new Notification({
                    sendTo,
                    Type,
                    Title,
                    message,
                    user: userId,
                });
                console.log("🚀 ~ awaitPromise.all ~ newNotification:", newNotification)
                await newNotification.save();
            }));
        } else if (sendTo === 'host') {
            const host = await User.findOne({ role: 'host' });
            if (host) recipients = [host._id];
        } else if (sendTo === 'specific') {
            recipients = await User.find({ role: 'specificRole' }).distinct('_id');
        }
        const newNotification = new Notification({
            sendTo,
            Type,
            Title,
            message,
            user,
            recipients
        });
                
        const savedNotification = await newNotification.save();

        return res.status(201).json({
            error_code: 200,
            message: 'Notification created successfully',
            notification: savedNotification
        });
    } catch (err) {
        console.error('Error inside createNotification controller:', err);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};




const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search || '';

        const totalCount = await Notification.countDocuments({
            Title: { $regex: searchQuery, $options: 'i' }
        });
        const notifications = await Notification.find({
            Title: { $regex: searchQuery, $options: 'i' }
        })
        .skip(skip)
        .limit(limit);

        res.status(200).json({
            error_code: 200,
            message: 'Notifications retrieved successfully',
            notifications,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalNotifications: totalCount
        });
    } catch (err) {
        console.error('Error inside getNotifications controller:', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};


const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        res.status(200).json({
            error_code: 200,
            message: 'Notification deleted successfully',
            notification
        });
    } catch (err) {
        console.error('Error inside deleteNotification controller:', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
}

const getNotificationId = async(req,res)=>{
    try{
            const { id } = req.params;
            const notification = await Notification.findById(id);
            console.log("🚀 ~ getNotificationId ~ notification:", notification)
            res.status(200).json({
                error_code: 200,
                message: 'Notification retrieved successfully',
                notification:notification.message
            });
        } catch (err) {
            console.error('Error inside getNotificationId controller:', err);
            res.status(500).json({
                error_code: 500,
                message: 'Internal Server Error'
            });
        }
}

//delete all notifications
const deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        res.status(200).json({
            error_code: 200,
            message: 'All notifications deleted successfully'
        });
    } catch (err) {
        console.error('Error inside deleteAllNotifications controller:', err);
        res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error'
        });
    }
};





module.exports = {
    createNotification,
    getNotifications,
    deleteNotification,getNotificationId,
    deleteAllNotifications


};
