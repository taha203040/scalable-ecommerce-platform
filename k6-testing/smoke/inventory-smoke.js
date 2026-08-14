import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 10,
    iterations: 70,

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

const headers = {
    'Content-Type': 'application/json',

    // Required only for DELETE
    'x-consumer-role': 'admin',
};

export default function () {

    // --------------------------------------------------
    // GET /items
    // --------------------------------------------------

    let res = http.get(`${BASE_URL}/items`);

    check(res, {
        'GET /items status 200': (r) => r.status === 200,
        'GET /items success': (r) => r.json('success') === true,
    });

    // --------------------------------------------------
    // POST /items
    // --------------------------------------------------

    const sku = `SMOKE-${Date.now()}`;

    const payload = JSON.stringify({
        name: 'Smoke Test Item',
        sku,
        price: 50,
        stock: 20,
        category: 'test',
    });

    res = http.post(
        `${BASE_URL}/items`,
        payload,
        { headers }
    );

    check(res, {
        'POST status 201': (r) => r.status === 201,
        'POST success': (r) => r.json('success') === true,
    });

    const id = res.json('data._id');

    // --------------------------------------------------
    // GET /items/:id
    // --------------------------------------------------

    res = http.get(`${BASE_URL}/items/${id}`);

    check(res, {
        'GET by id status 200': (r) => r.status === 200,
        'GET by id success': (r) => r.json('success') === true,
        'Correct item': (r) => r.json('data.sku') === sku,
    });

    // --------------------------------------------------
    // PATCH stock
    // --------------------------------------------------

    res = http.patch(
        `${BASE_URL}/items/${id}/stock`,
        JSON.stringify({
            delta: 5,
        }),
        { headers }
    );

    check(res, {
        'PATCH status 200': (r) => r.status === 200,
        'PATCH success': (r) => r.json('success') === true,
        'Stock updated': (r) => r.json('data.stock') === 25,
    });

    // --------------------------------------------------
    // DELETE item
    // --------------------------------------------------

    res = http.del(
        `${BASE_URL}/items/${id}`,
        null,
        { headers }
    );

    check(res, {
        'DELETE status 200': (r) => r.status === 200,
        'DELETE success': (r) => r.json('success') === true,
    });

    sleep(1);
}
