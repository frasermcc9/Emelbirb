import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { GlobalModel } from "../../database/models/Global/Global.model";
import { UserSettingsModel } from "../../database/models/Client/User.model";
import { findBestMatch } from "string-similarity";

export default class BuyBackgroundCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "buybackground",
            aliases: ["buybg"],
            group: "profile",
            memberName: "buybackground",
            description: "Buy a profile background.",
            guildOnly: true,
            args: [
                {
                    key: "bgName",
                    prompt: "Name of this background?",
                    type: "string",
                    max: 255,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { bgName }: CommandArguments): Promise<Message> {
        const user = await UserSettingsModel.findOneOrCreate({ userId: message.author.id });

        const globalModel = await GlobalModel.getSettings();

        const bgs = Object.keys(globalModel.backgrounds.list);
        const candidate = findBestMatch(bgName, bgs).bestMatch.target;
        //const url = globalModel.backgrounds.list[candidate].uri;

        const result = await user.buyBackground({ bg: bgName });
        if (result) {
            return message.channel.send(`You have bought the background **${candidate}**!`);
        } else {
            return message.channel.send(`Either you already own **${candidate}**, or you do not have enough credits.`);
        }
    }
}

interface CommandArguments {
    bgName: string;
}
