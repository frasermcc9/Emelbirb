import { model, Model, Document } from "mongoose";
import GlobalSchema from "./Global.schema";
import { Background } from "../../../structures/Background";

export const GlobalModel = model<IGlobalDocument>("global", GlobalSchema) as IGlobalModel;

export interface IGlobal {
    backgrounds: {
        default: string;
        list: { [k: string]: Background };
    };
    dateOfEntry?: Date;
    lastUpdated?: Date;
}
export interface IGlobalDocument extends IGlobal, Document {
    setLastUpdated(this: IGlobalDocument): Promise<void>;
    addBackground(this: IGlobalDocument, ...[name, uri, cost]: [string, string, number]): Promise<void>;
}
export interface IGlobalModel extends Model<IGlobalDocument> {
    getSettings(this: IGlobalModel): Promise<IGlobalDocument>;
}
