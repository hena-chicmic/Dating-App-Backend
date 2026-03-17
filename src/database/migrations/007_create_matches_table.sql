CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,

    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user1
        FOREIGN KEY(user1_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user2
        FOREIGN KEY(user2_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_match UNIQUE(user1_id, user2_id),

    CONSTRAINT check_different_users CHECK (user1_id <> user2_id)

   
);

    CREATE INDEX IF NOT EXISTS idx_matches_user1
    ON matches(user1_id);

    CREATE INDEX IF NOT EXISTS idx_matches_user2
    ON matches(user2_id);