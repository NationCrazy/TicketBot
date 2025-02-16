const ticketsModel = require('../../models/tickets');
const { query, dbType } = require('../../utils/database');

module.exports = {
    id: 'claimTicket',

    run: async (interaction, client) => {
        const ticketId = interaction.customId.split('_')[1];

        switch (dbType) {
            case 'mongodb': {
                const ticket = await ticketsModel.findOne({ uuid: ticketId });

                if (!ticket) {
                    await interaction.reply({ content: 'Ticket not found', ephemeral: true });
                    return;
                }

                if (ticket.claimedBy) {
                    await interaction.reply({ content: 'Ticket already claimed', ephemeral: true });
                    return;
                }

                await ticketsModel.updateOne({ ticketId }, { claimedBy: interaction.user.id });

                const ticketChannel = await interaction.guild.channels.cache.get(ticket.channelID);

                await ticketChannel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: false });
                await ticketChannel.permissionOverwrites.edit(client.settings.supportRole, { ViewChannel: false });
                await ticketChannel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });

                await interaction.reply({ content: 'Ticket claimed', ephemeral: true });
            }
            break;
            default: {

                const ticket = await query('SELECT * FROM tickets WHERE uuid = ?', [ticketId]);

                if (!ticket) {
                    await interaction.reply({ content: 'Ticket not found', ephemeral: true });
                    return;
                }

                if (ticket.claimedBy) {
                    await interaction.reply({ content: 'Ticket already claimed', ephemeral: true });
                    return;
                }

                await query('UPDATE tickets SET claimedBy = ? WHERE uuid = ?', [interaction.user.id, ticketId]);

                const ticketChannel = await interaction.guild.channels.cache.get(ticket.channelID);

                await ticketChannel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: false });
                await ticketChannel.permissionOverwrites.edit(client.settings.supportRole, { ViewChannel: false });
                await ticketChannel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });

                await interaction.reply({ content: 'Ticket claimed', ephemeral: true });
            }
        }
    }
}