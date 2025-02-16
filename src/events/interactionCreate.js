const log = require('../utils/log');

const fs = require('fs');
const path = require('path');

const buttonHandlers = new Map();
const buttonFiles = fs.readdirSync(path.join(__dirname, '../interactions/buttons')).filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
    const button = require(`../interactions/buttons/${file}`);
    buttonHandlers.set(button.id, button);
    log.info(`Loaded Button: ${button.id}`, 'info');
}

const selectMenuHandlers = new Map();
const selectMenuFiles = fs.readdirSync(path.join(__dirname, '../interactions/selectMenus')).filter(file => file.endsWith('.js'));
for (const file of selectMenuFiles) {
    const menu = require(`../interactions/selectMenus/${file}`);
    selectMenuHandlers.set(menu.id, menu);
    log.info(`Loaded Select Menu: ${menu.id}`, 'info');
}

const modalHandlers = new Map();
const modalFiles = fs.readdirSync(path.join(__dirname, '../interactions/modals')).filter(file => file.endsWith('.js'));
for (const file of modalFiles) {
    const modal = require(`../interactions/Modals/${file}`);
    modalHandlers.set(modal.id, modal);
    log.info(`Loaded Modal: ${modal.id}`, 'info');
}

module.exports = (client) => {
    client.on("interactionCreate", async (interaction) => {

        if (interaction.isButton()) {
            const baseId = interaction.customId.split('_')[0];
            const handler = buttonHandlers.get(baseId);
            if (handler) {
                const member = interaction.member;
                const role = client.settings.perms.buttons[baseId];

                if (role && !member.roles.cache.has(role)) {
                    return interaction.reply({ content: "You don't have permission to use this button.", ephemeral: true });
                }

                await handler.run(interaction, client);
            }
        }

        if (interaction.isStringSelectMenu()) {
            const baseId = interaction.customId.split('_')[0];
            const handler = selectMenuHandlers.get(baseId);
            if (handler) {
                await handler.run(interaction, client);
            }
        }

        if (interaction.isModalSubmit()) {
            const baseId = interaction.customId.split('_')[0];
            const handler = modalHandlers.get(baseId);
            if (handler) {
                await handler.run(interaction, client);
            }
        }
        
        if (interaction.isCommand()) {
            const command = client.slashCommands.get(interaction.commandName);
            if (!command) {
                return interaction.reply({ content: "Invalid command", ephemeral: true });
            }
        
            try {
                const member = interaction.member;
                const role = client.settings.perms.commands[interaction.commandName];

                if (role && !member.roles.cache.has(role)) {
                    return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
                }

                await command.run(interaction, client);
            } catch (error) {
                log.error(`An error occured when running ${interaction.commandName} executed by ${interaction.user.tag}:\n${error}`);
            }
        }
    });
}