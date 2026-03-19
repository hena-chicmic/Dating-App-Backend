CREATE TABLE IF NOT EXISTS interactions (

    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    target_user_id INTEGER NOT NULL,

    action TEXT NOT NULL CHECK (
        action IN ('like','dislike')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_interaction_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_interaction_target
        FOREIGN KEY(target_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_interaction
        UNIQUE(user_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_interactions_user
ON interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_interactions_target
ON interactions(target_user_id);
