const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

let agentOnline = false;
let lastAgentPing = Date.now();
let pendingCommand = null;

app.use(express.json());
app.use(express.static(__dirname));

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.send('OK');
});

// Agent register
app.post('/api/agent/register', (req, res) => {
    agentOnline = true;
    lastAgentPing = Date.now();
    if (pendingCommand) {
        const cmd = pendingCommand;
        pendingCommand = null;
        res.json({ status: 'OK', command: cmd.command });
    } else {
        res.json({ status: 'OK' });
    }
});

// Send command
app.post('/api/command', (req, res) => {
    const { command } = req.body || {};
    if (!agentOnline) {
        return res.status(503).json({ status: 'ERROR', message: 'Agente offline' });
    }
    pendingCommand = { command, id: Date.now() };
    res.json({ status: 'OK' });
});

// Status
app.get('/api/status', (req, res) => {
    res.json({ server: 'online', agent: (Date.now() - lastAgentPing) > 10000 ? 'offline' : 'online' });
});

app.listen(port, () => {
    console.log(`Server online porta ${port}`);
});
