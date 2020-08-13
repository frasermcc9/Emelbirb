import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { Message, GuildChannel, TextChannel, MessageEmbed, ReactionCollector, MessageReaction, User } from "discord.js";
import { ServerSettingsModel } from "../../database/models/Server/ServerSettings.model";
import { count } from "console";
import Log from "../../helpers/Log";
import { Bot } from "../../Bot";

export default class PollCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "poll",
            group: "voting",
            memberName: "poll",
            description: "Create an anonymous poll (for administrators).",
            guildOnly: true,
            clientPermissions: ["ADD_REACTIONS", "SEND_MESSAGES"],
            userPermissions: ["ADMINISTRATOR"],
            args: [
                {
                    key: "title",
                    prompt: "What should the title of the poll be?",
                    type: "string",
                    validate: (s: string) => s.length < 1000,
                },
                {
                    key: "time",
                    prompt: "How long should the poll be (in minutes)?",
                    type: "integer",
                    max: 1440,
                    error: "The poll duration must be below 24 hours.",
                },
                {
                    key: "channel",
                    prompt: "Which channel should the poll be sent to?",
                    type: "channel",
                },
                {
                    key: "options",
                    prompt: "What are the options for the poll?",
                    type: "string",
                    infinite: true,
                    validate: (m: string) => m.length < 100,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { time, options, title, channel }: CommandArguments): Promise<Message> {
        //input validation
        if (options.length > 10) {
            return message.channel.send("Only up to 10 choices are permitted.");
        }
        if (channel.type != "text") {
            return message.channel.send("The channel provided needs to be a text channel!");
        }

        //preparing poll output
        const output = new MessageEmbed()
            .setAuthor("Voting")
            .setTitle(title)
            .setDescription(
                "Please react to the corresponding number on the options below.\n- You can only vote for one person.\n- You can change your vote.\n- Your vote is anonymous."
            )
            .setColor("#17e651")
            .setTimestamp()
            .setFooter(`This poll will last for ${time} minutes since creation.`);

        let iconUri = message.guild.iconURL();
        if (iconUri) {
            output.setThumbnail(iconUri);
        }

        const reactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        const candidates: { [k: string]: Candidate } = {};

        options.forEach((choice, idx) => {
            output.addField(`Option ${reactions[idx]}`, choice, true);
            candidates[reactions[idx]] = { candidate: choice, reaction: reactions[idx], votes: new Set() };
        });

        const pollMessage = await channel.send(output);
        for (let i = 0; i < options.length; i++) {
            await pollMessage.react(reactions[i]);
        }

        const filter = (rxn: MessageReaction, user: User) => reactions.includes(rxn.emoji.name) && user.bot == false;

        new ReactionCollector(pollMessage, filter, { time: time * 60 * 1000 })
            .on("collect", async (collected, user) => {
                const reactorId = user.id;
                await collected.users.remove(reactorId);
                
                //check if member is registered
                if (Bot.Get.UserCache.get(user.id)?.getEmail() == undefined) {
                    return user.send(
                        "You cannot vote in this poll because you are not registered! Please reply with **RegisterVote** to vote!"
                    );
                }

                for (const key in candidates) {
                    if (Object.prototype.hasOwnProperty.call(candidates, key)) {
                        const found = candidates[key].votes.delete(reactorId);
                        if (found) Log.info("Poll", "Vote removed for " + reactorId);
                    }
                }
                candidates[collected.emoji.name].votes.add(reactorId);
                Log.info("Poll", "Vote added for " + reactorId);
            })
            .once("end", () => {
                const voteMap: Map<string, number> = new Map();
                for (const key in candidates) {
                    if (Object.prototype.hasOwnProperty.call(candidates, key)) {
                        voteMap.set(candidates[key].candidate, candidates[key].votes.size);
                    }
                }
                const pollResults: string[] = [];
                voteMap.forEach((votes, candidate) => {
                    pollResults.push(`${candidate} - ${votes} Votes`);
                });
                pollMessage.channel.send(
                    new MessageEmbed().setTitle("Voting Concluded").setDescription(pollResults.join("\n"))
                );
            });

        return pollMessage;
    }
}

interface CommandArguments {
    title: string;
    time: number;
    options: string[];
    channel: TextChannel;
}

interface Candidate {
    reaction: string;
    candidate: string;
    votes: Set<string>;
}
