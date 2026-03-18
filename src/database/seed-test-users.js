require('../config/env');
const db = require('../config/db');
const { hashPassword } = require('../utils/hash');

// The schema uses `username` rather than a separate full-name column.
const testUsers = [
    {
        username: 'Aarav Mehta',
        email: 'aarav.mehta.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1995-02-14',
        gender: 'male',
        interested_in: 'female',
        is_verified: true,
        height: 178,
        location_city: 'Chandigarh',
        location_country: 'India',
        latitude: 30.7333,
        longitude: 76.7794,
        interests: ['Travel', 'Music', 'Fitness']
    },
    {
        username: 'Priya Sharma',
        email: 'priya.sharma.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1997-06-08',
        gender: 'female',
        interested_in: 'male',
        is_verified: true,
        height: 165,
        location_city: 'Mohali',
        location_country: 'India',
        latitude: 30.7046,
        longitude: 76.7179,
        interests: ['Reading', 'Coffee', 'Travel']
    },
    {
        username: 'Rohan Verma',
        email: 'rohan.verma.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1993-09-21',
        gender: 'male',
        interested_in: 'female',
        is_verified: true,
        height: 182,
        location_city: 'Panchkula',
        location_country: 'India',
        latitude: 30.6942,
        longitude: 76.8606,
        interests: ['Gaming', 'Movies', 'Technology']
    },
    {
        username: 'Ananya Iyer',
        email: 'ananya.iyer.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1996-11-30',
        gender: 'female',
        interested_in: 'both',
        is_verified: true,
        height: 168,
        location_city: 'Zirakpur',
        location_country: 'India',
        latitude: 30.6425,
        longitude: 76.8173,
        interests: ['Art', 'Yoga', 'Music']
    },
    {
        username: 'Kabir Singh',
        email: 'kabir.singh.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1992-04-17',
        gender: 'male',
        interested_in: 'both',
        is_verified: true,
        height: 180,
        location_city: 'Kharar',
        location_country: 'India',
        latitude: 30.7463,
        longitude: 76.6469,
        interests: ['Hiking', 'Photography', 'Travel']
    },
    {
        username: 'Sneha Kapoor',
        email: 'sneha.kapoor.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1998-01-12',
        gender: 'female',
        interested_in: 'male',
        is_verified: true,
        height: 160,
        location_city: 'New Chandigarh',
        location_country: 'India',
        latitude: 30.7552,
        longitude: 76.7286,
        interests: ['Cooking', 'Movies', 'Pets']
    },
    {
        username: 'Aditya Rao',
        email: 'aditya.rao.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1994-07-03',
        gender: 'male',
        interested_in: 'female',
        is_verified: true,
        height: 176,
        location_city: 'Derabassi',
        location_country: 'India',
        latitude: 30.5881,
        longitude: 76.8428,
        interests: ['Cricket', 'Food', 'Music']
    },
    {
        username: 'Meera Nair',
        email: 'meera.nair.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1995-10-19',
        gender: 'female',
        interested_in: 'female',
        is_verified: true,
        height: 163,
        location_city: 'Pinjore',
        location_country: 'India',
        latitude: 30.7987,
        longitude: 76.9186,
        interests: ['Dance', 'Travel', 'Photography']
    },
    {
        username: 'Vikram Patel',
        email: 'vikram.patel.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1991-12-05',
        gender: 'male',
        interested_in: 'female',
        is_verified: true,
        height: 183,
        location_city: 'Mullanpur',
        location_country: 'India',
        latitude: 30.7737,
        longitude: 76.6935,
        interests: ['Startups', 'Fitness', 'Coffee']
    },
    {
        username: 'Isha Malhotra',
        email: 'isha.malhotra.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1997-03-27',
        gender: 'female',
        interested_in: 'male',
        is_verified: true,
        height: 167,
        location_city: 'Manimajra',
        location_country: 'India',
        latitude: 30.7219,
        longitude: 76.8421,
        interests: ['Fashion', 'Art', 'Food']
    }
];

const masterInterests = [
    'Travel',
    'Music',
    'Fitness',
    'Reading',
    'Coffee',
    'Gaming',
    'Movies',
    'Technology',
    'Art',
    'Yoga',
    'Hiking',
    'Photography',
    'Cooking',
    'Pets',
    'Cricket',
    'Food',
    'Dance',
    'Startups',
    'Fashion'
];

const upsertInterest = async (client, name) => {
    const result = await client.query(
        `INSERT INTO interests (name)
         VALUES ($1)
         ON CONFLICT (name)
         DO UPDATE SET name = EXCLUDED.name
         RETURNING id, name`,
        [name]
    );

    return result.rows[0];
};

const seedTestUsers = async () => {
    const client = await db.connect();

    try {
        console.log('Starting test-user seed...');
        await client.query('BEGIN');

        const interestIdByName = new Map();

        for (const interestName of masterInterests) {
            const interest = await upsertInterest(client, interestName);
            interestIdByName.set(interest.name, interest.id);
        }

        for (const user of testUsers) {
            const passwordHash = await hashPassword(user.password);

            const userResult = await client.query(
                `INSERT INTO users (
                    email,
                    password_hash,
                    username,
                    date_of_birth,
                    gender,
                    interested_in,
                    is_verified
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (email)
                DO UPDATE SET
                    password_hash = EXCLUDED.password_hash,
                    username = EXCLUDED.username,
                    date_of_birth = EXCLUDED.date_of_birth,
                    gender = EXCLUDED.gender,
                    interested_in = EXCLUDED.interested_in,
                    is_verified = EXCLUDED.is_verified,
                    updated_at = NOW()
                RETURNING id`,
                [
                    user.email,
                    passwordHash,
                    user.username,
                    user.date_of_birth,
                    user.gender,
                    user.interested_in,
                    user.is_verified
                ]
            );

            const userId = userResult.rows[0].id;

            await client.query(
                `INSERT INTO user_profiles (
                    user_id,
                    height,
                    location_city,
                    location_country,
                    latitude,
                    longitude
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id)
                DO UPDATE SET
                    height = EXCLUDED.height,
                    location_city = EXCLUDED.location_city,
                    location_country = EXCLUDED.location_country,
                    latitude = EXCLUDED.latitude,
                    longitude = EXCLUDED.longitude,
                    updated_at = NOW()`,
                [
                    userId,
                    user.height,
                    user.location_city,
                    user.location_country,
                    user.latitude,
                    user.longitude
                ]
            );

            await client.query(
                `DELETE FROM user_interests WHERE user_id = $1`,
                [userId]
            );

            for (const interestName of user.interests) {
                const interestId = interestIdByName.get(interestName);

                if (!interestId) {
                    throw new Error(`Interest not found in master list: ${interestName}`);
                }

                await client.query(
                    `INSERT INTO user_interests (user_id, interest_id)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id, interest_id) DO NOTHING`,
                    [userId, interestId]
                );
            }

            console.log(`Upserted ${user.username} with ${user.interests.length} interests`);
        }

        await client.query('COMMIT');
        console.log('Test-user seed completed successfully.');
        process.exit(0);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Test-user seed failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
};

seedTestUsers();
