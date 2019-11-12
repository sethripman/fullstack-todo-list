// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const client = require('./lib/client');
// Initiate database connection
client.connect();

// Application Setup
const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.static('public')); // server files from /public folder
app.use(express.json()); // enable reading incoming json data

// API Routes

// *** CATS ***
app.get('/api/cats', async (req, res) => {

    try {
        const result = await client.query(`
            SELECT
                c.id,
                c.name,
                c.type_id,
                t.name as type,
                c.url,
                c.year
            FROM cats c
            JOIN types t
            ON   c.type_id = t.id
            ORDER BY c.year;
        `);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }

});

app.get('/api/cats/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await client.query(`
            SELECT
                  c.*,
                  t.name as type
            FROM  cats c
            JOIN  types t
            ON    c.type_id = t.id
            WHERE c.id = $1
        `,
        [id]);

        const cat = result.rows[0];
        if (!cat) {
            res.status(404).json({
                error: `Cat id ${id} does not exist`
            });
        }
        else {
            res.json(result.rows[0]);
        }

    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }

});

app.post('/api/cats', async (req, res) => {
    const cat = req.body;

    try {
        const result = await client.query(`
            INSERT INTO cats (name, type_id, url, year, lives, is_sidekick)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `,
        [cat.name, cat.typeId, cat.url, cat.year, cat.lives, cat.isSidekick]
        );

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

// *** TYPES ***
app.get('/api/types', async (req, res) => {
    const showAll = (req.query.show && req.query.show.toLowerCase() === 'all');
    const where = showAll ? '' : 'WHERE inactive = FALSE';

    try {
        const result = await client.query(`
            SELECT *
            FROM types
            ${where}
            ORDER BY name;
        `);
        
        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }  
});

app.post('/api/types', async (req, res) => {
    const type = req.body;

    try {
        const result = await client.query(`
            INSERT INTO types (name)
            VALUES ($1)
            RETURNING *;
        `,
        [type.name]);
        
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') {
            res.status(400).json({
                error: `Type "${type.name}" already exists`
            });
        }
        else {
            console.log(err);
            res.status(500).json({
                error: err.message || err
            });
        }
    }
});

app.put('/api/types/:id', async (req, res) => {
    const id = req.params.id;
    const type = req.body;

    try {
        const result = await client.query(`
            UPDATE types
            SET    name = $2,
                   inactive = $3
            WHERE  id = $1
            RETURNING *;
        `, [id, type.name, type.inactive]);
     
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') {
            res.status(400).json({
                error: `Type "${type.name}" already exists`
            });
        }
        else {
            res.status(500).json({
                error: err.message || err
            });
        }
    }
});

app.delete('/api/types/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await client.query(`
            DELETE FROM types
            WHERE  id = $1
            RETURNING *;
        `, [id]);
        
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23503') {
            res.status(400).json({
                error: `Could not remove, type is in use. Make inactive or delete all cats with that type first.`
            });
        }
        else {
            res.status(500).json({
                error: err.message || err
            });
        }
    } 
});

// Start the server
app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});