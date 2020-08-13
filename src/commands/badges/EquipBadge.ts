import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, User, MessageReaction, ReactionCollector } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";
import { Bot } from "../../Bot";
import { UserSettingsModel } from "../../database/models/Client/User.model";
import { findBestMatch } from "string-similarity";

export default class EquipBadgeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "equipbadge",
            aliases: ["activatebadge"],
            group: "badges",
            memberName: "equipbadge",
            description: "Equips one of your badges.",
            guildOnly: true,
            args: [
                {
                    key: "badge",
                    prompt: "what is the name of the badge you would like to equip?",
                    type: "string",
                    max: 63,
                },
                {
                    key: "position",
                    prompt:
                        "Please reply with the position you would like to equip this at. https://cdn.discordapp.com/attachments/737561730967928853/743444324645077013/unknown.png",
                    type: "integer",
                    min: 1,
                    max: 5,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { badge, position }: CommandArguments): Promise<Message> {
        const userSettings = await UserSettingsModel.findOneOrCreate({ userId: message.author.id });

        const ownedBadges = Array.from(userSettings.badges.collection.keys());

        const candidate = findBestMatch(badge, ownedBadges).bestMatch.target;

        const confirmMessage = await message.channel.send(
            `Confirm that you will equip badge ${candidate} at position ${position}?`
        );
        await confirmMessage.react("✅");
        const result = await this.confirmChoice(confirmMessage, message.author);
        if (!result) return message.channel.send("Cancelled equipping badge.");

        const parsedPosition = ("p" + position) as "p1" | "p2" | "p3" | "p4" | "p5";
        const success = await userSettings.equipBadge({ badge: candidate, position: parsedPosition });
        if (!success) return message.channel.send("You do not appear to own this badge.");

        return message.channel.send(`Badge with name ${badge} equipped at position ${position!}`);
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
    position: 1 | 2 | 3 | 4 | 5;
    badge: string;
}
