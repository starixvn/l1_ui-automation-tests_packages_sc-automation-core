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

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let currentRoundID = await this.admin.getRunningRoundId(this.admin.page.context(),this.options.gameConfiguration.id);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.configAdmin.gameType,currentRoundID,this.configAdmin.accountId);
            const detailsRunning = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(detailsRunning).toHaveScreenshot(`detailsRunning`);
        });
    }

    protected TC2() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.configAdmin.gameType,1,this.configAdmin.accountId);
            const archivedRound = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(archivedRound).toHaveScreenshot(`archivedRound`);
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.options.Adminconfiguration.datasetTicket["TC3_settle"])
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
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.configAdmin.gameType,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, this.options.Adminconfiguration.datasetTicket["TC3_expect"].value, this.options.Adminconfiguration.datasetTicket["TC3_expect"].snapshot);
        });
    }

    protected TC4() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.options.Adminconfiguration.datasetTicket["TC4_settle"])
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
            // await this.verifyBetDetails(getRER, this.options.Adminconfiguration.datasetTicket["TC4_expect"]);
        });
    }

    protected TC5() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.options.Adminconfiguration.datasetTicket["TC5_settle"])
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
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            // await this.verifyBetDetails(getRER, this.options.Adminconfiguration.datasetTicket["TC5_expect"]);
        });
    }

    protected TC6() {
        admintest("Verify case Player placebet multiple choices and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.options.Adminconfiguration.datasetTicket["TC6_settle"])
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
            // await this.verifyBetDetails(getRER, this.options.Adminconfiguration.datasetTicket["TC6_expect"]);
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

    async verifyBetDetails(page: any, expectValue: object, expectSnapshot: object) {
        for (const key in expectValue) {
            const elementText = await page.getTextLocator(key);
            const expectedText = expectValue[key];
            expect(elementText).toEqual(expectedText);
        }

        for (const key in expectSnapshot) {
            const screenshot = await page.locator(key).screenshot();
            expect(screenshot).toMatchSnapshot(expectSnapshot[key]);
        }
    }

    
}
