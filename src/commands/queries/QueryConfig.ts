import { Message, MessageEmbed, TextChannel, GuildChannel, User } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { QuestionManager } from "../../structures/QuestionManager";

export default class QueryConfigCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "queryconfig",
            aliases: ["questionconfig"],
            group: "queries",
            memberName: "queryconfig",
            description: "Ask an anonymous question to two people (pre-determined people).",
            userPermissions: ["MANAGE_GUILD"],
            guildOnly: true,
            args: [
                {
                    key: "channel",
                    prompt: "What is the text channel where questions should be posted publicly?",
                    type: "channel",
                },
                {
                    key: "firstUser",
                    prompt: "Who is the first question answerer?",
                    type: "user",
                },
                {
                    key: "secondUser",
                    prompt: "Who is the second question answerer?",
                    type: "user",
                },
            ],
        });
    }

    async run(message: CommandoMessage, { channel, firstUser, secondUser }: CommandArguments): Promise<Message> {
        const QM = QuestionManager.get;

        (QM.Channel = channel.id), (QM.Guild = channel.guild.id), (QM.DmList = [firstUser.id, secondUser.id]);

        return message.channel.send("Question configuration updated!")
    }
}

interface CommandArguments {
    channel: GuildChannel;
    firstUser: User;
    secondUser: User;
}
