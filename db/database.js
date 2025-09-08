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
    })
    return db;
}

module.exports = { setUpDataBase };