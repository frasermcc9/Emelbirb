import { BotEvent } from "../Events.interface";
import { Bot } from "../../Bot";
import { GuildMember } from "discord.js";

export default class NewMemberDM implements BotEvent {
    private client: Bot = Bot.Get;

    start(): void {
        this.client.on("guildMemberAdd", this.updater);
    }

    private updater = async (member: GuildMember) => {
        const string =
            "Hi there, Welcome to the UoA Esports Club Discord server! If you want to find other people who play the same games as you, you can access the channels at #get-roles. If you'd like to change your colour, you can do that at #get-colours. We hope that you'll join us in our events, and enjoy your time here with the club!";
        member.send(string).catch(() => {});
    };
}
