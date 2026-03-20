CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL UNIQUE,

    OTPtoken INTEGER NOT NULL,

    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '15 minutes'),
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_email_verification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
