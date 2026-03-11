CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,

    reporter_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,

    reason VARCHAR(100) NOT NULL,
    description TEXT,

    status VARCHAR(20) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reporter
        FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reported_user
        FOREIGN KEY (reported_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT check_not_self_report CHECK (reporter_id <> reported_user_id),

    CONSTRAINT check_status
        CHECK (status IN ('pending','reviewed','resolved'))
);