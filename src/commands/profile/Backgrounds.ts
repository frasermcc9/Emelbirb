import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, MessageEmbed } from "discord.js";
import { GlobalModel } from "../../database/models/Global/Global.model";

export default class BackgroundsCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "backgrounds",
            aliases: ["viewbgs"],
            group: "profile",
            memberName: "backgrounds",
            description: "View all profile backgrounds.",
        });
    }

    async run(message: CommandoMessage, { bgName }: CommandArguments): Promise<Message> {
        const globalModel = await GlobalModel.getSettings();
        const backgrounds = globalModel.backgrounds.list;

        const output = new MessageEmbed().setTitle("Profile Backgrounds").setColor("#751fa1");
        const format = [];

        for (const key in backgrounds) {
            if (Object.prototype.hasOwnProperty.call(backgrounds, key)) {
                const element = backgrounds[key];
                format.push(`[${element.name}](${element.uri}) - $${element.cost}`);
            }
        }

        output.setDescription(format.join("\n"));

        return message.channel.send(output);
    }
}

interface CommandArguments {
    bgName: string;
}
