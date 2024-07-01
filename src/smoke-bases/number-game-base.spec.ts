import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { GameEvent } from "../_shared";
import { commonControls } from "../components/base-number-game-locator";
import { IBaseOptions } from "./base-options";

export class NumberGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected inGameUITests() {
        test("Verify in game UI", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const isInGame = await this.game.page.locator(commonControls.iconHome).isVisible();
            if (!isInGame) {
                await this.game.click(this.options.locators.lobbyGameIcon,5000);
                await this.game.page.locator(commonControls.iconHome).waitFor({state:"visible"})  
            }
            const inGameUi =
                process.env.npm_config_android == "true" ? this.options.locators.inGameUIAndroid : this.options.locators.inGameUI;

            await this.game.verifyLocatorsVisible(inGameUi);
        });

        test("Verify menu list items", async () => {
            // Assert
            await this.game.click(commonControls.iconMenu);
            await this.game.verifyLocatorsVisible(this.options.locators.menuItems);
            await this.game.click(commonControls.iconMenu);
        });

        test("Verify footer value", async () => {
            // Assert
            await this.game.verifyValueLocators(this.options.locators.footerValues);
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = {
                choice: this.options.placeBetChoices[2],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[2]],
            };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            const placeBetResponse = await this.player.gnQuickPlaceBet(bet.locator, bet.amount);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = placeBetResponse.odds;

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

            const hedgeBetLocators = [
                this.options.locators.betchoices[this.options.placeBetChoices[0]],
                this.options.locators.betchoices[this.options.placeBetChoices[1]],
            ];
            // Act
            const odds = await this.player.gnPlaceHedgeBet(hedgeBetLocators, this.options.placeBetAmount ?? 1);

            await this.game.verifyValueLocators(this.options.locators.hedgeBetError);
            let settledResults = await this.game.gnWaitForSettlement();
            settledResults.odds = odds;
            global.settledResults = settledResults;
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            await this.player.gnOpenHistory();
            // Act
            await this.game.verifyValueLocators(this.options.locators.historyHeader);
            const expectedValue = {
                drawId: global.settledResults.drawId,
                amount: this.options.placeBetAmount,
                winAmount: global.settledResults.winAmount,
            };

            for (const key in expectedValue) {
                await this.game.textLocatorShouldBe(this.options.locators.ticketHistory[key], expectedValue[key]);
            }
            await this.player.gnClosePopUp();
        });
    }

    protected statisticBoardTests() {
        test("Verify Statistic bar icon", async () => {
            const statisticbar =
                process.env.npm_config_android == "true" ? this.options.locators.statisticbarAndroid : this.options.locators.statisticbar;

            // Arrange
            await this.game.verifyLocatorsVisible(statisticbar);
        });

        test("Verify user can slide left/right to switch road", async () => {
            // Arrange
            await this.game.click(commonControls.btnStatisticNext)
            expect(await this.game.page.locator(commonControls.tblbigRoad).isVisible()).toBe(true);
            await this.game.click(commonControls.btnStatisticPrev)
            expect(await this.game.page.locator(commonControls.tblbeadRoad).isVisible()).toBe(true);
        });

        test("Verify total rows and columns of Bead Road & Big Road", async () => {
            // Arrange
            const totalcellBIR = await this.game.page.$$eval(commonControls.cellsbigRoad, (elements) => elements.length);
            const totalcellBER = await this.game.page.$$eval(commonControls.cellsbeadRoad, (elements) => elements.length);
            expect(totalcellBIR).toBe(108);
            expect(totalcellBER).toBe(108);
        });
    }

    protected gameGuideTests() {
        test("AND player could open guide and clarify guide content", async () => {
            // Arrange
            await this.player.gnOpenGuide();
            const getGuideContent = await this.game.getGuideContent();
            const expectedGuideContent = this.options.locators.guideContent.replace(/[\n\r]/g, "").replace(/ /g, "");
            const cleanedGuideContent = getGuideContent.replace(/[\n\r]/g, "").replace(/ /g, "");

            // Act
            expect(cleanedGuideContent).toContain(expectedGuideContent);
            await this.player.gnClosePopUp();
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
}
