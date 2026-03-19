CREATE TABLE IF NOT EXISTS users (

    id SERIAL PRIMARY KEY,

    email TEXT UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    username TEXT NOT NULL,

    date_of_birth DATE NOT NULL,

    gender TEXT CHECK (
        gender IN ('male','female','others')
    ),

    interested_in TEXT CHECK (
        interested_in IN ('male','female','both')
    ),

    min_preferred_age INTEGER DEFAULT 18 CHECK (
        min_preferred_age >= 18
    ),

    max_preferred_age INTEGER DEFAULT 50 CHECK (
        max_preferred_age >= min_preferred_age
    ),

    bio TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    is_verified BOOLEAN DEFAULT FALSE,

    is_banned BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (
        date_of_birth <= CURRENT_DATE - INTERVAL '18 years'
    )

);
