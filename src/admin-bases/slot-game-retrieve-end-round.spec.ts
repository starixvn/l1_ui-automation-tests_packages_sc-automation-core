import { expect } from "@playwright/test";
import { GameEvent } from "../_shared";
import { admintest, BasePlayer, BaseGame, BaseAdmin } from "../components";
import { IBaseOptions } from "./base-options";

export class SlotRERGameBase {
    admin: BaseAdmin;
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected TC1() {
        admintest("Verify case handId is archived", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const archivedRoundID = 1;
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                archivedRoundID,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.options.Adminconfiguration.datasetRER["expect_archived"]);
        });
    }

    protected TC2() {
        admintest("Set result win for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_win"]
            );
        });
        admintest("Placebet on win choice", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();
            await this.game.waitForTimeout(5000); 
            global.roundId = settledResults.roundId;
        });

        admintest("Verify RER of case win", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.options.Adminconfiguration.datasetRER["expect_win"]);
        });
    }

    protected TC3() {
        admintest("Set result loose for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_loose"]
            );
            await this.admin.waitForTimeout(5000);
        });
        admintest("Placebet on loose choice", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();
            global.roundId = settledResults.roundId;
            await this.game.waitForTimeout(5000);
        });

        admintest("Verify RER of case loose", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.options.Adminconfiguration.datasetRER["expect_loose"]);
        });
    }

    protected TC4() {
        admintest("Set result freespin for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_freespin"]
            );
        });
        admintest("Placebet on case got freespin", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const mainsettledResults =await this.game.waitForSettlement();//wait for main placebet
            await this.game.waitForSettlement();//wait for freespin 1
            await this.game.waitForSettlement();//wait for freespin 2
            await this.game.waitForSettlement();//wait for freespin 3
            global.roundId = mainsettledResults.roundId;
            await this.game.waitForTimeout(8000);

        });

        admintest("Verify RER of freespin", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.options.Adminconfiguration.datasetRER["expect_freespin"]);
        });
    }

    protected TC5() {
        admintest("Set result bonus for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_bonus"]
            );
        });
        admintest("Placebet on case got bonus", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent("bonuses");

            await this.player.placeBet(bet.choice, bet.amount);
            const bonus = await this.game.waitForEvent("bonuses");
            await this.game.waitForTimeout(5000);
            let x = 305
            for (let index = 1; index <= bonus.bonuses.bonus; index++) {
                await this.game.page.mouse.click(x,366)
                x+=150
                if (index == bonus.bonuses.bonus) {
                    const settledResults = await this.game.waitForSettlement();
                    global.roundId = settledResults.roundId;
                    global.winamount = settledResults.winAmount;
                }
                await this.game.waitForTimeout(800);
            }

        });

        admintest("Verify RER of bonus", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.options.Adminconfiguration.datasetRER["expect_bonus"],global.winamount);
            await this.admin.waitForTimeout(5000);

        });
    }

    protected TC6() {
        admintest("Set result jackpot for user", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const settlePath = this.options.Adminconfiguration.settlePath ?? "/";
            await this.admin.postGameResult(
                this.options.Adminconfiguration.settleDomain,
                settlePath,
                this.options.Adminconfiguration.datasetRER["settle_jackpot"]
            );
        });
        admintest("Placebet on case got jackpot", async () => {
            // Arrange
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            // Act
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();
            global.roundId = settledResults.roundId;
            global.winamount = settledResults.winAmount;
            await this.game.waitForTimeout(5000);
        });

        admintest("Verify RER of jackpot", async () => {
            admintest.setTimeout(this.options.gameConfiguration.maxTimeout);
            let getRER = await this.admin.getRetrieveEndRound(
                this.options.gameConfiguration.id,
                global.roundId,
                this.options.Adminconfiguration.accountId
            );
            await this.verifyRER(getRER, this.options.Adminconfiguration.datasetRER["expect_jackpot"],global.winamount);
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
        if (process.env.npm_config_jackpot) {
            this.TC6();
        }
    }

    async verifyRER(getData: any, expectedData: any, winAmount?: number) {
        const checkData = await JSON.parse(getData).result;
        expect(checkData.totalAmount).toBe(expectedData.totalAmount);
        if (winAmount) {
         expect(checkData.totalWin).toBe(winAmount);
        }
        else{
            expect(checkData.totalWin).toBe(expectedData.totalWin);
        }
        expect(checkData.validBetAmount).toBe(expectedData.validBetAmount);
        expect(checkData.errorCode).toBe(expectedData.errorCode);
        expect(checkData.errorDescription).toBe(expectedData.errorDescription);
    }

}
