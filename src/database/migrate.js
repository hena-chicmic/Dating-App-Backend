const fs = require('fs');
const path = require('path');
require('../config/env');
const pool = require('../config/db');

const migrate = async () => {
    try {
        console.log('Starting Database Migrations...');
        
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Sorts files alphabetically (001, 002, etc)

        for (const file of files) {
            console.log(`Applying migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            
            // Execute the raw SQL from the file
            await pool.query(sql);
            console.log(`Successfully applied: ${file}`);
        }

        console.log('All migrations executed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
