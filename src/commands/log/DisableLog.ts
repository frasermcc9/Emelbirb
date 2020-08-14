import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, Channel, TextChannel } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";

export default class DisableLogCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "disablelog",
            aliases: ["logoff", "stoplog"],
            group: "log",
            memberName: "disablelog",
            description: "Turns off the log.",
            userPermissions: ["ADMINISTRATOR"],
        });
    }

    async run(message: CommandoMessage): Promise<Message> {
        const settings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });
        await settings.removeLogChannel();
        return message.channel.send("Logging has been disabled!");
    }
}
