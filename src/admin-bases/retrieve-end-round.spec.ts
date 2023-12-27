import { expect } from "@playwright/test";
import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
const env = process.env.npm_config_env || "local"

export class RERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const gameName = this.options.gameConfiguration.name
            const wstoken = await this.admin.getWsToken(gameName)
            let currentRoundID = await this.admin.getRunningRoundId(this.options.Adminconfiguration.wsGameName,gameName,wstoken)
            let getRER= await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id,currentRoundID,this.options.gameConfiguration.accounts[env])
            console.log(getRER);
            await this.verifyRER(getRER,this.options.Adminconfiguration.dataset["TC1_expect"])
        });
    }

    protected TC2() {
        admintest("Verify case roundId is archived", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1
            let getRER= await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id,archivedRoundID,this.options.gameConfiguration.accounts[env])
            await this.verifyRER(getRER,this.options.Adminconfiguration.dataset["TC2_expect"])
        });
    }

    protected TC3() {
        admintest("Verify case Player placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const gameName = this.options.gameConfiguration.name
            const wstoken = await this.admin.getWsToken(gameName)
            let currentRoundID = await this.admin.getRunningRoundId(this.options.Adminconfiguration.wsGameName,gameName,wstoken)
            await this.admin.waitForTimeout(1000)
            const settleRoundID = await this.admin.setGameResult(this.options.Adminconfiguration.wsGameName,gameName,wstoken,currentRoundID+1,this.options.Adminconfiguration.dataset["TC3_settle"],"ws")
            global.settleRoundID = settleRoundID
            
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            const settleRoundID = `roundId":${global.settleRoundID}`
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(settleRoundID);
            this.game.waitForEvent(`settleRoundID`)
            // Act
            await this.player.placeBet(bet.choice, bet.amount);
            await this.game.waitForSettlement();
        });

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER= await this.admin.getRetrieveEndRound(this.options.gameConfiguration.id,global.settleRoundID,this.options.gameConfiguration.accounts[env])
            console.log(getRER);
            await this.verifyRER(getRER,this.options.Adminconfiguration.dataset["TC3_expect"])
            
        });
    }


    //     admintest("Verify case Player placebet 1 choice and win", async () => {
    //         // Arrange
    //         admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
    //     });

    //     admintest("Verify case Player placebet multiples choices and win", async () => {
    //         // Arrange
    //         admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
    //     });

    //     admintest("Verify case Player placebet 1 choice and lose", async () => {
    //         // Arrange
    //         admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
    //     });

    //     admintest("Verify case Player placebet multiples choices and lose", async () => {
    //         // Arrange
    //         admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
    //     });

    // }

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

        admintest.describe.serial(`${this.options.gameConfiguration.name} Admin Tests`, () => {
            admintest.beforeAll(async ({ baseGame,baseAdmin}) => {
                this.game = baseGame;
                this.admin = baseAdmin;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.TC1();
        this.TC2();
        this.TC3();

    }

    async verifyRER (getData: any, expectedData: any){
        expect(getData.totalAmount).toBe(expectedData.totalAmount)
        expect(getData.totalWin).toBe(expectedData.totalWin)
        expect(getData.validBetAmount).toBe(expectedData.validBetAmount)
        expect(getData.errorCode).toBe(expectedData.errorCode)
        expect(getData.errorDescription).toBe(expectedData.errorDescription)
    };
    
}
