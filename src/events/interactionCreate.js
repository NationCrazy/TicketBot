const { log } = require('../utils/logger');

const fs = require('fs');
const path = require('path');

const buttonHandlers = new Map();
const buttonFiles = fs.readdirSync(path.join(__dirname, '../interactions/buttons')).filter(file => file.endsWith('.js'));
for (const file of buttonFiles) {
    const button = require(`../interactions/buttons/${file}`);
    buttonHandlers.set(button.customId, button);
    log.info(`Loaded Button: ${button.customId}`, 'info');
}

const selectMenuHandlers = new Map();
const selectMenuFiles = fs.readdirSync(path.join(__dirname, '../interactions/selectMenus')).filter(file => file.endsWith('.js'));
for (const file of selectMenuFiles) {
    const menu = require(`../interactions/selectMenus/${file}`);
    selectMenuHandlers.set(menu.customId, menu);
    log.info(`Loaded Select Menu: ${menu.customId}`, 'info');
}

const modalHandlers = new Map();
const modalFiles = fs.readdirSync(path.join(__dirname, '../interactions/modals')).filter(file => file.endsWith('.js'));
for (const file of modalFiles) {
    const modal = require(`../interactions/Modals/${file}`);
    modalHandlers.set(modal.customId, modal);
    log.info(`Loaded Modal: ${modal.customId}`, 'info');
}

module.exports = (client) => {
    client.on("interactionCreate", async (interaction) => {

        if (interaction.isButton()) {
            const [baseId] = interaction.customId.split('_');
            const handler = buttonHandlers.get(baseId);
            if (handler) {
                await handler.run(client, interaction);
            }
        }

        if (interaction.isStringSelectMenu()) {
            const handler = selectMenuHandlers.get(interaction.customId);
            if (handler) {
                await handler.run(client, interaction);
            }
        }

        if (interaction.isModalSubmit()) {
            const handler = modalHandlers.get(interaction.customId);
            if (handler) {
                await handler.run(client, interaction);
            }
        }

        if (interaction.isCommand()) {
            if (!client.settings.roles) {
                return interaction.reply({ content: 'No roles set in permission. Set them in the config.', ephemeral: true });
            }
        
            const user = interaction.user;
            const guild = client.guilds.cache.get(process.env.GUILD_ID);
            const roleIds = client.settings.roles;
            const roles = await Promise.all(roleIds.map(id => guild.roles.fetch(id)));
            const role = roles.map(role => role.id);
            const member = await guild.members.fetch(user.id);
            const commandName = interaction.commandName;
        
            if (!member.roles.cache.has(role[0])) {
                return interaction.reply({ content: 'You do not have the correct roles for this command.', ephemeral: true });
            }
        
            const command = client.slashCommands.get(interaction.commandName);
            if (!command) {
                return interaction.reply({ content: "Invalid command", ephemeral: true });
            }
        
            if (client.settings.commandPerms[commandName] && client.settings.commandPerms[commandName]) {
                const requiredRoles = client.settings.commandPerms[commandName];
                const hasPermission = requiredRoles.some(roleId => member.roles.cache.has(roleId));
        
                if (!hasPermission) {
                    return interaction.reply({ content: 'You do not have the correct roles for this command.', ephemeral: true });
                }
            }
            try {
                await interaction.deferReply({ ephemeral: true });
                await command.run(client, interaction, interaction.options.data);
            } catch (error) {
                await log(`[Slash] ${interaction.user.tag} used ${interaction.commandName} which caused an error ${error}`, 'error')
                await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    });
}