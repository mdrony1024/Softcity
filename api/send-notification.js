// --- send-notification.js ---

// আপনার আসল বট টোকেন এবং অ্যাডমিনের চ্যাট আইডি এখানে বসান
const TELEGRAM_BOT_TOKEN = '8415145631:AAGikGq-EqKG_nkG6eGuTGAf8FpE3LOMOVU'; // আপনার বট টোকেনটি এখানে দিন
const ADMIN_CHAT_ID = '5761590224'; // আপনার অ্যাডমিন চ্যাট আইডি এখানে দিন

/**
 * টেলিগ্রাম বটে একটি বার্তা পাঠায়।
 * @param {string} message - যে বার্তাটি পাঠাতে চান।
 * @returns {Promise<void>}
 */
async function sendTelegramNotification(message) {
    // টোকেন বা চ্যাট আইডি না থাকলে ফাংশনটি কাজ করবে না
    if (!TELEGRAM_BOT_TOKEN || !ADMIN_CHAT_ID) {
        console.error('Telegram Bot Token or Admin Chat ID is not configured.');
        return;
    }

    // বার্তাটিকে URL-এ ব্যবহারের জন্য এনকোড করা হচ্ছে
    const encodedMessage = encodeURIComponent(message);
    
    // টেলিগ্রাম বট এপিআই-এর URL তৈরি করা
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${ADMIN_CHAT_ID}&text=${encodedMessage}&parse_mode=Markdown`;

    try {
        // fetch API ব্যবহার করে টেলিগ্রাম সার্ভারে একটি GET রিকোয়েস্ট পাঠানো হচ্ছে
        const response = await fetch(url);
        const data = await response.json();

        if (data.ok) {
            console.log('Telegram notification sent successfully!');
        } else {
            console.error('Failed to send Telegram notification:', data.description);
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}

// এই ফাংশনটিকে অন্য ফাইল থেকে ব্যবহার করার জন্য window অবজেক্টে যুক্ত করা হলো
window.sendNotification = sendTelegramNotification;
