const express = require('express')
const db = require('../db')
const { NotFoundError } = require('../expressError')


const router = new express.Router()


router.get('/', async (req, res) => {
    let results = await db.query(`
    SELECT code, name 
    FROM companies
    `)

    let companies = results.rows;

    return res.json({companies});
})

router.post('/', async (req, res) => {
    let {code, name, description} = req.body;
    let results = await db.query(`
    INSERT INTO companies
    (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description
    `, [code, name, description])
    let company = results.rows[0];
    return res.json({company});
})

router.use('/:code', async (req, res, next)=> {
    let result = await db.query(`
    SELECT code, name, description 
    FROM companies
    WHERE code = $1
    `, [req.params.code]);

    if(result.rows.length === 0){
        return next(new NotFoundError())
    };
    // is this kosher?
    req.requestedCompany = result.rows[0];
    return next();
})

router.get('/:code', async (req, res) => {
    let company = req.requestedCompany
    return res.json({company});
})

router.put('/:code', async (req, res) => {
    let {name, description} = req.body;
    let result = await db.query(`
    UPDATE companies
    SET name=$1, description=$2
    WHERE code = $3
    RETURNING code, name, description
    `, [name, description, req.params.code]);
    let company = result.rows[0];
    return res.json({company});
})

router.delete('/:code', async (req, res) => {
    await db.query(`
    DELETE FROM companies
    WHERE code = $1
    `, [req.requestedCompany.code]);
    return res.json({status: 'deleted'});
})




module.exports = router