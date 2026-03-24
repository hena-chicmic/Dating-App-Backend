require('../config/env');
const { connectDB, mongoose } = require('../config/db');
const User = require('../models/user.model');
const { hashPassword } = require('../utils/hash');

const testUsers = [
    {
        username: 'Aarav Mehta',
        email: 'aarav.mehta.test@example.com',
        password: 'TestUser@123',
        date_of_birth: '1995-02-14',
        gender: 'male',
        interested_in: 'female',
        is_verified: true,
        bio: 'Tech enthusiast and mountain lover.',
        profile: {
            height: 178,
            location_city: 'Chandigarh',
            location_country: 'India',
            location: { type: 'Point', coordinates: [76.7794, 30.7333] },
            profile_photo_url: 'https://res.cloudinary.com/demo/image/upload/v1631234567/sample.jpg'
        },
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
        bio: 'Coffee addict and bookworm.',
        profile: {
            height: 165,
            location_city: 'Mohali',
            location_country: 'India',
            location: { type: 'Point', coordinates: [76.7179, 30.7046] },
            profile_photo_url: 'https://res.cloudinary.com/demo/image/upload/v1631234568/sample2.jpg'
        },
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
        bio: 'Gamer and cinephile.',
        profile: {
            height: 182,
            location_city: 'Panchkula',
            location_country: 'India',
            location: { type: 'Point', coordinates: [76.8606, 30.6942] }
        },
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
        bio: 'Artist exploring the world.',
        profile: {
            height: 168,
            location_city: 'Zirakpur',
            location_country: 'India',
            location: { type: 'Point', coordinates: [76.8173, 30.6425] }
        },
        interests: ['Art', 'Yoga', 'Music']
    }
];

const seedTestUsers = async () => {
    try {
        await connectDB();
        console.log('Starting Mongoose test-user seed...');

        // Clear existing test users
        await User.deleteMany({ email: /.*\.test@example\.com$/ });
        console.log('Cleaned up previous test users.');

        for (const user of testUsers) {
            user.password_hash = await hashPassword(user.password);
            delete user.password;
        }

        await User.insertMany(testUsers);
        console.log(`Successfully seeded ${testUsers.length} test users.`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Test-user seed failed:', error);
        process.exit(1);
    }
};

seedTestUsers();
