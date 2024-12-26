import { expect } from "@playwright/test";
import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";
import * as adminLocator from "../components/base-admin-locator";

export class TableRERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify RER on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            await this.game.waitUntilPlaceBet();
            await this.player.placeBet(bet.choice, bet.amount);
            let currentRoundID = Number(await this.getClientRunningRound());
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                currentRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["expect_running"]);
        });
    }

    protected TC2() {
        admintest("Verify case roundId is archived", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["expect_archive"]);
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

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["expect_win"]);
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

        admintest("Verify RER placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["expect_lose"]);
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

        admintest("Verify RER place bet multiple choices and lose all", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["expect_multiple_choices"]);
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

        admintest("Verify RER placebet and result is draw", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["expect_draw"]);
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

    async verifyRER(getData: any, expectedData: any) {
        const checkData = await JSON.parse(getData).result;
        expect(checkData.totalAmount).toBe(expectedData.totalAmount);
        expect(checkData.totalWin).toBe(expectedData.totalWin);
        expect(checkData.validBetAmount).toBe(expectedData.validBetAmount);
        expect(checkData.errorCode).toBe(expectedData.errorCode);
        expect(checkData.errorDescription).toBe(expectedData.errorDescription);
    }

    async placeBetOnRound(bet: { choice: string; amount: number }, roundId: number, isWaitForSettlement = true) {
        this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
        this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
        let currentRoundID = Number(await this.getClientRunningRound());
        if (currentRoundID < roundId && isWaitForSettlement) {
            // Act
            await this.game.waitUntilPlaceBet();
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
