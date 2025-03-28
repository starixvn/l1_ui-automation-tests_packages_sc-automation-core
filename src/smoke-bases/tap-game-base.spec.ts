import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { performanceTest } from "../game-components/performance/performance";
import { GameGuides } from "../game-components/guides/guides.spec";

const stakeLevel = {
    stakemenu: "stakeMenu",
    imgStakeLevell1: "imgStakeLevell1",
    imgStakeLevell2: "imgStakeLevell2",
};

const projectName = process.env.npm_config_project?.includes("l1")
    ? "SG"
    : process.env.npm_config_project?.includes("l2")
      ? "VG"
      : process.env.npm_config_project;

export interface TapGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class TapGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;
    performanceTest: performanceTest = new performanceTest();
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: TapGameOptions) {}

    protected inGameOddsTests() {
        test("Ensure that the odds displayed for each bet choice are accurate.", async () => {
            await test.step("Ensure that the odds displayed for each bet choice are accurate.", async () => {
                // Assert
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected jackpotTests() {
        test("Verify that the Jackpot banner should be displayed in game ", async () => {
            await test.step("Verify that the Jackpot banner is displayed correctly on the screen.", async () => {
                // Act
                const jackpotbanner = await this.game.capture(`imgJackpot`);

                // Assert
                expect(jackpotbanner.image).toMatchSnapshot(jackpotbanner.name);
            });
            await test.step("Verify that the Hall of Fame popup should be displayed after clickking on icon in menu list", async () => {
                await this.game.clickJackpot(1000);

                // Act
                const jackpotPopup = await this.game.capture(`jackpotPopup`);

                // Assert
                expect(jackpotPopup.image).toMatchSnapshot(jackpotPopup.name);

                //Post-Act
                await this.game.clickOutSide();
            });
        });
    }

    protected betStakeLevelTests(projectCode = "l1") {
        test("Verify stake level should be correct", async () => {
            // Arrange
            await this.game.clickLocator(stakeLevel.stakemenu);
            await test.step("Verify that the stake level is displayed correctly on the screen.", async () => {
                // Act
                const stakelevelSnapshot = await this.game.capture(stakeLevel[`imgStakeLevel${projectCode}`]);

                // Assert
                expect(stakelevelSnapshot.image).toMatchSnapshot(stakelevelSnapshot.name);
                //Post Act
            });
            await this.game.clickLocator(stakeLevel.stakemenu);
        });
    }

    protected placeBetAndSettleTests() {
        test("Tap the screen to place a bet", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const amount = this.options.placeBetAmount
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            const { placeBetResponse } = await test.step("Verify that the bet is successfully placed.", async () => {
                // Act
                const placeBetResponse = await this.player.placeBet("", amount);
                return { placeBetResponse };
            });
            await test.step("Confirm that the endbet is accurate.", async () => {
                // Assert
                expect(placeBetResponse.endBet).toBe(amount );
            });
        });

        test("Press space to place a bet", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const amount = this.options.placeBetAmount
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
            const { placeBetResponse } = await test.step("Verify that the bet is successfully placed.", async () => {
                // Act
                await this.game.keyboardPress("Space");
                const placeBetResponse = await this.game.waitForEndBet();
                return { placeBetResponse };
            });
            await test.step("Confirm that the endbet is accurate.", async () => {
                // Assert
                expect(placeBetResponse.endBet).toBe(amount );
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
                //Close history
                await this.game.clickOutSide();
            });
        });
    }
    protected gameGuideTests() {
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout, this.options.isJackpot);
    }

    start(): void {
        test.beforeAll(async ({ baseGame }) => {
            this.game = baseGame;
            this.player = new BasePlayer(this.game);
            this.performanceTest.init(this.game);
            this.gameGuides.init(this.game);
        });

        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                return `${this.options.snapshotFolderPath}-snapshots/${name}`;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: [this.options.locators],
        });

        test.describe.serial(`${projectName} - ${this.options.gameConfiguration.name} Smoke Tests`, () => {
            this.runScenario();
        });
    }

    protected runScenario() {
        if (process.env.npm_config_trackdownload) {
            this.performanceTest.tests(this.options.gameConfiguration.ssoTime ?? 35000);
        }
        if (!process.env.npm_config_odds) {
            this.inGameOddsTests();
        }
        if (process.env.npm_config_jackpot) {
            this.jackpotTests();
        }
        this.betStakeLevelTests(process.env.npm_config_project);
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.gameGuideTests();
    }
}
