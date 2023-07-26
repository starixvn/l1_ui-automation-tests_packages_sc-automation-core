import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import { TableLocatorNames } from "../components/base-table-locator";
import { GameGuides } from "../game-components/guides/guides.spec";

export class TableGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}

    protected inGameUiTests() {
        test("Verify the dealer image appears", async () => {
            // Act
            const dealerSnapshot = await this.game.capture(TableLocatorNames.imgdealer);
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });

        test("Verify all bet choices display correctly", async () => {
            for (const iterator of this.options.placeBetChoices) {
                // Act
                const choiceSnapshot = await this.game.capture(iterator);
                // Assert
                expect(choiceSnapshot.image).toMatchSnapshot(choiceSnapshot.name);
            }
        });

        test("Verify default state", async () => {
            await test.step("Chip bar", async () => {
                const chipbar = await this.game.capture(TableLocatorNames.defaultChipBar);
                // Assert
                expect(chipbar.image).toMatchSnapshot(chipbar.name);
            });
            await test.step("Rebet button is disabled", async () => {
                const btnrebet = await this.game.capture(TableLocatorNames.btnRebet);
                // Assert
                expect(btnrebet.image).toMatchSnapshot(btnrebet.name);
            });
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
            const betChoice = await this.game.captureOwnbet(bet.choice);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(betChoice.image).toMatchSnapshot(betChoice.name);
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            expect(bet).toMatchWinning(settledResults);

            // Post-Act
            const settledata = {
                roundID: settledResults.roundId,
                betwin: settledResults.winAmount.toString(),
                bet: bet.amount.toString(),
                choice: bet.choice,
            };
            global.settledata = settledata;
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Act 1
            await this.game.clickHistory();

            // Assert 1

            const ticketdata = await getDataFistRowHistory(this.game);
            console.log(ticketdata);

            // Act 2
            await openRoundDetail(this.game);
            let roundID = await getRoundId(this.game, TableLocatorNames.lblHistoryDetailRoundId);

            // Assert 2
            console.log(roundID);

            //Post-Act
            await this.game.clickOutSide(1500);
            await this.game.clickOutSide(1500);
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
                this.gameGuides.init(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario(): void {
        this.inGameUiTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }
}

const getDataFistRowHistory = async (game: BaseGame, elementname: string = TableLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname);
    return tempdata;
};

const openRoundDetail = async (game: BaseGame) => {
    await game.clickLocator(TableLocatorNames.locHistoryRoundId, 1500);
};

const getRoundId = async (game: BaseGame, elementname: string = TableLocatorNames.lblHistoryDetailRoundId) => {
    let roundId = await game.getTextLocator(elementname);

    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};
