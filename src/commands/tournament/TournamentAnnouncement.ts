import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, TextChannel, Role, MessageEmbed } from "discord.js";
import { strict } from "assert";

export default class TournamentAnnouncementCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "tournamentannouncement",
            aliases: ["announce"],
            group: "tournament",
            memberName: "tournamentannouncement",
            clientPermissions: ["SEND_MESSAGES"],
            userPermissions: ["ADMINISTRATOR"],
            description: "Sends an announcement",
            args: [
                {
                    key: "title",
                    prompt: "Please enter the title of your announcement",
                    type: "string",
                },
                {
                    key: "description",
                    prompt: "Please enter the body text of the announcement",
                    type: "string",
                },
                {
                    key: "channel",
                    prompt: "Please enter the channel this announcement should be sent to",
                    type: "channel",
                },
                {
                    key: "image",
                    prompt: "Please enter an image for this announcement (type skip to not add an image)",
                    type: "string",
                },
            ],
        });
    }

    async run(message: CommandoMessage, { channel, description, image, title }: CommandArguments): Promise<Message> {
        const output = new MessageEmbed()
            .setTitle(title)
            .setDescription(description)
            .setColor("RANDOM")
            .setTimestamp()
            .setAuthor("UoA Esports Staff");

        const icon = message.guild.iconURL();
        if (icon) output.setThumbnail(icon);
        try {
            const url = new URL(image);
            output.setImage(url.toString());
        } catch {}

        return channel.send(output);
    }
}

interface CommandArguments {
    title: string;
    description: string;
    channel: TextChannel;
    image: string;
}
