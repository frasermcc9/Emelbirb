import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { QuestionManager } from "../../structures/QuestionManager";

export default class AnswerCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "answer",
            aliases: ["answerquestion"],
            group: "queries",
            memberName: "answer",
            description: "Answer a question that has been sent to you.",
            args: [
                {
                    key: "id",
                    prompt: "What is the id of the question you would like to answer?",
                    type: "integer",
                    max: 1023,
                    wait: 30,
                },
                {
                    key: "name",
                    prompt:
                        "How would you like your name to appear on the answer (for example, type 'John' and the public answer will say 'John's Reply')?",
                    type: "string",
                    max: 40,
                    wait: 60,
                },
                {
                    key: "response",
                    prompt: "What is your response (please below 1023 characters, or post a link to text)?",
                    type: "string",
                    max: 1023,
                    wait: 1500,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { id, response, name }: CommandArguments): Promise<Message> {
        const validIds = QuestionManager.get.DmList;

        if (!validIds.includes(message.author.id)) {
            return message.channel.send("You do not have the permissions to use this command.");
        }

        const questionObj = QuestionManager.get.submitAnswer(id, response, name, message.author.id);

        if (questionObj) {
            return message.channel.send("Your answer has been posted!");
        } else {
            return message.channel.send(
                "There was an error. Either you have already answered this question, or it doesn't exist."
            );
        }
    }
}

interface CommandArguments {
    id: number;
    name: string;
    response: string;
}
