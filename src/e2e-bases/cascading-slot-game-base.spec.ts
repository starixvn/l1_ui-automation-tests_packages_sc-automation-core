import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { CascadingSlotLocatorNames } from "../components/base-cascading-slot-locator";
import { GameGuides } from "../game-components/guides/guides.spec";

const timeout = 3000;
export interface SlotGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class CascadingSlotGameBase {
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
            const gamename = await this.game.capture(CascadingSlotLocatorNames.imgGameName);

            //Assert
            expect(gamename.image).toMatchSnapshot(gamename.name);
        });

        test("Verify symbols board in first load game", async () => {
            //Act
            const boardID = await getBoardID();
            const imgBoardId = await this.game.capture(`img${boardID}`);

            //Assert
            expect(imgBoardId.image).toMatchSnapshot(imgBoardId.name);
        });

        test("Verify roundID is null in first load game", async () => {
            //Act
            const defaultRoundID = await this.game.capture(CascadingSlotLocatorNames.lblRoundID);

            //Assert
            expect(defaultRoundID.image).toMatchSnapshot(defaultRoundID.name);
        });

        test("Verify bottom area", async () => {
            //Act
            const imgBottomArea = await this.game.capture(CascadingSlotLocatorNames.imgBottomArea);

            //Assert
            expect(imgBottomArea.image).toMatchSnapshot(imgBottomArea.name);
        });

        test("Verify tumble win list is clear", async () => {
            //Act
            const defaultTumbleWinList = await this.game.capture(CascadingSlotLocatorNames.lblTumbleWinList);

            //Assert
            expect(defaultTumbleWinList.image).toMatchSnapshot(defaultTumbleWinList.name);
        });

        test("Verify menu expand with sound and music on", async () => {
            //Act
            await this.game.clickLocator(CascadingSlotLocatorNames.mnuHamburger);
            const mnuHamburgerExpandSoundOn = await this.game.capture(CascadingSlotLocatorNames.mnuHamburgerExpandSoundOn);

            //Assert
            expect(mnuHamburgerExpandSoundOn.image).toMatchSnapshot(mnuHamburgerExpandSoundOn.name);

            //Pre Act

            await this.game.clickOutSide();
        });

        test("Verify menu expand with sound and music off", async () => {
            //Act
            await this.game.clickLocator(CascadingSlotLocatorNames.mnuHamburger);
            await this.game.clickLocator(CascadingSlotLocatorNames.icoSound);
            await this.game.clickLocator(CascadingSlotLocatorNames.icoMusic);
            const mnuHamburgerExpandSoundOn = await this.game.capture(CascadingSlotLocatorNames.mnuHamburgerExpandSoundOn);

            //Assert
            expect(mnuHamburgerExpandSoundOn.image).toMatchSnapshot(mnuHamburgerExpandSoundOn.name);

            
            //Pre Act

            await this.game.clickOutSide();
        });

    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            const turboOff = await this.game.captureLocator(CascadingSlotLocatorNames.imgTurboOFF);

            // Assert Turbo Off
            expect(turboOff.image).toMatchSnapshot(turboOff.name);
        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
            await clickTurbo(this.game);
            const turboOn = await this.game.captureLocator(CascadingSlotLocatorNames.imgTurboOn);

            // Assert turbo On
            expect(turboOn.image).toMatchSnapshot(turboOn.name);
        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Act
            await clickTurbo(this.game);
            const imgTurboOFF = await this.game.capture(CascadingSlotLocatorNames.imgTurboOFF);

            //Assert
            expect(imgTurboOFF.image).toMatchSnapshot(imgTurboOFF.name);
        });
    }

    protected spinByKeys() {
        test("Verify user able spin by space with turbo mode OFF", async () => {
            //Arrange
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            const bet = { choice: this.game.gameConfiguration.choices[0], amount:this.options.placeBetAmount??1 };
            //await this.player.selectPayline(CascadingSlotLocatorNames.btnPayline1);
            //await this.player.selectBetStake(CascadingSlotLocatorNames[`lblBetLevel${bet.amount}`]);

            //Act
            await this.game.waitForTimeout(timeout)
            await this.game.keyboardPress("Space");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(timeout);
            await this.game. clickOutSide(); //Click outside to close big win popup
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
            await this.game.clickOutSide(); //Click outside to close big win popup
        });

        test("Verify user able spin by space with turbo mode ON", async () => {
            //Arrang
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };
            await clickTurbo(this.game);

            //Act
            await this.game.keyboardPress("Space");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(timeout);
            await this.game.clickOutSide(); //Click outside to close big win popup
        });

        test("Verify user able spin by enter key with turbo mode ON", async () => {
            //Arrang
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: this.options.placeBetAmount ?? 1 };

            //Act
            await this.game.keyboardPress("Enter");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(timeout);
            await this.game.clickOutSide(); //Click outside to close big win popup
            await clickTurbo(this.game); //turn off turbo
        });
    }

    protected betControlTests() {
        test("Verify default value of total stake", async () => {
            //Act
            await this.game.clickLocator(CascadingSlotLocatorNames.btnTotalStake)
            const popBetControl = await this.game.capture(CascadingSlotLocatorNames.popBetControl);

            //Assert
            expect(popBetControl.image).toMatchSnapshot(popBetControl.name);
        });

        test("Verify increase bet level to the max value", async () => {
            //Act
            for (let i = 0; i < 4; i++) {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnBetLevelIncrease)
              }
            const popBetControlMaxBetLevel = await this.game.capture(CascadingSlotLocatorNames.popBetControlMaxBetLevel);

            //Assert
            expect(popBetControlMaxBetLevel.image).toMatchSnapshot(popBetControlMaxBetLevel.name);
        });

        test("Verify increase coin value to the max value", async () => {
            //Act
            for (let i = 0; i < 3; i++) {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnCoinValueIncrease)
              }
            const popBetControlMaxCoinValue = await this.game.capture(CascadingSlotLocatorNames.popBetControlMaxCoinValue);

            //Assert
            expect(popBetControlMaxCoinValue.image).toMatchSnapshot(popBetControlMaxCoinValue.name);
        });

        // test("Verify max value of total bet", async () => {
        //     //Act
        //     const imgTotalBetMax = await this.game.capture(CascadingSlotLocatorNames.imgTotalBet);

        //     //Assert
        //     expect(imgTotalBetMax.image).toMatchSnapshot(imgTotalBetMax.name);
        // });

        test("Verify decrease bet level to the min value", async () => {
            //Act
            for (let i = 0; i < 9; i++) {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnBetLevelDecrease)
              }
            const popBetControlMinBetLevel = await this.game.capture(CascadingSlotLocatorNames.popBetControlMinBetLevel);

            //Assert
            expect(popBetControlMinBetLevel.image).toMatchSnapshot(popBetControlMinBetLevel.name);
        });

        test("Verify decrease coin value to the min value", async () => {
            //Act
            for (let i = 0; i < 3; i++) {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnCoinValueDecrease)
              }
            const popBetControlMinCoinValue = await this.game.capture(CascadingSlotLocatorNames.popBetControlMinCoinValue);

            //Assert
            expect(popBetControlMinCoinValue.image).toMatchSnapshot(popBetControlMinCoinValue.name);
        });

        // test("Verify min value of total bet", async () => {
        //     //Act
        //     const imgTotalBetMin = await this.game.capture(CascadingSlotLocatorNames.imgTotalBet);

        //     //Assert
        //     expect(imgTotalBetMin.image).toMatchSnapshot(imgTotalBetMin.name);
        // });

    }


    protected autoSpinTests() {
        test("Verify default UI of AutoSpin popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Arrange
            await openAutoSpinBoard(this.game);

            // Act
            const popAutoSpin = await this.game.capture(CascadingSlotLocatorNames.popAutoSpin);

            //Assert
            expect(popAutoSpin.image).toMatchSnapshot(popAutoSpin.name);

            await this.game.clickOutSide();
        });

        test("Verify UI of AutoSpin popup when turn on turbo mode", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Arrange
            await clickTurbo(this.game)
            await openAutoSpinBoard(this.game);

            // Act
            const popAutoSpinTurbo = await this.game.capture(CascadingSlotLocatorNames.popAutoSpin);

            //Assert
            expect(popAutoSpinTurbo.image).toMatchSnapshot(popAutoSpinTurbo.name);

            await this.game.clickOutSide();
        });

        test("Verify case user select 10 auto spins then wait for finishing 10 auto spins", async () => {
            // Arrange
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;

            // Act
            await selectAutoSpin(this.game, totalAutoSpin);
            for (let index = 1; index <= totalAutoSpin; index++) {
                const settledResults = await this.game.waitForSettlement();

                settledResultsAutoSpin.push(settledResults.winAmount);
            }

            //Assert
            expect(settledResultsAutoSpin.length >= 10).toBe(true);
            await this.game.waitForTimeout(timeout); 
            await this.game.clickOutSide();//handle cases win multiplier

            //Post-Act
            await this.game.clickOutSide(); //click outside to close auto spin popup
        });

        test("Verify user can stop auto spin process by clicking on autospin button", async () => {
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;
            await selectAutoSpin(this.game, totalAutoSpin);

            for (let index = 1; index <= totalAutoSpin - 5; index++) {
                const settledResults = await this.game.waitForSettlement();
                settledResultsAutoSpin.push(settledResults.winAmount);
            }

            await this.game.clickLocator(CascadingSlotLocatorNames.btnAutoSpin); //stop autospin

            //Assert
            expect(settledResultsAutoSpin.length < 10).toBe(true);
            await this.game.waitForTimeout(timeout); //handle cases free spin or bonus
            
            await this.game.clickOutSide();
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Act 1
            await this.game.clickHistory(1000);
            await this.game.captureLocator(CascadingSlotLocatorNames.lblHistoryFirstRow);

            // Assert 1
            await verifyticketdata(this.game, global.settledata);

            // Act 2
            await openRoundDetail(this.game);
            let roundID = await getRoundId(this.game, CascadingSlotLocatorNames.lblHistoryDetailRoundId);

            // Assert 2
            expect(roundID).toEqual(global.settledata.roundID);

            //Post-Act
            await this.game.clickLocator(CascadingSlotLocatorNames.btnClosePopup);
            await this.game.clickLocator(CascadingSlotLocatorNames.btnClosePopup);
        });
    }

    protected trialModeTests() {
        test("Verify default bottom area of trial mode", async () => {
            //Act
            await this.game.clickLocator(CascadingSlotLocatorNames.btnTrialMode)
            const imgBottomAreaTrialMode = await this.game.capture(CascadingSlotLocatorNames.imgBottomArea);

            //Assert
            expect(imgBottomAreaTrialMode.image).toMatchSnapshot(imgBottomAreaTrialMode.name);
        });

        test("Verify bet control popup in trial mode", async () => {
            //Act
            await this.game.clickLocator(CascadingSlotLocatorNames.btnTotalStake)
            const popBetControl = await this.game.capture(CascadingSlotLocatorNames.popBetControl);

            //Assert
            expect(popBetControl.image).toMatchSnapshot(popBetControl.name);
        });

        test("Verify message You are in trial mode", async () => {
            //Act
            const popBetControl = await this.game.capture(CascadingSlotLocatorNames.popBetControl);

            //Assert
            expect(popBetControl.image).toMatchSnapshot(popBetControl.name);
        });

        test("Verify default user balance trial mode and round id is clear", async () => {
            //Act
            const imgGeneralInfoDefaultTrialMode = await this.game.capture(CascadingSlotLocatorNames.popBetControl);

            //Assert
            expect(imgGeneralInfoDefaultTrialMode.image).toMatchSnapshot(imgGeneralInfoDefaultTrialMode.name);
        });

        test("Verify round id of the first round of trial mode", async () => {
            //Act
            await this.game.clickLocator(CascadingSlotLocatorNames.btnSpin)
            const roundIdFirstRoundTrialMode = await this.game.capture(CascadingSlotLocatorNames.lblRoundID);

            //Assert
            expect(roundIdFirstRoundTrialMode.image).toMatchSnapshot(roundIdFirstRoundTrialMode.name);

            //Post-Act
            await this.game.clickLocator(CascadingSlotLocatorNames.btnTrialMode);
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" });
            const bet = { choice: this.game.gameConfiguration.choices[0], amount: this.options.placeBetAmount ?? 1 };
            let bettime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "numeric", minute: "numeric" });
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
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
        this.spinByKeys();
        this.autoSpinTests();
        this.betControlTests();
        this.trialModeTests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }

        
}

const openAutoSpinBoard = async (game: BaseGame) => {
    await game.clickOutSide();
    await game.clickLocator(CascadingSlotLocatorNames.btnAutoSpin);
};

const selectAutoSpin = async (game: BaseGame, totalspin: number) => {
    await game.clickLocator(CascadingSlotLocatorNames.btnAutoSpin, 1500);
    await game.clickLocator(CascadingSlotLocatorNames[`btnAutoSpin${totalspin}`]);
    await game.clickLocator(CascadingSlotLocatorNames.btnAutoSpinTurbo);
    await game.clickLocator(CascadingSlotLocatorNames.btnAutoSpinStart, 100);
};


const clickTurbo = async (game: BaseGame) => {
    await game.clickLocator(CascadingSlotLocatorNames.btnTurbo);
};

const getRoundId = async (game: BaseGame, elementname: string = CascadingSlotLocatorNames.lblRoundID) => {
    let roundId = await game.getTextLocator(elementname);

    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};

const getDataFistRowHistory = async (game: BaseGame, elementname: string = CascadingSlotLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname);

    if (tempdata != null) {
        let data = tempdata.split(" ");
        return {
            bettime: data[0].toString(),
            betdate: data[1].toString(),
            bet: data[2].toString().replace(/[^0-9.]/g, ""),
            line: data[3].toString().replace(/[^0-9.]/g, ""),
            totalbet: data[4].toString().replace(/[^0-9.]/g, ""),
            betwin: data[5].toString().replace(/[^0-9.]/g, ""),
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
    await game.clickLocator(CascadingSlotLocatorNames.locHistoryRoundId, 1000);
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
    return boardId;}


