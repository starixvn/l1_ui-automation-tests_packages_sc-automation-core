import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { GameEvent } from "../_shared";
import {commonControls} from "../components/base-number-game-locator";
import { IBaseOptions } from "./base-options";

export class NumberGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected inGameUITests() {
        test("Verify in game UI", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.verifyLocatorsImage(this.options.locators.inGameUI);
        });

        test("Verify menu list items", async () => {
            // Assert
            await this.game.click(commonControls.iconMenu)
            await this.verifyListLocatorsVisible(this.options.locators.menuItems);
            await this.game.click(commonControls.iconMenu)
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.gnPlaceBet(bet.choice, bet.amount);
            const settledResults = await this.game.gnWaitForSettlement();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            expect(bet).toMatchWinning(settledResults);
        });
    }

    protected hedgeBetTests() {
        test("THEN player should get error when they hedge their bets", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            await this.player.gnPlaceHedgeBet(this.options.placeBetChoices, this.options.placeBetAmount ?? 1);

            await this.verifyLocatorsValue(this.options.locators.hedgeBetError);
            global.settledResults =await this.game.gnWaitForSettlement();
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            await this.player.gnOpenHistory();
            console.log(global.settledResults);
            
            // Act
            await this.verifyLocatorsValue(this.options.locators.historyHeader);
            // await this.verifyLocatorsValue(global.settledResults);
            await this.player.gnClosePopUp()

        });
    }

    protected statisticBoardTests() {
        test("AND player clarify the statistic board of above placed bet round", async () => {
            // Arrange
            // Act
            // to be implemented
        });
    }

    protected gameGuideTests() {
        test("AND player could open guide and clarify guide content", async () => {
            // Arrange
            await this.player.gnOpenGuide();

            // Act
            await this.verifyLocatorsValue(this.options.locators.gameGuide);
            await this.player.gnClosePopUp()
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
        this.hedgeBetTests();
        this.statisticBoardTests();
        this.ticketHistoryTests();
        this.gameGuideTests();
    }

    async verifyLocatorsImage(expectSnapshot: object) {
        for (const key in expectSnapshot) {
            expect(await this.game.page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key]);
        }
    }

    async verifyLocatorsValue(expectedValue?: object) {
        for (const key in expectedValue) {
            expect(await this.game.page.locator(key).innerText()).toBe(expectedValue[key]);
        }
    }

    async verifyListLocatorsVisible(locators: string[]) {
        for (const locator of locators) {
            expect(await this.game.page.locator(locator).isVisible()).toBe(true);
        }
    }


}
