import { model, Model, Document } from "mongoose";
import UserSettingsSchema from "./UserSettings.schema";

export const UserSettingsModel = model<IUserSettingsDocument>(
    "userSettings",
    UserSettingsSchema
) as IUserSettingsModel;

export interface IUserSettings {
    userId: string;
    email?: string;
    dateOfEntry?: Date;
    lastUpdated?: Date;
}
export interface IUserSettingsDocument extends IUserSettings, Document {
    setLastUpdated(this: IUserSettingsDocument): Promise<void>;
    updateEmail(this: IUserSettingsDocument, { email }: { email: string }): Promise<void>;
    getEmail(this: IUserSettingsDocument): string | undefined;
}
export interface IUserSettingsModel extends Model<IUserSettingsDocument> {
    findOneOrCreate(this: IUserSettingsModel, { userId }: { userId: string }): Promise<IUserSettingsDocument>;
}
