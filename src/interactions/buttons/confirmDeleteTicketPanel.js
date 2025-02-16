const ticketPanelModel = require('../../models/ticketPanel');
const { query, dbType } = require('../../utils/database');

module.exports = {
    id: 'confirmDeleteTicketPanel',

    run: async (interaction, client) => {
        const ticketUUID = interaction.customId.split('_')[1];

        switch (dbType) {
            case 'mongodb': {
                const ticketPanel = await ticketPanelModel.findOne({ uuid: ticketUUID });

                if (!ticketPanel) {
                    await interaction.update({ content: 'Ticket Panel not found', ephmeral: true });
                    return;
                }

                await ticketPanelModel.deleteOne({ uuid: ticketUUID })

                try {
                    const message = await interaction.channel.messages.fetch(ticketPanel.messageID);
                    if (message) await message.delete();
                } catch (error) {
                    // Ignore any errors when fetching or deleting the message
                }

                await interaction.update({ embeds: [], components: [], content: 'Ticket Panel Deleted', ephmeral: true });
                break;
            }
            default: {
                const ticketPanel = await query('SELECT * FROM ticket_panels WHERE uuid = ?', [ticketUUID]);
                
                if (!ticketPanel) {
                    await interaction.update({ content: 'Ticket Panel not found', ephmeral: true });
                    return;
                }

                try {
                    const message = await interaction.channel.messages.fetch(ticketPanel[0].messageId);
                    if (message) await message.delete();
                } catch (error) {
                    // Ignore any errors when fetching or deleting the message
                }

                await query('DELETE FROM ticket_panels WHERE uuid = ?', [ticketUUID]);

                await interaction.update({ embeds: [], components: [], content: 'Ticket Panel Deleted', ephmeral: true });
            }
        }
    }
}