import { IServerSettingsDocument, IServerSettingsModel } from "./ServerSettings.model";
import { Bot } from "../../../Bot";
import { throws } from "assert";

//Section: Instance Methods (for document)

export async function setLastUpdated(this: IServerSettingsDocument): Promise<void> {
    const now = new Date();
    if (!this.lastUpdated || this.lastUpdated < now) {
        this.lastUpdated = now;
        await this.save();
    }
    Bot.Get.refreshCachePoint(this);
}

export function getMemberCountChannel(this: IServerSettingsDocument): string | undefined {
    return this.memberCounter;
}

export async function setMemberCountChannel(
    this: IServerSettingsDocument,
    { channelId }: { channelId: string }
): Promise<void> {
    this.memberCounter = channelId;
    await this.setLastUpdated();
}

export async function setPrefix(this: IServerSettingsDocument, { prefix }: { prefix: string }) {
    this.prefix = prefix;
    return await this.setLastUpdated();
}

export function getPrefix(this: IServerSettingsDocument): string | undefined {
    return this.prefix;
}

export async function setSuggestionChannel(this: IServerSettingsDocument, { channelId }: { channelId: string }) {
    this.suggestions.channel = channelId;
    return await this.setLastUpdated();
}

export function getSuggestionChannel(this: IServerSettingsDocument): string | undefined {
    return this.suggestions.channel;
}

export async function incrementSuggestions(this: IServerSettingsDocument): Promise<number> {
    this.suggestions.counter += 1;
    await this.setLastUpdated();
    return this.suggestions.counter;
}

export async function setDadbot(this: IServerSettingsDocument, { setting }: { setting: boolean }): Promise<void> {
    this.dadBot = setting;
    return await this.setLastUpdated();
}

export async function addCommand(
    this: IServerSettingsDocument,
    { name, response }: { name: string; response: string }
): Promise<void> {
    if (this.guildCommands == undefined) {
        this.guildCommands = new Map<string, string>();
    }
    this.guildCommands.set(name, response);
    await this.setLastUpdated();
}

export async function deleteCommand(this: IServerSettingsDocument, { name }: { name: string }): Promise<boolean> {
    const result = this.guildCommands?.has(name);
    this.guildCommands?.delete(name);
    Bot.Get.destroyCommandListener(this.guildId, name);
    await this.setLastUpdated();
    return result ?? false;
}

export async function getCommands(this: IServerSettingsDocument): Promise<Map<string, string>> {
    if (this.guildCommands == undefined) {
        this.guildCommands = new Map<string, string>();
        await this.setLastUpdated();
    }
    return this.guildCommands;
}

export async function setLogChannel(this: IServerSettingsDocument, { channel }: { channel: string }): Promise<void> {
    this.logging.channel = channel;
    await this.setLastUpdated();
}
export async function getLogChannel(this: IServerSettingsDocument): Promise<string | undefined> {
    return this.logging.channel;
}
export async function removeLogChannel(this: IServerSettingsDocument): Promise<void> {
    this.logging.channel = undefined;
    await this.setLastUpdated();
}

export async function addBadge(
    this: IServerSettingsDocument,
    {
        badgeUri,
        badgeName,
        tier,
        description,
    }: { badgeUri: string; badgeName: string; tier: number; description: string }
): Promise<void> {
    if (this.badges == undefined) {
        this.badges = {};
    }
    this.badges[badgeName] = { uri: badgeUri, name: badgeName, tier: tier, description: description };
    this.markModified("badges");
    return await this.setLastUpdated();
}

export async function removeBadge(this: IServerSettingsDocument, { badgeName }: { badgeName: string }): Promise<void> {
    if (this.badges == undefined) {
        this.badges = {};
    }
    delete this.badges[badgeName];
    this.markModified("badges");
    return await this.setLastUpdated();
}

//Section: Static Methods (for model)

export async function findOneOrCreate(
    this: IServerSettingsModel,
    { guildId }: { guildId: string }
): Promise<IServerSettingsDocument> {
    let record: IServerSettingsDocument | null = await this.findOne({ guildId: guildId });
    if (record == null) {
        record = await this.create({
            guildId: guildId,
            suggestions: { counter: 0 },
            guildCommands: new Map(),
            logging: {},
            badges: {},
        });
        Bot.Get.refreshCachePoint(record);
    }
    return record;
}

export async function removeGuild(this: IServerSettingsModel, { guildId }: { guildId: string }): Promise<void> {
    await this.findOneAndDelete({ guildId: guildId });
}
