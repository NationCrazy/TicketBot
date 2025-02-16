module.exports = {
    id: 'cancelDeleteTicketPanel',

    run: async (interaction, client) => {
        await interaction.update({ content: 'Ticket panel deletion cancelled.', ephemeral: true });
    }
}