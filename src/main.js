const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    EmbedBuilder,
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember
    ],
});

client.slashCommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.modals = new Collection();

const settings = require('../settings.json');
client.settings = settings;

const commandsHandler = require('./handlers/commands');
commandsHandler(client);
const eventsHandler = require('./handlers/events');
eventsHandler(client);

client.login(process.env.DISCORD_TOKEN);

module.exports = client;