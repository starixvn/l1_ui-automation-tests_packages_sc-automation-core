import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { CascadingSlotLocatorNames } from "../components/base-cascading-slot-locator";
import { GameGuides } from "../game-components/guides/guides.spec";

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
            await test.step("Capture game name and compare with snapshot", async () => {
                const gamename = await this.game.capture(CascadingSlotLocatorNames.imgGameName);

             //Assert
                expect(gamename.image).toMatchSnapshot(gamename.name);
            });
        });

        test("Verify symbols board in first load game and odds popup", async () => {
            //Act
            const boardID = await test.step("Get first board id", async() => {
                return await getBoardID();
            });
            await test.step("Click on symbol to show odds popup", async() => {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnSymbol,2000);

            });
            //Assert
            await test.step("Capture board and compare with snapshot", async() => {
                const imgBoardId = await this.game.capture(`img${boardID}`);
                expect(imgBoardId.image).toMatchSnapshot(imgBoardId.name);
            });

        });

        test("Verify roundID is null in first load game", async () => {
            //Act
            await test.step("Capture Round ID at the first load and compare with snapshot", async() => {
                const defaultRoundID =  await this.game.capture(CascadingSlotLocatorNames.lblRoundID);
            //Assert
                expect(defaultRoundID.image).toMatchSnapshot(defaultRoundID.name, {maxDiffPixelRatio : 0});
            });
        });

        test("Verify bottom area", async () => {
            //Act
            await test.step("Capture bottom area at the first load and compare with snapshot", async() => {
                const imgBottomArea =  await this.game.capture(CascadingSlotLocatorNames.imgBottomArea);
            //Assert
                expect(imgBottomArea.image).toMatchSnapshot(imgBottomArea.name);
            });
        });

        test("Verify tumble win list is clear", async () => {
            //Act
            await test.step("Capture tumble win list at the first load and compare with snapshot", async () => {
                const defaultTumbleWinList = await this.game.capture(CascadingSlotLocatorNames.lblTumbleWinList);
            //Assert
                expect(defaultTumbleWinList.image).toMatchSnapshot(defaultTumbleWinList.name);
            });
        });

        test("Verify menu expand with sound and music on", async () => {
            //Act
            await test.step("Click hamburger menu", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.mnuHamburger);
            });
            await test.step("Capture expand hamburger menu and compare with the snapshot", async () => {
                const mnuHamburgerExpandSoundOn = await this.game.capture(CascadingSlotLocatorNames.mnuHamburgerExpandSoundOn);
            //Assert
                expect(mnuHamburgerExpandSoundOn.image).toMatchSnapshot(mnuHamburgerExpandSoundOn.name);
            });
            //Post-Act
            await test.step("Click out side to close the menu", async () => {
                await this.game.clickOutSide(1000);
            });
        });

        test("Verify menu expand with sound and music off", async () => {
            //Act
            await test.step("Click on hamburger menu", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.mnuHamburger);
            });
            await test.step("Click on sound icon", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.icoSound);
            });
            await test.step("Click on music icon", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.icoMusic);
            });
            await test.step("Capture expand hamburger menu and compare with snapshot", async () => {
                const mnuHamburgerExpandSoundOff = await this.game.capture(CascadingSlotLocatorNames.mnuHamburgerExpandSoundOff);
                //Assert
                expect(mnuHamburgerExpandSoundOff.image).toMatchSnapshot(mnuHamburgerExpandSoundOff.name);

            });
            //Post-Act
            await test.step("Click outside to close the menu", async () => {
                await this.game.clickOutSide();
            });
        });

    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            await test.step("Capture default turbo button and compare with snapshot", async () => {
                const turboDefault = await this.game.captureLocator(CascadingSlotLocatorNames.imgTurboDefault);

            // Assert
                expect(turboDefault.image).toMatchSnapshot(turboDefault.name);
            });
        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
            await test.step("Click on turbo button to turn on turbo mode", async () => {
                await clickTurbo(this.game);
            });

            await test.step("Capture turbo button and compare with snapshot", async () => {
                const turboOn = await this.game.captureLocator(CascadingSlotLocatorNames.imgTurboOn);
                expect(turboOn.image).toMatchSnapshot(turboOn.name);
            });
        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Act
            await test.step("Click on turbo button to turn on turbo mode", async () => {
                await clickTurbo(this.game);
            });

            await test.step("Capture turbo button and compare with snapshot", async () => {
                const imgTurboOFF = await this.game.capture(CascadingSlotLocatorNames.imgTurboOFF);
                expect(imgTurboOFF.image).toMatchSnapshot(imgTurboOFF.name);
            });
        });
    }

    protected spinByKeys() {
        test("Verify user able spin by space with turbo mode OFF", async () => {
            //Arrange
            await test.step("Attach web socket and capture event", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            });
            const bet = { choice: this.game.gameConfiguration.choices[0], amount:this.options.placeBetAmount??1 };
            //Act
            await test.step("Press space", async () => {
                await this.game.keyboardPress("Space");
            });
            // Assert
            await test.step("Wait for end bet and compare bet amount", async () => {
                const placeBetResponse = await this.game.waitForEndBet()
                expect(placeBetResponse.endBet).toBe(bet.amount * parseFloat(bet.choice));
            });
            await test.step("Wait for animation", async () => {
                await waitForTumbling(this.game);
            });
            await test.step("Click outside to close big win popup", async () => {
                await this.game. clickOutSide(2500); //Click outside to close big win popup
            });
        });

        test("Verify user able spin by enter key with turbo mode OFF", async () => {
            //Arrange
            await test.step("Attach web socket and capture event", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            });
            const bet = { choice: this.game.gameConfiguration.choices[0], amount:this.options.placeBetAmount??1 };
            //Act
            await test.step("Press Enter", async () => {
                await this.game.keyboardPress("Enter");
            });
            // Assert
            await test.step("Wait for end bet and compare bet amount", async () => {
                const placeBetResponse = await this.game.waitForEndBet()
                expect(placeBetResponse.endBet).toBe(bet.amount * parseFloat(bet.choice));
            });
            await test.step("Wait for animation", async () => {
                await waitForTumbling(this.game);
            });
            await test.step("Click outside to close big win popup", async () => {
                await this.game. clickOutSide(2500); //Click outside to close big win popup
            });
        });

        test("Verify user able spin by space with turbo mode ON", async () => {
            //Arrange
            await test.step("Attach web socket and capture event", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            });
            const bet = { choice: this.game.gameConfiguration.choices[0], amount:this.options.placeBetAmount??1 };
            //Act
            await test.step("Click Turbo button", async () => {
                await clickTurbo(this.game);
            });

            await test.step("Press space", async () => {
                await this.game.keyboardPress("Space");
            });
            // Assert
            await test.step("Wait for end bet and compare bet amount", async () => {
                const placeBetResponse = await this.game.waitForEndBet()
                expect(placeBetResponse.endBet).toBe(bet.amount * parseFloat(bet.choice));
            });

            await test.step("Wait for animation", async () => {
                await waitForTumbling(this.game);
            });
            
            await test.step("Click outside to close big win popup", async () => {
                await this.game. clickOutSide(2500); //Click outside to close big win popup
            });
        });

        test("Verify user able spin by enter key with turbo mode ON", async () => {
           //Arrange
            await test.step("Attach web socket and capture event", async () => {
                this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            });
        const bet = { choice: this.game.gameConfiguration.choices[0], amount:this.options.placeBetAmount??1 };
            //Act
            await test.step("Press space", async () => {
                await this.game.keyboardPress("Space");
            });
            // Assert
            await test.step("Wait for end bet and compare bet amount", async () => {
                const placeBetResponse = await this.game.waitForEndBet()
                expect(placeBetResponse.endBet).toBe(bet.amount * parseFloat(bet.choice));
            });
            await test.step("Wait for animation", async () => {
                await waitForTumbling(this.game);
            });
            await test.step("Click outside to close big win popup", async () => {
                await this.game. clickOutSide(2500); //Click outside to close big win popup
            });
            await test.step("Click Turbo button", async () => {
                await clickTurbo(this.game) //turn off turbo
            });
        });
    }

    protected betControlTests() {
        test("Verify default value of total stake", async () => {
            //Act
            await test.step("Click on total stake", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnTotalStake);

            });
            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetControl = await this.game.capture(CascadingSlotLocatorNames.popBetControl);
                expect(popBetControl.image).toMatchSnapshot(popBetControl.name);
            });
            
        });

        test("Verify increase bet level to the max value", async () => {
            //Act
            await test.step("Click on bet level increase button multiple times", async () => {
                for (let i = 0; i < 5; i++) {
                    await this.game.clickLocator(CascadingSlotLocatorNames.btnBetLevelIncrease)
                }

            });
            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetControlMaxBetLevel = await this.game.capture(CascadingSlotLocatorNames.popBetControlMaxBetLevel);
                expect(popBetControlMaxBetLevel.image).toMatchSnapshot(popBetControlMaxBetLevel.name);
            });
        });

        test("Verify increase coin value to the max value", async () => {
            //Act
            await test.step("Click on coin value increase button multiple times", async () => {
                for (let i = 0; i < 3; i++) {
                    await this.game.clickLocator(CascadingSlotLocatorNames.btnCoinValueIncrease)
                }
            });
            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetControlMaxCoinValue = await this.game.capture(CascadingSlotLocatorNames.popBetControlMaxCoinValue);
                expect(popBetControlMaxCoinValue.image).toMatchSnapshot(popBetControlMaxCoinValue.name);
            });
        });


        test("Verify decrease bet level to the min value", async () => {
            //Act
            await test.step("Click on bet level decrease button multiple times", async () => {
                for (let i = 0; i < 9; i++) {
                    await this.game.clickLocator(CascadingSlotLocatorNames.btnBetLevelDecrease)
                }
            });
            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetControlMinBetLevel = await this.game.capture(CascadingSlotLocatorNames.popBetControlMinBetLevel);
                expect(popBetControlMinBetLevel.image).toMatchSnapshot(popBetControlMinBetLevel.name);
            });
        });

        test("Verify decrease coin value to the min value", async () => {
            //Act
            await test.step("Click on coin value decrease button multiple times", async () => {
                for (let i = 0; i < 3; i++) {
                    await this.game.clickLocator(CascadingSlotLocatorNames.btnCoinValueDecrease)
                }
            });

            //Assert
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetControlMinCoinValue = await this.game.capture(CascadingSlotLocatorNames.popBetControlMinCoinValue);
                expect(popBetControlMinCoinValue.image).toMatchSnapshot(popBetControlMinCoinValue.name);
            });

            //Post-Act
            await test.step("Click outside to close the popup", async () => {
                await this.game.clickOutSide(2000);
            });
        });

    }


    protected autoSpinTests() {
        test("Verify default UI of AutoSpin popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Arrange
            await test.step("Open auto spin popup", async () => {
                await openAutoSpinBoard(this.game);
            });

            // Assert
            await test.step("Capture auto spin popup and compare with snapshot", async () => {
                const popAutoSpin = await this.game.capture(CascadingSlotLocatorNames.popAutoSpin);
                expect(popAutoSpin.image).toMatchSnapshot(popAutoSpin.name);
            });

            await test.step("Click outside to close the popup", async () => {
                await this.game.clickOutSide(1000);
            });
        });

        test("Verify UI of AutoSpin popup when turn on turbo mode", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Arrange
            await test.step("Click on turbo button", async () => {
                await clickTurbo(this.game)
            });

            await test.step("Open auto spin popup ", async () => {
                await openAutoSpinBoard(this.game);
            });

            // Assert
            await test.step("Capture auto spin popup and compare with snapshot", async () => {
                const popAutoSpinTurbo = await this.game.capture(CascadingSlotLocatorNames.popAutoSpinTurbo);
                expect(popAutoSpinTurbo.image).toMatchSnapshot(popAutoSpinTurbo.name);
            });

            // Post-Act
            await test.step("Click outside to close the popup", async () => {
                await this.game.clickOutSide();
            });
        });

        test("Verify case user select 10 auto spins then wait for finishing 10 auto spins", async () => {
            // Arrange
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;

            // Act
            await test.step("Start 10 auto spins", async () => {
                await selectAutoSpin(this.game, totalAutoSpin);
            });

            //Assert
            await test.step("Wait for finish 10 spins", async () => {
                for (let index = 1; index <= totalAutoSpin; index++) {
                    const settledResults = await waitForSettlementCascadingSlot(this.game);
                    settledResultsAutoSpin.push(settledResults.winAmount);
                    if(index == totalAutoSpin){
                        this.game.waitForTimeout((settledResults.tumble + 1)*4000); //wait for tumbling of the last spin
                    }
                }
            });
            await test.step("Verify total of spins", async () => {
                expect(settledResultsAutoSpin.length >= 10).toBe(true);            
            });
            //Post-Act
            await test.step("Click outside to close big win popup", async () => {
                await this.game.clickOutSide(2000);//close big win popup
            });
            await test.step("Click out side to close auto spin popup", async () => {
                await this.game.clickOutSide(1000); //click outside to close auto spin popup
            });
        });

        test("Verify user can stop auto spin process by clicking on autospin button", async () => {
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;
            await test.step("Start 10 auto spin", async () => {
                await selectAutoSpin(this.game, totalAutoSpin);
            });
            //Act
            let tumbleOfTheLastSpin = 1;
            await test.step("Wait for 5 spin and stop", async () => {
                for (let index = 1; index <= totalAutoSpin - 5; index++) {
                    const settledResults = await waitForSettlementCascadingSlot(this.game);
                    settledResultsAutoSpin.push(settledResults.winAmount);
                    if(index == totalAutoSpin - 5){
                        tumbleOfTheLastSpin = settledResults.tumble;
                    }
                }
                await this.game.clickLocator(CascadingSlotLocatorNames.btnAutoSpin); //stop autospin
            });

            //Assert
            await test.step("Verify total of auto spin < 10", async () => {
                expect(settledResultsAutoSpin.length < 10).toBe(true);
            });

            await test.step("Wait for animation", async () => {
                await this.game.waitForTimeout((tumbleOfTheLastSpin + 1)*4000 ); //handle cases free spin or bonus
            });
            
            await test.step("Click outside to close big win popup", async () => {
                await this.game.clickOutSide(2500);
            });
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Act 1
            await test.step("Open history", async () => {
                await this.game.clickHistory(1000);
            });

            await test.step("Capture first row of history", async () => {
                await this.game.captureLocator(CascadingSlotLocatorNames.lblHistoryFirstRow);
            });

            // Assert 1
            await test.step("Verify content", async () => {
                await verifyticketdata(this.game, global.settledata);
            });

            // Act 2
            let roundID;
            await test.step("Open bet details and get round Id", async () => {
                await openRoundDetail(this.game);
                roundID = await getRoundId(this.game, CascadingSlotLocatorNames.lblHistoryDetailRoundId);
            });

            // Assert 2
            await test.step("Verify round Id", async () => {
                expect(roundID).toEqual(global.settledata.roundID);
            });

            //Post-Act
            await test.step("Click outside to close bet detail and history", async () => {
                await this.game.clickOutSide(1500);
                await this.game.clickOutSide(1500);
            });
        });
    }

    protected trialModeTests() {
        test("Verify default bottom area of trial mode", async () => {
            //Act
            await test.step("Click trial mode button", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnTrialMode)
            });

            //Assert
            await test.step("Capture bottom area and compare with snapshot", async () => {
                const imgBottomAreaTrialMode = await this.game.capture(CascadingSlotLocatorNames.imgBottomAreaTrialMode);
                expect(imgBottomAreaTrialMode.image).toMatchSnapshot(imgBottomAreaTrialMode.name, {maxDiffPixelRatio : 0});
            });
        });

        test("Verify turbo button of trial mode is disabled", async () => {

            await test.step("Capture turbo mode button and compare with snapshot", async () => {
                //Act
                const imgTurboTrial = await this.game.capture(CascadingSlotLocatorNames.imgTurboTrial);

                //Assert
                expect(imgTurboTrial.image).toMatchSnapshot(imgTurboTrial.name, {maxDiffPixelRatio : 0});
            });
        });

        test("Verify expand hamburger menu of trial mode", async () => {
            //Act
            await test.step("Click on hamburger menu", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.mnuHamburger);
            });

            //Assert
            await test.step("Capture hamburger menu and compare with snapshot", async () => {
                const mnuHamburgerExpandTrialMode = await this.game.capture(CascadingSlotLocatorNames.mnuHamburgerExpandTrialMode);
                expect(mnuHamburgerExpandTrialMode.image).toMatchSnapshot(mnuHamburgerExpandTrialMode.name, {maxDiffPixelRatio:0});
            });
            
            //Post-Act
            await test.step("Click outside to close the menu", async () => {
                await this.game.clickOutSide(500) // close popup
            });
        });

        test("Verify user can open game guide in trial mode", async () => {
            //Act
            await test.step("Click on hamburger menu", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.mnuHamburger);
            });
            
            await test.step("Click on game guide icon", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.icoGuide);
            });

            //Assert
            await test.step("Capture text game guide and compare with snapshot", async () => {
                const popGameGuide = await this.game.capture(CascadingSlotLocatorNames.popGameGuide);
                expect(popGameGuide.image).toMatchSnapshot(popGameGuide.name, {maxDiffPixelRatio : 0});
                
            });
            //Post-Act
            await test.step("Click outside to close game guide", async () => {
                await this.game.clickOutSide(1000); // close popup
            });
        });

        test("Verify bet control popup in trial mode", async () => {
            //Act
            await test.step("Click on total stake", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnTotalStake)
            });

            //Assert 
            await test.step("Capture bet control popup and compare with snapshot", async () => {
                const popBetControlTrialMode = await this.game.capture(CascadingSlotLocatorNames.popBetControlTrialMode);
                expect(popBetControlTrialMode.image).toMatchSnapshot(popBetControlTrialMode.name, {maxDiffPixelRatio : 0});
            });
            
            //Post-Act
            await test.step("Click outside to close the popup", async () => {
                await this.game.clickOutSide(500); // close popup
            });
        });

        test("Verify message You are in trial mode", async () => {
            await test.step("Capture message and compare with snapshot", async () => {
                //Act
                const lblTumbleWinListTrialMode = await this.game.capture(CascadingSlotLocatorNames.lblTumbleWinListTrialMode);

                //Assert
                expect(lblTumbleWinListTrialMode.image).toMatchSnapshot(lblTumbleWinListTrialMode.name, {maxDiffPixelRatio:0});
            });
        });

        test("Verify default user balance trial mode", async () => {
            await test.step("Capture user balance and compare with snapshot", async () => {
                //Act
                const imgUserBalanceTrialMode = await this.game.capture(CascadingSlotLocatorNames.imgUserBalanceTrialMode);

                //Assert
                expect(imgUserBalanceTrialMode.image).toMatchSnapshot(imgUserBalanceTrialMode.name, {maxDiffPixelRatio : 0});
            });
        });

        test("Verify round id of the first round of trial mode", async () => {
            //Act
            await test.step("", async () => {
                await this.game.clickLocator(CascadingSlotLocatorNames.btnSpin)
            });
            
            //Assert
            await test.step("Capture round id and compare with snapshot", async () => {
                const lblRoundIdFirstRoundTrialMode = await this.game.capture(CascadingSlotLocatorNames.lblRoundIdFirstRoundTrialMode);
                expect(lblRoundIdFirstRoundTrialMode.image).toMatchSnapshot(lblRoundIdFirstRoundTrialMode.name, {maxDiffPixelRatio : 0});

            });
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
            let placeBetResponse, settledResults;
            await test.step("Place bet", async () => {
                placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            });
            await test.step("Get bet result", async () => {
                settledResults = await waitForSettlementCascadingSlot(this.game);
            });

            // Assert
            await test.step("Verify bet amount", async () => {
                expect(placeBetResponse.endBet).toBe(bet.amount);
            });

            await test.step("Wait for animation", async () => {
                await this.game.waitForTimeout((settledResults.tumble + 1) * 4000); //wait for tumbling
            });

            await test.step("Click outside to close big win popup", async () => {
                await this.game.clickOutSide(2000); //close big win popup
            });

            // Post-Act
            const settledata = {
                roundID: settledResults.roundId.toString(),
                betwin: settledResults.winAmount.toString(),
                bet: bet.amount.toString(),
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
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
        this.betControlTests();
        this.trialModeTests();
    }
}

const openAutoSpinBoard = async (game: BaseGame) => {
    await game.clickOutSide();
    await game.clickLocator(CascadingSlotLocatorNames.btnAutoSpin);
};

const selectAutoSpin = async (game: BaseGame, totalspin: number) => {
    await game.clickLocator(CascadingSlotLocatorNames.btnAutoSpin, 1500);
    await game.clickLocator(CascadingSlotLocatorNames[`btnAutoSpin${totalspin}`]);
    await game.clickLocator(CascadingSlotLocatorNames.btnAutoSpinStart, 100);
};


const clickTurbo = async (game: BaseGame) => {
    await game.clickLocator(CascadingSlotLocatorNames.btnTurbo);
    await game.waitForTimeout(2000); //wait for message closed
};

const getRoundId = async (game: BaseGame, elementname: string = CascadingSlotLocatorNames.lblHistoryDetailRoundId) => {
    let roundId = await game.getTextLocator(elementname);

    return roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};

const getDataFistRowHistory = async (game: BaseGame, elementname: string = CascadingSlotLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname);

    if (tempdata != null) {
        let data = tempdata.split(" ");
        //handle case bat date are separated
        if(data.length > 6){
            data[1] = data [1] + data [2] + data [3]
            data[2] = data[4];
            data[3] = data[5];
            data[4] = data[6];
            data[5] = data[7];
        };
        return {
            bettime: data[0].toString(),
            betdate: data[1].toString(),
            betlevel: data[2].toString().replace(/[^0-9.]/g, ""),
            coinvalue: data[3].toString().replace(/[^0-9.]/g, ""),
            totalbet: data[4].toString().replace(/[^0-9.]/g, ""),
            betwin: data[5].toString().replace(/[^0-9.]/g, "") !== "" ? parseFloat(data[5].toString().replace(/[^0-9.]/g, "")).toString() : "0", //handle case get wrong text 0 -> D
        };
    } else {
        return {
            bettime: "N/A",
            betdate: "N/A",
            betlevel: "N/A",
            coinvalue: "N/A",
            totalbet: "N/A",
            betwin: "N/A",
        };
    }
};

const waitForTumbling = async (game: BaseGame) =>{
    const message = await game.waitForEvent(GameEvent.Settlement);
    const tumble = message.finish.tumbles.length;
    await game.waitForTimeout((tumble + 1)*4000);
}

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
    const ticketdata = await getDataFistRowHistory(game);
    expect(ticketdata.betdate, "verify bet date").toEqual(expectdata.betdate);
    expect(ticketdata.betwin, "verify bet win").toEqual(expectdata.betwin);
};

const waitForSettlementCascadingSlot = async (game: BaseGame): Promise<any> => {
    const message = await game.waitForEvent(GameEvent.Settlement);
    await game.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement
    const winningByChoice = game.latestCaptureEvent(GameEvent.WinStatus);

    let settledResults = {
        settlementResult: message?.finish?.settlementResult,
        odds: game.odds,
        winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
        tumble: message.finish.tumbles.length,
        roundId: message?.finish?.roundId,
    };
    settledResults["winAmount"] = message?.finish?.win ?? 0;;
    
    return settledResults;
}

const getBoardID = async () => {
    let boardId = "";
    for (let index = 0; index <= 10; index++) {
        if (global.logMsg[0] === "B" + index) {
            boardId = "B" + index;
            break;
        }
    }
    return boardId;}


