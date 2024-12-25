import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {initializeWeb3Client} from "./lib/web3-storage.js";

dotenv.config();

const app = express();
const upload = multer();

const allowedOrigins = process.env.CORS_ORIGINS.split(',');

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Initialize Web3.Storage client
let web3StorageClient = await initializeWeb3Client();

// Endpoints
app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK');
});
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        const file = new File([req.file.buffer], req.file.originalname, {
            type: req.file.mimetype,
        });

        const cid = await web3StorageClient.uploadFile(file);
        res.status(200).json({ cid: cid.toString() }); // Send the CID as a response
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Failed to upload file');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
