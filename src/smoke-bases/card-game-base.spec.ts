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

export interface CardGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class CardGameBase {
    game: BaseGame;
    player: BasePlayer;
    performanceTest: performanceTest = new performanceTest();
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: CardGameOptions) {}

    protected inGameBetChoiceTests() {
        test("Validate bet choice visibility and snapshot capture", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await test.step("Validate bet choice visibility and snapshot capture", async () => {
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
        test("Verify game odds match configuration", async () => {
            // Assert
            await test.step("Verify game odds match configuration", async () => {
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected placeBetAndSettleTests() {
        test("Test complete bet lifecycle: placement → settlement → validation", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);
            const { isdealerPontoon, placebetdeal, playertotal } =
                await test.step("Verify that the bet is successfully placed", async () => {
                    // Act
                    const placebetdeal = await this.player.placeBet(bet.choice, bet.amount);
                    let endDeal = await this.game.latestCaptureEvent(GameEvent.Deal).deal;
                    const isdealerPontoon = endDeal.dealer.length == 0 ? false : true;
                    const playertotal = Math.max(endDeal.hands[0].total[0], endDeal.hands[0].total[1] ?? 0);
                    return { isdealerPontoon, placebetdeal, playertotal };
                });
            await test.step("Confirm that the bet is settled correctly.", async () => {
                // Assert
                expect(placebetdeal.deal.hands[0].bet).toBe(bet.amount);
                expect(placebetdeal.deal.hands[0].pos).toBe(parseInt(bet.choice));
                if (isdealerPontoon == false && playertotal < 21) {
                    const settledResults = await this.player.standCard();
                    expect(settledResults.stand.pos).toBe(parseInt(bet.choice));
                    expect(settledResults.stand.bet).toBe(bet.amount);
                }
            });
        });
    }

    protected ticketHistoryTests() {
        test("Test betting history display and popup management", async () => {
            await test.step("Verify that the history popup is displayed correctly and contains accurate betting history information", async () => {
                // Arrange
                const historyPayload = await this.player.openHistory();

                // Act
                const historySnapshot = await this.game.captureHistory();

                // Assert
                expect(historyPayload.history.betLogs.length).toBeGreaterThan(0);
                expect(historySnapshot.image).toMatchSnapshot(historySnapshot.name);
            });
            //Post-act
            await this.game.clickOutSide();
            await this.game.waitForTimeout(5000);
        });
    }

    protected gameGuideTests() {
        // Run comprehensive game guide validation
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
            locators: [this.options.locators],
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
            // Monitor game performance metrics when enabled
            this.performanceTest.tests(this.options.gameConfiguration.ssoTime ?? 35000);
        }
        this.inGameBetChoiceTests();
        if (!process.env.npm_config_odds) {
            this.inGameOddsTests();
        }
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.gameGuideTests();
    }
}
