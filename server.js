const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const { scheduleWhatsAppReminder } = require('./reminderScheduler');
require('dotenv').config();
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes
app.get('/todos', (req, res) => {
    db.all('SELECT * FROM todos ORDER BY due_time', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/todos', (req, res) => {
    const { task, due_time } = req.body;
    db.run('INSERT INTO todos (task, due_time) VALUES (?, ?)', [task, due_time], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Schedule the WhatsApp reminder
        scheduleWhatsAppReminder(this.lastID, task, due_time);
        
        res.json({ id: this.lastID, task, due_time });
    });
});

app.put('/todos/:id/complete', (req, res) => {
    const id = req.params.id;
    db.run('UPDATE todos SET completed = 1 WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Task marked as completed' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});