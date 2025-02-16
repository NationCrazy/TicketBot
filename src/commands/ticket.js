const { SlashCommandBuilder, ChannelType, EmbedBuilder, ButtonBuilder, ButtonStyle, TextInputStyle } = require('discord.js');
const { ModalBuilder, TextInputBuilder, SelectMenuBuilder, ActionRowBuilder } = require('@discordjs/builders');

const ticketPanelModel = require('../models/ticketPanel');
const ticketsModel = require('../models/tickets');
const { query, dbType } = require('../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Setup the ticket system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new ticket panel')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('The channel where the ticket panel will be created')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a ticket panel.')
                .addStringOption(option =>
                    option
                        .setName('messageid')
                        .setDescription('The message ID of the ticket panel')
                        .setRequired(true)
                )
        )
        .addSubcommandGroup(group =>
            group
                .setName('category')
                .setDescription('Manage ticket categories')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('add')
                        .setDescription('Add a new ticket category')
                        .addStringOption(option =>
                            option
                                .setName('messageid')
                                .setDescription('The message ID of the ticket panel')
                                .setRequired(true)
                        )
                        .addChannelOption(option =>
                            option
                                .setName('category')
                                .setDescription('The category where the tickets will be created')
                                .setRequired(true)
                                .addChannelTypes(ChannelType.GuildCategory)
                        )
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('remove')
                        .setDescription('Remove a ticket category')
                        .addStringOption(option =>
                            option
                                .setName('messageid')
                                .setDescription('The message ID of the ticket panel')
                                .setRequired(true)
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a user to a ticket')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to add to the ticket')
                        .setRequired(true)
                )
        ),

    run: async (interaction, client) => {
        const subcommand = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup();

        if (group === 'category') {
            if (subcommand === 'add') {
                const messageId = interaction.options.getString('messageid');
                const category = interaction.options.getChannel('category');

                switch (dbType) {
                    case 'mongodb': {
                        const ticketPanel = await ticketPanelModel.findOne({ messageID: messageId });

                        if (!ticketPanel) {
                            await interaction.editReply({ content: 'Ticket panel not found', ephemeral: true });
                            return;
                        }

                        const modal = new ModalBuilder()
                            .setCustomId(`addTicketPanel_${messageId}_${category.id}`)
                            .setTitle('Add Category');

                        const descriptionInput = new TextInputBuilder()
                            .setCustomId('description')
                            .setLabel('Embed Description')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true);

                        const textInput = new TextInputBuilder()
                            .setCustomId('text')
                            .setLabel('Button Text')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const emojiInput = new TextInputBuilder()
                            .setCustomId('emoji')
                            .setLabel('Button Emoji')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const styleInput = new TextInputBuilder()
                            .setCustomId('style')
                            .setLabel('Button Style')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('PRIMARY, SECONDARY, SUCCESS, DANGER')
                            .setRequired(true);

                        const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
                        const textRow = new ActionRowBuilder().addComponents(textInput);
                        const emojiRow = new ActionRowBuilder().addComponents(emojiInput);
                        const styleRow = new ActionRowBuilder().addComponents(styleInput);

                        modal.addComponents(descriptionRow, textRow, emojiRow, styleRow);

                        await interaction.showModal(modal);
                        break;
                    }
                    default: {
                        const result = await query(`SELECT * FROM ticket_panels WHERE messageID = ? LIMIT 1`, [messageId]);

                        if (!result) {
                            await interaction.editReply({ content: 'Ticket panel not found', ephemeral: true });
                            return;
                        }

                        const modal = new ModalBuilder()
                            .setCustomId(`addTicketPanel_${messageId}_${category.id}`)
                            .setTitle('Add Category');

                        const descriptionInput = new TextInputBuilder()
                            .setCustomId('description')
                            .setLabel('Embed Description')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true);

                        const textInput = new TextInputBuilder()
                            .setCustomId('text')
                            .setLabel('Button Text')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const emojiInput = new TextInputBuilder()
                            .setCustomId('emoji')
                            .setLabel('Button Emoji')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true);

                        const styleInput = new TextInputBuilder()
                            .setCustomId('style')
                            .setLabel('Button Style')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('PRIMARY, SECONDARY, SUCCESS, DANGER')
                            .setRequired(true);

                        const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
                        const textRow = new ActionRowBuilder().addComponents(textInput);
                        const emojiRow = new ActionRowBuilder().addComponents(emojiInput);
                        const styleRow = new ActionRowBuilder().addComponents(styleInput);

                        modal.addComponents(descriptionRow, textRow, emojiRow, styleRow);

                        await interaction.showModal(modal);
                        break;
                    }
                }
            } else if (subcommand === 'remove') {
                await interaction.deferReply({ ephemeral: true });
                const messageId = interaction.options.getString('messageid');

                switch (dbType) {
                    case 'mongodb': {
                        const ticketPanel = await ticketPanelModel.findOne({ messageID: messageId });

                        if (!ticketPanel) {
                            await interaction.editReply({ content: 'Ticket panel not found', ephemeral: true });
                            return;
                        }

                        const embed = new EmbedBuilder()
                            .setColor(client.settings.embedColor)
                            .setTitle('Delete Ticket Category')
                            .setDescription('Choose a category to delete');

                        const menu = new SelectMenuBuilder()
                            .setCustomId(`deleteTicketCategory_${ticketPanel.uuid}`)
                            .setPlaceholder('Select a category')
                            .setMinValues(1)
                            .setMaxValues(1);

                        menu.addOptions(ticketPanel.categories.map(category => ({
                            label: category.text,
                            value: category.text,
                        })));

                        const row = new ActionRowBuilder().addComponents(menu);
                        await interaction.editReply({ embeds: [embed], components: [row] });
                        break;
                    }
                    default: {
                        const ticketPanel = await query('SELECT * FROM ticket_panels WHERE messageID = ?', [messageId]);

                        if (!ticketPanel) {
                            await interaction.editReply({ content: 'Ticket panel not found', ephemeral: true });
                            return;
                        }

                        const embed = new EmbedBuilder()
                            .setColor(client.settings.embedColor)
                            .setTitle('Delete Ticket Category')
                            .setDescription('Choose a category to delete');

                        const menu = new SelectMenuBuilder()
                            .setCustomId(`deleteTicketCategory_${ticketPanel.uuid}`)
                            .setPlaceholder('Select a category')
                            .setMinValues(1)
                            .setMaxValues(1);

                        const categories = JSON.parse(ticketPanel.categories || '[]');
                        menu.addOptions(categories.map(category => ({
                            label: category.text,
                            value: category.text,
                        })));

                        const row = new ActionRowBuilder().addComponents(menu);
                        await interaction.editReply({ embeds: [embed], components: [row] });
                        break;
                    }
                }
            }
        } else {
            switch (subcommand) {
                case 'create': {
                    const channel = interaction.options.getChannel('channel');

                    const modal = new ModalBuilder()
                        .setCustomId(`createTicketPanel_${channel.id}`)
                        .setTitle('Create Ticket Panel');

                    const titleInput = new TextInputBuilder()
                        .setCustomId('title')
                        .setLabel('Title of the ticket panel')
                        .setPlaceholder('Enter the title of the ticket panel')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short);

                    const descriptionInput = new TextInputBuilder()
                        .setCustomId('description')
                        .setLabel('Description of the ticket panel')
                        .setPlaceholder('Enter the description of the ticket panel')
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph);

                    const titleRow = new ActionRowBuilder().addComponents(titleInput);
                    const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);

                    modal.addComponents(titleRow, descriptionRow);

                    await interaction.showModal(modal);
                    break;
                }
                case 'delete': {
                    await interaction.deferReply({ ephemeral: true });
                    const messageId = interaction.options.getString('messageid');

                    switch (dbType) {
                        case 'mongodb': {
                            const ticketPanel = await ticketPanelModel.findOne({ messageID: messageId });

                            if (!ticketPanel) {
                                await interaction.editReply({ content: 'Ticket panel not found', ephemeral: true });
                                return;
                            }

                            const embed = new EmbedBuilder()
                                .setColor(client.settings.embedColor)
                                .setTitle('Ticket Panel Deletion')
                                .setDescription(`Are you sure you want to delete ${ticketPanel.title}?`);

                            const confirmButton = new ButtonBuilder()
                                .setCustomId(`confirmDeleteTicketPanel_${ticketPanel.uuid}`)
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🗑️');

                            const cancelButton = new ButtonBuilder()
                                .setCustomId(`cancelDeleteTicketPanel_${ticketPanel.uuid}`)
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('🚫');

                            const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

                            await interaction.editReply({ embeds: [embed], components: [row] });
                            break;
                        }
                        default: {
                            const ticketPanel = await query('SELECT * FROM ticket_panels WHERE messageId = ?', [messageId]);

                            if (!ticketPanel) {
                                await interaction.editReply({ content: 'Ticket panel not found', ephemeral: true });
                                return;
                            }

                            const embed = new EmbedBuilder()
                                .setColor(client.settings.embedColor)
                                .setTitle('Ticket Panel Deletion')
                                .setDescription(`Are you sure you want to delete ${ticketPanel.title}?`);

                            const confirmButton = new ButtonBuilder()
                                .setCustomId(`confirmDeleteTicketPanel_${ticketPanel.uuid}`)
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji('🗑️');

                            const cancelButton = new ButtonBuilder()
                                .setCustomId(`cancelDeleteTicketPanel_${ticketPanel.uuid}`)
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Secondary)
                                .setEmoji('🚫');

                            const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

                            await interaction.editReply({ embeds: [embed], components: [row] });
                            break;
                        }
                    }
                    break;
                }
                case 'add': {
                    await interaction.deferReply({ ephemeral: true });
                    const channel = interaction.channel;
                    const ticketID = channel.name.split('-')[1];

                    const user = interaction.options.getUser('user');

                    switch (dbType) {
                        case 'mongodb': {
                            const ticket = await ticketsModel.findOne({ uuid: ticketID });

                            if (!ticket) {
                                await interaction.editReply({ content: 'Ticket not found', ephemeral: true });
                                return;
                            }

                            await ticket.users.push(user.id);

                            await interaction.editReply({ content: `User added to ticket ${ticketID}`, ephemeral: true });
                            break;
                        }
                        default: {
                            const ticket = await query('SELECT * FROM tickets WHERE uuid = ?', [ticketID]);

                            if (!ticket) {
                                await interaction.editReply({ content: 'Ticket not found', ephemeral: true });
                                return;
                            }

                            await query('UPDATE tickets SET addedUsers = ? WHERE uuid = ?', [user.id, ticketID]);

                            await interaction.editReply({ content: `User added to ticket \`${ticketID}\``, ephemeral: true });
                            break;
                        }
                    }
                    break;
                }
            }
        }
    }
}