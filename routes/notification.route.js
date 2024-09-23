const notificationController = require('../controllers/notification.controller')
module.exports = (app) => {

    app.post('/notification',notificationController.createNotification);
    app.get('/getNotifications',notificationController.getNotifications);
    app.delete('/deleteNotification/:id',notificationController.deleteNotification);
    app.get('/getNotificationId/:id',notificationController.getNotificationId);
    app.delete('/deleteAllNotifications',notificationController.deleteAllNotifications)

}