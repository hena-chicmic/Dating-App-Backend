-- Migration: 002_create_user_profiles_table
-- Description: create user_profiles table

CREATE TABLE IF NOT EXISTS user_profiles (

    id SERIAL PRIMARY KEY,

    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    height INTEGER CHECK (height > 0),

    location_city TEXT,

    location_country TEXT,

    latitude DOUBLE PRECISION,

    longitude DOUBLE PRECISION,

    profile_photo_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id
ON user_profiles(user_id);