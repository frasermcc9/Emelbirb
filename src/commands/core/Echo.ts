import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";

export default class EchoCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "echo",
            group: "core",
            memberName: "echo",
            description: "repeats what you said",
        });
    }

    async run(message: CommandoMessage, args: any): Promise<Message> {
        return message.channel.send(message.cleanContent);
    }
}
