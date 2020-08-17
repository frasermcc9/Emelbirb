import { Schema } from "mongoose";
import { findOneOrCreate, UserSettingsMethods } from "./User.functions";

const UserSettingsSchema = new Schema({
    userId: { type: String, required: true },
    email: { type: String, required: false },
    badges: {
        collection: Map,
        equipped: {
            p1: String,
            p2: String,
            p3: String,
            p4: String,
            p5: String,
        },
        background: { type: String, required: false },
        backgrounds: [String],
        aboutMe: String,
    },
    stats: {
        credits: Number,
        exp: Number,
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

UserSettingsSchema.statics.findOneOrCreate = findOneOrCreate;

UserSettingsSchema.methods.setLastUpdated = UserSettingsMethods.setLastUpdated;
UserSettingsSchema.methods.updateEmail = UserSettingsMethods.updateEmail;
UserSettingsSchema.methods.getEmail = UserSettingsMethods.getEmail;

UserSettingsSchema.methods.equipBadge = UserSettingsMethods.equipBadge;
UserSettingsSchema.methods.giveBadge = UserSettingsMethods.giveBadge;
UserSettingsSchema.methods.unequipBadge = UserSettingsMethods.unequipBadge;
UserSettingsSchema.methods.equippedBadges = UserSettingsMethods.equippedBadges;

UserSettingsSchema.methods.getBackground = UserSettingsMethods.getBackground;
UserSettingsSchema.methods.setBackground = UserSettingsMethods.setBackground;
UserSettingsSchema.methods.buyBackground = UserSettingsMethods.buyBackground;

UserSettingsSchema.methods.decrementCredits = UserSettingsMethods.decrementCredits;
UserSettingsSchema.methods.getStats = UserSettingsMethods.getStats;
UserSettingsSchema.methods.incrementStats = UserSettingsMethods.incrementStats;

UserSettingsSchema.methods.setAboutMe = UserSettingsMethods.setAboutMe;

export default UserSettingsSchema;
