import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/ServerSettings.model";
import { Bot } from "../../Bot";

export default class CreateBadgeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "createbadge",
            aliases: ["makebadge"],
            group: "badges",
            memberName: "createbadge",
            description: "Creates a badge in this guild.",
            userPermissions: ["ADMINISTRATOR"],
            guildOnly: true,
            args: [
                {
                    key: "badge",
                    prompt: "what should the name of this badge be?",
                    type: "string",
                    max: 255,
                },
                {
                    key: "description",
                    prompt: "Describe this badge.",
                    type: "string",
                    max: 255,
                    wait: 300,
                },
                {
                    key: "tier",
                    prompt: "What is the tier of this badge?",
                    type: "integer",
                    max: 4,
                    min: 1,
                },
                {
                    key: "uri",
                    prompt:
                        "Please link to an image upload of this badge. Ideally it should be a small, perfect circle icon.",
                    type: "string",
                },
            ],
        });
    }

    async run(message: CommandoMessage, { badge, uri, tier, description }: CommandArguments): Promise<Message> {
        const guildSettings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });

        await guildSettings.addBadge({ badgeName: badge, badgeUri: uri, tier: tier, description: description });
        return message.channel.send(`Badge with name **${badge}** added!`);
    }
}

interface CommandArguments {
    uri: string;
    badge: string;
    tier: number;
    description: string;
}
