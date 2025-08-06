// File: /api/send-notification.js

export default async function handler(request, response) {
    // --- নিচের দুটি জায়গায় আপনার নিজের টোকেন ও চ্যাট আইডি দিন ---
    const BOT_TOKEN = "8415145631:AAGikGq-EqKG_nkG6eGuTGAf8FpE3LOMOVU";
    const ADMIN_CHAT_ID = "5761590224";

    if (request.method !== 'POST') {
        return response.status(405).send({ message: 'Only POST requests allowed' });
    }

    try {
        const { message } = request.body;

        if (!message) {
            return response.status(400).send({ message: 'Message text is required' });
        }

        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: ADMIN_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        response.status(200).send({ message: 'Notification sent successfully!' });

    } catch (error) {
        console.error("Error sending notification:", error);
        response.status(500).send({ message: 'Failed to send notification' });
    }
}
