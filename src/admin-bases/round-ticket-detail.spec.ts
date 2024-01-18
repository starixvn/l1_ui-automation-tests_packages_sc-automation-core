import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";

export class TicketDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;

    constructor(protected options: IBaseOptions) {}

    protected TC01() {
        admintest("Verify bet detail of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let currentRoundID = await this.admin.getRunningRoundId(this.admin.page.context(),this.options.gameConfiguration.id);
            const betdetails = await this.admin.filterBetDetails(this.admin.page.context(),this.configAdmin.gameType,currentRoundID,this.configAdmin.accountId);
            
        });
    }

    protected Verify_Result_and_Bet_Detail_In_Case() {
        admintest("Verify result and bet detail in case", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        });
    }

    protected Verify_Ticket_Detail_table() {
        admintest("Verify Result - Bet detail in case Player's hand Won", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
        
        });
    }

      start(): void {
        admintest.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.options.snapshotFolderPath + "-snapshots/" + name;

                return snapshotPath;
            };
        });

        admintest.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: this.options.locators,
        });

        admintest.describe.serial(`${this.options.gameConfiguration.name} Ticket Detail Tests`, () => {
            admintest.beforeAll(async ({ baseGame,baseAdmin}) => {
                this.game = baseGame;
                this.admin = baseAdmin;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.Verify_UI_and_Format();
        this.Verify_Result_and_Bet_Detail_In_Case();
        this.Verify_Ticket_Detail_table();

    }

    
}
