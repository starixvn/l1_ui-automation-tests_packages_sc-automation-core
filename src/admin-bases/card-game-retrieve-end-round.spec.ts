import { expect } from "@playwright/test";
import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";

export class CardRERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;
    configAdmin = this.options.Adminconfiguration;
    dataSet = this.configAdmin[`${process.env.npm_config_project}datasetRER`];

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("User Place a Bet to get running handId", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            await this.standCard();
            let currentRoundID = Number(await this.getClientRunningRound());
            global.roundId = currentRoundID;
        });

        admintest("Verify RER on handId is running", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["TC1_expect"]);
            await this.cancelBet();
        });
    }

    protected TC2() {
        admintest("Verify case handId is archived", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["TC2_expect"]);
        });
    }

    protected TC3() {
        admintest("Set result win for a hand ", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.dataSet["TC3_settle"]
            );
        });
        admintest("Placebet on win hand", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            await this.followCardAndSettle();
            let currentRoundID = Number(await this.getClientRunningRound());
            await this.cancelBet();
            global.roundId = currentRoundID;
        });

        admintest("Verify RER of case hand is win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["TC3_expect"]);
        });
    }

    protected TC4() {
        admintest("Set result loose for hand ", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.dataSet["TC4_settle"]
            );
        });
        admintest("Placebet on loose hand", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            await this.followCardAndSettle();
            let currentRoundID = Number(await this.getClientRunningRound());
            await this.cancelBet();
            global.roundId = currentRoundID;
        });

        admintest("Verify RER of case handId is loose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["TC4_expect"]);
        });
    }

    protected TC5() {
        admintest("Placebet on a hand then Cancel Bet", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            await this.player.placeBet(bet.choice, bet.amount);
            await this.followCardThenCancel();
            let currentRoundID = Number(await this.getClientRunningRound());
            await this.cancelBet();
            global.roundId = currentRoundID;
        });

        admintest("Verify RER of case hand is cancel", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.dataSet["TC5_expect"]);
        });
    }

    protected TC6() {
        admintest("Set result win for multiple hands ", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.dataSet["TC6_settle"]
            );
        });
        admintest("Placebet on win hands", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            let betChoices: any = this.options.multiPlaceBetChoices;
            const amount = this.options.placeBetAmount ?? 1;
            for (const iterator of betChoices) {
                await this.game.clickStake(amount);
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(1000);
            }
            await this.game.clickSubmitBet();
            await this.followCardAndSettle();
            let currentRoundID = Number(await this.getClientRunningRound());
            await this.cancelBet();
            global.roundId = currentRoundID;
        });

        admintest("Verify RER of case multiple hands is win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
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

    async verifyRER(getData: any, expectedData: any) {
        const checkData = await JSON.parse(getData).result;
        expect(checkData.totalAmount).toBe(expectedData.totalAmount);
        expect(checkData.totalWin).toBe(expectedData.totalWin);
        expect(checkData.validBetAmount).toBe(expectedData.validBetAmount);
        expect(checkData.errorCode).toBe(expectedData.errorCode);
        expect(checkData.errorDescription).toBe(expectedData.errorDescription);
    }

    async followCardAndSettle() {
        this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
        await this.game.waitForTimeout(8000);
        await this.game.clickLocator("standcard", 10000);
        await this.game.clickLocator("followcard", 5000);
        await this.game.waitForTimeout();
        await this.game.latestCaptureEvent(GameEvent.EndBet);
    }

    async followCardThenCancel() {
        await this.game.clickLocator("standcard", 10000);
        await this.game.clickLocator("cancelbet", 2000);
    }

    async getClientRunningRound() {
        return this.game.getTextLocator("roundId");
    }

    async standCard() {
        await this.game.clickLocator("standcard", 8000);
    }

    async cancelBet() {
        for (let i = 0; i < 3; i++) {
            await this.game.clickLocator("cancelbet", 2000);
        }
    }
}
