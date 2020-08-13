import { Message, MessageEmbed } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { UserSettingsModel } from "../../database/models/Client/User.model";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";
import { IBadge } from "../../structures/Badges";

export default class AllBadgesCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "allbadges",
            aliases: ["allbadge"],
            group: "badges",
            memberName: "allbadges",
            description: "View all your badges.",
            guildOnly: true,
        });
    }

    async run(message: CommandoMessage, { badge, position }: CommandArguments): Promise<Message> {
        const userSettings = await UserSettingsModel.findOneOrCreate({ userId: message.author.id });
        const guildSettings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });

        const ownedBadges = Array.from(userSettings.badges.collection.keys());

        const resolvedBadges: IBadge[] = [];
        ownedBadges.forEach((k) => {
            const badge = guildSettings.badges[k];
            if (badge) {
                resolvedBadges.push(badge);
            }
        });

        const embed = new MessageEmbed().setTitle("All your badges").setColor("#9809eb");
        for (let i = 1; i <= 4; i++) {
            const filtered = resolvedBadges.filter((b) => b.tier == i);
            embed.addField(
                `➤ Tier ${i} Badges`,
                `${filtered.map((e) => `**${e.name}**\n${e.description}`).join("\n")}\n-`,
                false
            );
        }
        return message.channel.send(embed);
    }
}

interface CommandArguments {
    position: 1 | 2 | 3 | 4 | 5;
    badge: string;
}
