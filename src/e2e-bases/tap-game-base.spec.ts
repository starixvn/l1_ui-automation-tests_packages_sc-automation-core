import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { IBaseOptions } from "./base-options";
import { expect } from "../expects";
import { GameGuides } from "../game-components/guides/guides.spec";
import verifyImage from "../expects/verify-image";

const timeout = 4000;

export class TapGameBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}

    protected inGameTests() {
        test("Verify received websocket Odds of game should be the same with game's config @Odds", async () => {
            // Assert
            await test.step(`Verify ODDs should be correct`, async () => {
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected mainUITests() {
        test("Verify game name @UI01", async () => {
            //Act
            await verifyImage(this.game, "imgGameName")

        });

        test("Verify roundID is null in first load game @UI03", async () => {
            //Act
            await verifyImage(this.game, "defaultRoundID")
        });

    }

    protected autoSpinTests() {
        test("Verify default UI of AutoSpin popup @AutoSpin01", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Arrange
            await test.step(`Open autospin popup`, async () => {
                await openAutoSpinBoard(this.game);
            });

            // Act
            await verifyImage(this.game, "popAutoSpin")

            await test.step(`Close popup`, async () => {
            await this.game.clickOutSide(1000);
            });
        });

        test("Verify case user select 10 auto spins then wait for finishing 10 auto spins" , async () => {
            // Arrange
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;

            const amount = this.options.placeBetAmount

            await test.step(`Select bet stake`, async () => {
                await this.game.clickLocator("cboBetLevel");
                await this.game.clickLocator(`stake${amount}`);
            });

            // Act
            await test.step(`Wait for 10 spins finished`, async () => {
                await selectAutoSpin(this.game, totalAutoSpin);
                for (let index = 1; index <= totalAutoSpin; index++) {
                    const settledResults = await this.game.waitForSettlement();

                    settledResultsAutoSpin.push(settledResults.winAmount);
                }
            });

            //Assert
            await test.step(`Verify number of spins`, async () => {
                expect(settledResultsAutoSpin.length >= 10).toBe(true);
            });

            //Post-Act
            await test.step(`Click out side to close big win`, async () => {
                await this.game.clickOutSide(2000); //click outside to close big win 
            });
        });

        test("Verify case user select 10 auto spins-Turbo mode then wait for finishing 10 " , async () => {
            // Arrange
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;

            const amount = this.options.placeBetAmount

            await test.step(`Select bet stake`, async () => {
                await this.game.clickLocator("cboBetLevel");
                await this.game.clickLocator(`stake${amount}`);
            });

            // Act
            await test.step(`Wait for 10 spins finished`, async () => {
                await selectAutoSpin(this.game, totalAutoSpin, true);
                for (let index = 1; index <= totalAutoSpin; index++) {
                    const settledResults = await this.game.waitForSettlement();

                    settledResultsAutoSpin.push(settledResults.winAmount);
                }
            });

            //Assert
            await test.step(`Verify number of spins`, async () => {
                expect(settledResultsAutoSpin.length >= 10).toBe(true);
            });

            //Post-Act
            await test.step(`Click out side to close big win`, async () => {
                await this.game.clickOutSide(2000); //click outside to close big win 
            });
        });

        test("Verify user can stop auto spin process by clicking on autospin button @AutoSpin03", async () => {
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;
            await test.step(`Start 10 auto spin`, async () => {
                await selectAutoSpin(this.game, totalAutoSpin);
            });

            await test.step(`Wait for 5 spins and stop`, async () => {
                for (let index = 1; index <= totalAutoSpin - 5; index++) {
                    const settledResults = await this.game.waitForSettlement();
                    settledResultsAutoSpin.push(settledResults.winAmount);
                }

                await this.game.clickLocator("btnAutoSpin"); //stop autospin
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

        test("Verify user can stop auto spin process by press Spacebar", async () => {
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;
            await test.step(`Start 10 auto spin`, async () => {
                await selectAutoSpin(this.game, totalAutoSpin);
            });

            await test.step(`Wait for 5 spins and stop`, async () => {
                for (let index = 1; index <= totalAutoSpin - 5; index++) {
                    const settledResults = await this.game.waitForSettlement();
                    settledResultsAutoSpin.push(settledResults.winAmount);
                }

                await this.game.keyboardPress("Space"); //stop autospin
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

     protected placeBetAndSettleTests() {
        test("Verify that player be able to place a bet and settle @Settlement", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
            const amount = this.options.placeBetAmount ?? 1
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            let placeBetResponse, settledResults;
            await test.step(`Place bet`, async () => {
                placeBetResponse = await this.player.placeBet("", amount);
            });

            await test.step(`Wait for settlement`, async () => {
                settledResults = await this.game.waitForSettlement();
            });

            // Assert
            await test.step(`Verify settlement result`, async () => {
                expect(placeBetResponse.endBet).toBe(amount);
            });

            await test.step(`Verify bet ticket in history popup`, async () => {
                await this.game.clickHistory()
                const firstrow = await this.game.getTextLocator("firstrow")
                expect(firstrow).toContain(amount.toString())
                expect(firstrow).toContain(settledResults.roundId.toString())
                expect(firstrow).toContain(today)
                await this.game.clickOutSide(2000); 
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
            locators: [this.options.locators],
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
        this.autoSpinTests();
        this.placeBetAndSettleTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);
    }
}

const openAutoSpinBoard = async (game: BaseGame) => {
    await game.clickOutSide();
    await game.clickLocator("btnAutoSpin");
};

const selectAutoSpin = async (game: BaseGame, totalspin: number, turboMode: boolean=false) => {
    await game.clickLocator("btnAutoSpin", 1500);
    await game.clickLocator(`btnAutoSpin${totalspin}`);
    if (turboMode) {
        await game.clickLocator("btnAutoSpinTurbo", 1500);
    }
    await game.clickLocator("btnAutoSpinStart",0);
};

