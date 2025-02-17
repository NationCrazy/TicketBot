CREATE TABLE IF NOT EXISTS tickets (
    uuid VARCHAR(255) NOT NULL PRIMARY KEY,
    createdBy VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    channelID VARCHAR(255) NOT NULL,
    addedUsers TEXT DEFAULT '[]',
    claimedBy VARCHAR(255),
    status VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tickets_uuid ON tickets(uuid);