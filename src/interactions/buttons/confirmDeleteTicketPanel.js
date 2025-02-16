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

                const message = await interaction.channel.messages.fetch(ticketPanel.messageId).catch(() => null);
                if (message) await message.delete().catch(() => null);

                await interaction.update({ content: 'Ticket Panel Deleted', ephmeral: true });
                break;
            }
            default: {
                const ticketPanel = await query('SELECT * FROM ticket_panels WHERE uuid = ?', [ticketUUID]);
                
                if (!ticketPanel) {
                    await interaction.update({ content: 'Ticket Panel not found', ephmeral: true });
                    return;
                }

                const message = await interaction.channel.messages.fetch(ticketPanel[0].messageId).catch(() => null);
                if (message) await message.delete().catch(() => null);

                await query('DELETE FROM ticket_panels WHERE uuid = ?', [ticketUUID]);

                await interaction.update({ content: 'Ticket Panel Deleted', ephmeral: true });
            }
        }
    }
}