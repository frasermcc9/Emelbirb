import { Bot } from "../../../Bot";
import { IUserSettingsDocument, IUserSettingsModel } from "./User.model";
import { IActiveBadges } from "../../../structures/Badges";
import { GlobalModel } from "../Global/Global.model";
import { findBestMatch } from "string-similarity";

//Section: Instance Methods (for document)

export abstract class UserSettingsMethods {
    static getEmail(this: IUserSettingsDocument): string | undefined {
        return this.email;
    }

    static async updateEmail(this: IUserSettingsDocument, { email }: { email: string }): Promise<void> {
        this.email = email;
        await this.setLastUpdated();
        Bot.Get.refreshUserCachePoint(this);
    }

    static async setLastUpdated(this: IUserSettingsDocument): Promise<void> {
        const now = new Date();
        if (!this.lastUpdated || this.lastUpdated < now) {
            this.lastUpdated = now;
            await this.save();
        }
    }

    static equippedBadges(this: IUserSettingsDocument): IActiveBadges {
        if (this.badges.collection == undefined) {
            this.badges.collection = new Map();
        }
        return this.badges.equipped;
    }

    static async giveBadge(this: IUserSettingsDocument, { badge }: { badge: string }): Promise<void> {
        if (this.badges.collection == undefined) {
            this.badges.collection = new Map();
        }
        this.badges.collection.set(badge, badge);
        this.markModified("badges");
        await this.setLastUpdated();
    }

    static async equipBadge(
        this: IUserSettingsDocument,
        { badge, position }: { badge: string; position: keyof IActiveBadges }
    ): Promise<boolean> {
        if (this.badges.collection == undefined) {
            this.badges.collection = new Map();
        }
        if (!this.badges.collection.has(badge)) return false;
        this.badges.equipped[position] = badge;
        this.markModified("badges");
        await this.setLastUpdated();
        return true;
    }

    static async unequipBadge(
        this: IUserSettingsDocument,
        { position }: { position: keyof IActiveBadges }
    ): Promise<void> {
        this.badges.equipped[position] = null;
        this.markModified("badges");
        return await this.setLastUpdated();
    }

    static async setBackground(
        this: IUserSettingsDocument,
        { uri, force }: { uri: string; force?: boolean }
    ): Promise<void> {
        if (this.badges.backgrounds?.includes(uri) || force) {
            this.badges.background = uri;
            this.markModified("badges");
            return await this.setLastUpdated();
        }
    }

    static async getBackground(this: IUserSettingsDocument): Promise<string> {
        let data = this.badges.background;
        if (!data) {
            data = (await GlobalModel.getSettings()).backgrounds.default;
        }
        return data;
    }

    static async buyBackground(this: IUserSettingsDocument, { bg }: { bg: string }): Promise<void> {
        const globalModel = await GlobalModel.getSettings();
        const options = Object.keys(globalModel.backgrounds.list);
        const candidate = findBestMatch(bg, options).bestMatch.target;
        const query = globalModel.backgrounds.list[candidate];
        if (this.badges.backgrounds == undefined) {
            this.badges.backgrounds = [];
        }
        this.badges.backgrounds.push(query.uri);
        this.markModified("badges");
        return await this.setLastUpdated();
    }
}

//Section: Static Methods (for model)

export async function findOneOrCreate(
    this: IUserSettingsModel,
    { userId }: { userId: string }
): Promise<IUserSettingsDocument> {
    let record: IUserSettingsDocument | null = await this.findOne({ userId: userId });
    if (record == null) {
        record = await this.create({
            userId: userId,
            badges: { collection: new Map(), equipped: { p1: null, p2: null, p3: null, p4: null, p5: null } },
        });
    }
    return record;
}
