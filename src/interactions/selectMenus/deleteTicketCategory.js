const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const ticketPanelModel = require('../../models/ticketPanel');
const { query, dbType } = require('../../utils/database');

module.exports = {
    id: 'deleteTicketCategory',

    run: async (interaction, client) => {
        const ticketPanelUuid = interaction.customId.split('_')[1];
        const category = interaction.values[0]

        switch (dbType) {
            case 'mongodb': {
                const ticketPanel = await ticketPanelModel.findOne({ uuid: ticketPanelUuid });

                if (!ticketPanel) {
                    await interaction.reply({ content: 'Ticket panel not found', ephemeral: true });
                    return;
                }

                const updatedCategories = ticketPanel.categories.filter(c => c.text !== category);
                ticketPanel.categories = updatedCategories;
                await ticketPanel.save();

                const message = await interaction.channel.messages.fetch(ticketPanel.messageID);

                const buttons = updatedCategories.map(category => {
                    const buttonStyle = ButtonStyle[category.style.charAt(0) + category.style.slice(1).toLowerCase()];
                    return new ButtonBuilder()
                        .setCustomId(`createTicket_${category.id}`)
                        .setLabel(category.text)
                        .setEmoji(category.emoji)
                        .setStyle(buttonStyle);
                });

                const embed = message.embeds[0];
                const row = new ActionRowBuilder();
                if (buttons.length > 0) {
                    row.addComponents(buttons);
                    await message.edit({ embeds: [embed], components: [row] });
                } else {
                    await message.edit({ embeds: [embed], components: [] });
                }
                await interaction.update({ embeds: [], components: [], content: `Category \`${category}\` deleted from ticket panel \`${ticketPanel.uuid}\``, ephemeral: true });
                break;
            }
            default: {
                const ticketPanel = await query('SELECT * FROM ticket_panels WHERE uuid = ?', [ticketPanelUuid]);

                if (!ticketPanel) {
                    await interaction.reply({ content: 'Ticket panel not found', ephemeral: true });
                    return;
                }

                const categories = JSON.parse(ticketPanel.categories);
                const updatedCategories = categories.filter(c => c.text !== category);

                await query('UPDATE ticket_panels SET categories = ? WHERE uuid = ?', [JSON.stringify(updatedCategories), ticketPanelUuid]);

                const message = await interaction.channel.messages.fetch(ticketPanel.messageID);

                const buttons = updatedCategories.map(category => {
                    const buttonStyle = ButtonStyle[category.style.charAt(0) + category.style.slice(1).toLowerCase()];
                    return new ButtonBuilder()
                        .setCustomId(`createTicket_${category.id}`)
                        .setLabel(category.text)
                        .setEmoji(category.emoji)
                        .setStyle(buttonStyle);
                });

                const embed = message.embeds[0];
                const row = new ActionRowBuilder();
                if (buttons.length > 0) {
                    row.addComponents(buttons);
                    await message.edit({ embeds: [embed], components: [row] });
                } else {
                    await message.edit({ embeds: [embed], components: [] });
                }
                await interaction.update({ embeds: [], components: [], content: `Category \`${category}\` deleted from ticket panel \`${ticketPanel.uuid}\``, ephemeral: true });
            }
        }
    }
}