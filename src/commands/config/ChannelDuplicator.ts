import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, VoiceChannel, Channel } from "discord.js";
import { ChannelDuplicatorModel } from "../../database/models/ChannelDuplicator/ChannelDuplicator.model";

export default class ChannelDuplicatorCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "channelduplicator",
            aliases: ["channel-duplicator"],
            group: "config",
            memberName: "channelduplicator",
            userPermissions: ["ADMINISTRATOR"],
            description:
                "Setup a new voice channel for duplication (members who join will temporarily create a new voice channel for themselves).",
            args: [
                {
                    key: "response",
                    prompt: "Press 'c' to create or 'd' to delete voice channel creator.",
                    type: "string",
                },
            ],
        });
    }

    // TODO: Allow for multiple lobbies and to allow for user friendly custom positioning.

    async run(message: CommandoMessage, { response }: { response: string }): Promise<Message> {
        // TODO: Make this dynamic for customisation.
        const categoryName = "Temporary Lobbies";
        const channelName = "Join to Create a Room!";
        const guild = message.guild.id;

        // Cleans the response.
        response = response.trim().toLowerCase();
        // Fetches guild object from guild ID.
        const guildObject = this.client.guilds.cache.get(guild);
        // Fetches list of channels from the database.
        const channels = await ChannelDuplicatorModel.getGuildChannels({ guildId: guild });

        if (response == "c") {
            if (channels.length == 0) {
                // Creates the category parent and then adds a voice channel.
                const newCategory = await guildObject?.channels.create(categoryName, { type: "category" });
                const newChannel = await guildObject?.channels.create(channelName, {
                    type: "voice",
                    parent: newCategory,
                });

                // Searches to see if the guild is already in the database.
                const guildData = await ChannelDuplicatorModel.findOneOrCreate({ guildId: guild });
                // ID of created channel will be added.
                // The order of this is crucial for deletion. You cannot delete parent channel then the child channel.
                await guildData.addGuildChannel({ channelId: newChannel!.id });
                await guildData.addGuildChannel({ channelId: newCategory!.id });
                return message.channel.send(`Channel ${newCategory!.name} has been set as a duplicating channel.`);
            } else {
                return message.channel.send("There is already a lobby duplicator on your server.");
            }
        } else if (response == "d") {
            if (!(channels.length == 0)) {
                const guildData = await ChannelDuplicatorModel.findOneOrCreate({ guildId: guild });
                channels.forEach(async function (element) {
                    await guildData.removeGuildChannel({ channelId: element });
                });
                channels.forEach(async (_, index) => {
                    await this.client.channels.cache.get(channels[index])?.delete();
                });
                return message.channel.send(`Lobby duplicator has been removed as a duplicating channel.`);
            } else {
                return message.channel.send("There are no channels to delete!");
            }
        } else {
            return message.channel.send("Please type in a valid input.");
        }
    }
}
