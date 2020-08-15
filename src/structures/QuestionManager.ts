import { EventEmitter } from "events";
import { Bot } from "../Bot";
import { TextChannel } from "discord.js";

export class QuestionManager extends EventEmitter {
    private constructor() {
        super();
        this.questionMap = new Map();
        this.initiateEvents();
        //defaults
        this.dmList = ["", ""];
        this.guild = "";
        this.channel = "";
    }

    private static instance: QuestionManager;
    public static get get(): QuestionManager {
        if (this.instance == undefined) {
            this.instance = new QuestionManager();
        }
        return this.instance;
    }
    private initiateEvents() {
        this.on("firstAnswer", async (questionData) => {
            const message = (Bot.Get.guilds
                .resolve(questionData.guildId!)
                ?.channels.resolve(questionData.channelId!) as TextChannel).messages.resolve(questionData.messageId!);
            const embed = message?.embeds[0]!;
            embed.fields[0] = {
                name: `${questionData.p1Answer?.person}'s Response`,
                value: `Awaiting the response from the other person before displaying...`,
                inline: true,
            };
            embed.setColor("#ede911");
            await message?.edit(embed);
        });
        this.on("secondAnswer", async (questionData) => {
            const message = (Bot.Get.guilds
                .resolve(questionData.guildId!)
                ?.channels.resolve(questionData.channelId!) as TextChannel).messages.resolve(questionData.messageId!);
            const embed = message?.embeds[0]!;
            embed!.fields[0] = {
                name: `${questionData.p1Answer?.person}'s Response`,
                value: questionData.p1Answer!.answer,
                inline: true,
            };
            embed!.fields[1] = {
                name: `${questionData.p2Answer?.person}'s Response`,
                value: questionData.p2Answer!.answer,
                inline: true,
            };
            embed!.setColor("#1cc71f");
            await message?.edit(embed);
        });
    }

    private questionMap: Map<number, IQuestion>;

    private dmList: [string, string];

    private guild: string;
    private channel: string;

    public set DmList(list: [string, string]) {
        this.dmList = list;
    }
    public get DmList() {
        return this.dmList;
    }
    public set Guild(id: string) {
        this.guild = id;
    }
    public get Guild() {
        return this.guild;
    }
    public set Channel(id: string) {
        this.channel = id;
    }
    public get Channel() {
        return this.channel;
    }

    /**
     * Adds a pending question. Returns the question object with an id
     * @param question the question
     */
    public addQuestion(question: IQuestion): IQuestion {
        const newId = this.questionMap.size + 1;
        question.id = newId;
        this.questionMap.set(newId, question);
        return question;
    }

    public setQuestionReturnPoint(question: IQuestion, location: IQuestionLocation): IQuestion {
        question.guildId = location.guildId;
        question.channelId = location.channelId;
        question.messageId = location.messageId;
        return question;
    }

    public submitAnswer(id: number, answer: string, person: string, personId: string): boolean {
        const question = this.questionMap.get(id);
        if (question === undefined) {
            return false;
        }
        if (question.p1Answer === undefined) {
            question.p1Answer = {
                answer: answer,
                person: person,
                personId: personId,
            };
            this.emit("firstAnswer", question);
        } else if (question.p2Answer === undefined && personId !== question.p1Answer.personId) {
            question.p2Answer = {
                answer: answer,
                person: person,
                personId: personId,
            };
            this.emit("secondAnswer", question);
        } else {
            return false;
        }
        return true;
    }
}

export declare interface QuestionManager {
    on(event: "firstAnswer", listener: (question: IQuestion) => void): this;
    on(event: "secondAnswer", listener: (question: IQuestion) => void): this;
}

interface IQuestion extends IAnswerers, IQuestionLocation {
    question: string;
    id?: number;
}

interface IQuestionLocation {
    guildId?: string;
    channelId?: string;
    messageId?: string;
}

interface IAnswerers {
    p1Answer?: {
        person: string;
        personId: string;
        answer: string;
    };
    p2Answer?: {
        person: string;
        personId: string;
        answer: string;
    };
}
