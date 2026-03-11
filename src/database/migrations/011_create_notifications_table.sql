CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    type VARCHAR(30) NOT NULL,
    reference_id INTEGER,

    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_notification_type
        CHECK (type IN ('new_match','new_message','new_like'))
);

    CREATE INDEX idx_notification
    ON notifications(user_id)