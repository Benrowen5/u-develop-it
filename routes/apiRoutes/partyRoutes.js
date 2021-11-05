const express = require('express');
const router = express.Router();
const db = require('../../db/connection');

// GET route for all parties
router.get('/parties', (req, res) => {
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
router.get('/party/:id', (req, res) => {
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

// delete a party
router.delete('/party/:id', (req, res) => {
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

// put route for updating a candidates party affiliation
router.put('/candidate/:id', (req, res) => {
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


module.exports = router;