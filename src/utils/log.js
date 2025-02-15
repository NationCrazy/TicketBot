const chalk = require('chalk');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

const styles = {
    info: chalk.bold.blue.inverse,
    error: chalk.bold.red.inverse,
    warn: chalk.bold.yellow.inverse,
    success: chalk.bold.green.inverse,
    debug: chalk.bold.magenta.inverse
};

const logPath = path.join(__dirname, '..', '..', 'logs');

if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
}

const getLogFileName = () => {
    const baseFileName = `log-${moment().format('MM-DD-YYYY')}`;
    let counter = 1;
    let fileName;

    do {
        fileName = `${baseFileName}-${counter}.log`;
        counter++;
    } while (fs.existsSync(path.join(logPath, fileName)));

    return fileName;
};

const logFile = path.join(logPath, getLogFileName());

if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
}

const log = {
    info: (message) => {
        const type = 'info';
        const logMessage = `${moment().format('MM-DD-YYYY - mm:HH:ss')} ${type.toUpperCase()} ${message}\n`;

        console.log(chalk.bold.inverse(moment().format('MM-DD-YYYY - mm:HH:ss')) + ' ' + `${styles[type](' ' + type.toUpperCase() + ' ')}` + ' ' + message);

        fs.appendFileSync(logFile, logMessage);
    },
    error: (message) => {
        const type = 'error';
        const logMessage = `${moment().format('MM-DD-YYYY - mm:HH:ss')} ${type.toUpperCase()} ${message}\n`;

        console.log(chalk.bold.inverse(moment().format('MM-DD-YYYY - mm:HH:ss')) + ' ' + `${styles[type](' ' + type.toUpperCase() + ' ')}` + ' ' + message);

        fs.appendFileSync(logFile, logMessage);
    },
    warn: (message) => {
        const type = 'warn';
        const logMessage = `${moment().format('MM-DD-YYYY - mm:HH:ss')} ${type.toUpperCase()} ${message}\n`;

        console.log(chalk.bold.inverse(moment().format('MM-DD-YYYY - mm:HH:ss')) + ' ' + `${styles[type](' ' + type.toUpperCase() + ' ')}` + ' ' + message);
        fs.appendFileSync(logFile, logMessage);
    },
    success: (message) => {
        const type = 'success';
        const logMessage = `${moment().format('MM-DD-YYYY - mm:HH:ss')} ${type.toUpperCase()} ${message}\n`;

        console.log(chalk.bold.inverse(moment().format('MM-DD-YYYY - mm:HH:ss')) + ' ' + `${styles[type](' ' + type.toUpperCase() + ' ')}` + ' ' + message);

        fs.appendFileSync(logFile, logMessage);
    },
    debug: (message) => {
        const type = 'debug';
        const logMessage = `${moment().format('MM-DD-YYYY - mm:HH:ss')} ${type.toUpperCase()} ${message}\n`;

        console.log(chalk.bold.inverse(moment().format('MM-DD-YYYY - mm:HH:ss')) + ' ' + `${styles[type](' ' + type.toUpperCase() + ' ')}` + ' ' + message);

        fs.appendFileSync(logFile, logMessage);
    }
}
module.exports = log;