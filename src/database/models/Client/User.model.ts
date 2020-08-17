import { model, Model, Document } from "mongoose";
import UserSettingsSchema from "./User.schema";
import { IActiveBadges } from "../../../structures/Badges";

export const UserSettingsModel = model<IUserSettingsDocument>("userSettings", UserSettingsSchema) as IUserSettingsModel;

export interface IUserSettings {
    userId: string;
    email?: string;
    badges: {
        collection: Map<string, string>;
        equipped: {
            p1: string | null;
            p2: string | null;
            p3: string | null;
            p4: string | null;
            p5: string | null;
        };
        background?: string;
        backgrounds?: string[];
        aboutMe?: string;
    };
    stats: {
        credits: number;
        exp: number;
    };
    dateOfEntry?: Date;
    lastUpdated?: Date;
}
export interface IUserSettingsDocument extends IUserSettings, Document {
    setLastUpdated(this: IUserSettingsDocument): Promise<void>;
    updateEmail(this: IUserSettingsDocument, { email }: { email: string }): Promise<void>;
    getEmail(this: IUserSettingsDocument): string | undefined;
    equippedBadges(this: IUserSettingsDocument): IActiveBadges;
    giveBadge(this: IUserSettingsDocument, { badge }: { badge: string }): Promise<void>;
    equipBadge(
        this: IUserSettingsDocument,
        { badge, position }: { badge: string; position: keyof IActiveBadges }
    ): Promise<boolean>;
    unequipBadge(this: IUserSettingsDocument, { position }: { position: keyof IActiveBadges }): Promise<void>;

    setBackground(this: IUserSettingsDocument, { uri, force }: { uri: string; force?: boolean }): Promise<boolean>;
    getBackground(this: IUserSettingsDocument): Promise<string>;
    buyBackground(this: IUserSettingsDocument, { bg }: { bg: string }): Promise<boolean>;

    incrementStats(this: IUserSettingsDocument, exp: number, cred: number, guildId?: string): Promise<void>;
    decrementCredits(this: IUserSettingsDocument, n: number): Promise<boolean>;
    getStats(this: IUserSettingsDocument): { credits: number; exp: number };

    setAboutMe(this: IUserSettingsDocument, details: string): Promise<void>;
}

export interface IUserSettingsModel extends Model<IUserSettingsDocument> {
    findOneOrCreate(this: IUserSettingsModel, { userId }: { userId: string }): Promise<IUserSettingsDocument>;
}
