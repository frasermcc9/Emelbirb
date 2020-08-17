import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { UserSettingsModel } from "../../database/models/Client/User.model";

export default class AboutMeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "aboutme",
            aliases: ["profiledetails", "details", "description", "setaboutme"],
            group: "profile",
            memberName: "aboutme",
            description: "Set your profile About Me.",
            guildOnly: true,
            args: [
                {
                    key: "details",
                    prompt: "Please enter your description.",
                    type: "string",
                    max: 255,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { details }: CommandArguments): Promise<Message> {
        const user = await UserSettingsModel.findOneOrCreate({ userId: message.author.id });

        await user.setAboutMe(details);

        return message.channel.send(`Your profile about me has been updated!`);
    }
}

interface CommandArguments {
    details: string;
}
