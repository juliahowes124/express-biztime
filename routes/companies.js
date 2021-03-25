const express = require('express')
const db = require('../db')


const router = new express.Router()


router.get('/', async (req, res) => {
    let results = await db.query(`
    SELECT code, name 
    FROM companies
    `)

    let companies = results.rows;

    return res.json({companies});
})

router.get('/:code', async (req, res) => {
    let result = await db.query(`
    SELECT * 
    FROM companies
    WHERE code = $1
    `, [req.params.code]);

    let company = result.rows[0];
    return res.json({company});
})




module.exports = router