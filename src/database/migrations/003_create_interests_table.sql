-- Migration: 003_create_interests_table
-- Description: create interests master table

CREATE TABLE IF NOT EXISTS interests (

    id SERIAL PRIMARY KEY,

    name TEXT UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);