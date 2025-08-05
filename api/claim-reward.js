// এই সম্পূর্ণ নতুন কোডটি আপনার api/claim-reward.js ফাইলে পেস্ট করুন

const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// --- Firebase Admin SDK সেটআপ (নিরাপদ উপায়) ---
try {
  const serviceAccount = {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  if (!initializeApp.length) {
      initializeApp({
          credential: cert(serviceAccount),
          databaseURL: "https://giveawaybd-default-rtdb.firebaseio.com"
      });
  }
} catch (error) {
  console.error('Firebase Admin SDK Initialization Error:', error.message);
}

const db = getDatabase();

// --- মূল API ফাংশন ---
export default async function handler(req, res) {
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // --- ডেটাবেস থেকে সেটিংস এবং ব্যবহারকারীর ডেটা একসাথে নিন ---
        const settingsRef = db.ref('settings');
        const userStatsRef = db.ref(`users/${user_id}/stats`);
        
        const [settingsSnapshot, userStatsSnapshot] = await Promise.all([
            settingsRef.once('value'),
            userStatsRef.once('value')
        ]);
        
        const settings = settingsSnapshot.val() || {};
        const userStats = userStatsSnapshot.val() || {};

        const dailyAdLimit = settings.dailyAdLimit || 20; // ডিফল্ট ২০

        // --- আজকের তারিখ YYYY-MM-DD ফরম্যাটে নিন ---
        const today = new Date().toISOString().slice(0, 10);
        
        // --- ব্যবহারকারীর আজকের ডেটা রিসেট করুন (যদি তারিখ ভিন্ন হয়) ---
        let todayAdsWatched = 0;
        if (userStats.lastAdWatchedDate === today) {
            todayAdsWatched = userStats.adsWatched || 0;
        } else {
            // তারিখ পরিবর্তন হলে, আজকের সংখ্যা ০ থেকে শুরু হবে
            await userStatsRef.update({ lastAdWatchedDate: today, adsWatched: 0 });
        }

        // --- Daily Ad Limit চেক করুন ---
        if (todayAdsWatched >= dailyAdLimit) {
            return res.status(429).json({ error: 'Daily ad limit reached. Please try again tomorrow.' });
        }

        // --- পয়েন্ট যোগ করুন ---
        const pointsPerAd = settings.pointsPerAd || 10; // ডিফল্ট ১০
        const userPointsRef = db.ref(`users/${user_id}/points`);
        
        await userPointsRef.transaction((currentPoints) => {
            return (currentPoints || 0) + pointsPerAd;
        });

        // --- আজকের দেখা অ্যাডের সংখ্যা ১ বাড়ান ---
        await userStatsRef.update({
            adsWatched: todayAdsWatched + 1
        });
        
        // সফল বার্তা পাঠান
        res.status(200).json({ success: true, message: `${pointsPerAd} points added.` });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
}
