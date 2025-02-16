const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const ticketPanelModel = require('../../models/ticketPanel');
const { query, dbType } = require('../../utils/database');

module.exports = {
    id: 'addTicketPanel',

    run: async (interaction, client) => {
        const ticketPanelMSGID = interaction.customId.split('_').slice(1, -1).join('_');
        const categoryID = interaction.customId.split('_').pop();

        const description = interaction.fields.getTextInputValue('description');
        const text = interaction.fields.getTextInputValue('text');
        const emoji = interaction.fields.getTextInputValue('emoji');
        const style = interaction.fields.getTextInputValue('style');

        if (style != 'PRIMARY' && style != 'SECONDARY' && style != 'SUCCESS' && style != 'DANGER' && style.includes(' ')) {
            await interaction.reply({ content: 'Invalid style', ephemeral: true });
            return;
        }

        switch (dbType) {
            case 'mongodb': {
                const ticketPanel = await ticketPanelModel.findOne({ messageID: ticketPanelMSGID });

                if (!ticketPanel) {
                    await interaction.reply({ content: 'Ticket panel not found', ephemeral: true });
                    return;
                }

                ticketPanel.categories.push({
                    id: categoryID,
                    description,
                    text,
                    emoji,
                    style
                });
                await ticketPanel.save();

                const message = await interaction.channel.messages.fetch(ticketPanel.messageID);

                const buttons = ticketPanel.categories.map((category, index) => {
                    const buttonStyle = ButtonStyle[category.style.charAt(0) + category.style.slice(1).toLowerCase()];
                    return new ButtonBuilder()
                        .setCustomId(`createTicket_${category.id}_${index}`)  // Added index to make each ID unique
                        .setLabel(category.text)
                        .setEmoji(category.emoji)
                        .setStyle(buttonStyle);
                }); 

                const row = new ActionRowBuilder().addComponents(buttons);

                await message.edit({ embeds: [ticketPanel.embed], components: [row] });
                break;
            }
            default: {
                const currentPanel = await query(`SELECT categories FROM ticket_panels WHERE messageID = ?`, [ticketPanelMSGID]);

                const categories = JSON.parse(currentPanel.categories || '[]');

                categories.push({
                    id: categoryID,
                    description,
                    text: text,
                    emoji: emoji,
                    style: style
                });

                await query(`UPDATE ticket_panels SET categories = ? WHERE messageID = ?`, 
                    [JSON.stringify(categories), ticketPanelMSGID]);

                const result = await query(`SELECT * FROM ticket_panels WHERE messageID = ?`, [ticketPanelMSGID]);
            
                const message = await interaction.channel.messages.fetch(result.messageID);
                
                const buttons = categories.map((category, index) => {
                    const buttonStyle = ButtonStyle[category.style.charAt(0) + category.style.slice(1).toLowerCase()];
                    return new ButtonBuilder()
                        .setCustomId(`createTicket_${category.id}`)
                        .setLabel(category.text)
                        .setEmoji(category.emoji)
                        .setStyle(buttonStyle);
                });
            
                const row = new ActionRowBuilder().addComponents(buttons);
                const embed = JSON.parse(result.embed);
            
                await message.edit({ embeds: [embed], components: [row] });
                await interaction.reply({ content: 'Panel updated successfully!', ephemeral: true });
                break;
            }
        }
    }
}