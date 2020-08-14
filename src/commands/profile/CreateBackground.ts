import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { GlobalModel } from "../../database/models/Global/Global.model";

export default class CreateBackgroundCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "createbackground",
            aliases: ["createbg"],
            group: "badges",
            memberName: "createbackground",
            description: "Creates a background globally.",
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: "bgName",
                    prompt: "Name of this background?",
                    type: "string",
                    max: 255,
                },
                {
                    key: "bgUri",
                    prompt: "Url for this background?",
                    type: "string",
                },
                {
                    key: "bgCost",
                    prompt: "Cost of this background",
                    type: "integer",
                    min: 0,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { bgCost, bgName, bgUri }: CommandArguments): Promise<Message> {
        const globalModel = await GlobalModel.getSettings();

        await globalModel.addBackground(bgName, bgUri, bgCost);

        return message.channel.send(`Background with name **${bgName}** added!`);
    }
}

interface CommandArguments {
    bgName: string;
    bgUri: string;
    bgCost: number;
}
