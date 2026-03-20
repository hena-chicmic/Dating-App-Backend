
CREATE TABLE call_logs (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    caller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'initiated', 
    duration INTEGER DEFAULT 0, 
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX idx_call_logs_match_id ON call_logs(match_id);
CREATE INDEX idx_call_logs_caller_id ON call_logs(caller_id);
CREATE INDEX idx_call_logs_receiver_id ON call_logs(receiver_id);
