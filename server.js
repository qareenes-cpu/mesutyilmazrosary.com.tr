const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from root
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Database Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tesbih_vitrini', // Connect directly to DB if possible
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}).promise();

async function initDB() {
    try {
        // Only attempt to create database if we are NOT in a managed environment
        // or if we specifically want to try.
        // In many PaaS, you are given a connection string to an existing DB.

        // Check connection
        try {
            await pool.query('SELECT 1');
            console.log('Connected to database successfully.');
        } catch (err) {
            if (err.code === 'BAD_DB_ERROR') {
                // Database doesn't exist, try to create it (local development scenario)
                console.log('Database does not exist, attempting to create...');
                const adminPool = mysql.createPool({
                    host: process.env.DB_HOST || 'localhost',
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    waitForConnections: true,
                    connectionLimit: 1
                }).promise();

                await adminPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'tesbih_vitrini'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                await adminPool.end();
                console.log('Database created.');
            } else {
                throw err;
            }
        }

        const sqlPath = path.join(__dirname, 'db_init.sql');
        if (fs.existsSync(sqlPath)) {
            // Check if tables exist to avoid re-running init unnecessarily
            const [tables] = await pool.query('SHOW TABLES');
            if (tables.length === 0) {
                console.log('Initializing database tables...');
                const sql = fs.readFileSync(sqlPath, 'utf8');
                const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);

                for (let query of queries) {
                    if (query.toUpperCase().startsWith('CREATE DATABASE') || query.toUpperCase().startsWith('USE')) continue;
                    await pool.query(query);
                }
                console.log('Database initialized successfully.');
            } else {
                console.log('Database already contains tables, skipping initialization.');
            }
        }
    } catch (err) {
        console.error('Initialization error:', err.message);
    }
}

// API Endpoints

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        const [rows] = await pool.query('SELECT `value` FROM settings WHERE `key` = "admin_user" OR `key` = "admin_pass"');
        const settings = {};
        rows.forEach(row => {
            // We'll have two rows: one for admin_user, one for admin_pass
        });

        // Simpler way to get specifically these two
        const [userRow] = await pool.query('SELECT `value` FROM settings WHERE `key` = "admin_user"');
        const [passRow] = await pool.query('SELECT `value` FROM settings WHERE `key` = "admin_pass"');

        const dbUser = userRow[0]?.value || 'admin';
        const dbPass = passRow[0]?.value || 'admin123';

        if (username === dbUser && password === dbPass) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get single product by code or ID
app.get('/api/products/:query', async (req, res) => {
    const query = req.params.query;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        const [rows] = await pool.query(
            'SELECT * FROM products WHERE product_code = ? OR series_number = ? OR id = ?',
            [query, query, query]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Search products
app.get('/api/search', async (req, res) => {
    const q = req.query.q;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        const [rows] = await pool.query(
            'SELECT * FROM products WHERE name LIKE ? OR master LIKE ? OR product_code LIKE ? OR series_number LIKE ?',
            [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get settings
app.get('/api/settings', async (req, res) => {
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        const [rows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Update settings
app.post('/api/settings', async (req, res) => {
    const settings = req.body;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
                [key, value, value]
            );
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// File Upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add a category
app.post('/api/categories', async (req, res) => {
    const { name } = req.body;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.json({ message: 'Category added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete a category
app.delete('/api/categories/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Add new product
app.post('/api/products', async (req, res) => {
    const p = req.body;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        const [result] = await pool.query(
            'INSERT INTO products (product_code, name, master, collection, description, material, series_number, bead_count, bead_size, imame_motif, imame_size, stock_code, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [p.product_code, p.name, p.master, p.collection, p.description, p.material, p.series_number, p.bead_count, p.bead_size, p.imame_motif, p.imame_size, p.stock_code, p.category, p.image_url]
        );
        res.json({ id: result.insertId, message: 'Product added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // await pool.query(`USE \`${process.env.DB_NAME || 'tesbih_vitrini'}\``); // Connects directly now
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});


app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    await initDB();
});
