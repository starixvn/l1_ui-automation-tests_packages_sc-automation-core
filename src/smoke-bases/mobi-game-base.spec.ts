import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";

import { IBaseOptions } from "./base-options";

export class MobiGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected inGameUITests() {
        test("Verify Game Name and Bet Locators", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            const isFrame = await this.game.page.$("#frmGame")
            if (isFrame) {
                await this.game.verifyFrameLocatorsVisible("#frmGame",this.options.locators.inGameUI);
            }else{
                await this.game.verifyLocatorsVisible(this.options.locators.inGameUI);
                await this.game.page.reload(); // PRO issue only: need to be reload page for capturing web socket data, by default on framerecived do not have any channel
            }
        });
    }


    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            const bet = {
                choice: this.options.placeBetChoices[0],
                amount: this.options.placeBetAmount ?? 1,
                locator: this.options.locators.betchoices[this.options.placeBetChoices[0]],
            };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            const placeBetResponse = await this.player.mbQuickPlaceBet(bet.locator, bet.amount,this.options.gameConfiguration.name);
            let settledResults = await this.game.waitForSettlement(this.options.gameConfiguration.name);

            // Assert

            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
        });
    }

    protected hedgeBetTests() {
        test("THEN player should get error when they hedge their bets", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet(this.options.gameConfiguration.name)
            const hedgeBetLocators = [
                this.options.locators.betchoices[this.options.placeBetChoices[1]],
                this.options.locators.betchoices[this.options.placeBetChoices[0]],
            ];
            // Act
            await this.player.mbPlaceHedgeBet(hedgeBetLocators, this.options.placeBetAmount ?? 1);
            const hedgeBetError = this.options.locators.hedgeBetError 
            const isFrame = await this.game.page.$("#frmGame")
            if (isFrame) {
                const framelocator =  this.game.page.frameLocator("#frmGame")
                await expect(framelocator.locator((Object.keys(hedgeBetError)).toString())).toContainText(Object.values(hedgeBetError))
            }else{
                await expect(this.game.page.locator((Object.keys(hedgeBetError)).toString())).toContainText(Object.values(hedgeBetError))
            }
            

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
        this.inGameUITests()
        this.placeBetAndSettleTests();
        this.hedgeBetTests();
    }
}
