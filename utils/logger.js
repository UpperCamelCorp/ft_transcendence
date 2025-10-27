const fs = require('fs');
const path = require('path');

const logDir = '/var/log/transcendence';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logStream = fs.createWriteStream(path.join(logDir, 'app.log'), { flags: 'a' });

class Logger {
    static log(level, message, metadata = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: 'transcendence',
            ...metadata
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        logStream.write(logLine);

        console.log(logLine.trim());
    }

    static info(message, metadata = {}) {
        this.log('info', message, metadata);
    }

    static warn(message, metadata = {}) {
        this.log('warn', message, metadata);
    }

    static error(message, metadata = {}) {
        this.log('error', message, metadata);
    }

    static auth(message, metadata = {}) {
        this.log('info', message, { ...metadata, type: 'auth_event' });
    }

    static game(message, metadata = {}) {
        this.log('info', message, { ...metadata, type: 'game_event' });
    }

    static api(message, metadata = {}) {
        this.log('info', message, { ...metadata, type: 'api_call' });
    }
}

module.exports = Logger;