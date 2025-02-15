require("dotenv").config();
const mongoose = require("mongoose");
const mysql = require("mysql2/promise");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbType = process.env.DB_TYPE || "sqlite";
let db;

const log  = require("./log");

async function executeSQLFiles(dbInstance) {
    const schemaPath = path.join(__dirname, "models");
    const sqlFiles = fs.readdirSync(schemaPath).filter(file => file.endsWith(".sql"));

    for (const file of sqlFiles) {
        const sql = fs.readFileSync(path.join(schemaPath, file), "utf-8");
        // log.info(`📂 Executing ${file}...`);
        if (dbType === "mysql") await dbInstance.execute(sql);
        else dbInstance.run(sql);
    }
}

async function connectDB() {
    if (dbType === "mongodb") {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        log.info("✅ Connected to MongoDB");
        db = mongoose;
    } else if (dbType === "mysql") {
        db = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });
        log.info("✅ Connected to MySQL");
        await executeSQLFiles(db);
    } else if (dbType === "sqlite") {
        db = new sqlite3.Database('../data/db.sqlite', (err) => {
            if (err) console.error(err.message);
            else log.info("✅ Connected to SQLite");
        });
        executeSQLFiles(db);
    } else {
        log.error("❌ Invalid database type");
    }
}

module.exports = { connectDB, db, dbType };