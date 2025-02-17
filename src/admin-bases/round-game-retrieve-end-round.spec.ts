import { expect } from "@playwright/test";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";

export class RERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];
    operatorId = this.configAdmin[`${process.env.npm_config_project}operatorId`];
    mornitorlocator = this.configAdmin.mornitorlocator;
    settleNextRound = this.configAdmin.isSettleNextRound;

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify case roundId is archived", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["Expect_NoData"]);
        });
    }

    protected TC2() {
        admintest("Verify case Player has ticket on roundId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet();
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, this.dataSet["Settle_Win"]);
            const currentRoundId = await this.getClientRunningRound();
            global.settleRoundID = Number(currentRoundId) + (this.settleNextRound ? 1 : 0);
            if (this.settleNextRound) {
                await this.game.waitUntilNextRound();
            }
        });
        admintest("THEN player able to place a bet and settle on running round", async () => {
            // Arrange

            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.player.placeBet(bet.choice, bet.amount);
        });

        admintest("Verify RER of case of running round", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["Expect_NoData"]);
        });
    }

    protected TC3() {
        admintest("Set result win for user when placing 1 bet choice", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet();
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, this.dataSet["Settle_Win"]);
            const currentRoundId = await this.getClientRunningRound();
            global.settleRoundID = Number(currentRoundId) + (this.settleNextRound ? 1 : 0);
            if (this.settleNextRound) {
                await this.game.waitUntilNextRound();
            }
        });
        admintest("THEN player able to place a bet and settle", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.player.placeBet(bet.choice, bet.amount);
            await this.game.waitForSettlement()
            await this.game.waitForTimeout(5000)
        });

        admintest("Verify RER placebet 1 choice and win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId,
            );
            await this.verifyRER(getRER, this.dataSet["Expect_Win"]);
        });
    }

    protected TC4() {
        admintest("Verify case Player placebet 1 choice and lose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet()
            const tabMonitoring = await this.admin.OpenMonitoring(
                this.admin.page.context(),
                this.options.gameConfiguration.id,
                this.mornitorlocator,
            );
            await this.fillGameResult(tabMonitoring, this.dataSet["Settle_Lose"]);
            const currentRoundId = await this.getClientRunningRound();
            global.settleRoundID = Number(currentRoundId) + (this.settleNextRound ? 1 : 0);
            if (this.settleNextRound) {
                await this.game.waitUntilNextRound();
            }
        });
        admintest("THEN player able to place a bet and settle on lose round", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            await this.player.placeBet(bet.choice, bet.amount);
            await this.game.waitForSettlement()
            await this.game.waitForTimeout(5000)
        });

        admintest("Verify RER of Lose case", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.settleRoundID,
                this.options.Adminconfiguration.accountId,
                this.operatorId
            );
            await this.verifyRER(getRER, this.dataSet["Expect_Lose"]);
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
     }

    async verifyRER(getData: any, expectedData: any) {
        const checkData = await JSON.parse(getData).Result;
        expect(checkData.TotalAmount).toBe(expectedData.totalAmount);
        expect(checkData.ValidBetAmount).toBe(expectedData.validBetAmount);
        expect(checkData.ErrorCode).toBe(expectedData.errorCode);
        expect(checkData.ErrorDescription).toBe(expectedData.errorDescription);
    }

    async getClientRunningRound() {
        return this.game.getTextLocator("roundId");
    }

    async fillGameResult(newTab: any, data: object) {
        for (const [key, value] of Object.entries(data)) {
            await newTab.click(key);
            await newTab.waitForTimeout(200);
            await newTab.click(value);
            await newTab.waitForTimeout(200);
        }
        await newTab.close();
    }
}
