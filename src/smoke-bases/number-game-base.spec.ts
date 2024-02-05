import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";

import { IBaseOptions } from "./base-options";

export class NumberGameBase {nPlaceBet
    protected game: BaseGame;
    protected player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected inGameUITests() {
        test("Verify in game UI", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.GnWaitUntilPlaceBet();
            await this.verifyLocatorsImage(this.options.locators.inGameUI);
        });

        test("AND odds should be correct", async () => {
            // Assert
            await this.verifyLocatorsValue(this.options.locators.inGameValues);
        });
    }


    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };

            // Act
            const placeBetResponse = await this.player.GnPlaceBet(bet.choice, bet.amount);
            const settledResults = await this.game.GnWaitForSettlement();

            // Assert
            console.log(settledResults,placeBetResponse);
            
        });
    }

    protected hedgeBetTests() {
        test("THEN player should get error when they hedge their bets", async () => {
            // Arrange
            const { maxTimeout, hedgeBetGroups } = this.options.gameConfiguration;
            test.setTimeout(maxTimeout);

            // Act
            await this.player.GnPlaceHedgeBet(hedgeBetGroups[0], this.options.placeBetAmount ?? 1);

            await this.verifyLocatorsValue(this.options.locators.hedgeBetError)

        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            await this.player.GnOpenHistory();

            // Act
            // to be implemented
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
            await this.player.GnOpenGuide();

            // Act
            // to be implemented
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

    async verifyLocatorsImage( expectSnapshot: object) {
        for (const key in expectSnapshot) {
            expect(await this.game.page.locator(key).screenshot()).toMatchSnapshot(expectSnapshot[key]);
        }
    }

    async verifyLocatorsValue(expectedValue?: object) {
        for (const key in expectedValue) {
            expect(await this.game.page.locator(key).innerText()).toBe(expectedValue[key]);
        }
    }


}
