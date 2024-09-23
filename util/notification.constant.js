const nodemailer = require('nodemailer');

module.exports = {
    sendTo : {
        toAll : 'toAll',
        specific : 'specific',
        host : 'host'
    },
    notificationType : {
        email : 'email',
        sms : 'sms',
        push : 'push'
    },
    emailSender  : (userEmail,body) => {
        console.log('mail sender')
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: 'checkdemo02@gmail.com',
              pass: 'vqdoqmekygtousli'
            }
          });
          const mailOptions = {
            from: 'checkdemo02@gmail.com',
            to: userEmail,
            subject: body.Title,
            text: body.message
          };
          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
            }
          });
    }
}