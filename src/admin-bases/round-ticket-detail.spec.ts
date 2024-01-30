import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { expect } from "@playwright/test";

export class TicketDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let currentRoundID = await this.admin.getRunningRoundId(this.admin.page.context(),this.options.gameConfiguration.id);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,currentRoundID,this.configAdmin.accountId);
            const detailsRunning = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(detailsRunning).toHaveScreenshot(`detailsRunning.png`);
            await betdetailsTab.close()
        });
    }

    protected TC2() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,1,this.configAdmin.accountId);
            const archivedRound = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(archivedRound).toHaveScreenshot(`archivedRound.png`);
            await betdetailsTab.close()
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id , this.dataSet["TC3_settle"])
            global.settleRoundID = settleRoundId
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.placeBetOnRound(bet, global.settleRoundID);
        });

        admintest("Verify BetDetails of case placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID , this.dataSet["TC3_expect"].snapshot);
        });
    }

    protected TC4() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id , this.dataSet["TC4_settle"])
            global.settleRoundID = settleRoundId

        });
        admintest("THEN player able to place a bet and settle on running round", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.placeBetOnRound(bet, global.settleRoundID, false);
        });

        admintest("Verify BetDetails of case of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            const detailsRunning = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(detailsRunning).toHaveScreenshot(`detailsRunning.png`);
        });
    }

    protected TC5() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id , this.dataSet["TC5_settle"])
            global.settleRoundID = settleRoundId
        });
        admintest("THEN player able to place a bet and lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            await this.placeBetOnRound(bet, global.settleRoundID);
        });

        admintest("Verify BetDetails of case placebet 1 choice and lose", async () => {
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID , this.dataSet["TC5_expect"].snapshot);
        });
    }

    protected TC6() {
        admintest("Verify case Player placebet multiple choices and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id , this.dataSet["TC6_settle"])
            global.settleRoundID = settleRoundId
        });
        admintest("THEN player able to placebet multiple choices and lose all", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.OwnBets);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            // Act
            let betChoices: any = this.options.multiPlaceBetChoices;
            const amount = this.options.placeBetAmount ?? 1;
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            let currentRoundID = Number(await this.getClientRunningRound());
            if (currentRoundID !=  global.settleRoundID) {
                await this.game.waitUntilPlaceBet()
            }
            for (const iterator of betChoices) {
                await this.game.clickStake(amount);
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
              }

            // Act
            await this.game.waitForEvent(GameEvent.Settlement);
        });

        admintest("Verify BetDetails of case placebet multiple choices and lose all", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID , this.dataSet["TC6_expect"].snapshot);
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
        this.TC1();
        this.TC2();
        this.TC3();
        this.TC4();
        this.TC5();
        this.TC6();

    }

    async placeBetOnRound(bet: { choice: string; amount: number }, roundId: number, isWaitForSettlement = true) {
        this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        let currentRoundID = Number(await this.getClientRunningRound());
        if (currentRoundID < roundId && isWaitForSettlement) {
            // Act
            await this.player.placeBet(bet.choice, bet.amount);
            await this.game.waitForEvent(GameEvent.Settlement);
        }
        else if (currentRoundID ===  roundId && isWaitForSettlement) {

            await this.game.clickStake(bet.amount);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(800);
            await this.game.waitForEvent(GameEvent.Settlement);
        }
        else if (currentRoundID ===  roundId) {

            await this.game.clickStake(bet.amount);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(800);
        }
        else if (currentRoundID !=  roundId) {
            await this.game.waitUntilPlaceBet()
            await this.game.clickStake(bet.amount);
            await this.game.clickToChoice(bet.choice);
            await this.game.waitForTimeout(800);
        }
    }

    async getClientRunningRound() {
        return this.game.getTextLocator("roundId");
    }

    async verifyBetDetails(page: any, roundID: number, expectSnapshot: object) {
        let bettime = await page.locator(adminLocator.commonUiBetDetailsTicket.lblBetDate).innerText()
        let roundId = await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText()

        expect(await this.checkDate(bettime)).toBe(true);
        expect(roundId.includes(roundID)).toBe(true);

        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key]);
        }
        await page.close()
    }

    async checkDate(dateString:string) {
        // Parse the date string
        const date = new Date(dateString);
    
        // Get the current date
        const currentDate = new Date();
    
        // Compare the year, month, and day
        const sameYear = date.getFullYear() === currentDate.getFullYear();
        const sameMonth = date.getMonth() === currentDate.getMonth();
        const sameDay = date.getDate() === currentDate.getDate();
    
        // If all three are true, the dates are the same
        return sameYear && sameMonth && sameDay;
    }
}
