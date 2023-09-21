import { test, BasePlayer, BaseGame } from "../components";
import { GameEvent } from "../_shared";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { baseLocatorNames } from "../components/base-game-locator";

export interface CardGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class CardGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: CardGameOptions) {}

    protected inGameUiTests() {
        test("Verify the game info should be displayed correctly on table", async () => {
            // Act
            await this.game.waitUntilNextRound();
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            const dealerSnapshot = await this.game.capture(baseLocatorNames.imgdealer);
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name, { maxDiffPixelRatio: 0.3 });
        });
        test("AND bet choices should be displayed on table", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(this.options.waitBetTimeout);

            for (const placeBetChoice of this.options.placeBetChoices) {
                // Act
                const betChoice = await this.game.captureChoice(placeBetChoice);

                // Assert
                expect(betChoice.image).toMatchSnapshot(betChoice.name);
            }
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.Deal);

            // Act
            const placebetdeal = await this.player.placeBet(bet.choice, bet.amount);
            await this.player.standCard();

            // Assert
            expect(placebetdeal.deal.hands[0].bet).toBe(bet.amount);
            expect(placebetdeal.deal.hands[0].pos).toBe(parseInt(bet.choice));
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
        this.inGameUiTests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
    }
}
