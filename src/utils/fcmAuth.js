import { GoogleAuth } from 'google-auth-library';

/**
 * Get FCM access token for v1 API
 * @returns {Promise<string>} Access token
 */
export const getFCMAccessToken = async () => {
    try {
        const auth = new GoogleAuth({
            credentials: {
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });
        
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        
        if (!accessToken.token) {
            throw new Error('Failed to obtain access token');
        }
        
        return accessToken.token;
    } catch (error) {
        console.error('FCM Auth Error:', error);
        throw new Error(`FCM authentication failed: ${error.message}`);
    }
};