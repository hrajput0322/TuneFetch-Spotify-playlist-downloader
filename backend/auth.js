require('dotenv').config();
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const { createClient } = require('redis');
const crypto = require('node:crypto');
const { Auth } = require('googleapis');

const requiredSettings = [
    'SESSION_SECRET',
    'REDIS_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
];

for (const setting in requiredSettings) {
    if (!process.env[setting]) {
        throw new Error(`Missing ${setting} in backend/.env`);
    }
}

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
});

const googleOAuthClient = new Auth.OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function configureSession(app) {
    await redisClient.connect();

    app.use(
        session({
            name: 'tunefetch.sid',
            store: new RedisStore({
                client: redisClient,
                prefix: 'tunefetch:session:',
            }),
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            rolling: true,
            cookie: {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            },
        })
    );

    app.get('/auth/google', async (req, res, next) => {
        try {
            const { codeVerifier, codeChallenge } = googleOAuthClient.generateCodeVerifierAsync();
            const state = crypto.randomBytes(32).toString('hex');

            req.session.oauthState = state;
            req.session.codeVerifier = codeVerifier;

            const authorizationUrl = googleOAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube.readonly'],
                state,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
            })

            await saveSession(req);
            app.redirect(authorizationUrl);
        } catch (error) {
            next(error);
        }
    });

    app.get('/auth/google/callback', async (req, res, next) => {
        try {
            const { code, state, error } = req.query;

            if (error) {
                return res.status(400).send('Google sign-in was cancelled or failed.');
            }

            if (
                typeof code !== 'string' ||
                typeof state !== 'string' ||
                state !== req.session.oauthState ||
                !req.session.codeVerifier
            ) {
                return res.status(400).send('Invalid sign-in response. Please try again.');
            }

            const { tokens } = googleOAuthClient.getToken({
                code,
                codeVerifier: req.session.codeVerifier,
            })

            await regenerateSession(req);
            req.session.googleTokens = tokens;
            await saveSession(req);

            res.redirect('http://127.0.0.1:5173');
        }
        catch (error) {
            next(error);
        }
    });
}

module.exports = { configureSession };