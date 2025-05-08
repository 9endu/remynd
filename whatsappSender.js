require('dotenv').config(); // Load environment variables first

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Validate environment variables before creating client
if (!accountSid || !authToken) {
  throw new Error('Twilio credentials missing in environment variables');
}

const client = require('twilio')(accountSid, authToken);
const RECIPIENT_NUMBER = process.env.WHATSAPP_NUMBER; 

// Improved with error handling and input validation
async function sendWhatsAppMessage(message) {
  if (!message?.trim()) {
    throw new Error('Message content cannot be empty');
  }

  if (!RECIPIENT_NUMBER?.startsWith('whatsapp:+')) {
    throw new Error('Invalid recipient number format. Must start with "whatsapp:+"');
  }

  try {
    const response = await client.messages.create({
      body: message.substring(0, 1600), // Truncate to avoid character limits
      from: 'whatsapp:+14155238886', // Sandbox number
      to: RECIPIENT_NUMBER
    });
    
    console.log(`Message ${response.sid} sent to ${RECIPIENT_NUMBER}`);
    return response;
  } catch (error) {
    console.error('Twilio API Error:', {
      code: error.code,
      message: error.message,
      moreInfo: error.more_info
    });
    throw error; // Re-throw for calling code to handle
  }
}

module.exports = { sendWhatsAppMessage };