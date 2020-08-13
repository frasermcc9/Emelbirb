import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message } from "discord.js";
import { Bot } from "../../Bot";
import { UserSettingsModel } from "../../database/models/Client/UserSettings.model";

export default class RegisterVoteCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "registervote",
            aliases: ["registertovote", "voteregister"],
            group: "voting",
            memberName: "registervote",
            description: "Create an anonymous poll (for administrators).",
            clientPermissions: ["SEND_MESSAGES"],
            args: [
                {
                    key: "email",
                    prompt: "Please enter the email you used to sign up for the club.",
                    type: "string",
                    validate: (s: string) => s.length < 1000,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { email }: CommandArguments): Promise<Message> {
        email = email.toLowerCase();
        const result = Bot.Get.isValidEmail(email);
        if (result) {
            const user = await UserSettingsModel.findOneOrCreate({ userId: message.author.id });
            if (user.getEmail()) {
                return message.channel.send("You already have an email associated.");
            }
            await user.updateEmail({ email: email });
            return message.channel.send("You have been registered successfully!");
        } else {
            return message.channel.send(
                "This email is not valid, or is already in use. If you think there is a mistake, please contact an admin."
            );
        }
    }
}

interface CommandArguments {
    email: string;
}

interface Candidate {
    reaction: string;
    candidate: string;
    votes: Set<string>;
}
