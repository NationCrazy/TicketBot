require("dotenv").config();
const mongoose = require("mongoose");
const mysql = require("mysql2/promise");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbType = process.env.DB_TYPE || "sqlite";
let db;

const log = require("./log");

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

async function executeSQLFiles(dbInstance) {
    const schemaPath = path.join(__dirname, "/../", "models");
    const sqlFiles = fs.readdirSync(schemaPath).filter(file => file.endsWith(".sql"));

    for (const file of sqlFiles) {
        const sql = fs.readFileSync(path.join(schemaPath, file), "utf-8");
        if (dbType === "mysql") await dbInstance.execute(sql);
        else dbInstance.run(sql);
    }
}

async function connectDB() {
    if (dbType === "mongodb") {
        await mongoose.connect(process.env.MONGO_URI);
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
        db = new sqlite3.Database(path.join(dataDir, 'db.sqlite'), (err) => {
            if (err) console.error(err.message);
            else log.info("✅ Connected to SQLite");
        });
        executeSQLFiles(db);
    } else {
        log.error("❌ Invalid database type");
    }
}

async function query(sql, params) {
    if (dbType === 'mysql') {
        return await db.execute(sql, params);
    } else if (dbType === 'sqlite') {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }
}

module.exports = { connectDB, dbType, query };
connectDB();