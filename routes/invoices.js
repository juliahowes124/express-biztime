const express = require('express');
const db = require('../db');
const { NotFoundError } = require('../expressError');


const router = new express.Router();

router.get('/', async (req, res) => {
    let results = await db.query(`
        SELECT id, comp_code
        FROM invoices 
    `)
    let invoices = results.rows;
    return res.json({invoices});
});

//replace with helper function to check results of query
router.use('/:id', async (req, res, next) => {
    let result = await db.query(`
        SELECT id, comp_code
        FROM invoices 
        WHERE id = $1
    `, [req.params.id])

    if (result.rows.length === 0) {
        return next(new NotFoundError());
    }
    return next();
})

router.get('/:id', async (req, res) => {
    let invoiceQuery = await db.query(`
        SELECT id, comp_code, amt, paid, add_date, paid_date
        FROM invoices 
        WHERE id = $1
    `, [req.params.id]); //dont repeat queries

    invoice = invoiceQuery.rows[0];

    let companyQuery = await db.query(`
        SELECT code, name, description
        FROM companies 
        WHERE code = $1
    `, [invoice.comp_code]);

    invoice.company = companyQuery.rows[0];

    return res.json({invoice});
});

router.post('/', async (req, res) => {
    const { comp_code, amt } = req.body;
    
    const result = await db.query(`
        INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date
    `, [comp_code, amt]);

    const invoice = result.rows[0];
    return res.json({invoice});
})

router.put('/:id', async (req, res) => {
    const amt = req.body.amt;
    const result = await db.query(`
        UPDATE invoices
        SET amt=$1
        WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date
    `, [amt, req.params.id]);
    const company = result.rows[0];
    return res.json({company});
})

router.delete('/:id', async (req, res) => {
    await db.query(`
        DELETE FROM invoices
        WHERE id = $1
    `, [req.params.id])

    return res.json({status: 'deleted'})
})

module.exports = router