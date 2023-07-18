import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { CSLocatorNames } from "../components/base-classic-slot-locator";
import { GameGuides } from "../game-components/guides/guides.spec";

const timeout = 3000;
export interface SlotGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class SlotGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();


    constructor(protected options: SlotGameOptions) {}

    protected inGameTests() {
        test("Verify received websocket Odds of game should be the same with game's config ", async () => {
            // Assert
            await test.step(`Verify ODD should be correct`, async () => {
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected mainUITests() {
        test("Verify game name", async () => {
            //Act
            const gamename = await this.game.capture(CSLocatorNames.imgGameName);

            //Assert
            expect(gamename.image).toMatchSnapshot(gamename.name);
        });

        test("Verify symbols board in first load game", async () => {
            //Act
            const boardID = await getBoardID();
            await this.game.clickLocator(CSLocatorNames.btnSymbol, 2000);
            const imgBoardId = await this.game.capture(`img${boardID}`);

            //Assert
            expect(imgBoardId.image).toMatchSnapshot(imgBoardId.name);
        });

        test("Verify roundID is null in first load game", async () => {
            //Act
            const defaultRoundID = await this.game.capture(CSLocatorNames.lblRoundID);

            //Assert
            expect(defaultRoundID.image).toMatchSnapshot(defaultRoundID.name);
        });

        test("Verify payline number in right & left column", async () => {
            await test.step("The numbers are shows in the following order: 20, 8, 2, 14, 17, 7, 1, 10, 23, 15, 9, 3, 21", async () => {
                //Act
                const imgLeftNumbersColumn = await this.game.capture(CSLocatorNames.imgLeftNumbersColumn);

                //Assert
                expect(imgLeftNumbersColumn.image).toMatchSnapshot(imgLeftNumbersColumn.name);
            });
            await test.step("The numbers are shows in the following order: 18, 5, 12, 24, 6, 22, 16, 11, 19, 13, 4, 25", async () => {
                //Act
                const imgRightNumbersColumn = await this.game.capture(CSLocatorNames.imgRightNumbersColumn);

                //Assert
                expect(imgRightNumbersColumn.image).toMatchSnapshot(imgRightNumbersColumn.name);
            });
        });
    }

    protected paylineTests() {
        test("Verify default paylines (25 lines) in first load game", async () => {
            //Act
            const btnPayline = await this.game.capture(CSLocatorNames.btnPayline);

            //Assert
            expect(btnPayline.image).toMatchSnapshot(btnPayline.name);
        });

        test("Verify Payline Popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await openPayLineBoard(this.game);
            for (const placeBetChoice of this.options.placeBetChoices) {
                //Act 1
                await selectBetChoice(this.game, `btn${placeBetChoice}`);

                let betChoice = await this.game.captureLocator(`tbl${placeBetChoice}`);
                // Assert
                expect(betChoice.image).toMatchSnapshot(betChoice.name);

                //Act 2
                await closePayLineBoard(this.game);
                await openPayLineBoard(this.game);
                // Assert2
                expect(betChoice.image).toMatchSnapshot(betChoice.name);
            }
        });

        test("Verify submit bet button is disabled when no choice is selected", async () => {
            // Act
            await this.game.clickLocator(CSLocatorNames.btnClearPayline,timeout);
            const imgConfirmPaylineDisabled = await this.game.capture(CSLocatorNames.imgConfirmPaylineDisabled);

            //Assert
            expect(imgConfirmPaylineDisabled.image).toMatchSnapshot(imgConfirmPaylineDisabled.name);

            //Post-Act
            await closePayLineBoard(this.game);
        });
    }

    protected betTotalBetTests() {
        test("Verify list bet stake", async () => {
            // Act
            const cboBetLevel = await this.game.capture(CSLocatorNames.cboBetLevel);

            //Assert
            expect(cboBetLevel.image).toMatchSnapshot(cboBetLevel.name);

            //Post-Act
            await this.game.clickOutSide();
        });

        test("Verify selected bet stake value and total bet amount", async () => {
            const betStake = process.env.npm_config_project === "l2"? ["BetLevel5", "BetLevel10"] : ["BetLevel0_1", "BetLevel0_2"]
            const totalStake = process.env.npm_config_project === "l2"? ["Totalbet5", "Totalbet10"] : ["Totalbet0_1", "Totalbet0_2"]
            let imgBetStake, imgTotalStake;
            for (let index = 0; index < betStake.length; index++) {
                await this.player.selectBetStake(`lbl${betStake[index]}`);

                // Act
                imgBetStake = await this.game.capture(`img${betStake[index]}`);
                imgTotalStake = await this.game.capture(`img${totalStake[index]}`);

                //Assert
                expect(imgBetStake.image).toMatchSnapshot(imgBetStake.name);
                expect(imgTotalStake.image).toMatchSnapshot(imgTotalStake.name);
            }
        });
    }

    protected autoSpinTests() {
        test("Verify default UI of AutoSpin popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Arrange
            await openAutoSpinBoard(this.game);

            // Act
            const popAutoSpin = await this.game.capture(CSLocatorNames.popAutoSpin);

            //Assert
            expect(popAutoSpin.image).toMatchSnapshot(popAutoSpin.name);

            await this.game.clickOutSide();
        });

        test("Verify case user select 10 auto spins then wait for finishing 10 auto spins", async () => {
            // Arrange
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;

            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: CSLocatorNames.lblBetLevel0_1 };
            await clickTurbo(this.game);
            await this.player.selectPayline(CSLocatorNames.btnPayline1);
            await this.game.waitForTimeout(timeout);
            await this.player.selectBetStake(bet.amount);

            // Act
            await selectAutoSpin(this.game, totalAutoSpin);
            for (let index = 1; index <= totalAutoSpin; index++) {
                const settledResults = await this.game.waitForSettlement();

                settledResultsAutoSpin.push(settledResults.winAmount);
            }

            //Assert
            expect(settledResultsAutoSpin.length >= 10).toBe(true);
            await this.game.waitForTimeout(timeout); //handle cases free spin or bonus

            //Post-Act
            await this.game.clickOutSide();
        });

        test("Verify user can stop auto spin process by clicking on autospin button", async () => {
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;
            await selectAutoSpin(this.game, totalAutoSpin);

            for (let index = 1; index <= totalAutoSpin - 5; index++) {
                const settledResults = await this.game.waitForSettlement();
                settledResultsAutoSpin.push(settledResults.winAmount);
            }

            await this.game.clickLocator(CSLocatorNames.btnAutoSpin); //stop autospin

            //Assert
            expect(settledResultsAutoSpin.length < 10).toBe(true);
            await this.game.waitForTimeout(timeout); //handle cases free spin or bonus
        });
    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            const turboOff = await this.game.captureLocator(CSLocatorNames.imgTurboOFF);

            // Assert Turbo Off
            expect(turboOff.image).toMatchSnapshot(turboOff.name);
        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
            await clickTurbo(this.game);
            const turboOn = await this.game.captureLocator(CSLocatorNames.imgTurboOn);

            // Assert turbo On
            expect(turboOn.image).toMatchSnapshot(turboOn.name);
        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Act
            await clickTurbo(this.game);
            const imgTurboOFF = await this.game.capture(CSLocatorNames.imgTurboOFF);

            //Assert
            expect(imgTurboOFF.image).toMatchSnapshot(imgTurboOFF.name);
        });
    }

    protected spinByKeys() {
        test("Verify user able spin by space with turbo mode OFF", async () => {
            //Arrange
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };
            await this.player.selectPayline(CSLocatorNames.btnPayline1);
            await this.player.selectBetStake(CSLocatorNames[`lblBetLevel${bet.amount}`]);
            await this.game.waitForTimeout(timeout)

            //Act
            await this.game.keyboardPress("Space");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(timeout);
            await this.game.clickOutSide(1500); //click ouside to close big win popup
        });

        test("Verify user able spin by enter key with turbo mode OFF", async () => {
            //Arrange
            let bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };

            //Act
            await this.game.keyboardPress("Enter");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(timeout);
            await this.game.clickOutSide(1500); //click ouside to close big win popup
        });

        test("Verify user able spin by space with turbo mode ON", async () => {
            //Arrange
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };
            await clickTurbo(this.game);

            //Act
            await this.game.keyboardPress("Space");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(timeout);
            await this.game.clickOutSide(1500); //click ouside to close big win popup
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" });
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };
            let bettime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "numeric", minute: "numeric" });
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBetClassicSlot(bet.choice, CSLocatorNames.lblBetLevel1);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(bet).toMatchWinningSymbols(settledResults);

            // Post-Act
            const settledata = {
                roundID: await getRoundId(this.game),
                betwin: settledResults.winAmount.toString(),
                bet: bet.amount.toString(),
                line: bet.choice,
                bettime: bettime,
                betdate: today,
            };
            global.settledata = settledata;
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Act 1
            await this.game.clickHistory(1000);
            await this.game.captureLocator(CSLocatorNames.lblHistoryFirstRow);

            // Assert 1
            await verifyticketdata(this.game, global.settledata);

            // Act 2
            await openRoundDetail(this.game);
            let roundID = await getRoundId(this.game, CSLocatorNames.lblHistoryDetailRoundId);

            // Assert 2
            expect(roundID).toEqual(global.settledata.roundID);

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

        test.describe.serial(`${this.options.gameConfiguration.name} E2E Testing`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.gameGuides.init(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameTests();
        this.mainUITests();
        this.turboTests();
        this.paylineTests();
        this.betTotalBetTests();
        this.spinByKeys();
        this.autoSpinTests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }
}

const openAutoSpinBoard = async (game: BaseGame) => {
    await game.clickOutSide();
    await game.clickLocator(CSLocatorNames.btnAutoSpin);
};

const selectAutoSpin = async (game: BaseGame, totalspin: number) => {
    await game.clickLocator(CSLocatorNames.btnAutoSpin, 1500);
    await game.clickLocator(CSLocatorNames[`btnAutoSpin${totalspin}`]);
    await game.clickLocator(CSLocatorNames.btnAutoSpinStart, 100);
};

const openPayLineBoard = async (game: BaseGame) => {
    await game.clickLocator(CSLocatorNames.btnPayline, 1000);
};

const selectBetChoice = async (game: BaseGame, choice: string) => {
    await game.clickLocator(CSLocatorNames.btnClearPayline, 1000);
    await game.clickLocator(choice);
};

const closePayLineBoard = async (game: BaseGame) => {
    await game.clickLocator(CSLocatorNames.btnClosePopup, 1000);
};

const clickTurbo = async (game: BaseGame) => {
    await game.clickLocator(CSLocatorNames.btnTurbo);
};

const getRoundId = async (game: BaseGame, elementname: string = CSLocatorNames.lblRoundID) => {
    let roundId = await game.getTextLocator(elementname);

    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};

const getDataFistRowHistory = async (game: BaseGame, elementname: string = CSLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname);

    if (tempdata != null) {
        let data = tempdata.split(" ");
        return {
            betdate: data[0].toString(),
            bet: data[1].toString().replace(/[^0-9.]/g, ""),
            line: data[2].toString().replace(/[^0-9.]/g, ""),
            totalbet: data[3].toString().replace(/[^0-9.]/g, ""),
            betwin: data[4].toString().replace(/[^0-9.]/g, ""),
        };
    } else {
        return {
            bettime: "N/A",
            betdate: "N/A",
            bet: "N/A",
            line: "N/A",
            totalbet: "N/A",
            betwin: "N/A",
        };
    }
};

const openRoundDetail = async (game: BaseGame) => {
    await game.clickLocator(CSLocatorNames.locHistoryRoundId, 1000);
};

export interface Expectdata {
    line: string;
    betdate: string;
    bet: string;
    betwin: string;
}

const verifyticketdata = async (game: BaseGame, expectdata: Expectdata) => {
    let line = expectdata.line.replace("btnPayline", "");
    const ticketdata = await getDataFistRowHistory(game);
    expect(ticketdata.betdate, "verify bet date").toEqual(expectdata.betdate);
    expect(ticketdata.bet).toEqual(expectdata.bet);
    expect(ticketdata.line, "verify bet bet choice").toEqual(line);
    expect(ticketdata.betwin, "verify bet win").toEqual(expectdata.betwin);
};

const getBoardID = async () => {
    let boardId = "";
    for (let index = 0; index <= 10; index++) {
        if (global.logMsg[0] === "B" + index) {
            boardId = "B" + index;
            break;
        }
    }
    return boardId;
};
