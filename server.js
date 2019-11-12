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

// *** TODOS ***
app.get('/api/todos', async (req, res) => {

    try {
        const result = await client.query(`
            SELECT *
            FROM todos
            ORDER BY task;
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

app.post('/api/todos', async (req, res) => {
    const todo = req.body;

    try {
        const result = await client.query(`
            INSERT INTO todos (task)
            VALUES ($1)
            RETURNING *;
        `,
        [todo.task]);

        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') {
            res.status(400).json({
                error: `Task "${todo.task}" already exists`
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

app.put('/api/todos/:id', async (req, res) => {
    const id = req.params.id;
    const todo = req.body;

    try {
        const result = await client.query(`
            UPDATE todos
            SET     task = $2,
                    complete = $3
            WHERE  id = $1
            RETURNING *;
        `, [id, todo.task, todo.complete]);
     
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') {
            res.status(400).json({
                error: `Task "${todo.task}" already exists`
            });
        }
        else {
            res.status(500).json({
                error: err.message || err
            });
        }
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await client.query(`
            DELETE FROM todos
            WHERE  id = $1
            RETURNING *;
        `, [id]);
        
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23503') {
            res.status(400).json({
                error: `Could not remove, todo is in use.`
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