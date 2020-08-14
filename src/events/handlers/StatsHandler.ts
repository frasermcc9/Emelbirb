import { BotEvent } from "../Events.interface";
import { Bot } from "../../Bot";
import { Message } from "discord.js";
import { UserSettingsModel } from "../../database/models/Client/User.model";

export default class StatsHandler implements BotEvent {
    private client: Bot = Bot.Get;

    private dailyMap = new Map<string, number>();

    start(): void {
        this.client.on("message", this.handler);
        setTimeout(() => {
            this.dailyMap.clear();
        }, 1000 * 3600 * 24);
    }

    private handler = async (message: Message) => {
        const userId = message.author.id;
        const user = await UserSettingsModel.findOneOrCreate({ userId: userId });

        const usages = this.dailyMap.set(userId, (this.dailyMap.get(userId) ?? 0) + 1).get(userId)!;

        const multiplier = usages <= 10 ? 5 : 1;

        const exp = ~~((Math.random() * 10 + 1) * multiplier);
        const credits = ~~((Math.random() * 3 + 1) * multiplier);

        user.incrementStats(exp, credits);
    };
}
