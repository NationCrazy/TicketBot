const glob = require("glob");
const { promisify } = require("util");
const globPromise = promisify(glob);
const dotenv = require('dotenv');
dotenv.config();

const log = require('../utils/log');

module.exports = async (client) => {
    const slashCommands = await globPromise(`${process.cwd()}/src/commands/*.js`);
    const arrayOfSlashCommands = [];

    slashCommands.map((value) => {
        const file = require(value);
        const splitted = value.split("/");
        const directory = splitted[splitted.length - 2];
        const properties = { directory, ...file };

        if (file.data) {
            client.slashCommands.set(file.data.name, properties);
        }

        if (file.data) {
            arrayOfSlashCommands.push(file.data.toJSON());
            log.info(`${file.data.name} loaded`);
        }
    });

    client.on("ready", async () => {
        try {
            const guild = await client.guilds.fetch(process.env.GUILD_ID);

            if (guild != null) {
                await client.application.commands.set(arrayOfSlashCommands, guild.id);
            }
        } catch (error) {
            log.error(`An error occurred while setting slash commands:\n${error}`);
        }
    });
};