import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, User, MessageReaction, ReactionCollector } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";
import { Bot } from "../../Bot";
import { findBestMatch } from "string-similarity";

export default class DeleteBadgeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "deletebadge",
            aliases: ["removebadge", "delbadge"],
            group: "badges",
            memberName: "deletebadge",
            description: "Deletes a badge in this guild.",
            userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
            args: [
                {
                    key: "badge",
                    prompt: "Which badge should be deleted?",
                    type: "string",
                    max: 63,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { badge }: CommandArguments): Promise<Message> {
        const guildSettings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });

        const options = Object.keys(guildSettings.badges);

        const candidate = findBestMatch(badge, options).bestMatch.target;

        const m = await message.channel.send(`Confirm: Delete badge **${candidate}** from this server?`);
        await m.react("✅");
        const result = await this.confirmChoice(m, message.author);

        if (!result) return message.channel.send(`Cancelled deleting badge.`);

        await guildSettings.removeBadge({ badgeName: candidate });
        return message.channel.send(`Badge **${candidate}** was removed!`);
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
    badge: string;
}
