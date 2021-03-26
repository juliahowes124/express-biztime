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
    `);
});

describe('GET companies', () => {
    test('companies successfully fetched', async () => {
        let response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200)
        expect(response.body.companies[0]).toEqual({...testCompany, description: undefined})
    });
})

describe('GET company', () => {
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

describe('POST new company', () => {
    test('company successfully posted', async () => {
        let response = await request(app).post('/companies').send(testCompany2);
        expect(response.statusCode).toEqual(200);
        expect(response.body.company).toEqual(testCompany2);
        let queriedCompanies = await db.query(`SELECT * FROM companies`);
        expect(queriedCompanies.rows.length).toEqual(2);
    })
})

describe('PUT companies', () => {
    test('successfully altered company', async ()=>{

        let edits = {name: 'poog', description: 'not your average company'}
        let resp = await request(app).put('/companies/goog').send(edits);
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.company).toEqual({...testCompany, ...edits})
    });
    test('company not fetched', async () => {
        let response = await request(app).put('/companies/boog');
        expect(response.statusCode).toEqual(404);
        expect(response.body.error.message).toEqual("Not Found");
    });
});

describe('DELETE companies', ()=> {
    test('successfully delete company', async ()=> {
        let resp = await request(app).delete('/companies/goog');
        expect(resp.statusCode).toEqual(200);
        expect(resp.body.status).toEqual('deleted');
        let data = await db.query('SELECT name FROM companies');
        expect(data.rows.length).toEqual(0);
    });
});

beforeAll(done => {
    done();
});
  
afterAll(done => {
    // Closing the DB connection allows Jest to exit successfully.
    db.end();
    done();
});