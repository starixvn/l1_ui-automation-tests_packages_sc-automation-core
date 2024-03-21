import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import * as adminLocator from "../components/base-admin-locator";
import { commonControls } from "../components/base-number-game-locator";
import { expect } from "@playwright/test";

export class NumberTicketDetailGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetTicket`];

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify bet detail of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                currentRoundID,
                this.configAdmin.accountId,
                this.configAdmin.operatorId,
            );
            const detailsRunning = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(detailsRunning).toHaveScreenshot(`detailsRunning.png`);
            await betdetailsTab.close();
        });
    }

    protected TC2() {
        admintest("Verify bet detail of archived round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                1,
                this.configAdmin.accountId,
                this.configAdmin.operatorId,
            );
            const archivedRound = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(archivedRound).toHaveScreenshot(`archivedRound.png`);
            await betdetailsTab.close();
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["win_settle"]);
            global.settleRoundID = currentRoundID;
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            // Act
            await this.placeBetOnRound(bet);
        });

        admintest("Verify BetDetails of case placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.configAdmin.operatorId
            );
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID, this.dataSet["win_expect"].snapshot);
        });
    }

    protected TC4() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["win_settle"]);
            global.settleRoundID = currentRoundID;
        });
        admintest("THEN player able to place a bet and settle on running round", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            // Act
            await this.placeBetOnRound(bet, false);
        });

        admintest("Verify BetDetails of case of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.configAdmin.operatorId
            );
            const detailsRunning = await betdetailsTab.locator(adminLocator.commonUiBetDetailsTicket.tblMain);
            await expect(detailsRunning).toHaveScreenshot(`detailsRunning.png`);
        });
    }

    protected TC5() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["loose_settle"]);
            global.settleRoundID = currentRoundID;

        });
        admintest("THEN player able to place a bet and lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 ,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            await this.placeBetOnRound(bet);

        });

        admintest("Verify BetDetails of case placebet 1 choice and lose", async () => {
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.configAdmin.operatorId
            );
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID, this.dataSet["loose_expect"].snapshot);
        });
    }

    protected TC6() {
        admintest("Verify case Player placebet multiple choices and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["loose_settle"]);
            global.settleRoundID = currentRoundID;
        });
        admintest("THEN player able to placebet multiple choices and lose all", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const amount = this.options.placeBetAmount ?? 1;
            const multiplechoices = [
                this.options.locators.betchoices[this.options.placeBetChoices[0]],
                this.options.locators.betchoices[this.options.placeBetChoices[2]],
            ];
            // Act
            for (const iterator of multiplechoices) {
                await this.game.click(`#chip-${amount}`);
                await this.game.click(iterator);
                await this.game.waitForTimeout(800);
              }

        });

        admintest("Verify BetDetails of case placebet multiple choices and lose all", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betdetailsTab = await this.admin.filterBetDetails(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.configAdmin.accountId,
                this.configAdmin.operatorId
            );
            await this.verifyBetDetails(betdetailsTab, global.settleRoundID, this.dataSet["loose_multiple_choices_expect"].snapshot);
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
            admintest.beforeAll(async ({ baseGame, baseAdmin }) => {
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

    async placeBetOnRound(bet, isWaitForSettlement = true) {
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        await this.game.click(`#chip-${bet.amount}`);
        await this.game.click(bet.locator);
        if (isWaitForSettlement) {
            await this.game.waitForEvent(GameEvent.Settlement);
        }
    }

    async getClientRunningRound() {
        const runningRoundID = await this.game.getTextLocator(commonControls.lblRoundId);
        return runningRoundID.trim().replace("#", "");
    }

    async verifyBetDetails(page: any, roundID: number, expectSnapshot: object) {
        const bettime = await page.locator(adminLocator.commonUiBetDetailsTicket.lblBetDate).innerText();
        const roundId = await page.locator(adminLocator.commonUiBetDetailsTicket.lblRoundId).innerText();
        expect(await this.checkDate(bettime)).toBe(true);
        expect(roundId.includes(roundID)).toBe(true);
        for (const key in expectSnapshot) {
            expect(await page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key]);
        }
        await page.close();
    }

    async checkDate(dateString: string) {
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
