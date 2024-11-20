import express from 'express';
import cors from 'cors'; // Import the cors middleware
import dotenv from 'dotenv';
import Openfort from '@openfort/openfort-node';

const app = express();
dotenv.config();

const PORT = process.env.PORT ?? 3000;


if (!process.env.OPENFORT_SECRET_KEY || !process.env.SHIELD_PUBLIC_KEY || !process.env.SHIELD_SECRET_KEY || !process.env.ENCRYPTION_SHARE) {
    throw new Error(
        `Unable to load the .env file. Please copy .env.example to .env and fill in the required environment variables.`
    );
}
const openfort = new Openfort(process.env.OPENFORT_SECRET_KEY);

// Use the cors middleware to disable CORS
app.use(cors());

app.get("/api/healthz", (req, res) => {
    res.send("OK");
});

app.post("/api/protected-create-encryption-session", async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).send({
                error: 'You must be signed in to view the protected content on this page.',
            });
        }
        await openfort.iam.verifyOAuthToken({ provider: 'firebase', token: accessToken, tokenType: 'idToken' });
        const session = await openfort.registerRecoverySession(process.env.SHIELD_PUBLIC_KEY!, process.env.SHIELD_SECRET_KEY!, process.env.ENCRYPTION_SHARE!)
        res.json({ session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});