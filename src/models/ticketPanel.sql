CREATE TABLE IF NOT EXISTS ticketPanel (
    uuid VARCHAR(255) NOT NULL,
    channelID VARCHAR(255) NOT NULL,
    embed JSON NOT NULL,
    categories JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uuid),
    INDEX (uuid)
);