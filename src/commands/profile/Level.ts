import { Message, MessageEmbed, User } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { UserSettingsModel } from "../../database/models/Client/User.model";
import { ExpUtility } from "../../structures/Exp";
import { delimit } from "../../helpers/Utility";

export default class LevelCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "level",
            aliases: ["xp", "exp", "experience"],
            group: "profile",
            memberName: "level",
            description: "View your level.",
            args: [
                {
                    key: "user",
                    prompt: "Who's level would you like to see?",
                    type: "user",
                    default: (m: Message) => m.author,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { user }: CommandArguments): Promise<Message> {
        const userDb = await UserSettingsModel.findOneOrCreate({ userId: user.id });
        const exp = userDb.getStats().exp;
        const credits = userDb.getStats().credits;

        const level = ExpUtility.level(exp);
        //const currentXp = ExpUtility.ExpThroughLevel(exp);
        const expToNext = ExpUtility.ExpToNextLevel(exp);

        const output = new MessageEmbed()
            .setTitle("Your Level")
            .setColor("#4293f5")
            .setThumbnail(message.author.displayAvatarURL())
            .setDescription(`You are level **${level}**!`)
            .addField(
                "Experience till next level",
                `You need **${delimit(expToNext)}** more experience to reach level **${level + 1}**!`
            )
            .addField("Credits", `You have **$${delimit(credits)}**!`);

        return message.channel.send(output);
    }
}

interface CommandArguments {
    user: User;
}
