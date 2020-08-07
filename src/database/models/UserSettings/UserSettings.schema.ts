import { Schema } from "mongoose";
import { findOneOrCreate, setLastUpdated, updateEmail, getEmail } from "./UserSettings.functions";

const UserSettingsSchema = new Schema({
    userId: { type: String, required: true },
    email: { type: String, required: false },
    dateOfEntry: {
        type: Date,
        default: new Date(),
    },
    lastUpdated: {
        type: Date,
        default: new Date(),
    },
});

UserSettingsSchema.statics.findOneOrCreate = findOneOrCreate;

UserSettingsSchema.methods.setLastUpdated = setLastUpdated;
UserSettingsSchema.methods.updateEmail = updateEmail;
UserSettingsSchema.methods.getEmail = getEmail;

export default UserSettingsSchema;
