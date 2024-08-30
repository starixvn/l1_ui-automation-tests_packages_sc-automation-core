import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { GameEvent } from "../_shared";
import { GameGuides } from "../game-components/guides/guides.spec";
import { baseLocatorNames } from "../components/base-game-locator";
import { BetHistory } from "../game-components/history/history.spec";

const timeout = 4000;

export class TableGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();
    protected betHistory: BetHistory = new BetHistory(this.options);

    constructor(protected options: IBaseOptions) {}

    protected inGameUiTests() {
        test("Verify the dealer image appears @UI01", async () => {
            // Act
            await this.game.waitUntilNextRound();
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            const dealerSnapshot = await this.game.capture(baseLocatorNames.imgdealer);
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name, { maxDiffPixelRatio: 0.3 });
        });

        test("Verify all bet choices display correctly @UI02", async () => {
            for (const iterator of this.options.placeBetChoices) {
                // Act
                const choiceSnapshot = await this.game.capture(iterator + "Choice");
                // Assert
                expect(choiceSnapshot.image).toMatchSnapshot(choiceSnapshot.name);
            }
        });
        test("Verify default state of chip bar @UI03", async () => {
            const chipbar = await this.game.capture(`defaultChipBar${process.env.npm_config_project}`);
            // Assert
            expect(chipbar.image).toMatchSnapshot(chipbar.name);
        });
        if (this.options.gameConfiguration.rebet) {
            test("Verify Rebet button is disabled @UI04", async () => {
                const btnrebet = await this.game.capture(baseLocatorNames.btnRebet);
                // Assert
                expect(btnrebet.image).toMatchSnapshot(btnrebet.name);
            });
        }
    }

    protected placeBetAndSettleTests() {
        test("Verify the roundId displayed on table is the same in round settle result @Settlement01", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const betChoice = await this.game.capture(bet.choice + `Ownbet${process.env.npm_config_project}`);
            const roundId = await this.game.getTextLocator(baseLocatorNames.lblRoundIdOnTable, "#0123456789");
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
            console.log(settledResults.roundId, roundId);
            expect(roundId.includes(settledResults.roundId)).toBe(true);
        });

        test("Verify that player able to place bet and return settlement data for comparing history ticket detail @Settlement02", async () => {
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
                settledResults: settledResults.settlementResult,
                roundId: settledResults.roundId,
                betwin: settledResults.winAmount,
                bet: bet.amount,
                choice: bet.choice,
            };
            global.settledata = settledata;
        });
    }

    protected ticketHistoryTests() {
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
        test("Verify data of history of above round", async () => {
            // Act 1
            await this.game.clickHistory(timeout);
            const ticketdata = await getDataFistRowHistory(this.game);

            const indexHistory: any = this.options.indexTicketHistory;

            const winamount = ticketdata[ticketdata?.length - 1];
            const totalbet = ticketdata[ticketdata?.length + indexHistory.totalbet];
            const dateIndex = ticketdata.findIndex((value) => {
                return value.includes("/");
            });
            const roundId = ticketdata[dateIndex + 1];

            // Assert
            expect(parseFloat(winamount)).toBeCloseTo(parseFloat(global.settledata.betwin), -1);
            expect(totalbet).toEqual(global.settledata.bet);
            expect(parseInt(roundId)).toBeCloseTo(parseInt(global.settledata.roundId), -1);

            // Act 2
            if (indexHistory.isIdLink) {
                await this.game.clickLocator(baseLocatorNames.locHistoryRoundId, 1500);
                const roundID = await this.game.getTextLocator(baseLocatorNames.lblHistoryDetailRoundId, "0123456789");
                // Assert 2
                expect(parseInt(roundID)).toEqual(parseInt(global.settledata.roundId));
            }

            //Post-Act
            await this.game.clickOutSide();
            await this.game.clickOutSide();
        });
    }

    protected LedBarTests() {
        test("Verify the latest result in bar should be displayed correctly @LedBar", async () => {
            // Act 1
            const barItems: any = this.options.barItems;
            const latestBarItem = barItems.filter((item) => global.settledata.settledResults[item] === true);

            const barLed = await this.game.capture(latestBarItem + "Bar");

            // Assert
            expect(barLed.image).toMatchSnapshot(barLed.name, { maxDiffPixelRatio: 0.3 });
        });
    }

    protected maxBetTests() {
        test("Verify that player should get error when they reach max bet @MaxBet", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            let betChoices: any = this.options.multiPlaceBetChoices;
            await this.game.waitUntilPlaceBet();
            await this.game.waitForTimeout(timeout / 4);
            for (const iterator of betChoices) {
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(800);
            }
            let i: number = 0,
                j: number = 0;
            while (i < 10) {
                await this.game.clickLocator(baseLocatorNames.btnRightArrow);
                i++;
            }

            for (const iterator of betChoices) {
                this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
                await this.game.clickToChoice(iterator);
                await this.game.waitForTimeout(1000)
                const endBetMsg = await this.game.latestCaptureEvent(GameEvent.EndBet);
                // Assert
                expect(endBetMsg).toMatchObject({ endBet: -1, betChoice: iterator});
            }
            // post Act
            while (j < 10) {
                await this.game.clickLocator(baseLocatorNames.btnLeftArrow);
                j++;
            }
        });
    }

    protected reBet() {
        test("Verify player able to place bet other choice then get data for next rebet @Rebet01", async () => {
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
        test("Verify player can rebet all bet choice and amount of previous placebet @Rebet02", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            const bet = { choice: this.options.placeBetChoices[1], amount: this.options.placeBetAmount ?? 1 };
            await this.game.waitUntilPlaceBet();
            await this.game.clickLocator(baseLocatorNames.btnRebet);

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
        test("Verify player able to placebet multiple choices in 1 round @Settlement03", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.OwnBets);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
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
                //tie refund rule only apply for main choices
                const bet =
                    settledResults.settlementResult.tie === true && !this.options.gameConfiguration.hedgeBetGroups.includes(iterator)
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
        test("Verify player redirect to gamelooby after clicking home icon @Lobby01", async () => {
            // Act 1
            await this.game.waitForTimeout(2000);
            await this.game.clickHome(timeout / 2, baseLocatorNames.btnHome);
            await this.game.waitUntilGameLobbyUiLoad();
            const gamelobby = await this.game.capture(baseLocatorNames.imgGameLobby);
            expect(gamelobby.image).toMatchSnapshot(gamelobby.name);
        });
    }

    protected turnbackGame(): void {
        test("Verify player able to go back game by clicking on game icon @Lobby02", async () => {
            // Act 1.
            await this.game.waitForTimeout(timeout / 2);

            const gameNavigate: any = this.options.gameLobbyNavigation;

            await this.game.clickLocator(gameNavigate[0], timeout);
            await this.game.clickLocator(gameNavigate[1], timeout * 2);

            const dealerSnapshot = await this.game.capture(baseLocatorNames.imgdealer);
            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });
    }

    protected jackPotBanner(): void {
        test("Verify JackPot banner still displayed when user return game lobby @JackPot", async () => {
            // Act 1
            await this.game.waitForTimeout(2000);
            await this.game.clickHome(timeout / 2, baseLocatorNames.btnHome);
            await this.game.waitUntilGameLobbyUiLoad();
            const jackPotBanner = await this.game.capture(baseLocatorNames.jackPotbanner);
            expect(jackPotBanner.image).toMatchSnapshot(jackPotBanner.name);
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
                this.betHistory.init(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario(): void {
        this.inGameUiTests();
        this.placeBetAndSettleTests();
        this.betHistory.tests();
        this.LedBarTests();
        if (this.options.gameConfiguration.rebet) {
            this.reBet();
        }
        this.maxBetTests();
        this.multipleBetChoices();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
        this.returnGameLobby();
        this.turnbackGame();
        if (process.env.npm_config_project === "l2") {
            this.jackPotBanner()
        }
    }
}

const getDataFistRowHistory = async (game: BaseGame, elementname: string = baseLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname, "0123456789:/., ", "history");
    return tempdata?.split(" ") || "";
};
