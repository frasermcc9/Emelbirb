import { IGlobalDocument, IGlobalModel } from "./Global.model";
import { set } from "lodash";

export abstract class GlobalDocumentMethods {
    static async setLastUpdated(this: IGlobalDocument): Promise<void> {
        const now = new Date();
        if (!this.lastUpdated || this.lastUpdated < now) {
            this.lastUpdated = now;
            await this.save();
        }
    }

    static async addBackground(this: IGlobalDocument, ...[name, uri, cost]: [string, string, number]): Promise<void> {
        set(this, `backgrounds.list.${name}`, { name: name, uri: uri, cost: cost });
        this.markModified("backgrounds");
        await this.setLastUpdated();
    }
}

export async function getSettings(this: IGlobalModel): Promise<IGlobalDocument> {
    let record: IGlobalDocument | null = await this.findOne();
    return (
        record ??
        (await this.create({
            backgrounds: {
                default: "https://cdn.discordapp.com/attachments/743473692125954138/743473757896835182/bg-default.png",
                list: {},
            },
        }))
    );
}
