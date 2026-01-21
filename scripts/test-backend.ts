const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
    console.log('🚀 Starting Backend Verification...');

    // 1. Register
    const uniqueId = Date.now();
    const email = `testuser${uniqueId}@example.com`;
    const password = 'password123';

    console.log(`\n1. Registering user: ${email}`);
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Test User',
            email,
            password
        })
    });

    const regData = await regRes.json();
    if (!regRes.ok) {
        console.error('❌ Registration Failed:', regData);
        return;
    }
    console.log('✅ Registration Success:', regData);

    // 2. Login
    console.log(`\n2. Logging in...`);
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password
        })
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok) {
        console.error('❌ Login Failed:', loginData);
        return;
    }

    // Extract token from cookie (node-fetch doesn't handle cookies automatically like browser)
    // But wait, the API sets 'Set-Cookie'. We need to send it back.
    // In a real script we'd need a cookie jar.
    // For simplicity, we can just check if login succeeded.
    // The Search Profile API requires a cookie. 
    // We can manually parse the Set-Cookie header.

    const setCookie = loginRes.headers.get('set-cookie');
    console.log('✅ Login Success. Cookie:', setCookie ? 'Present' : 'Missing');

    if (!setCookie) {
        console.error('❌ No cookie received, cannot proceed to protected route.');
        return;
    }

    // 2.5 Create Profile (Required for Search)
    console.log(`\n2.5 Creating Profile...`);
    const profileRes = await fetch(`${BASE_URL}/profile`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': setCookie
        },
        body: JSON.stringify({
            gender: 'Male',
            dateOfBirth: '1990-01-01',
            religion: 'Other',
            jobStatus: 'EMPLOYED',
            maritalStatus: 'SINGLE',
            bio: 'Test bio',
            location: 'Test City',
            photoUrl: 'https://example.com/photo.jpg'
        })
    });

    const profileData = await profileRes.json();
    if (!profileRes.ok) {
        console.error('❌ Profile Creation Failed:', profileData);
        return;
    }
    console.log('✅ Profile Created Success');

    // 3. Search Profiles
    console.log(`\n3. Searching Profiles (Protected Route)...`);
    const searchRes = await fetch(`${BASE_URL}/profiles?page=1`, {
        method: 'GET',
        headers: {
            'Cookie': setCookie
        }
    });

    const searchData = await searchRes.json();
    if (!searchRes.ok) {
        console.error('❌ Search Failed:', searchData);
        return;
    }
    console.log('✅ Search Success. Profiles found:', searchData.profiles?.length ?? 0);
}

testBackend().catch(console.error);