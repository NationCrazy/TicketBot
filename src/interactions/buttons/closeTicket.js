const ticketsModel = require('../../models/tickets');
const { query, dbType } = require('../../utils/database');

module.exports = {
    id: 'closeTicket',

    run: async (interaction, client) => {
        const ticketId = interaction.customId.split('_')[1];

        switch (dbType) {
            case 'mongodb': {
                const ticket = await ticketsModel.findOne({ ticketId });

                if (!ticket) {
                    await interaction.reply({ content: 'Ticket not found', ephemeral: true });
                    return;
                }

                await ticket.updateOne({
                    status: 'CLOSED',
                });

                const ticketChannel = await interaction.guild.channels.fetch(ticket.channelID);

                await ticketChannel.delete();

                const user = await interaction.guild.members.fetch(ticket.createdBy);

                await user.send({
                    content: `Your ticket has been closed.`,
                });
            }
                break;
            default: {
                const ticket = await query('SELECT * FROM tickets WHERE uuid = ?', [ticketId]);

                if (!ticket) {
                    await interaction.reply({ content: 'Ticket not found', ephemeral: true });
                    return;
                }

                await query('UPDATE tickets SET status = "CLOSED" WHERE uuid = ?', [ticketId])

                const ticketChannel = await interaction.guild.channels.fetch(ticket.channelID);

                await ticketChannel.delete();

                const user = await interaction.guild.members.fetch(ticket.createdBy);

                await user.send({
                    content: `Your ticket has been closed.`,
                });
            }
        }
    }
}