import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, Channel, TextChannel } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";

export default class EditLogChannelCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "editlogchannel",
            aliases: ["editlog", "editlogger", "editloggingchannel"],
            group: "log",
            memberName: "editlogchannel",
            description: "Changes the log channel.",
            userPermissions: ["ADMINISTRATOR"],
            args: [
                {
                    key: "logChannel",
                    prompt: "What would you like to set the log channel to?",
                    type: "channel",
                },
            ],
        });
    }

    async run(message: CommandoMessage, { logChannel }: { logChannel: Channel }): Promise<Message> {
        const settings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });

        if (logChannel.type != "text") {
            return message.channel.send("Log channel must be a text channel.");
        }

        await settings.setLogChannel({ channel: logChannel.id });

        return message.channel.send(`Log channel has been updated to **${(logChannel as TextChannel).name}**`);
    }
}
