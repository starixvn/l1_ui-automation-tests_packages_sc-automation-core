import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { baseLocatorNames } from "../components/base-game-locator";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";

export interface CrashGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}
const enum CrashGameEvent {
    StartCashOut = `"m":1,"`,
    StartFly = `"t":0`,
    CashOut = `"Spaceflight",{"name"`,
}
export class CrashGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: CrashGameOptions) {}

    protected inGameUITests() {
        test("Verify default control area", async () => {
            // Arrange
            const imgControlArea = await this.game.capture(`imgControlArea${process.env.npm_config_project}`);
            expect(imgControlArea.image).toMatchSnapshot(imgControlArea.name, { maxDiffPixelRatio: 0 });
        });
    }

    protected placeBetAndSettleTests() {
        test("Verify player be able to place bet and cash out", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout * 2);
            await test.step("Wait for new round and click place bet", async () => {
                await placeBet(this.game);
            });
            await test.step("Verify place bet button", async () => {
                const btnPlaceBet = await this.game.captureLocator(baseLocatorNames.btnPlaceBetBetAccepted);
                expect(btnPlaceBet.image).toMatchSnapshot(btnPlaceBet.name);
            });
            let settledResults;
            await test.step("Click cashout and verify win amount", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
                this.game.attachSocketAndCaptureEvent(CrashGameEvent.CashOut);
                await this.game.waitForEvent(CrashGameEvent.StartFly); //Wait for start fly
                settledResults = await this.game.latestCaptureEvent(GameEvent.Settlement);
                if (settledResults === "") {
                    //Have not crash yet
                    await this.game.waitForEvent(CrashGameEvent.StartCashOut); //wait for start cash out
                    await cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.latestCaptureEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.cashOut.cashOutWin);
                } else {
                    // If crash at base, place bet again
                    await placeBet(this.game);
                    await this.game.waitForEvent(CrashGameEvent.StartCashOut); //wait for start cash out
                    await cashOut(this.game); //click cash out
                    let cashOutResult = await this.game.latestCaptureEvent(CrashGameEvent.CashOut);
                    settledResults = await waitForSettlement(this.game);
                    expect(settledResults.winAmount).toEqual(cashOutResult.cashOut.cashOutWin);
                }
            });
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            await this.game.clickHistory();
            await this.game.waitForTimeout(2000);

            // Act
            const historySnapshot = await this.game.captureHistory();

            // Assert
            expect(historySnapshot.image).toMatchSnapshot(historySnapshot.name);
        });
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

        test.describe.serial(`${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameUITests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
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
