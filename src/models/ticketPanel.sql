CREATE TABLE IF NOT EXISTS ticket_panels (
    uuid VARCHAR(255) NOT NULL PRIMARY KEY,
    messageID VARCHAR(255) NOT NULL,
    channelID VARCHAR(255) NOT NULL,
    embed TEXT NOT NULL,
    categories TEXT DEFAULT '[]',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);