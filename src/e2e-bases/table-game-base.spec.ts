import { test, BasePlayer, BaseGame, GameLobbyLocator, TableLocator } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
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
            const dealerSnapshot = await this.game.capture(TableLocator.TableLocatorNames.imgdealer);
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name, { maxDiffPixelRatio: 0.3 });
        });

        test("Verify all bet choices display correctly", async () => {
            for (const iterator of this.options.placeBetChoices) {
                // Act
                const choiceSnapshot = await this.game.capture(iterator + "Choice");
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
                const btnrebet = await this.game.capture(TableLocator.TableLocatorNames.btnRebet);
                // Assert
                expect(btnrebet.image).toMatchSnapshot(btnrebet.name);
            });
        }
    }

    protected placeBetAndSettleTests() {
        test("Verify user able to place bet and check roundId and settlement result", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const roundId = await getRoundId(this.game, TableLocator.TableLocatorNames.lblRoundIdOnTable);
            const betChoice = await this.game.capture(bet.choice + `Ownbet${process.env.npm_config_project}`);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(betChoice.image).toMatchSnapshot(betChoice.name);
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            //handle tie: true
            if (settledResults.settlementResult.tie) {
                const refundbet = { choice: bet.choice, amount: bet.amount / 2 };
                expect(refundbet).toMatchWinning(settledResults);
            } else {
                expect(bet).toMatchWinning(settledResults);
            }
            expect(settledResults.roundId.toString()).toEqual(roundId);
        });

        test("User able to place bet and return settlement data for comparing history ticket detail", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            //handle tie: true
            if (settledResults.settlementResult.tie) {
                const refundbet = { choice: bet.choice, amount: bet.amount / 2 };
                expect(refundbet).toMatchWinning(settledResults);
            } else {
                expect(bet).toMatchWinning(settledResults);
            }

            // Post-Act
            const settledata = {
                roundId: settledResults.roundId.toString(),
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

            const indexHistory: any = this.options.indexHistory;

            const winamount = ticketdata[ticketdata?.length - indexHistory.winamount];
            const totalbet = ticketdata[ticketdata?.length - indexHistory.totalbet];
            const roundId = ticketdata[ticketdata?.length - indexHistory.roundId];

            // Assert
            expect(winamount.trim()).toEqual(global.settledata.betwin);
            expect(totalbet).toEqual(global.settledata.bet);
            expect(roundId).toEqual(global.settledata.roundId);

            // Act 2
            if (indexHistory.navticketdetail) {
                await openRoundDetail(this.game);
                const roundID = await getRoundId(this.game);
                // Assert 2
                expect(roundID).toEqual(global.settledata.roundId);
            }

            //Post-Act
            await this.game.clickOutSide();
            await this.game.clickOutSide();
        });
    }

    protected maxBetTests() {
        test("THEN player should get error when they reach max bet", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            let betChoices: any = this.options.multiPlaceBetChoices;
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(timeout / 4);
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
            }
            let i: number = 0;
            while (i < 9) {
                await this.game.clickLocator(TableLocator.TableLocatorNames.btnRightArrow);
                i++
            }

            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(1000);     
                const msgMaxbet = await this.game.capture('msgMaxbet'+iterator);
                 // Assert
                expect(msgMaxbet.image).toMatchSnapshot(msgMaxbet.name,{maxDiffPixelRatio:0.3});
            }

            await this.game.waitForSettlement();

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
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
        });
        test("User can use rebet function", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 };
            await this.game.waitUntilPlaceBet();
            await this.game.clickLocator(TableLocator.TableLocatorNames.btnRebet);

            // Act
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
            //handle tie: true
            if (settledResults.settlementResult.tie) {
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
            this.game.attachSocketAndCaptureEvent(GameEvent.OwnBets);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            let betChoices: any = this.options.multiPlaceBetChoices;
            const amount = this.options.placeBetAmount ?? 1;
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(timeout / 4);
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
            }

            // Act
            let ownBets = await this.game.latestCaptureEvent(GameEvent.OwnBets);

            const settledResults = await this.game.waitForSettlement();
            let calWinAmount = 0;
            // Assert
            for (const iterator of betChoices) {
                const bet =
                    settledResults.settlementResult.tie === true
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
            await this.game.waitForTimeout(2000);
            await this.game.clickHome(timeout / 2, TableLocator.TableLocatorNames.btnHome);
            await this.game.waitUntilGameLobbyUiLoad();
            const gamelobby = await this.game.capture(GameLobbyLocator.GameLobbyLocatorNames.imgGameLobby);
            expect(gamelobby.image).toMatchSnapshot(gamelobby.name);
        });
    }

    protected turnbackGame(): void {
        test("Verify user able to go back game by clicking on game icon", async () => {
            // Act 1.
            await this.game.waitForTimeout(timeout / 2);

            const gameNavigate: any = this.options.gameLobbyNavigaion;

            await this.game.clickLocator(gameNavigate[0], timeout);
            await this.game.clickLocator(gameNavigate[1], timeout);

            const dealerSnapshot = await this.game.capture(TableLocator.TableLocatorNames.imgdealer);
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
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

        test.describe.serial(`${this.options.gameConfiguration.name} E2E Tests`, () => {
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
        this.maxBetTests()
        this.multipleBetChoices();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
        this.returnGameLobby();
        this.turnbackGame();
    }
}

const getDataFistRowHistory = async (game: BaseGame, elementname: string = TableLocator.TableLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname);
    return tempdata?.split(" ") || "";
};

const openRoundDetail = async (game: BaseGame) => {
    await game.clickLocator(TableLocator.TableLocatorNames.locHistoryRoundId, 1500);
};

const getRoundId = async (game: BaseGame, elementname: string = TableLocator.TableLocatorNames.lblHistoryDetailRoundId) => {
    let roundId = await game.getTextLocator(elementname);

    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};
