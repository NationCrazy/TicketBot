const { EmbedBuilder } = require('discord.js');
const uuid = require('uuid');

const ticketPanelModel = require('../../models/ticketPanel');
const { query, dbType } = require('../../utils/database');

module.exports = {
    id: 'createTicketPanel',

    run: async (interaction, client) => {
        const channelId = interaction.customId.split('_')[1];

        const name = interaction.fields.getTextInputValue('title');
        const description = interaction.fields.getTextInputValue('description');

        const channel = client.channels.cache.get(channelId);

        if (!channel) {
            await interaction.reply({ content: 'Channel not found', ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(name)
            .setDescription(description)
            .setColor(client.settings.embedColor);

        const message = await channel.send({ embeds: [embed] });

        switch (dbType) {
            case 'mongodb': {
                await ticketPanelModel.create({
                    uuid: uuid.v4(),
                    messageID: message.id,
                    channelID: channelId,
                    embed: embed,
                    categories: []
                });

                await interaction.reply({ content: 'Ticket panel created', ephemeral: true });
                break;
            }
            default: {
                await query('INSERT INTO ticket_panels (uuid, messageID, channelID, embed, categories) VALUES (?, ?, ?, ?, ?)',
                    [uuid.v4(), message.id, channelId, JSON.stringify(embed), '[]']
                );

                await interaction.reply({ content: 'Ticket panel created', ephemeral: true });
                break;
            }
        }
    }
}