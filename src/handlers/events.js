const fs = require('fs');

const log = require('../utils/log');

module.exports = (client) => {
    fs.readdirSync('./src/events').filter((file) => file.endsWith('.js')).forEach((event) => {
        const eventModule = require(`../events/${event}`);
        if (typeof eventModule === 'function') {
            eventModule(client);
        } else if (eventModule.execute) {
            client.on(event.split('.')[0], (...args) => eventModule.execute(...args, client));
        }
    });
    log.info('Events loaded');
}