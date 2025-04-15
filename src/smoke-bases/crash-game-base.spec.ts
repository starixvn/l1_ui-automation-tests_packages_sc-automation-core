import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { baseLocatorNames } from "../components/base-game-locator";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { performanceTest } from "../game-components/performance/performance";
import { GameGuides } from "../game-components/guides/guides.spec";
const projectName = process.env.npm_config_project?.includes("l1")
    ? "SG"
    : process.env.npm_config_project?.includes("l2")
      ? "VG"
      : process.env.npm_config_project;

export interface CrashGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}
const CrashGameEvent = {
    StartCashOut: (msg) => msg?.c?.t == 0,
    CashOut: (msg) => msg?.cashOut,
    HalfCashOut: (msg) => msg?.halfCashOut,
};
export class CrashGameBase {
    game: BaseGame;
    player: BasePlayer;
    performanceTest: performanceTest = new performanceTest();
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: CrashGameOptions) {}

    protected inGameUITests() {
        test("Verify default control area", async () => {
            // Arrange
            await test.step("Verify default controls are displayed correctly on the screen.", async () => {

            const imgControlArea = await this.game.capture(`imgControlArea${process.env.npm_config_project}`);
            expect(imgControlArea.image).toMatchSnapshot(imgControlArea.name, { maxDiffPixelRatio: 0.1 });
        });
    });
    }

    protected placeBetAndSettleTests() {
        test("Verify player be able to place bet and cash out", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout * 2);
            await placeBet(this.game);
            const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceBetBetAccepted);
            expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            await this.game.waitForSpecificEvent(CrashGameEvent.StartCashOut);
            let settledResults = await this.game.latestCaptureEvent(GameEvent.Settlement);
            await test.step("Confirm that the bet is settled correctly.", async () => {
                if (settledResults === "") {
                    //Have not crash yet
                    cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.waitForSpecificEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.cashOut.cashOutWin);
                } else {
                    // If crash at base, place bet again
                    await placeBet(this.game);
                    await this.game.waitForSpecificEvent(CrashGameEvent.StartCashOut); //wait for start cash out
                    await cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.waitForSpecificEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.cashOut.cashOutWin);
                }
            });
        });
    }

    protected ticketHistoryTests() {
        test("Access the history popup.", async () => {
            // Arrange
            await this.game.clickHistory();
            await this.game.waitForTimeout(2000);

            // Act
            const historySnapshot = await this.game.captureHistory();
            await test.step("Verify that the history popup is displayed correctly and contains accurate betting history information.", async () => {
                // Assert
                expect(historySnapshot.image).toMatchSnapshot(historySnapshot.name);
            });
            //Post-Act
            await this.game.clickOutSide(3000);
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
            this.performanceTest.tests(this.options.gameConfiguration.ssoTime ?? 35000);
        }
        this.inGameUITests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.gameGuideTests();
    }
}
const cashOut = async (game: BaseGame) => {
    await game.waitForTimeout(200);
    await game.clickLocator(baseLocatorNames.btnCashOut);
};

const placeBet = async (game: BaseGame) => {
    await game.waitUntilPlaceBet();
    await game.clickLocator(baseLocatorNames.btnPlaceBet);
};
const waitForSettlement = async (game: BaseGame) => {
    const message = await game.waitForEvent(GameEvent.Settlement);
    await game.waitForTimeout(2500); // add sleep due to feature Publish round result prior to settlement
    const winningByChoice = game.latestCaptureEvent(GameEvent.WinStatus);

    let settledResults = {
        settlementResult: message?.finish?.settlementResult,
        winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
        roundId: message.finish.roundId || 0,
    };
    settledResults["winAmount"] = winningByChoice.status.win ? winningByChoice.status.bet : 0;
    return settledResults;
};
