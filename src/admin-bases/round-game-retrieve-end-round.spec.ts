import { expect } from "@playwright/test";
import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";

export class RERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];
    operatorId = this.configAdmin[`${process.env.npm_config_project}operatorId`]
    mornitorlocator = this.configAdmin.mornitorlocator

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify RER on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let currentRoundID = await this.admin.getRunningRoundId(this.admin.page.context(),this.options.gameConfiguration.id,this.mornitorlocator);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                currentRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId
            );
            await this.verifyRER(getRER, this.dataSet["TC1_expect"]);
        });
    }

    protected TC2() {
        admintest("Verify case roundId is archived", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId
            );
            await this.verifyRER(getRER, this.dataSet["TC2_expect"]);
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.dataSet["TC3_settle"],this.mornitorlocator)
            global.settleRoundID = settleRoundId
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.placeBetOnRound(bet, global.settleRoundID);
        });

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId
            );
            await this.verifyRER(getRER, this.dataSet["TC3_expect"]);
        });
    }

    protected TC4() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.dataSet["TC4_settle"],this.mornitorlocator)
            global.settleRoundID = settleRoundId

        });
        admintest("THEN player able to place a bet and settle on running round", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.placeBetOnRound(bet, global.settleRoundID, false);
        });

        admintest("Verify RER of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["TC4_expect"]);
        });
    }

    protected TC5() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.dataSet["TC5_settle"],this.mornitorlocator)
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

        admintest("Verify RER placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId
            );
            await this.verifyRER(getRER, this.dataSet["TC5_expect"]);
        });
    }

    protected TC6() {
        admintest("Verify case Player placebet multiple choices and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settleRoundId = await this.admin.setUiGameResult(this.admin.page.context(),this.options.gameConfiguration.id ,this.dataSet["TC6_settle"],this.mornitorlocator)
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

        admintest("Verify RER placebet multiple choices and lose all", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId
            );
            await this.verifyRER(getRER, this.dataSet["TC6_expect"]);
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
}
