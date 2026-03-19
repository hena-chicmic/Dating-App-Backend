CREATE TABLE IF NOT EXISTS user_media (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    media_url TEXT NOT NULL,

    media_type TEXT CHECK (
        media_type IN ('image','video')
    ),

    is_primary BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_media_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_media_user
ON user_media(user_id);
