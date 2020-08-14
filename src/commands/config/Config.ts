import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, VoiceChannel, Channel, GuildChannelManager, MessageCollector, User, SnowflakeUtil } from "discord.js";
import { ServerSettingsModel, IServerSettingsDocument } from "../../database/models/Server/Server.model";

export default class ConfigCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "config",
            aliases: ["cfg", "configuration", "serversettings", "settings"],
            group: "config",
            memberName: "config",
            description: "Configure the server settings.",
            userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
        });
    }

    async run(message: CommandoMessage): Promise<Message> {
        const settings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });

        const menuData = await this.getMenuData(settings, message.guild.channels);
        const menuString = this.getMenuString(menuData);
        const menuMessage = await message.channel.send(menuString);

        const response = await this.getResponse(message);

        const prefix = menuData[2];

        switch (response) {
            case 1:
                this.action(prefix + "membercounter", message);
                break;
            case 2:
                this.action(prefix + "dadbot", message);
                break;
            case 3:
                this.action(prefix + "editprefix", message);
                break;
            case 4:
                this.action(prefix + "editlogchannel", message);
                break;
            case 5:
                this.action(prefix + "logoff", message);
                break;
            case 6:
                this.action(prefix + "suggestionchannel", message);
                break;
            default:
                return message.channel.send("The operation has been cancelled.");
        }
        if (menuMessage.deletable) menuMessage.delete();
        return menuMessage;
    }

    private async getMenuData(
        settings: IServerSettingsDocument,
        channelManager: GuildChannelManager
    ): Promise<string[]> {
        let promises: Promise<string>[] = [];
        promises.push(
            new Promise((res) => {
                const counterId = settings.memberCounter;
                if (!counterId) res("Disabled");
                else res(channelManager.resolve(counterId)?.name ?? "Disabled");
            }),
            new Promise((res) => {
                if (!settings.dadBot) res("Disabled");
                else res("Enabled");
            }),
            new Promise((res) => {
                const prefix = settings.prefix;
                if (!prefix) {
                    const globalPrefix = this.client.commandPrefix;
                    res(globalPrefix);
                } else res(prefix);
            }),
            new Promise((res) => {
                const channelId = settings.logging.channel;
                if (!channelId) res("Disabled");
                else res(channelManager.resolve(channelId)?.name ?? "Disabled");
            }),
            new Promise((res) => {
                const channelId = settings.suggestions.channel;
                if (!channelId) res("Disabled");
                else res(channelManager.resolve(channelId)?.name ?? "Disabled");
            })
        );
        return await Promise.all(promises);
    }

    private getMenuString(settings: string[]) {
        return `
        \`\`\`php
        Emelbirb Server Configuration Menu

        [1] # Member Counter Channel (current: "${settings[0]}")
        [2] # Dadbot (current: "${settings[1]}")
        [3] # Prefix (current: "${settings[2]}")
        [4] # Change Log Channel (current: "${settings[3]}")
        [5] # Stop Logging
        [6] # Suggestions (current: "${settings[4]}")
        
        Type the appropriate number to change this setting.
        Type "exit" to quit the menu. It will automatically close in 15 seconds.
        \`\`\`
        `.replace(/^ +/gm, "");
    }

    private getResponse(invokingMessage: CommandoMessage): Promise<number> {
        return new Promise((res) => {
            const f = (msg: Message) => msg.author == invokingMessage.author;
            const c = new MessageCollector(invokingMessage.channel, f, { time: 1000 * 15 })
                .once("collect", (data: Message) => {
                    const content = Number(data.content);
                    if (content > 0 && content <= 6) {
                        res(content);
                    } else {
                        res(0);
                    }
                    c.stop();
                })
                .once("end", () => res(0));
        });
    }

    private action(cmd: string, message: CommandoMessage) {
        this.client.emit(
            "message",
            //@ts-ignore
            new CommandoMessage(
                //@ts-ignore
                this.client,
                {
                    content: cmd,
                    author: message.author,
                    guild: message.guild,
                },
                message.channel
            )
        );
    }
}
