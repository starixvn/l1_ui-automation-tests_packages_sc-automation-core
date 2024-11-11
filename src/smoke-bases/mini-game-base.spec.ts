import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { performanceTest } from "../game-components/performance/performance";
import { GameGuides } from "../game-components/guides/guides.spec";

const projectName = process.env.npm_config_project?.includes("l1")
    ? "SG"
    : process.env.npm_config_project?.includes("l2")
      ? "VG"
      : process.env.npm_config_project;

export class MiniGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;
    protected performanceTest: performanceTest = new performanceTest();
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}

    protected inGameBetChoiceTests() {
        test("Verify that the bet choices are displayed correctly on the screen", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await test.step("Verify that the bet choices are displayed correctly on the screen.", async () => {
                await this.game.waitUntilNextRound();
                await this.game.waitForTimeout(this.options.waitBetTimeout);

                for (const placeBetChoice of this.options.placeBetChoices) {
                    // Act
                    const betChoice = await this.game.captureChoice(placeBetChoice);

                    // Assert
                    expect(betChoice.image).toMatchSnapshot(betChoice.name);
                }
            });
        });
    }

    protected inGameOddsTests() {
        test("Ensure that the odds displayed for each bet choice are accurate.", async () => {
            await test.step("Ensure that the odds displayed for each bet choice are accurate.", async () => {
                // Assert
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected placeBetAndSettleTests() {
        test("Place a bet on a valid bet choice.", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            const { placeBetResponse, settledResults } = await test.step("Verify that the bet is successfully placed.", async () => {
                // Act
                const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
                const settledResults = await this.game.waitForSettlement();
                return { placeBetResponse, settledResults };
            });
            await test.step("Confirm that the bet is settled correctly.", async () => {
                // Assert
                expect(placeBetResponse.endBet).toBe(bet.amount);
                expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
                expect(bet).toMatchWinning(settledResults);
            });
        });
    }

    protected hedgeBetTests() {
        test("Attempt to place a bet that would result in a hedged position.", async () => {
            // Arrange
            const { maxTimeout, hedgeBetGroups } = this.options.gameConfiguration;
            test.setTimeout(maxTimeout);
            // Act
            const endBetMsg = await this.player.placeHedgeBet(hedgeBetGroups[0], this.options.placeBetAmount ?? 1);
            await test.step("Verify that an error message is displayed to prevent the bet from being placed.", async () => {
                // Assert
                expect(endBetMsg).toMatchObject({ endBet: -1, betChoice: hedgeBetGroups[0][1] });
            });
        });
    }

    protected ticketHistoryTests() {
        test("Access the history popup.", async () => {
            // Arrange
            const historyPayload = await this.player.openHistory();

            // Act
            const historySnapshot = await this.game.captureHistory();

            await test.step("Verify that the history popup is displayed correctly and contains accurate betting history information.", async () => {
                // Assert
                expect(historyPayload.history.betLogs.length).toBeGreaterThan(0);
                expect(historySnapshot.image).toMatchSnapshot(historySnapshot.name);
                await this.game.clickOutSide(3000); //close popup
            });
        });
    }
    protected gameGuideTests() {
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }

    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.options.snapshotFolderPath + "-snapshots/" + name;

                return snapshotPath;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: this.options.locators,
        });

        test.describe.serial(`${projectName} - ${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.performanceTest.init(this.game);
                this.gameGuides.init(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        if (process.env.npm_config_trackdownload) {
            this.performanceTest.tests(this.options.gameConfiguration.ssoTime ?? 35000);
        }
        this.inGameOddsTests();
        this.inGameBetChoiceTests();
        this.placeBetAndSettleTests();
        this.hedgeBetTests();
        this.ticketHistoryTests();
        this.gameGuideTests();
    }
}
