const express = require('express');
const db = require('../db');

const request = require('supertest');
const app = require('../app');

const testCompany = { code: "goog", name: "google", description: "blah" };
const testCompany2 = { code: "micro", name: "microsoft", description: "blah2" };

beforeEach(async () => {
    let { code, name, description } = testCompany;
    await db.query(`
        INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
    `, [code, name, description]);
});

afterEach(async () => {
    await db.query(`
        DELETE FROM companies
    `)
});


describe('get companies', () => {
    test('companies successfully fetched', async () => {
        let response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200)
        expect(response.body.companies[0]).toEqual({...testCompany, description: undefined})
    });
})

//ASK ABOUT DESCRIBE STUFF
describe('get company', () => {
    test('company successfully fetched', async () => {
        let response = await request(app).get('/companies/goog');
        expect(response.statusCode).toEqual(200)
        expect(response.body.company).toEqual({...testCompany, invoices: []})
    });

    test('company not fetched', async () => {
        let response = await request(app).get('/companies/boog');
        expect(response.statusCode).toEqual(404);
        expect(response.body.error.message).toEqual("Not Found");
    });

})

describe('post new company', () => {
    test('company successfully posted', async () => {
        let response = await request(app).post('/companies').send(testCompany2);
        expect(response.statusCode).toEqual(200);
        expect(response.body.company).toEqual(testCompany2);
        let queriedCompanies = await db.query(`SELECT * FROM companies`);
        expect(queriedCompanies.rows.length).toEqual(2);
    })
})

