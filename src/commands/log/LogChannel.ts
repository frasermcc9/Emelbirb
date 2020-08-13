import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, Channel, TextChannel } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";

export default class LogChannelCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "logchannel",
            aliases: ["log", "logger", "loggingchannel"],
            group: "log",
            memberName: "logchannel",
            description: "Replies with a lenny face",
            userPermissions: ["ADMINISTRATOR"],
            args: [
                {
                    key: "logChannel",
                    prompt: "What would you like to set the log channel to?",
                    type: "channel",
                    default: new Channel(client, { type: "text" }),
                },
            ],
        });
    }

    async run(message: CommandoMessage, { logChannel }: { logChannel: Channel }): Promise<Message> {
        const settings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });
        if (logChannel.id == undefined) {
            const currentChannelId = await settings.getLogChannel();
            let currentChannel: string;
            if (currentChannelId == undefined) {
                currentChannel = "not set up";
            } else {
                currentChannel = message.guild.channels.resolve(currentChannelId)!.name;
            }
            return message.channel.send(`This servers log channel is **${currentChannel}**.`);
        }

        if (logChannel.type != "text") {
            return message.channel.send("Log channel must be a text channel.");
        }

        await settings.setLogChannel({ channel: logChannel.id });

        return message.channel.send(`Log channel has been updated to **${(logChannel as TextChannel).name}**`);
    }
}
