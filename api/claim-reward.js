// এই সম্পূর্ণ কোডটি আপনার api/claim-reward.js ফাইলে পেস্ট করুন
// এটি Environment Variables ব্যবহার করে, যা সবচেয়ে নিরাপদ পদ্ধতি

const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

// --- Firebase Admin SDK সেটআপ (নিরাপদ উপায়) ---
// এই কোডটি Vercel-এর Environment Variables থেকে আপনার গোপন তথ্যগুলো খুঁজে নেবে।
// কোডের ভেতরে সরাসরি কোনো গোপন কী লেখা নেই।
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

  // Firebase অ্যাপটি যদি আগে থেকে ইনিশিয়ালাইজ করা না থাকে, তবেই নতুন করে ইনিশিয়ালাইজ করুন
  if (!initializeApp.length) {
      initializeApp({
          credential: cert(serviceAccount),
          databaseURL: "https://giveawaybd-default-rtdb.firebaseio.com" // আপনার ডাটাবেস ইউআরএল
      });
  }
} catch (error) {
  console.error('Firebase Admin SDK Initialization Error:', error.message);
}


const db = getDatabase();

// --- মূল API ফাংশন যা Adsgram থেকে কল হবে ---
export default async function handler(req, res) {
    // Adsgram থেকে পাঠানো user_id নিন
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // >>> এখানেই আপনি পুরস্কারের পয়েন্ট নির্ধারণ করবেন <<<
    const pointsPerAd = 10; // প্রতিটি অ্যাডের জন্য ১০ পয়েন্ট

    // ডেটাবেসে ব্যবহারকারীর পয়েন্টের রেফারেন্স নিন
    const userPointsRef = db.ref(`users/${user_id}/points`);

    try {
        // Firebase Transaction ব্যবহার করে নিরাপদে পয়েন্ট আপডেট করুন
        await userPointsRef.transaction((currentPoints) => {
            return (currentPoints || 0) + pointsPerAd;
        });

        // সফলভাবে পয়েন্ট যোগ হয়েছে
        res.status(200).json({ success: true, message: `${pointsPerAd} points added successfully.` });

    } catch (error) {
        console.error('Firebase Transaction Error:', error);
        res.status(500).json({ error: 'Failed to add points' });
    }
      }
