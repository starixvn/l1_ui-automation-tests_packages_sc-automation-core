import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import { TableLocatorNames } from "../components/base-table-locator";
import { GameGuides } from "../game-components/guides/guides.spec";
const timeout = 4000;

export class TableGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}

    protected inGameUiTests() {
        test("Verify the dealer image appears", async () => {
            // Act
            await this.game.waitUntilNextRound();
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            const dealerSnapshot = await this.game.capture(TableLocatorNames.imgdealer);
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });

        test("Verify all bet choices display correctly", async () => {
            for (const iterator of this.options.placeBetChoices) {
                // Act
                const choiceSnapshot = await this.game.capture(iterator+'Choice');
                // Assert
                expect(choiceSnapshot.image).toMatchSnapshot(choiceSnapshot.name);
            }
        });
        test("Verify default state of chip bar", async () => {
            const chipbar = await this.game.capture(`defaultChipBar${process.env.npm_config_project}`);
            // Assert
            expect(chipbar.image).toMatchSnapshot(chipbar.name);
        });
        if (this.options.gameConfiguration.rebet) {
            test("Verify Rebet button is disabled", async () => {
                const btnrebet = await this.game.capture(TableLocatorNames.btnRebet);
                // Assert
                expect(btnrebet.image).toMatchSnapshot(btnrebet.name);
            });
        }
       
    }

    protected placeBetAndSettleTests() {
        test("User able to place bet and check settlement data", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const betChoice = await this.game.capture(bet.choice +`Ownbet${process.env.npm_config_project}`);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(betChoice.image).toMatchSnapshot(betChoice.name);
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            //handle tie: true
            if (settledResults.tie) {
                const refundbet = { choice: bet.choice, amount: bet.amount / 2 };
                expect(refundbet).toMatchWinning(settledResults);
            } else {
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
            await this.game.clickHistory(timeout);
            const ticketdata = await getDataFistRowHistory(this.game);

            const winamount = ticketdata[ticketdata?.length -1];
            const totalbet = ticketdata[ticketdata?.length -2];

            // Assert
            expect(winamount.trim()).toEqual(global.settledata.betwin);
            expect(totalbet).toEqual(global.settledata.bet);

            // Act 2
            await openRoundDetail(this.game);
            let roundID = await getRoundId(this.game, TableLocatorNames.lblHistoryDetailRoundId);

            // Assert 2
            expect(roundID).toEqual(global.settledata.roundID);

            //Post-Act
            await this.game.clickOutSide();
            await this.game.clickOutSide();
        });
    }

    protected reBet() {
        test("Verify User able to place bet other choice then get data for next rebet", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const betChoice = await this.game.captureOwnbet(bet.choice);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(betChoice.image).toMatchSnapshot(betChoice.name);
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);

        });
        test("User can use rebet function", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 };
            await this.game.waitUntilPlaceBet();
            await this.game.clickLocator(TableLocatorNames.btnRebet);

            // Act
            const betChoice = await this.game.captureOwnbet(bet.choice);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(betChoice.image).toMatchSnapshot(betChoice.name);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            //handle tie: true
            if (settledResults.tie) {
                const refundbet = { choice: bet.choice, amount: bet.amount / 2 };
                expect(refundbet).toMatchWinning(settledResults);
            } else {
                expect(bet).toMatchWinning(settledResults);
            }
        });
    }

    protected multipleBetChoices() {
        test("User able to placebet multiple choices", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent("ownBets");
            let betChoices: any = this.options.placeBetChoices;
            const amount = this.options.placeBetAmount ?? 1;
            betChoices.splice(1, 1);
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(timeout/4);
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
            }

            // Act
            let ownBets = await this.game.latestCaptureEvent("ownBets");

            const settledResults = await this.game.waitForSettlement();
            let calWinAmount = 0;
            // Assert
            for (const iterator of betChoices) {
                const bet =
                    settledResults.tie === true
                        ? { choice: iterator, amount: (this.options.placeBetAmount as number) / 2 ?? 0.5 }
                        : { choice: iterator, amount: this.options.placeBetAmount ?? 1 };
                expect(ownBets.ownBets[iterator]).toBe(amount);
                let odds = settledResults.settlementResult[iterator] ? settledResults.odds[iterator] : 0;
                calWinAmount += bet.amount * odds;
            }
            expect(calWinAmount).toBe(settledResults.winAmount);
        });
    }

    protected returnGameLobby(): void {
        test("Verify user able to return game lobby by clicking on home icon", async () => {
          // Act 1
          await this.game.waitForTimeout(2000)
          await this.game.clickLocator(TableLocatorNames.btnHome);
          await this.game.waitUntilGameLobbyUiLoad()
          const gamelobby = await this.game.capture(`imgGameLobby${process.env.npm_config_project}`)
          expect(gamelobby.image).toMatchSnapshot(gamelobby.name)
        });
      }
    
      protected turnbackGame(): void {
        test("Verify user able to go back game by clicking on game icon", async () => {
          // Act 1.
          await this.game.waitForTimeout(timeout/2)
          await this.game.clickLocator(TableLocatorNames.tabGames, timeout);
          await this.game.clickLocator(TableLocatorNames.icoGame, timeout);
    
          const dealerSnapshot = await this.game.capture(TableLocatorNames.imgdealer);
          // Assert
          expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        })
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
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        if (this.options.gameConfiguration.rebet) {
            this.reBet(); 
        }
        this.multipleBetChoices();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
        this.returnGameLobby()
        this.turnbackGame()
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
