import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { baseLocatorNames } from "../components/base-game-locator";
import { GameGuides } from "../game-components/guides/guides.spec";
import { BetHistory } from "../game-components/history/history.spec";

const timeout = 4000;
export interface SlotGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class SlotGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();
    protected betHistory: BetHistory = new BetHistory(this.options);

    constructor(protected options: SlotGameOptions) {}

    protected inGameTests() {
        test("Verify received websocket Odds of game should be the same with game's config ", async () => {
            // Assert
            await test.step(`Verify ODDs should be correct`, async () => {
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected mainUITests() {
        test("Verify game name", async () => {
            //Act
            let gamename;
            await test.step(`Capture game name`, async () => {
                gamename = await this.game.capture(baseLocatorNames.imgGameName);
            });

            //Assert
            await test.step(`Compare with snapshot`, async () => {
                expect(gamename.image).toMatchSnapshot(gamename.name);
            });
        });

        test("Verify symbols board in first load game", async () => {
            //Act
            const boardID = await getBoardID();
            await test.step(`Click on symbol`, async () => {
                await this.game.clickLocator(baseLocatorNames.btnSymbol, 2000);
            });
            let imgBoardId = await this.game.capture(`img${boardID}`);
            if (process.env.npm_config_jackpot) {
                await test.step(`Capture JackPot board`, async () => {
                    imgBoardId = await this.game.capture(`img${boardID}JP`);
                });

                //Assert
                await test.step(`Compare with snapshot`, async () => {
                    expect(imgBoardId.image).toMatchSnapshot(imgBoardId.name);
                });
            }
            //Assert
            else
                await test.step(`Compare with snapshot`, async () => {
                    expect(imgBoardId.image).toMatchSnapshot(imgBoardId.name);
                });
        });

        test("Verify roundID is null in first load game", async () => {
            //Act
            let defaultRoundID;
            await test.step(`Capture round ID`, async () => {
                defaultRoundID = await this.game.capture(baseLocatorNames.lblRoundID);
            });

            //Assert
            await test.step(`Compare with snapshot`, async () => {
                expect(defaultRoundID.image).toMatchSnapshot(defaultRoundID.name);
            });
        });

        test("Verify payline number in right & left column", async () => {
            await test.step("Capture left payline column and compare with snapshot", async () => {
                //Act
                const imgLeftNumbersColumn = await this.game.capture(baseLocatorNames.imgLeftNumbersColumn);

                //Assert
                expect(imgLeftNumbersColumn.image).toMatchSnapshot(imgLeftNumbersColumn.name);
            });
            await test.step("Capture right payline column and compare with snapshot", async () => {
                //Act
                const imgRightNumbersColumn = await this.game.capture(baseLocatorNames.imgRightNumbersColumn);

                //Assert
                expect(imgRightNumbersColumn.image).toMatchSnapshot(imgRightNumbersColumn.name);
            });
        });
    }

    protected paylineTests() {
        test("Verify default paylines (25 lines) in first load game", async () => {
            //Act
            let btnPayline;
            await test.step(`Capture default paylines`, async () => {
                btnPayline = await this.game.capture(baseLocatorNames.btnPayline);
            });

            //Assert
            await test.step(`Compare with snapshot`, async () => {
                expect(btnPayline.image).toMatchSnapshot(btnPayline.name);
            });
        });

        test("Verify Payline Popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await test.step(`Open payline popup`, async () => {
                await openPayLineBoard(this.game);
            });
            await test.step(`Verify paylines popup`, async () => {
               const tblAllPayline = await this.game.capture(baseLocatorNames.tblAllPayline);
               expect(tblAllPayline.image).toMatchSnapshot(tblAllPayline.name);
            });
        });
    }

    protected betTotalBetTests() {
        test("Verify list bet stake", async () => {
            // Act
            let cboBetLevel;
            await test.step(`Capture bet level`, async () => {
                cboBetLevel = await this.game.capture(`cboBetLevel${process.env.npm_config_project}`);
            });

            //Assert
            await test.step(`Compare with snapshot`, async () => {
                expect(cboBetLevel.image).toMatchSnapshot(cboBetLevel.name);
            });

            //Post-Act
            await test.step(`Click outside`, async () => {
                await this.game.clickOutSide();
            });
        });

        test("Verify selected bet stake value and total bet amount", async () => {
            const betStake = process.env.npm_config_project === "l2" ? ["BetLevel5", "BetLevel10"] : ["BetLevel0_1", "BetLevel0_2"];
            const totalStake = process.env.npm_config_project === "l2" ? ["Totalbet5", "Totalbet10"] : ["Totalbet0_1", "Totalbet0_2"];
            let imgBetStake, imgTotalStake;
            for (let index = 0; index < betStake.length; index++) {
                await test.step(`Select ${betStake[index]}`, async () => {
                    await this.player.selectBetStake(`lbl${betStake[index]}`);
                });

                // Act
                await test.step(`Capture ${betStake[index]} and total stake`, async () => {
                    imgBetStake = await this.game.capture(`img${betStake[index]}`);
                    imgTotalStake = await this.game.capture(`img${totalStake[index]}`);
                });

                //Assert
                await test.step(`Compare with snapshot`, async () => {
                    expect(imgBetStake.image).toMatchSnapshot(imgBetStake.name);
                    expect(imgTotalStake.image).toMatchSnapshot(imgTotalStake.name);
                });
            }
        });
    }

    protected autoSpinTests() {
        test("Verify default UI of AutoSpin popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Arrange
            await test.step(`Open autospin popup`, async () => {
                await openAutoSpinBoard(this.game);
            });

            // Act
            let popAutoSpin;
            await test.step(`Capture default autospin popup`, async () => {
                popAutoSpin = await this.game.capture(baseLocatorNames.popAutoSpin);
            });

            //Assert
            await test.step(`Compare with snapshot`, async () => {
                expect(popAutoSpin.image).toMatchSnapshot(popAutoSpin.name);
            });

            await test.step(`Close popup`, async () => {
                await this.game.clickOutSide(1000);
            });
        });

        test("Verify case user select 10 auto spins then wait for finishing 10 auto spins", async () => {
            // Arrange
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;

            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: baseLocatorNames.lblBetLevel0_1 };
            await test.step(`Click turbo button`, async () => {
                await clickTurbo(this.game);
            });
            await test.step(`Select payline`, async () => {
                await this.player.selectPayline(baseLocatorNames.btnPayline1);
                await this.game.waitForTimeout(timeout);
            });

            await test.step(`Select bet stake`, async () => {
                await this.player.selectBetStake(bet.amount);
            });

            // Act
            await test.step(`Wait for 10 spins finished`, async () => {
                await selectAutoSpin(this.game, totalAutoSpin);
                for (let index = 1; index <= totalAutoSpin; index++) {
                    const settledResults = await this.game.waitForSettlement();

                    settledResultsAutoSpin.push(settledResults.winAmount);

                    await this.game.waitForFreeSpin(settledResults)
                }
            });

            //Assert
            await test.step(`Verify number of spins`, async () => {
                expect(settledResultsAutoSpin.length >= 10).toBe(true);
                await this.game.waitForTimeout(timeout); //handle cases free spin or bonus
            });

            //Post-Act
            await test.step(`Click out side to close big win`, async () => {
                await this.game.clickOutSide(2000); //click outside to close big win popup
            });
        });

        test("Verify user can stop auto spin process by clicking on autospin button", async () => {
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;
            await test.step(`Start 10 auto spin`, async () => {
                await selectAutoSpin(this.game, totalAutoSpin);
            });

            await test.step(`Wait for 5 spins and stop`, async () => {
                for (let index = 1; index <= totalAutoSpin - 5; index++) {
                    const settledResults = await this.game.waitForSettlement();
                    settledResultsAutoSpin.push(settledResults.winAmount);
                    await this.game.waitForFreeSpin(settledResults)
                }

                await this.game.clickLocator(baseLocatorNames.btnAutoSpin); //stop autospin
            });

            //Assert
            await test.step(`Verify number of auto spin`, async () => {
                expect(settledResultsAutoSpin.length < 10).toBe(true);
            });

            //Post-Act
            await test.step(`Click outside`, async () => {
                await this.game.waitForTimeout(timeout); //handle cases free spin or bonus
                await this.game.clickOutSide(2000); //click outside to close big win popup
            });
        });
    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            let turboOff;
            await test.step(`Capture default turbo mode`, async () => {
                turboOff = await this.game.captureLocator(baseLocatorNames.imgTurboOFF);
            });

            // Assert Turbo Off
            await test.step(`Compare with snapshot`, async () => {
                expect(turboOff.image).toMatchSnapshot(turboOff.name);
            });
        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
            await test.step(`Click turbo button`, async () => {
                await clickTurbo(this.game);
            });
            let turboOn;
            await test.step(`Capture turbo button on`, async () => {
                turboOn = await this.game.captureLocator(baseLocatorNames.imgTurboOn);
            });

            // Assert turbo On
            await test.step(`Compare with snapshot`, async () => {
                expect(turboOn.image).toMatchSnapshot(turboOn.name);
            });
        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Act
            await test.step(`Click turbo button`, async () => {
                await clickTurbo(this.game);
            });

            let imgTurboOFF;
            await test.step(`Capture turbo off`, async () => {
                imgTurboOFF = await this.game.capture(baseLocatorNames.imgTurboOFF);
            });

            //Assert
            await test.step(`Compare with snapshot`, async () => {
                expect(imgTurboOFF.image).toMatchSnapshot(imgTurboOFF.name);
            });
        });
    }

    protected spinByKeys() {
        test("Verify user able spin by space with turbo mode OFF", async () => {
            //Arrange
            await test.step(`Attach web socket and capture event`, async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            });
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };
            await test.step(`Select payline and bet stake`, async () => {
                await this.game.clickOutSide();
                await this.player.selectPayline(baseLocatorNames.btnPayline1);
                await this.player.selectBetStake(baseLocatorNames[`lblBetLevel${bet.amount}`]);
                await this.game.waitForTimeout(timeout);
            });

            //Act
            await test.step(`Press space`, async () => {
                await this.game.keyboardPress("Space");
            });

            let settledResults;
            await test.step(`Wait for settlement`, async () => {
                settledResults = await this.game.waitForSettlement();
            });

            // Assert
            await test.step(`Verify settlement result`, async () => {
                expect(bet).toMatchWinningSymbols(settledResults);
            });

            await test.step(`Wait for free spins`, async () => {
                await this.game.waitForFreeSpin(settledResults)
            });

            await test.step(`Click outside`, async () => {
                await this.game.waitForTimeout(6000);
                await this.game.clickOutSide(2000); //click outside to close big win popup
            });
        });

        test("Verify user able spin by enter key with turbo mode OFF", async () => {
            //Arrange
            let bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };

            //Act
            await test.step(`Press enter`, async () => {
                await this.game.keyboardPress("Enter");
            });

            let settledResults;
            await test.step(`Wait for settlement`, async () => {
                settledResults = await this.game.waitForSettlement();
            });

            // Assert
            await test.step(`Verify settlement result`, async () => {
                expect(bet).toMatchWinningSymbols(settledResults);
            });

            await test.step(`Wait for free spins`, async () => {
                await this.game.waitForFreeSpin(settledResults)
            });

            await test.step(`Click outside`, async () => {
                await this.game.waitForTimeout(6000);
                await this.game.clickOutSide(2000); //click outside to close big win popup
            });
        });

        test("Verify user able spin by space with turbo mode ON", async () => {
            //Arrange
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };
            await test.step(`Click turbo`, async () => {
                await clickTurbo(this.game);
            });

            //Act
            await test.step(`Press space`, async () => {
                await this.game.keyboardPress("Space");
            });

            let settledResults;
            await test.step(`Wait for settlement`, async () => {
                settledResults = await this.game.waitForSettlement();
            });
            

            // Assert
            await test.step(`Verify settlement result`, async () => {
                expect(bet).toMatchWinningSymbols(settledResults);
            });

            await test.step(`Wait for free spins`, async () => {
                await this.game.waitForFreeSpin(settledResults)
            });

            await test.step(`Click outside`, async () => {
                await this.game.waitForTimeout(6000);
                await this.game.clickOutSide(2000); //click outside to close big win popup
            });
        });
    }

    protected placeBetAndSettleTests() {
        test("Verify that player be able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" });
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            let placeBetResponse, settledResults;
            await test.step(`Place bet`, async () => {
                placeBetResponse = await this.player.placeBetClassicSlot(bet.choice, baseLocatorNames.lblBetLevel1);
            });

            await test.step(`Wait for settlement`, async () => {
                settledResults = await this.game.waitForSettlement();
            });

            await test.step(`Wait for free spins`, async () => {
                await this.game.waitForFreeSpin(settledResults)
            });

            // Assert
            await test.step(`Verify settlement result`, async () => {
                expect(placeBetResponse.endBet).toBe(bet.amount);
                expect(bet).toMatchWinningSymbols(settledResults);
            });

            // Post-Act
            const settledata = {
                roundId: settledResults.roundId,
                betwin: settledResults.winAmount,
                bet: bet.amount,
                choice: "bet",
                betdate: today,
            };
            global.settledata = settledata;

            await test.step(`Click outside`, async () => {
                await this.game.clickOutSide(2000); //click outside to close big win
            });
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
                this.betHistory.init(this.game);
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
        this.betHistory.tests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }
}

const openAutoSpinBoard = async (game: BaseGame) => {
    await game.clickOutSide();
    await game.clickLocator(baseLocatorNames.btnAutoSpin);
};

const selectAutoSpin = async (game: BaseGame, totalspin: number) => {
    await game.clickLocator(baseLocatorNames.btnAutoSpin, 1500);
    await game.clickLocator(baseLocatorNames[`btnAutoSpin${totalspin}`]);
    await game.clickLocator(baseLocatorNames.btnAutoSpinStart, 100);
};

const openPayLineBoard = async (game: BaseGame) => {
    await game.clickLocator(baseLocatorNames.btnPayline, 1000);
};

// const selectBetChoice = async (game: BaseGame, choice: string) => {
//     await game.clickLocator(baseLocatorNames.btnClearPayline, 1000);
//     await game.clickLocator(choice);
// };

// const closePayLineBoard = async (game: BaseGame) => {
//     await game.clickLocator(baseLocatorNames.btnClosePopup, 1000);
// };

const clickTurbo = async (game: BaseGame) => {
    await game.clickLocator(baseLocatorNames.btnTurbo);
};

export interface Expectdata {
    line: string;
    betdate: string;
    bet: string;
    betwin: string;
}

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
