-- Migration: 004_create_user_interests_table
-- Description: create mapping table between users and interests

CREATE TABLE IF NOT EXISTS user_interests (

    user_id INTEGER NOT NULL,

    interest_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_interest
        FOREIGN KEY(interest_id)
        REFERENCES interests(id)
        ON DELETE CASCADE,

    PRIMARY KEY (user_id, interest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user
ON user_interests(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interests_interest
ON user_interests(interest_id);