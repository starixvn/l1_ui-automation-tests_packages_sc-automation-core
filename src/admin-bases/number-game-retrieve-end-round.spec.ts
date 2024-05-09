import { expect } from "@playwright/test";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import { commonControls } from "../components/base-number-game-locator";

export class NumberRERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify RER on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();

            const getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                currentRoundID,
                this.options.Adminconfiguration.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["runningRound"]);
        });
    }

    protected TC2() {
        admintest("Verify case roundId is archived", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            const getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                this.options.Adminconfiguration.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["archivedRound"]);
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const odds = await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["win_settle1"]);
            global.settleRoundID = currentRoundID;
            global.odds = odds;
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[0],
                amount: this.options.placeBetAmount ?? 10,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            // Act
            await this.placeBetOnRound(bet);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = global.odds;
            const betTimes = await this.getClientTicketBetTimes();
            global.expectedData = { bet, settledResults, betTimes };
        });

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["win_expect1"], global.expectedData.settledResults.winAmount);
        });
    }

    protected TC4() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["win_settle2"]);
            global.settleRoundID = currentRoundID;
        });
        admintest("THEN player able to place a bet and settle on running round", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[0],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            // Act
            await this.placeBetOnRound(bet);
        });

        admintest("Verify RER of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["runningRound"]);
        });
    }

    protected TC5() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const odds = await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["loose_settle1"]);
            global.settleRoundID = currentRoundID;
            global.odds = odds;
        });
        admintest("THEN player able to place a bet and lose", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[0],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            // Act
            await this.placeBetOnRound(bet);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = global.odds;
            const betTimes = await this.getClientTicketBetTimes();
            global.expectedData = { bet, settledResults, betTimes };
        });

        admintest("Verify RER placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["loose_expect1"]);
        });
    }

    protected TC6() {
        admintest("Verify case Player placebet multiple choices and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const odds = await this.game.gnWaitUntilPlaceBet();
            const currentRoundID = await this.getClientRunningRound();
            await this.admin.gnSetUiGameResult(this.admin.page.context(), this.options.gameConfiguration.id, this.dataSet["loose_settle2"]);
            global.settleRoundID = currentRoundID;
            global.odds = odds;
        });
        admintest("THEN player able to placebet multiple choices and lose all", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const amount = this.options.placeBetAmount ?? 1;
            const bet = {
                choices: [this.options.placeBetChoices[0], this.options.placeBetChoices[2]],
                amount: this.options.placeBetAmount ?? 10,
                locators: [
                    this.options.locators.betchoices[this.options.placeBetChoices[0]],
                    this.options.locators.betchoices[this.options.placeBetChoices[2]],
                ],
            };
            // Act
            for (const iterator of bet.locators) {
                await this.game.click(`#chip-${amount}`);
                await this.game.click(iterator);
                await this.game.waitForTimeout(800);
            }
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = global.odds;
            const betTimes = await this.getClientTicketBetTimes();
            global.expectedData = { bet, settledResults, betTimes };
        });

        admintest("Verify RER placebet multiple choices and lose all", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.dataSet.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["loose_expect2"]);
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

        admintest.describe.serial(`${this.options.gameConfiguration.name} Admin Retrieve End Round Tests`, () => {
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

    async verifyRER(getData: any, expectedData: any, totalWin = 0) {
        const checkData = await JSON.parse(getData).result;
        expect(checkData.totalAmount).toBe(expectedData.totalAmount);
        expect(checkData.totalWin).toBe(totalWin);
        expect(checkData.validBetAmount).toBe(expectedData.validBetAmount);
        expect(checkData.errorCode).toBe(expectedData.errorCode);
        expect(checkData.errorDescription).toBe(expectedData.errorDescription);
    }

    async placeBetOnRound(bet: any) {
        await this.game.click(`#chip-${bet.amount}`);
        await this.game.click(bet.locator, 1000);
    }

    async getClientRunningRound() {
        const runningRoundID = await this.game.getText(commonControls.lblRoundId);
        return runningRoundID.trim().replace("#", "");
    }

    async getClientTicketBetTimes() {
        await this.player.gnOpenHistory();
        const settleTime = (await this.game.getText("//table/tbody/tr[1]/td[1]", "innerHTML")).replace(/<br>| /g, " ");
        await this.game.click("//table/tbody/tr[1]/td[2]");
        const placeBetTime = (await this.game.getText("//div[@id='bet-detail']//table/tbody/tr[1]/td[1]", "innerHTML")).replace(
            /<br>| /g,
            " ",
        );
        await this.game.page.reload();
        await this.game.waitForTimeout(3000);
        return { settleTime, placeBetTime };
    }
}
