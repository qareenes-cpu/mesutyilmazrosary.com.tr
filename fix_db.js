const mysql = require('mysql2/promise');
require('dotenv').config();

async function init() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Connecting to database...');
        await pool.query('CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');
        console.log('Categories table ensured.');

        const categories = [
            'Damla Kehribar',
            'Sıkma Kehribar',
            'Ateş Kehribar',
            'Oltu Taşı',
            'Kuka Tesbihler',
            'Ağaç Grubu',
            'Değerli Taşlar',
            'Fosil Grubu',
            'Antika Serisi'
        ];

        for (const cat of categories) {
            await pool.query('INSERT IGNORE INTO categories (name) VALUES (?)', [cat]);
        }
        console.log('Categories seeded.');

    } catch (err) {
        console.error('DB Fix Error:', err);
    } finally {
        await pool.end();
        process.exit();
    }
}

init();
