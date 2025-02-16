const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const uuid = require('uuid');

const ticketsModel = require('../../models/tickets');
const { query, dbType } = require('../../utils/database');


module.exports = {
    id: 'createTicket',

    run: async (interaction, client) => {
        const categoryID = interaction.customId.split('_')[1];

        switch (dbType) {
            case 'mongodb': {
                const ticketPanel = await ticketPanelModel.findOne({ messageID: interaction.message.id });

                if (!ticketPanel) {
                    await interaction.reply({ content: 'Ticket panel not found', ephemeral: true });
                    return;
                }

                const categories = JSON.parse(ticketPanel.categories);
                const category = categories.find(cat => cat.id === categoryID);

                const ticketId = uuid.v4().substring(0, 8);

                const ticketChannel = await interaction.guild.channels.create({
                    type: ChannelType.GuildText,
                    name: `${category.text}-${ticketId}`,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: client.settings.supportRole,
                            allow: ['ViewChannel'],
                        },
                        {
                            id: interaction.member.user.id,
                            allow: ['ViewChannel'],
                        },
                    ]
                });

                await ticketsModel.create({
                    uuid: ticketId,
                    createdBy: interaction.member.user.id,
                    category: category.text,
                    channelID: ticketChannel.id,
                    status: 'OPEN',
                });

                const embed = new EmbedBuilder()
                    .setTitle(`${category.text} Ticket`)
                    .setDescription(`Welcome to your ticket, ${interaction.member.user}!\n\nA staff member will be with you shortly.\n\n${category.description}`)
                    .setColor(client.settings.embedColor)
                    .setTimestamp()
                    .setFooter({ text: `Ticket ID: ${ticketId}` });

                const claimButton = new ButtonBuilder()
                    .setCustomId(`claimTicket_${ticketId}`)
                    .setLabel('Claim Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Success);

                const closeButton = new ButtonBuilder()
                    .setCustomId(`closeTicket_${ticketId}`)
                    .setLabel('Close Ticket')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder()

                await ticketChannel.send({
                    content: `<@${interaction.member.user.id}>`,
                    embeds: [embed],
                    components: [row.addComponents(claimButton, closeButton)],
                });

                await interaction.reply({ content: `Ticket Created <#${ticketChannel.id}>`, ephemeral: true });
                break;
            }
            default: {
                const ticketPanel = await query('SELECT * FROM ticket_panels WHERE messageID = ?', [interaction.message.id]);

                if (!ticketPanel) {
                    await interaction.reply({ content: 'Ticket panel not found', ephemeral: true });
                    return;
                }

                const categories = JSON.parse(ticketPanel.categories);
                const category = categories.find(cat => cat.id === categoryID);

                const ticketId = uuid.v4().substring(0, 8);

                const ticketChannel = await interaction.guild.channels.create({
                    type: ChannelType.GuildText,
                    name: `${category.text}-${ticketId}`,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.roles.everyone.id,
                            deny: ['ViewChannel'],
                        },
                        {
                            id: client.settings.supportRole,
                            allow: ['ViewChannel'],
                        },
                        {
                            id: interaction.member.user.id,
                            allow: ['ViewChannel'],
                        },
                    ]
                });

                await query(`INSERT INTO tickets (uuid, createdBy, category, channelID, status) VALUES (?, ?, ?, ?, ?)`,
                    [ticketId, interaction.member.user.id, category.text, ticketChannel.id, 'OPEN']);

                const embed = new EmbedBuilder()
                    .setTitle(`${category.text} Ticket`)
                    .setDescription(`Welcome to your ticket, ${interaction.member.user}!\n\nA staff member will be with you shortly.\n\n${category.description}`)
                    .setColor(client.settings.embedColor)
                    .setTimestamp()
                    .setFooter({ text: `Ticket ID: ${ticketId}` });

                const claimButton = new ButtonBuilder()
                    .setCustomId(`claimTicket_${ticketId}`)
                    .setLabel('Claim Ticket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Success);

                const closeButton = new ButtonBuilder()
                    .setCustomId(`closeTicket_${ticketId}`)
                    .setLabel('Close Ticket')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Danger);

                const row = new ActionRowBuilder()

                await ticketChannel.send({
                    content: `<@${interaction.member.user.id}>`,
                    embeds: [embed],
                    components: [row.addComponents(claimButton, closeButton)],
                });

                await interaction.reply({ content: `Ticket Created <#${ticketChannel.id}>`, ephemeral: true });
                break;
            }
        }
    }
}