import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { expect } from "@playwright/test";

export class TableTicketDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            await this.player.placeBet(bet.choice, bet.amount);
            let currentRoundID = Number(await this.getClientRunningRound());
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
        admintest("Place bet on 1 bet choice win", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.game.waitUntilPlaceBet();
            await this.player.placeBet(bet.choice, bet.amount);
            let currentRoundID = Number(await this.getClientRunningRound());
            global.settleRoundID = currentRoundID;
        });

        admintest("Set result win for the bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.setUIGameResult(this.admin.page.context(), this.dataSet["settle_win"])
            await this.game.waitForEvent(GameEvent.Settlement);
        });

        admintest("Verify BetDetails of case placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID , this.dataSet["expect_win"].snapshot);
        });
    }

    protected TC4() {
        admintest("Place bet on 1 bet choice lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.game.waitUntilPlaceBet();
            await this.player.placeBet(bet.choice, bet.amount);
            let currentRoundID = Number(await this.getClientRunningRound());
            global.settleRoundID = currentRoundID;
        });

        admintest("Set result lose for the bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.setUIGameResult(this.admin.page.context(), this.dataSet["settle_lose"])
            await this.game.waitForEvent(GameEvent.Settlement);
        });

        admintest("Verify BetDetails of case placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID , this.dataSet["expect_lose"].snapshot);
        });
    }

    protected TC5() {
        admintest("Place bet on multiple bet choices", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let betChoices: any = this.options.multiPlaceBetChoices;
            await this.game.waitUntilPlaceBet();
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
            }
            let currentRoundID = Number(await this.getClientRunningRound());
            global.settleRoundID = currentRoundID;
        });

        admintest("Set result lose for all bet choices", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.setUIGameResult(this.admin.page.context(), this.dataSet["settle_lose_multiple_choices"])
            await this.game.waitForEvent(GameEvent.Settlement);
        });

        admintest("Verify BetDetails of case placebet multiple bet choices and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID , this.dataSet["expect_multiple_choices"].snapshot);
        });
    }

    protected TC6() {
        admintest("Place bet on 1 bet choice draw", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.game.waitUntilPlaceBet();
            await this.player.placeBet(bet.choice, bet.amount);
            let currentRoundID = Number(await this.getClientRunningRound());
            global.settleRoundID = currentRoundID;
        });

        admintest("Set result draw", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.setUIGameResult(this.admin.page.context(), this.dataSet["settle_draw"])
            await this.game.waitForEvent(GameEvent.Settlement);
        });

        admintest("Verify bet details placebet and result is draw", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(this.admin.page.context(),this.options.gameConfiguration.id,global.settleRoundID,this.configAdmin.accountId);
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID , this.dataSet["expect_draw"].snapshot);
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
            locators: [this.options.locators],
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
        let roundId = await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText()

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

    protected async setUIGameResult(context: any, data: object) {
        const admindomain = new URL(this.admin.page.url());
        const monitoring = admindomain.protocol + "//" + admindomain.hostname + "/GameSettings/GameMonitor";
        await this.admin.page.goto(monitoring);
        await this.admin.page.focus(adminLocator.monitoring[this.options.gameConfiguration.id]);
        const [newTab] = await Promise.all([
            context.waitForEvent("page"),
            await this.admin.page.click(adminLocator.monitoring[this.options.gameConfiguration.id]),
        ]);
        await newTab.waitForLoadState();
        await this.fillGameResult(newTab, data);
    }

    protected async fillGameResult(newTab: any ,data: object) {
        for (const [key, value] of Object.entries(data)) {
            await newTab.click(key);
            await newTab.waitForTimeout(200);
            await newTab.click(value);
            await newTab.waitForTimeout(200);
        }
        await newTab.click(adminLocator.commonUiResult.btnSubmit);
        await newTab.close();
    }
}
