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
        test("Verify default state of chip bar", async () => {
            const chipbar = await this.game.capture(TableLocatorNames.defaultChipBar);
            // Assert
            expect(chipbar.image).toMatchSnapshot(chipbar.name);
        });
        test("Verify Rebet button is disabled", async () => {
            const btnrebet = await this.game.capture(TableLocatorNames.btnRebet);
            // Assert
            expect(btnrebet.image).toMatchSnapshot(btnrebet.name);
        });
    }

    protected placeBetAndSettleTests() {
        test("User able to place bet and check settlement data", async () => {
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
            //handle tie: true
            if (settledResults.tie) {
                const refundbet = { choice: bet.choice, amount: bet.amount/2 };
                expect(refundbet).toMatchWinning(settledResults);
            }
            else{
                expect(bet).toMatchWinning(settledResults);
            }

            // Post-Act
            const settledata = {
                roundID: settledResults.roundId.toString(),
                betwin: settledResults.winAmount.toString(),
                bet: bet.amount.toString(),
                choice: bet.choice,
            };
            global.settledata = settledata;
        });
    }

    protected ticketHistoryTests() {
        test("Verify history and ticket detail", async () => {
            // Act 1
            await this.game.clickHistory();
            const ticketdata = await getDataFistRowHistory(this.game);

            const winamount = ticketdata[ticketdata?.length - 1];
            const totalbet = ticketdata[ticketdata?.length - 2];

            // Assert
            expect(winamount).toEqual(global.settledata.betwin);
            expect(totalbet).toEqual(global.settledata.bet);

            // Act 2
            await openRoundDetail(this.game);
            let roundID = await getRoundId(this.game, TableLocatorNames.lblHistoryDetailRoundId);

            // Assert 2
            expect(roundID).toEqual(global.settledata.roundID);

            //Post-Act
            await this.game.clickOutSide(1500);
            await this.game.clickOutSide(1500);
        });
    }

    protected reBet() {
        test("User can rebet bet choices and amount of previous round", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitUntilPlaceBet();
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };

            await this.game.clickLocator(TableLocatorNames.btnRebet)
            
            // Act
            const betChoice = await this.game.captureOwnbet(global.settledata.choice);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(betChoice.image).toMatchSnapshot(betChoice.name);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            //handle tie: true
            if (settledResults.tie) {
                const refundbet = { choice: bet.choice, amount: global.settledata.bet/2 };
                expect(refundbet).toMatchWinning(settledResults);
            }
            else{
                expect(bet).toMatchWinning(settledResults);
            }

        });
    }

    protected multipleBetChoices() {
        test("User able to placebet multiple choices", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            let betChoices: any = this.options.placeBetChoices;
            const amount = this.options.placeBetAmount ?? 1;
            betChoices.splice(1, 1);
            await this.game.waitUntilPlaceBet();
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
            }

            // Act
            const settledResults = await this.game.waitForSettlement();

            // Assert

            for (let i = 0; i < settledResults.length; i++) {
                const bet =(settledResults.tie === true)?{choice: betChoices[i], amount: (this.options.placeBetAmount)as number/2 ?? 0.5} :{choice: betChoices[i], amount: this.options.placeBetAmount ?? 1}
                expect(settledResults[i].endBet).toBe(amount);
                expect(settledResults[i].settlementResult).toMatchBetOptions(betChoices[i]);
                expect(bet).toMatchWinning(settledResults);
            }

            // Post-Act
            global.rebetChoices = betChoices;

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
        this.placeBetAndSettleTests()
        this.ticketHistoryTests()
        this.reBet()
        this.multipleBetChoices()
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }
}

const getDataFistRowHistory = async (game: BaseGame, elementname: string = TableLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname);
    return tempdata?.split(" ") || "";
};

const openRoundDetail = async (game: BaseGame) => {
    await game.clickLocator(TableLocatorNames.locHistoryRoundId, 1500);
};

const getRoundId = async (game: BaseGame, elementname: string = TableLocatorNames.lblHistoryDetailRoundId) => {
    let roundId = await game.getTextLocator(elementname);

    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};
