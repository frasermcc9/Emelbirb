import { Bot } from "../../../Bot";
import { throws } from "assert";
import { IUserSettingsDocument, IUserSettingsModel } from "./UserSettings.model";

//Section: Instance Methods (for document)

export async function setLastUpdated(this: IUserSettingsDocument): Promise<void> {
    const now = new Date();
    if (!this.lastUpdated || this.lastUpdated < now) {
        this.lastUpdated = now;
        await this.save();
    }
}

export async function updateEmail(this: IUserSettingsDocument, { email }: { email: string }): Promise<void> {
    this.email = email;
    await this.setLastUpdated();
    Bot.Get.refreshUserCachePoint(this);
}

export function getEmail(this: IUserSettingsDocument): string | undefined {
    return this.email;
}

//Section: Static Methods (for model)

export async function findOneOrCreate(
    this: IUserSettingsModel,
    { userId }: { userId: string }
): Promise<IUserSettingsDocument> {
    let record: IUserSettingsDocument | null = await this.findOne({ userId: userId });
    if (record == null) {
        record = await this.create({ userId: userId });
    }
    return record;
}
