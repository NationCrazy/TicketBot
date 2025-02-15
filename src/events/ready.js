const log = require('../utils/log');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        log.success(`Logged in as ${client.user.tag}!`);
    },
}