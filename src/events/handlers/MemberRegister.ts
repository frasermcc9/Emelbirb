import { BotEvent } from "../Events.interface";
import { Bot } from "../../Bot";
import { ServerSettingsModel } from "../../database/models/Server/Server.model";
import { GoogleSpreadsheet } from "google-spreadsheet";
import Log from "../../helpers/Log";
import { UserSettingsModel } from "../../database/models/Client/User.model";

/**
 * Gets list of members from the spreadsheet
 */
export default class MemberRegisterCount implements BotEvent {
    private client: Bot = Bot.Get;

    async start(): Promise<void> {
        await this.SheetReader();
        await this.DatabaseReader();
    }

    private async SheetReader() {
        if (process.env.MEMBER_SHEET == undefined) {
            return Log.error("MemberRegister", "No MEMBER_SHEET value provided in env file.");
        }
        const credentials = require("../../../client_secret.json");
        const document = new GoogleSpreadsheet(process.env.MEMBER_SHEET);
        await document.useServiceAccountAuth(credentials);
        await document.loadInfo();

        const sheet = document.sheetsByIndex[0];
        const rows = await sheet.getRows();

        rows.forEach((row) => {
            const email: string = row["University Email Address"];
            const name = row["Full Name (AS SHOWN ON ID CARD)"];
            const uniId = row["ID Number (N/A if non-UoA Student)"];
            const games = row["What games do you play?"];
            const studyYear = row["What year of study are you in?"];
            this.client.addClubMember({
                email: email.toLowerCase(),
                name: name,
                uniId: uniId,
                games: games,
                studyYear: studyYear,
            });
        });
    }

    private async DatabaseReader() {
        const users = await UserSettingsModel.find();
        users.forEach((user) => {
            this.client.refreshUserCachePoint(user);
        });
    }
}
