import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";

export default class DiceCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "dice",
            aliases: ["die"],
            group: "fun",
            memberName: "dice",
            description: "Roles a die.",
        });
    }

    async run(message: CommandoMessage): Promise<Message> {
        return message.channel.send(`You rolled a ${~~Math.random() * 6 + 1}`);
    }
}
