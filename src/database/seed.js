require('../config/env');
const db = require('../config/db');
const { hashPassword } = require('../utils/hash');

const seed = async () => {
    try {
        console.log('Starting Database Seeding...');
        
        // 1. Seed Users
        const usersToSeed = [
            {
                email: 'alice@example.com',
                password: 'password123',
                username: 'alice_wonder',
                date_of_birth: '1995-05-12',
                gender: 'female',
                interested_in: 'male',
                is_verified: true
            },
            {
                email: 'bob@example.com',
                password: 'password123',
                username: 'bob_builder',
                date_of_birth: '1993-08-21',
                gender: 'male',
                interested_in: 'female',
                is_verified: true
            },
            {
                email: 'charlie@example.com',
                password: 'password123',
                username: 'charlie_chaplin',
                date_of_birth: '1990-11-05',
                gender: 'male',
                interested_in: 'both',
                is_verified: true
            }
        ];

        for (const u of usersToSeed) {
            const existing = await db.query('SELECT id FROM users WHERE email=$1', [u.email]);
            if (existing.rows.length === 0) {
                const hashedPass = await hashPassword(u.password);
                const result = await db.query(
                    `INSERT INTO users (email, password_hash, username, date_of_birth, gender, interested_in, is_verified) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                    [u.email, hashedPass, u.username, u.date_of_birth, u.gender, u.interested_in, u.is_verified]
                );
                console.log(`Seeded user: ${u.username} (ID: ${result.rows[0].id})`);
            } else {
                console.log(`User already exists: ${u.email}`);
            }
        }

        console.log('Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Database seeding failed:', error);
        process.exit(1);
    }
};

seed();
