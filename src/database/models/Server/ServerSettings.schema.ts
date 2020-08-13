import { Schema } from "mongoose";
import {
    setLastUpdated,
    setMemberCountChannel,
    getMemberCountChannel,
    findOneOrCreate,
    removeGuild,
    setPrefix,
    getPrefix,
    setSuggestionChannel,
    getSuggestionChannel,
    incrementSuggestions,
    setDadbot,
    addCommand,
    deleteCommand,
    getCommands,
    getLogChannel,
    setLogChannel,
    removeLogChannel,
    addBadge,
    removeBadge,
} from "./ServerSettings.functions";

const ServerSettingsSchema = new Schema({
    guildId: { type: String, unique: true },
    memberCounter: { type: String, required: false },
    prefix: { type: String, required: false },
    suggestions: {
        channel: { type: String, required: false },
        counter: { type: Number, default: 0 },
    },
    dadBot: { type: Boolean, required: false },
    guildCommands: { type: Map, required: false },
    logging: {
        channel: { type: String, required: false },
    },
    badges: {
        type: {},
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

ServerSettingsSchema.statics.findOneOrCreate = findOneOrCreate;
ServerSettingsSchema.statics.removeGuild = removeGuild;

ServerSettingsSchema.methods.setMemberCountChannel = setMemberCountChannel;
ServerSettingsSchema.methods.getMemberCountChannel = getMemberCountChannel;

ServerSettingsSchema.methods.setPrefix = setPrefix;
ServerSettingsSchema.methods.getPrefix = getPrefix;

ServerSettingsSchema.methods.setSuggestionChannel = setSuggestionChannel;
ServerSettingsSchema.methods.getSuggestionChannel = getSuggestionChannel;
ServerSettingsSchema.methods.incrementSuggestions = incrementSuggestions;

ServerSettingsSchema.methods.setDadbot = setDadbot;

ServerSettingsSchema.methods.addCommand = addCommand;
ServerSettingsSchema.methods.deleteCommand = deleteCommand;
ServerSettingsSchema.methods.getCommands = getCommands;

ServerSettingsSchema.methods.getLogChannel = getLogChannel;
ServerSettingsSchema.methods.setLogChannel = setLogChannel;
ServerSettingsSchema.methods.removeLogChannel = removeLogChannel;

ServerSettingsSchema.methods.addBadge = addBadge;
ServerSettingsSchema.methods.removeBadge = removeBadge;

ServerSettingsSchema.methods.setLastUpdated = setLastUpdated;

export default ServerSettingsSchema;
