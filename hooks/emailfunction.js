const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendMail = (user) => {

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verfication</title>
        <style>
            /* Styles for the buttons */
            .button-container {
                margin-top: 20px;
                display: flex;
                justify-content: center;
            }
            .button {
                padding: 10px 20px;
                margin: 0 10px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                text-transform: uppercase;
                transition: background-color 0.3s ease;
            }
            .button.accept {
                background-color: #4CAF50;
                color: white;
            }
            .button.accept:hover {
                background-color: #45a049;
            }
            .button.decline {
                background-color: #f44336;
                color: white;
            }
            .button.decline:hover {
                background-color: #d32f2f;
            }
        </style>
    </head>
    <body style="font-family: Arial, sans-serif;">

        <h2>PASSWORD RESET</h2>

        <p>Hello,</p>

        

        <p>Please click the link below to reset your password</p>

    

        <p>Thank you.</p>

        <p>Sincerely,<br>
        StreamVibe</p>

    </body>
    </html>
    `;

    const main = async () => {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            service: 'gmail',
            port: 465,
            secure: true,
            // logger: true,
            // debug: true,
            auth: {
                user: 'maameyaahenewaa2001@gmail.com',
                pass: process.env.PASS,
            },
            tls: {
                rejectUnauthorized: true
            }
        });


        // Define the email content
        const mailOptions = {
            from: '"StreamVibe" <maameyaahenewaa2001@gmail.com>',
            to: user.email,
            subject: 'Email Verification',
            html: html,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    }

    main()
}






module.exports= sendMail;
