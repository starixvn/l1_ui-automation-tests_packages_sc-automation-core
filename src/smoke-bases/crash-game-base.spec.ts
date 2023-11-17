import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { baseLocatorNames } from "../components/base-game-locator";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";

export interface CrashGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class CrashGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: CrashGameOptions) {}

    protected inGameUITests() {
        test("Verify default control area", async () => {
            // Arrange
            const imgControlArea = await this.game.capture(baseLocatorNames.imgControlArea);
            expect(imgControlArea.image).toMatchSnapshot(imgControlArea.name, { maxDiffPixelRatio: 0 });
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
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            await this.game.waitForEvent(`"t":0`); //Wait for start fly
            let settledResults = await this.game.latestCaptureEvent(GameEvent.Settlement)
            if(settledResults === "") //Have not crash yet
            {
                await this.game.waitForEvent(`"m":1,`); //wait for start cash out
                await cashOut(this.game); //click cash out
                settledResults = await this.game.waitForSettlement();

                expect(settledResults.winAmount).toBeGreaterThanOrEqual(bet.amount);
            }
            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            await this.game.clickHistory();

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
    await game.clickLocator(baseLocatorNames.btnCashOut);
};

// const cashOutHalf = async (game: BaseGame) => {
//     await game.waitForEvent('101')
//     await game.clickLocator(baseLocatorNames.btnCashOutHalf);
// };
