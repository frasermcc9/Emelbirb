import { TextChannel, Permissions, Role, MessageEmbed } from "discord.js";
import { Bot } from "../../Bot";
import Log from "../../helpers/Log";
import { BotEvent } from "../Events.interface";

export default class ServerLogging implements BotEvent {
    private client: Bot = Bot.Get;

    start(): void {
        this.client.on("roleUpdate", async (oldRole, newRole) => {
            const settings = this.client.GuildSettingsCache.get(oldRole.guild.id);
            const channel = await settings?.getLogChannel();
            if (channel) {
                Log.trace("ServerLoggingEvent", "Logging info to server with logging enabled.");
                const channelObj = oldRole.guild.channels.resolve(channel) as TextChannel;

                const added = ~oldRole.permissions.bitfield & newRole.permissions.bitfield;
                const removed = oldRole.permissions.bitfield & ~newRole.permissions.bitfield;

                const addedPerms = new Permissions(added).toArray();
                const removedPerms = new Permissions(removed).toArray();

                const output = new MessageEmbed()
                    .setTitle("Role Update")
                    .setDescription(`LOG: ${newRole.name} PERMISSION UPDATE`)
                    .setColor("RED")
                    .addField("Permissions Added", addedPerms.join("\n") || "none")
                    .addField("Permissions removed", removedPerms.join("\n") || "none");

                return channelObj.send(output);
            }
        });
    }
}
