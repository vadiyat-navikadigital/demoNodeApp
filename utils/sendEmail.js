const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('SMTP connection failed:', error.message);
        } else {
            console.log('SMTP connection successful:', success);
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
    } catch (err) {
        console.error('Error while sending email:', err.message);
        throw new Error('Email sending failed');
    }
};

module.exports = sendEmail;


// const nodemailer = require('nodemailer');
// const sendEmail = async (options) => {
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'rylee.koelpin@ethereal.email',
//             pass: 'Hufkbb9WhpeaXNdHwr'
//         }
//     });
//     const mailOptions = {
//         // from: process.env.EMAIL_USER,
//         from: '"Ayush Maru" <rylee.koelpin@ethereal.email>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//     };
//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully!');
//     } catch (err) {
//         console.error('Error while sending email:', err.message);
//         throw new Error('Email sending failed');
//     }

// }
// module.exports = sendEmail;