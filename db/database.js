const sqlite3 = require('sqlite3');
const path = require('path');


const setUpDataBase = async () => {
    const db = new sqlite3.Database(path.join(__dirname, 'transcendence.db'), (e) => {
        if (e)
            console.log(e);
        else
            console.log('Database setup');
    });
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            hash TEXT NOT NULL,
            picture TEXT
            )`
        , (e) => {
            if (e)
                console.log(e);
            else
                console.log('Tables initiated');
        });

        // Add picture column to existing table if it doesn't exist
        db.run(`ALTER TABLE users ADD COLUMN picture TEXT`, (e) => {
            if (e && !e.message.includes('duplicate column name')) {
                console.log('Column addition error:', e);
            } else if (!e) {
                console.log('Picture column added successfully');
            }
        });
    })
    return db;
}

module.exports = { setUpDataBase };