import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, GuildChannel, TextChannel, MessageEmbed, Role, Guild, CategoryChannel } from "discord.js";
import { ServerSettingsModel } from "../../database/models/ServerSettings/ServerSettings.model";
import { count } from "console";
import Log from "../../helpers/Log";

export default class TournamentChannelGeneratorCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "tournamentchannelgenerator",
            aliases: ["channelgen", "genchannel", "generatechannels", "channelgenerator"],
            group: "tournament",
            memberName: "tournamentchannelgenerator",
            userPermissions: ["ADMINISTRATOR"],
            clientPermissions: ["MANAGE_ROLES", "MANAGE_CHANNELS"],
            description:
                "Generate corresponding voice channels and roles. The channels will only be viewable by the associated role.",
            guildOnly: true,
            args: [
                {
                    key: "tournament",
                    prompt: "What is the name of the tournament?",
                    type: "string",
                },
                {
                    key: "names",
                    prompt: "Please submit the names for the channel and role, one message per entry.",
                    infinite: true,
                    type: "string",
                },
            ],
        });
    }

    /**
     * Role that represents everyone
     */
    private everyone!: Role;

    async run(
        message: CommandoMessage,
        { names, tournament }: { names: string[]; tournament: string }
    ): Promise<Message> {
        this.everyone = message.guild.roles.cache.find((r) => r.name == "@everyone")!;
        const roles = await this.teamRoleCreator(names, message.guild);
        const category = await this.categoryCreator(tournament, message.guild, roles);
        await this.teamChannelCreator(names, message.guild, category, roles);
        await this.tournamentChannelGenerator(tournament, message.guild, category);
        return message.channel.send("Roles and channels created!");
    }

    /**
     * Returns promise when all roles are created.
     * @param names the names of the roles
     * @param guild the guild to add to
     * @returns array of created roles
     */
    private async teamRoleCreator(names: string[], guild: Guild): Promise<Role[]> {
        return new Promise((res) => {
            let roles: Role[] = [];
            names.forEach(async (name) => {
                const newRole = await guild.roles.create({
                    data: {
                        name: name,
                    },
                });
                roles.push(newRole);
                if (roles.length == names.length) {
                    res(roles);
                }
            });
        });
    }

    /**
     * Returns promise when all roles are created.
     * @param names the names of the roles
     * @param guild the guild to add to
     * @returns array of created roles
     */
    private async categoryCreator(tournament: string, guild: Guild, roles: Role[]): Promise<CategoryChannel> {
        return new Promise(async (res) => {
            const category = await guild.channels.create(tournament, { type: "category" });
            await category.updateOverwrite(this.everyone, { VIEW_CHANNEL: false });
            roles.forEach(async (r, idx) => {
                await category.updateOverwrite(r, { VIEW_CHANNEL: true });
                if (idx == roles.length - 1) {
                    res(category);
                }
            });
        });
    }

    /**
     * Creates the team channels
     * @param names the channel names
     * @param guild the guild
     * @param parent the parent category channel
     * @param roles the roles array that corresponds with the channel names
     */
    private async teamChannelCreator(
        names: string[],
        guild: Guild,
        parent: CategoryChannel,
        roles: Role[]
    ): Promise<void> {
        return new Promise((res) => {
            names.forEach(async (name, idx) => {
                await guild.channels.create(name, {
                    permissionOverwrites: [
                        {
                            type: "role",
                            id: roles[idx],
                            allow: ["CONNECT", "VIEW_CHANNEL"],
                        },
                        {
                            id: this.everyone,
                            deny: ["CONNECT"],
                        },
                    ],
                    type: "voice",
                    parent: parent,
                });
                if (idx == names.length - 1) {
                    res();
                }
            });
        });
    }

    public async tournamentChannelGenerator(
        tournamentName: string,
        guild: Guild,
        category: CategoryChannel
    ): Promise<void> {
        const adminChannel = await guild.channels.create(`${tournamentName} Announcements`, {
            type: "text",
            parent: category,
        });
        await adminChannel.updateOverwrite(this.everyone, { SEND_MESSAGES: false });

        const channelNames = [
            `${tournamentName} Discussion`,
            `${tournamentName} Queries`,
            `${tournamentName} Reschedules`,
        ];
        return new Promise((res) => {
            channelNames.forEach(async (n, idx) => {
                await guild.channels.create(n, { parent: category, type: "text" });
                if (idx == 2) {
                    res();
                }
            });
        });
    }
}
