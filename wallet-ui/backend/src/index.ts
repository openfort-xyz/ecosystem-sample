import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Openfort from '@openfort/openfort-node';

const app = express();
dotenv.config();

const PORT = process.env.PORT ?? 3001;

if (!process.env.OPENFORT_SECRET_KEY || !process.env.SHIELD_PUBLIC_KEY || !process.env.SHIELD_SECRET_KEY || !process.env.ENCRYPTION_SHARE || !process.env.STRIPE_SECRET_KEY) {
    throw new Error(
        `Unable to load the .env file. Please copy .env.example to .env and fill in the required environment variables.`
    );
}

if (!process.env.OPENFORT_PROD_SECRET_KEY || !process.env.SHIELD_PROD_PUBLIC_KEY || !process.env.SHIELD_PROD_SECRET_KEY || !process.env.ENCRYPTION_PROD_SHARE) {
    console.warn(
        `Unable to load the .env file for production. Please copy .env.example to .env and fill in the required environment variables for production.`
    );
}

// Use the cors middleware to disable CORS
app.use(cors());

app.use(express.json());

app.post("/api/create-onramp-session", async (req, res) => {
    try {
        const transaction_details = req.body;

        const params = new URLSearchParams();

        // Custom support for currencies
        params.append('source_currency', 'usd');
        // // params.append('source_currency', 'eur');
        params.append('wallet_address', transaction_details["address"]);
        params.append('lock_wallet_address', 'true');
        params.append('destination_networks[]', 'ethereum');
        params.append('destination_network', 'ethereum');
        params.append('destination_currency', 'usdc');

        const onrampSession = await fetch("https://api.stripe.com/v1/crypto/onramp_sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`
            },
            body: params
        });
        const data: any = await onrampSession.json();
        res.send(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });

    }
});

app.use(express.json());

app.post("/api/protected-create-encryption-session", async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).send({
                error: 'You must be signed in to view the protected content on this page.',
            });
        }

        const { isProd } = req.body;

        let openfortKey, shieldPublicKey, shieldSecretKey, encryptionShare;

        if (isProd) {
            if (!process.env.OPENFORT_PROD_SECRET_KEY || !process.env.SHIELD_PROD_PUBLIC_KEY ||
                !process.env.SHIELD_PROD_SECRET_KEY || !process.env.ENCRYPTION_PROD_SHARE) {
                return res.status(500).send({
                    error: 'Production environment variables are not configured properly.',
                });
            }
            openfortKey = process.env.OPENFORT_PROD_SECRET_KEY;
            shieldPublicKey = process.env.SHIELD_PROD_PUBLIC_KEY;
            shieldSecretKey = process.env.SHIELD_PROD_SECRET_KEY;
            encryptionShare = process.env.ENCRYPTION_PROD_SHARE;
        } else {
            openfortKey = process.env.OPENFORT_SECRET_KEY!;
            shieldPublicKey = process.env.SHIELD_PUBLIC_KEY!;
            shieldSecretKey = process.env.SHIELD_SECRET_KEY!;
            encryptionShare = process.env.ENCRYPTION_SHARE!;
        }

        const openfort = new Openfort(openfortKey);
        await openfort.iam.verifyAuthToken(accessToken);
        const session = await openfort.registerRecoverySession(shieldPublicKey, shieldSecretKey, encryptionShare);
        res.json({ session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/healthz", (req, res) => {
    res.send("OK");
});

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});
