const mysql = require('mysql2');
const express = require('express');
const inputCheck = require('./utils/inputCheck');
const { data } = require('browserslist');
const { result } = require('lodash');
const PORT = process.env.PORT || 3001;
const app = express();

// Express.js middleware functions
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // Your MySQL username,
        user: 'root',
        // your MySQL password
        password: 'r00t',
        database: 'election'
    },
    console.log('Connected to the election database')
);

// GET all candidates
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id`;
    // query to get all candidates from database
    db.query(`SELECT * FROM candidates`, (err, rows) => {
        if (err) {
            res.status(500).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// GET a single candidate based on id
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                AS party_name
                FROM candidates
                LEFT JOIN parties
                ON candidates.party_id = parties.id
                WHERE candidates.id = ?`;
    const params = [req.params.id];

    // GET a single candidate
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// GET route for all parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message});
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

// get route for a single party
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({error: err.message});
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

// Delete a single candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err,result) => {
        if (err) {
            res.statusMessage(400).json({error: res.message});
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});

// delete a party
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: res.message});
        } else if (!result.affectedRows) {
            res.json({
                message: 'Party not found!'
            });
        } else {
            res.json({
                message: 'success',
                changes: result.affectedRows,
                id: req.params.id
            });
        };
    });
});

// Create a candidate
app.post('/api/candidate', ({body}, res) => {
    const errors = inputCheck (body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({error: errors});
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected) 
                VALUES (?, ?, ?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
});

// put route for updating a candidates party affiliation
app.put('/api/candidate/:id', (req, res) => {
    // check for errors in input prior to attempting to update - ensure party_id was provided
    const errors = inputCheck(req.body, 'party_id');
    if (errors) {
        res.status(400).json({ error: errors});
        return;
    }

    // route code for updating candidate party
    const sql = `UPDATE candidates SET party_id = ?
                WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.query(sql, params, (err, result) => {
        if(err) {
            res.status(400).json({ error: err.message});
        } else if (!result.affectedRows) {
            res.json ({
                message: 'Candidate not found'
            });
        } else {
            res.json ({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});

// default response for any other request (not found)
app.use((req,res) => {
    res.status(404).end();
});

app.listen(PORT, () => {
    console.log(`Server now running on port ${PORT}`);
});