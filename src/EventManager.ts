import { BotEvent } from "./events/Events.interface";
import Log from "./helpers/Log";
import { EventEmitter } from "events";

export class EventManager extends EventEmitter {
    constructor() {
        super();
    }

    public init() {
        const events = require("require-all")({
            dirname: __dirname + "/events/handlers",
        });
        for (const name in events) {
            const event = new events[name].default() as BotEvent;
            event.start();
        }
        Log.info("Bot", "Bot events registered successfully");
    }

    public alert<K extends keyof EventTypes>(event: K, args: EventTypes[K]) {
        this.emit(event, args);
    }

    public on<K extends keyof EventTypes>(event: K, listener: (args: EventTypes[K]) => void): this {
        this.on(event, listener);
        return this;
    }
}

interface EventTypes {
    levelUp: { userId: string; level: number; guildId?: string };
}
