import { Schema } from "mongoose";
import { GlobalDocumentMethods, getSettings } from "./Global.functions";

const GlobalSchema = new Schema({
    backgrounds: {
        default: String,
        list: {},
    },
    dateOfEntry: {
        type: Date,
        default: new Date(),
    },
    lastUpdated: {
        type: Date,
        default: new Date(),
    },
});

GlobalSchema.statics.getSettings = getSettings;

GlobalSchema.methods.setLastUpdated = GlobalDocumentMethods.setLastUpdated;
GlobalSchema.methods.addBackground = GlobalDocumentMethods.addBackground;

export default GlobalSchema;
