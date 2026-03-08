/**
 * API Integration Test
 * Tests full Auth + User profile flow against a running server.
 * Run: node tests/api_test.js
 * Requires the server to be running on PORT 5000.
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
const TEST_USER = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass123!',
    height: 180,
    weight: 75,
    shoulder: 45,
    waist: 32
};

let authToken = '';
let testsPassed = 0;
let testsFailed = 0;

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'localhost',
            port: 5000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
            }
        };
        const req = http.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => (responseBody += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
                } catch {
                    resolve({ status: res.statusCode, body: responseBody });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

function pass(name) {
    console.log(`  ✅ PASS: ${name}`);
    testsPassed++;
}

function fail(name, reason) {
    console.error(`  ❌ FAIL: ${name} — ${reason}`);
    testsFailed++;
}

async function runTests() {
    console.log('\n=== API Integration Test Suite ===\n');

    // 1. Register
    console.log('1. POST /api/auth/register');
    try {
        const res = await request('POST', '/api/auth/register', {
            username: TEST_USER.username,
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        if (res.status === 201 && res.body.token) {
            authToken = res.body.token;
            pass('User registration returns 201 with JWT token');
        } else {
            fail('User registration', `Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        fail('User registration', e.message);
    }

    // 2. Login
    console.log('\n2. POST /api/auth/login');
    try {
        const res = await request('POST', '/api/auth/login', {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        if (res.status === 200 && res.body.token) {
            authToken = res.body.token; // refresh token
            const bio = res.body.user?.biometrics;
            if (bio && 'shoulder' in bio && !('shoulderWidth' in bio)) {
                pass('Login returns 200 with correct biometric field (shoulder)');
            } else {
                fail('Login biometrics naming', `Biometrics object: ${JSON.stringify(bio)}`);
            }
        } else {
            fail('User login', `Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        fail('User login', e.message);
    }

    // 3. Get Profile (GET /api/users/me)
    console.log('\n3. GET /api/users/me');
    try {
        const res = await request('GET', '/api/users/me', null, authToken);
        if (res.status === 200 && res.body.email === TEST_USER.email) {
            pass('Authenticated profile fetch returns correct user data');
        } else {
            fail('Profile fetch', `Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        fail('Profile fetch', e.message);
    }

    // 4. Update Biometrics (PUT /api/users/me/biometrics)
    console.log('\n4. PUT /api/users/me/biometrics');
    try {
        const res = await request('PUT', '/api/users/me/biometrics', {
            height: 182,
            weight: 78,
            shoulder: 46,
            waist: 33
        }, authToken);
        if (res.status === 200 && res.body.success === true) {
            pass('Biometric update returns 200 with success flag');
        } else {
            fail('Biometric update', `Status: ${res.status}, Body: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        fail('Biometric update', e.message);
    }

    // 5. Unauthorized access check
    console.log('\n5. GET /api/users/me (without token)');
    try {
        const res = await request('GET', '/api/users/me', null, null);
        if (res.status === 401) {
            pass('Unauthorized request correctly returns 401');
        } else {
            fail('Auth guard check', `Expected 401, got: ${res.status}`);
        }
    } catch (e) {
        fail('Auth guard check', e.message);
    }

    // Summary
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    if (testsFailed === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️ Some tests failed. Check the output above.');
    }
    process.exit(testsFailed > 0 ? 1 : 0);
}

runTests();
