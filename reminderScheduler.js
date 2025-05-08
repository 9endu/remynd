const schedule = require('node-schedule');
const db = require('./db');
const { sendWhatsAppMessage } = require('./whatsappSender');

function scheduleWhatsAppReminder(id, task, dueTime) {
    const reminderTime = new Date(dueTime);
    
    // Schedule reminder for due time
    schedule.scheduleJob(reminderTime, async () => {
        // Check if task is already completed
        db.get('SELECT completed FROM todos WHERE id = ?', [id], (err, row) => {
            if (!err && row && !row.completed) {
                sendWhatsAppMessage(`Reminder: It's time for your task - "${task}"`);
                
                // Update notified status
                db.run('UPDATE todos SET notified = 1 WHERE id = ?', [id]);
            }
        });
    });
    
    // Optional: Schedule check-in reminders (e.g., 1 hour before)
    const checkInTime = new Date(reminderTime.getTime() - 60 * 60 * 1000);
    if (checkInTime > new Date()) {
        schedule.scheduleJob(checkInTime, () => {
            db.get('SELECT completed FROM todos WHERE id = ?', [id], (err, row) => {
                if (!err && row && !row.completed) {
                    sendWhatsAppMessage(`Check-in: Your task "${task}" is due in 1 hour`);
                }
            });
        });
    }
}

module.exports = { scheduleWhatsAppReminder };