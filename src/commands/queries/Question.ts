import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { QuestionManager } from "../../structures/QuestionManager";

export default class QuestionCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "question",
            aliases: ["ask", "askquestion", "query"],
            group: "queries",
            memberName: "question",
            description: "Ask an anonymous question to two people (pre-determined people).",
            args: [
                {
                    key: "question",
                    prompt: "What is your question?",
                    type: "string",
                    max: 1023,
                    wait: 300,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { question }: CommandArguments): Promise<Message> {
        const QM = QuestionManager.get;
        const guild = this.client.guilds.resolve(QM.Guild); 
        const channel = guild?.channels.resolve(QM.Channel)! as TextChannel;

        const p1 = guild?.members.resolve(QM.DmList[0]);
        const p2 = guild?.members.resolve(QM.DmList[1]);

        const questionObj = QuestionManager.get.addQuestion({
            question: question,
        });

        const publicOutput = new MessageEmbed()
            .setTitle(`Question **${questionObj.id}**`)
            .setDescription(question)
            .setColor("#c71414")
            .addField("Awaiting Person One Response...", "This person has not sent a response yet.", true)
            .addField("Awaiting Person Two Response...", "This person has not sent a response yet.", true);

        const questionMessage = await channel.send(publicOutput);

        QuestionManager.get.setQuestionReturnPoint(questionObj, {
            guildId: guild?.id,
            channelId: channel.id,
            messageId: questionMessage.id,
        });

        const dmOutput = new MessageEmbed()
            .setTitle("New Question")
            .setDescription(`Question ID: ${questionObj.id}`)
            .addField("The Question", question)
            .setFooter("Reply with 'answer' to provide your reply.");
        await p1?.send(dmOutput);
        await p2?.send(dmOutput);

        return message.channel.send("Your question has been posted!");
    }
}

interface CommandArguments {
    question: string;
}
