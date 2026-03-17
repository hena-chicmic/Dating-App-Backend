CREATE TABLE IF NOT EXISTS messages (

    id SERIAL PRIMARY KEY,

    match_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,

    message_text TEXT,

    media_url TEXT,
    media_type TEXT CHECK (
        media_type IN ('image','video','audio','file')
    ),

    is_read BOOLEAN DEFAULT FALSE,

    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_match
        FOREIGN KEY(match_id)
        REFERENCES matches(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_sender
        FOREIGN KEY(sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_match
ON messages(match_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender
ON messages(sender_id);