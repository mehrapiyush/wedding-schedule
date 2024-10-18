const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mailjet = require('node-mailjet');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5001;

// Middleware
// Only enable CORS in development if needed (when React is served on a different port)
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
}
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'build')));

// Create Mailjet client using environment variables
const mailJetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_API_SECRET
);

// POST route to send emails
app.post('/send-greeting', async (req, res) => {
    const { name, greeting } = req.body;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                padding: 20px;
                max-width: 600px;
                margin: auto;
            }
            h1 {
                color: #333;
            }
            p {
                font-size: 16px;
                color: #555;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello Piyush and Tanvi,</h1>
            <p>You have received a new greeting:</p>
            <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #666;">
                "${greeting}"
            </blockquote>
            <p>Wishing you all the best!</p>
            <div class="footer">— Your Friendly Team</div>
        </div>
    </body>
    </html>
    `;

    const messageData = {
        Messages: [
            {
                From: {
                    Email: 'mehrapiyush1271@gmail.com', // Sender's email
                    Name: name, // Sender's name
                },
                To: [
                    {
                        Email: 'piyushmehradtu@gmail.com', // First recipient
                        Name: "Piyush and Tanvi",
                    },
                    {
                        Email: 'seth.tnv@gmail.com', // Second recipient
                        Name: "Seth",
                    },
                ],
                Subject: `Greeting from ${name}`, // Subject line
                TextPart: `You have received a new greeting from ${name}:\n\n"${greeting}"`,
                HTMLPart: htmlContent
            },
        ],
    };

    try {
        const result = await mailJetClient.post('send', { version: 'v3.1' }).request(messageData);
        console.log('Email sent successfully:', result.body);
        res.status(200).json({ message: 'Greeting sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send greeting' });
    }
});


// Serve React app (build files)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
