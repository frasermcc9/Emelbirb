import axios from "axios";
import { Message, MessageAttachment, User } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import sharp from "sharp";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";
import { UserSettingsModel } from "../../database/models/Client/User.model";
import { generate } from "text-to-image";
import { expProgress } from "../../helpers/Graphics";
import { ExpUtility } from "../../structures/Exp";

export default class ProfileCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "profile",
            aliases: ["viewbadges", "view-badges", "badges"],
            group: "profile",
            memberName: "profile",
            description: "View your equipped badges.",
            guildOnly: true,
            args: [
                {
                    key: "user",
                    prompt: "Who's profile would you like to see?",
                    type: "user",
                    default: (m: Message) => m.author,
                },
            ],
        });
    }

    async run(message: CommandoMessage, { user }: CommandArguments): Promise<Message> {
        const reply = await message.channel.send("Loading Badges...");

        const serverSettings = await ServerSettingsModel.findOneOrCreate({ guildId: message.guild.id });

        const userSettings = await UserSettingsModel.findOneOrCreate({ userId: user.id });
        const equippedBadges = userSettings.equippedBadges();
        const iterator = ["p1", "p2", "p3", "p4", "p5"];

        const userBackground = await userSettings.getBackground();
        const userBackgroundImg = (await axios({ url: userBackground, responseType: "arraybuffer" })).data as Buffer;
        const base = sharp(userBackgroundImg);

        const bufferArray: Promise<CompositeImage>[] = [];

        bufferArray.push(this.fetchFg());

        const exp = ExpUtility.currentLevelData(userSettings.stats.exp);
        bufferArray.push(this.fetchExp(exp.percent));

        let i = -1;
        for (const key of iterator) {
            if (Object.prototype.hasOwnProperty.call(equippedBadges, key)) {
                i++;
                const element = equippedBadges[key as "p1" | "p2" | "p3" | "p4" | "p5"]!;
                const img = serverSettings?.badges?.[element]?.uri;
                if (img == undefined) continue;
                bufferArray.push(this.fetchImg(img, { xPos: 24, yPos: 312 + 85 * i, xResize: 80, yResize: 80 }));
            }
        }

        expProgress(0.5);

        const userAvatar = user.avatarURL() ?? user.defaultAvatarURL;
        bufferArray.push(this.fetchImg(userAvatar, { xPos: 19, yPos: 117, xResize: 184, yResize: 184 }));

        const username = user.username;
        bufferArray.push(this.fetchName(username));

        const resolvedBuffers = await Promise.all(bufferArray);
        const image = base.composite(resolvedBuffers);

        const buffer = await image.toBuffer();
        const MA = new MessageAttachment(buffer).setFile(buffer);

        if (reply.deletable) reply.delete();
        return message.channel.send(MA);
    }

    /**
     * Fetches the foreground base image and returns a promise containing its
     * composite image.
     */
    private fetchFg(): Promise<CompositeImage> {
        return new Promise(async (res, rej) => {
            const fgReq = await axios({
                url: "https://cdn.discordapp.com/attachments/743473692125954138/743845283749953606/profile-base.png",
                responseType: "arraybuffer",
            });
            const fg = await sharp(fgReq.data).toBuffer();
            res({ input: fg, top: 115, left: 17 });
        });
    }

    private fetchExp(percent: number): Promise<CompositeImage> {
        return new Promise(async (res, rej) => {
            const bar = expProgress(percent);
            const pngBuffer = Buffer.from(bar.split(",")[1], "base64");
            const buffer = await sharp(pngBuffer).toBuffer();
            res({ input: buffer, top: 651, left: 243 });
        });
    }

    private fetchImg(img: string, { xPos, xResize, yPos, yResize }: FetchImageSettings): Promise<CompositeImage> {
        return new Promise(async (res, rej) => {
            const input = (await axios({ url: img, responseType: "arraybuffer" })).data as Buffer;
            const buffer = await sharp(input).resize(xResize, yResize).toBuffer();
            res({ input: buffer, top: yPos, left: xPos });
        });
    }

    private fetchName(username: string): Promise<CompositeImage> {
        return new Promise(async (res) => {
            const nameImg = await generate(username, {
                fontSize: 48,
                lineHeight: 56,
                textColor: "#ffffff",
                bgColor: "rgba(255, 255, 255, 0)",
                margin: 0,
                maxWidth: 340,
                fontWeight: "700",
            });
            const pngBuffer = Buffer.from(nameImg.split(",")[1], "base64");
            const buffer = await sharp(pngBuffer).toBuffer();
            res({ input: buffer, left: 218, top: 244 });
        });
    }
}

interface CommandArguments {
    user: User;
}

interface CompositeImage {
    input: Buffer;
    top: number;
    left: number;
}

interface FetchImageSettings {
    xPos: number;
    yPos: number;
    xResize: number;
    yResize: number;
}
