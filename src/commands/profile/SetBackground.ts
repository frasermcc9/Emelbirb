import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { GlobalModel } from "../../database/models/Global/Global.model";
import { UserSettingsModel } from "../../database/models/Client/User.model";
import { findBestMatch } from "string-similarity";

export default class SetBackgroundCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "setbackground",
            aliases: ["setbg"],
            group: "profile",
            memberName: "setbackground",
            description: "Set your profile background.",
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

        if (bgName.toLowerCase() == "default") {
            await user.setBackground({ uri: globalModel.backgrounds.default, force: true });
            return message.channel.send("Your background has been reset!");
        }

        const bgs = Object.keys(globalModel.backgrounds.list);
        const candidate = findBestMatch(bgName, bgs).bestMatch.target;
        const url = globalModel.backgrounds.list[candidate].uri;

        const result = await user.setBackground({ uri: url });
        if (result) {
            return message.channel.send(`Your background has been set to ${candidate}!`);
        } else {
            return message.channel.send(`You do not own the background **${candidate}**.`);
        }
    }
}

interface CommandArguments {
    bgName: string;
}
