const express = require('express');
const router = express.Router();
const { askAgent } = require('../agents/agent.js')


router.post('/', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'No question provided' });
    }

    try {
        const answer = await askAgent(question);
        res.json({ answer});
    } catch (err) {
        console.error('Error in /ask route:', err);
        res.status(500).json({ error: 'Something went wrong.' });
    }
});

module.exports = router;
