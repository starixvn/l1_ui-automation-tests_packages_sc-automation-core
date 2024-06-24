import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame, GameConfiguration } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";

export interface MultiplayGameOptions extends IBaseOptions {
    gameConfiguration: GameConfiguration;
    subGameConfigurations: GameConfiguration[];
}

export class MultiplayGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: MultiplayGameOptions) {}

    protected inGameBetChoiceTests() {
        test("AND bet choices should be displayed on table", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilNextRound();
            await this.game.clickLocator("closeguide");
            await this.game.waitForTimeout(this.options.waitBetTimeout);

            // Act
            const betChoice = await this.game.captureChoice(this.options.placeBetChoices[0]);

            // Assert
            expect(betChoice.image).toMatchSnapshot(betChoice.name);
        });
    }

    protected inGameOddsTests() {
        test("AND odds should be correct", async () => {
            // Assert
            expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();

            // // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            expect(bet).toMatchWinning(settledResults);
        });
    }

    protected hedgeBetTests() {
        test("THEN player should get error when they hedge their bets", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);

            // Act
            const endBetMsg = await this.player.placeHedgeBet(this.options.gameConfiguration.hedgeBetGroups[0], this.options.placeBetAmount ?? 1);
            
            // Assert
            expect(endBetMsg).toMatchObject({ endBet: -1, betChoice: this.options.gameConfiguration.hedgeBetGroups[0][1]});
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            const historyPayload = await this.player.openHistory();

            // Act
            const historySnapshot = await this.game.captureHistory();

            // Assert
            expect(historyPayload.history.betLogs.length).toBeGreaterThan(0);
            expect(historySnapshot.image).toMatchSnapshot(historySnapshot.name);

            //Post-condition
            await this.player.clickOutSide();
        });
    }

    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.options.snapshotFolderPath + "-snapshots/" + name;

                return snapshotPath;
            };
        });

        this.useTestFixtures();

        test.describe.serial(`${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
            });

            this.inGameBetChoiceTests();
            this.inGameOddsTests();
            this.placeBetAndSettleTests();
            this.hedgeBetTests();
            this.ticketHistoryTests();
            this.subGameplaceBetAndSettleTests();
        });
    }

    protected useTestFixtures() {
        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: this.options.locators,
        });
    }

    protected subGameplaceBetAndSettleTests() {
        this.options.subGameConfigurations.forEach((gameOptions) => {
            test(`THEN player able to place a bet and settle ${gameOptions.name}`, async () => {
                // Arrange
                test.setTimeout(gameOptions.maxTimeout);
                let bet = { choice: gameOptions.choices[0], amount: this.options.placeBetAmount ?? 1 };
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

                // Act
                const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount, gameOptions.name);

                const settledResults = await this.game.waitForSettlement(gameOptions.name);
                bet.choice = bet.choice.toString().replace(/[0-9]/g, "");
                // // Assert
                expect(placeBetResponse.endBet).toBe(bet.amount);
                expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
                expect(bet).toMatchWinning(settledResults);
            });
        });
    }
}
