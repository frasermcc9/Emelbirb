import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, User, MessageCollector, ReactionCollector, MessageReaction } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";
import { Bot } from "../../Bot";
import { findBestMatch } from "string-similarity";
import { UserSettingsModel } from "../../database/models/Client/User.model";

export default class GiveBadgeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "givebadge",
            group: "badges",
            memberName: "givebadge",
            description: "Gives a badge to a user in this guild.",
            userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
            args: [
                {
                    key: "user",
                    prompt: "Who should be given the badge?",
                    type: "user",
                },
                {
                    key: "badge",
                    prompt: "What badge from this server should i give to this person?",
                    type: "string",
                    max: 63,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { badge, user }: CommandArguments): Promise<Message> {
        const guildSettings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });
        const options = Object.keys(guildSettings.badges);
        const candidate = findBestMatch(badge, options).bestMatch.target;
        const m = await message.channel.send(`Confirm: Add badge **${candidate}** to **${user.username}**?`);
        await m.react("✅");
        const result = await this.confirmChoice(m, message.author);

        if (!result) return message.channel.send(`You did not give **${user.username}** the badge **${candidate}**.`);

        const member = await UserSettingsModel.findOneOrCreate({ userId: user.id });
        await member.giveBadge({ badge: candidate });
        return message.channel.send(`You gave the badge **${candidate}** to **${user.username}**!`);
    }

    private async confirmChoice(msg: Message, invoker: User): Promise<boolean> {
        const f = (rxn: MessageReaction, user: User) => user.id == invoker.id && rxn.emoji.name == "✅";
        return new Promise((res, rej) => {
            new ReactionCollector(msg, f, { time: 1000 * 10 })
                .once("collect", () => {
                    res(true);
                })
                .once("end", () => {
                    res(false);
                });
        });
    }
}

interface CommandArguments {
    user: User;
    badge: string;
}
