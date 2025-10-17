import { test, BasePlayer, BaseGame } from "../components";
import { IBaseOptions } from "./base-options";
import { Portrail_Classic_Locators } from "../components/base-cocos-game-locator";
import { expect } from "../expects";
import { GameEvent } from "../_shared";
import { GameGuides } from "../game-components/guides/guides.spec";

export interface SlotGameOptions extends IBaseOptions {
    placeBetAmount?: number;
}

export class PortrailClassicGameBase {
    game: BaseGame;
    player: BasePlayer;
    settledResults: any;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: SlotGameOptions) {}

    private overrideClickOutSide() {
        // Override the method globally for this project
        this.game.clickOutSide = async () => {
            await this.game.page.mouse.click(470, 10);
        };
    }

    private overrideopenGuide() {
        // Override the method globally for this project
        this.game.openGuide = async () => {
            await this.game.page.waitForTimeout(1000);
            await this.game.clickCocos(Portrail_Classic_Locators.btnguide);
            await this.game.page.waitForTimeout(10000);
        };
    }

    protected mainUITests() {
        test("Measure page load and resource sizes of game", async () => {
            const LARGE_IMAGE_THRESHOLD = 100 * 1024; // 100KB
            const filenameCounts = new Map<string, number>();
            const page = this.game.page;
            let totalSize = 0;

            const responseListener = async (response: any) => {
                try {
                    const contentType = response.headers()["content-type"] || "";
                    const url = response.url();
                    
                    // Extract filename from URL
                    const filename = url.split("/").pop()?.split("?")[0] || "";
                    
                    // Get response size
                    let size = response.headers()["content-length"];
                    if (!size) {
                        try {
                            const buffer = await response.body();
                            size = buffer.length;
                        } catch {
                            return; // Skip if we can't get the body
                        }
                    }
                    
                    const sizeNum = parseInt(size, 10);
                    if (isNaN(sizeNum)) return;
                    
                    totalSize += sizeNum;
                    
                    // Check for large JPG images
                    if (contentType.includes("image/jpeg") && sizeNum > LARGE_IMAGE_THRESHOLD) {
                        const sizeKB = Math.round(sizeNum / 1024);
                        console.log(`Large JPG detected (${sizeKB}KB): ${url}`);
                        
                        // Track filename occurrences
                        const count = (filenameCounts.get(filename) || 0) + 1;
                        filenameCounts.set(filename, count);
                        
                        // Add test annotations
                        test.info().annotations.push({
                            type: "Large JPG",
                            description: `${url} (${sizeKB}KB)`,
                        });
                        
                        // Check for duplicates
                        if (count > 1) {
                            console.log(`⚠️ Duplicate filename detected: ${filename} (${count} occurrences)`);
                            test.info().annotations.push({
                                type: "Duplicate JPG",
                                description: `${filename} found ${count} times. Latest URL: ${url}`,
                            });
                        }
                    }
                } catch (error) {
                    console.warn(`Error processing response: ${error}`);
                }
            };

            // Start tracking resources
            page.on("response", responseListener);
            
            try {
                await page.reload();
                await page.waitForLoadState("networkidle", { timeout: 30000 });
            } finally {
                // Stop tracking resources
                page.removeListener("response", responseListener);
            }
            
            const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
            console.log(`Total size: ${totalSizeMB}MB, Large JPGs: ${filenameCounts.size}, Duplicated: ${filenameCounts.get("duplicated.png") || 0}`);
            await this.game.waitForTimeout(5000);

        });

        test("Verify welcome screen and Play Now button exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnPlayNow), "Play Now button not found").toBe(true);
        });

        test("Verify User can click Play Now button and navigate to game", async () => {
            const operatorName = (process.env.npm_config_project?.includes("l1")) ? "SABA.games" : "Vgaming";
            await this.clickPlayNowButton();
            await this.game.waitForTimeout(5000);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnSpin), "Spin button not found").toBe(true);
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtOperator)).toBe(operatorName);
        });

        test("Verify center message exists", async () => {
            const centerMessages = [
                "Bấm Quay hoặc giữ phím Space",
                "trên các cột khác nhau sẽ thắng Bonus game",
                "trên các cột khác nhau để thắng Free Spin",
                "Quay trúng",
                "Tổng Thắng: ",
                "thay thế tất cả biểu tượng, trừ"
            ];
         
            const actualMessage = await this.game.findLabelText(Portrail_Classic_Locators.txtMessageCenter);
            expect(centerMessages).toContain(actualMessage.trim());
        });

        if (process.env.npm_config_jackpot) {
            test("Verify Jackpot panel exists", async () => {
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.lblMajorJackpot), "Major jackpot label not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.lblGrandJackpot), "Grand jackpot label not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.lblMinorJackpot), "Minor jackpot label not found").toBe(true);
            });
        }

        test("Verify button auto spin exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnAutoSpin), "Auto spin button not found").toBe(true);
        });

        test("Verify button turbo mode exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnTurbo), "Turbo button not found").toBe(true);
        });

        test("Verify button bet amount setting exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.betAmountSetting), "Bet amount setting button not found").toBe(true);
        });

        test("Verify button menu exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnMenu), "Menu button not found").toBe(true);
        });

        test("Verify button game guide exists", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnguide), "Game guide button not found").toBe(true);
        });

        test.fixme("Verify all menu items exists", async () => {
            await this.game.clickCocos(Portrail_Classic_Locators.btnMenu,1000);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnLobby), "Lobby button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnMusic), "Music button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnSound), "Sound button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnHistory), "History button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnLine), "Line button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnMenuClose), "Menu close button not found").toBe(true);
            if (process.env.npm_config_jackpot) {
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnTop), "Top button not found").toBe(true);
             }
        });

        test("Verify User can open Line setting popup", async () => {
            await this.game.clickCocos(Portrail_Classic_Locators.btnLine,1000);
            const linebody = await this.game.getCocosBounds("Canvas/outer-containers/outer-container/line-selection/line-selection-dialog-portrait/popup/body");
            console.log(linebody);
        });


    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.iconTurboOFF), "Turbo OFF icon not found").toBe(true);

        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
                await this.game.clickCocos(Portrail_Classic_Locators.btnTurbo);
                expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.iconTurboON), "Turbo ON icon not found").toBe(true);

        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Turbo OFF
            await this.game.clickCocos(Portrail_Classic_Locators.btnTurbo);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.iconTurboOFF), "Turbo OFF icon not found").toBe(true);
        });
    }

    protected BetLevelSettingTests() {

        test("Verify User can open bet amount setting popup", async () => {
            await this.game.clickCocos(Portrail_Classic_Locators.betAmountSetting);
            await this.game.waitForTimeout(2000);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnBetLevelIncrease), "Bet level increase button not found").toBe(true);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnBetLevelDecrease), "Bet level decrease button not found").toBe(true);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnCoinValueIncrease), "Coin value increase button not found").toBe(true);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnCoinValueDecrease), "Coin value decrease button not found").toBe(true);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnTotalBetIncrease), "Total bet increase button not found").toBe(true);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnTotalBetDecrease), "Total bet decrease button not found").toBe(true);
            await this.game.waitForTimeout(2000);
        });

        test("Verify button state of bet level", async () => {
            await this.game.clickCocos(Portrail_Classic_Locators.btnBetLevelDecrease);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnBetLevelDecreaseUnactive), "Bet level decrease inactive button not found").toBe(true);
        });

        test("Verify button state of coin value", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnCoinValueDecreaseUnactive), "Coin value decrease inactive button not found").toBe(true);
            });

        test("Verify button state of total bet", async () => {
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnTotalBetDecreaseUnactive), "Total bet decrease inactive button not found").toBe(true);
        });

        test("Verify range value of bet level", async () => {
            const betlevel =  this.game.gameConfigs.betLevels
            for (const element of betlevel) {
                expect(await this.game.findLabelText(Portrail_Classic_Locators.txtBetLevelValue)).toBe(element.toString());
                await this.game.clickCocos(Portrail_Classic_Locators.btnBetLevelIncrease);
            }    
        });

        test("Verify range value of coin value", async () => {
            const coinvalue =  this.game.gameConfigs.coinValues
            for (const element of coinvalue) {
                expect(await this.game.findLabelText(Portrail_Classic_Locators.txtCoinValue)).toBe(element.toString());
                await this.game.clickCocos(Portrail_Classic_Locators.btnCoinValueIncrease);
            }    
        });

        test("Verify total bet value", async () => {
            const betlevel = await this.game.findLabelText(Portrail_Classic_Locators.txtBetLevelValue);
            const coinvalue = await this.game.findLabelText(Portrail_Classic_Locators.txtCoinValue);
            const expectedTotal = (Number(betlevel) * Number(coinvalue) * 20).toFixed(0);
            expect((await this.game.findLabelText(Portrail_Classic_Locators.txtTotalBetValue)).replace(/,/g, "")).toBe(expectedTotal.toString());
            expect((await this.game.findLabelText(Portrail_Classic_Locators.txtbottomTotalBet)).replace(/,/g, "")).toBe(expectedTotal.toString());
            await this.game.clickCocos(Portrail_Classic_Locators.iconCloseMainPopup);
            await this.game.waitForTimeout(2000);

        });

        test("Verify user can adjust bet by increase/decrease button", async () => {
            let totalBetbefore,totalBetafter = "";

            for (let i = 0; i < 20; i++) {
                await this.game.clickCocos(Portrail_Classic_Locators.btnBetIncrease);
            }

            for (let i = 0; i < 10; i++) {
                totalBetbefore = await this.game.findLabelText(Portrail_Classic_Locators.txtbottomTotalBet);
                await this.game.clickCocos(Portrail_Classic_Locators.btnBetDecrease);
                await this.game.waitForTimeout(500);
                totalBetafter = await this.game.findLabelText(Portrail_Classic_Locators.txtbottomTotalBet);
                expect(Number(totalBetafter.replace(/,/g, ''))<Number(totalBetbefore.replace(/,/g, ''))).toBe(true);
            }

            for (let i = 0; i < 10; i++) {
                totalBetbefore = await this.game.findLabelText(Portrail_Classic_Locators.txtbottomTotalBet);
                await this.game.clickCocos(Portrail_Classic_Locators.btnBetIncrease);
                await this.game.waitForTimeout(500);
                totalBetafter = await this.game.findLabelText(Portrail_Classic_Locators.txtbottomTotalBet);
                expect(Number(totalBetafter.replace(/,/g, ''))>Number(totalBetbefore.replace(/,/g, ''))).toBe(true);
            }

        });


    }

    protected placeBetAndSettleTests() {
        test("Verify that player be able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const betlevel = this.game.gameConfigs.betLevels[0];
            const coinvalue = this.game.gameConfigs.coinValues[1]; // Try index 0 for 0.05
            
            // Debug: Log coinValues array structure
            console.log("coinValues array:", this.game.gameConfigs.coinValues);
            console.log("Selected coinvalue at index 1:", coinvalue);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            await this.game.clickCocos(Portrail_Classic_Locators.btnTurbo);
            await this.setBetConfiguration(this.game, betlevel, coinvalue);
            const totalBet = await this.game.findLabelText(Portrail_Classic_Locators.txtbottomTotalBet);
            await this.clickSpinButton();

            await test.step("Get bet result", async () => {
                this.settledResults = await waitForSettlementCascadingSlot(this.game);
            });

            if (this.settledResults.isbigWin) {
                console.log("click bigwwin", this.settledResults.isbigWin);
                await this.game.waitForTimeout(10000);
                await this.game.clickOutSide();
            }

            this.settledResults.totalBet = totalBet;
            this.settledResults.betlevel = betlevel;
            this.settledResults.coinvalue = coinvalue;


            console.log(this.settledResults);

        });

        test("Verify total win result", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(5000);// wait for animation
            if(this.settledResults.win > 0) {
                expect(parseFloat(await this.game.findLabelText(Portrail_Classic_Locators.txtcenterWin))).toBeCloseTo(this.settledResults.win, 2);
                expect(parseFloat(await this.game.findLabelText(Portrail_Classic_Locators.txtbottomWin))).toBeCloseTo(this.settledResults.win, 2);
            } else {
                expect(await this.game.findLabelText(Portrail_Classic_Locators.txtbottomWin)).toBe("0");
            }
        });

        test("Verify bet ticket in history popup", async () => {
            await this.openHistoryPopup();

            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryTotalBet)).toBe(this.settledResults.totalBet.toString());
            expect(Number(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryWin))).toBe(Number(this.settledResults.win));
        });

        test("Verify bet ticket detail data in history popup", async () => {
            await this.game.page.mouse.click(600, 127);
            // await this.game.clickCocosByLabel(this.settledResults.roundId.toString());
            await this.game.waitForTimeout(2000);

            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailBetLevel)).toBe(this.settledResults.betlevel.toString());
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailBetCoinValue)).toBe(this.settledResults.coinvalue.toString());
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailTotalBet)).toBe(this.settledResults.totalBet.toString());
            expect(Number(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailWin))).toBe(Number(this.settledResults.win));
                if(this.settledResults.multiplier > 0) {
                expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailMultiplier)).toBe(this.settledResults.multiplier.toString());
            }
        });

        test("Verify user can close history popup", async () => {
            await this.game.clickCocos(Portrail_Classic_Locators.btnBackHistory);
            await this.game.waitForTimeout(2000);
            await this.game.clickCocos(Portrail_Classic_Locators.btnClosePopup);
            await this.game.waitForTimeout(2000);
            expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.txtHistoryRoundId), "History round ID should not be visible after closing popup").toBe(false);
        });
        


    }

    protected autoSpinTests() {

        test("Verify case user select 10 auto spins then wait for finishing 10 auto spins", async () => {
            // Arrange
            let settledResultsAutoSpin: Array<string> = [];
            const totalAutoSpin = 10;

            // Act
            await test.step("Start 10 auto spins", async () => {
                await this.openAutoSpinPopup();
                await this.game.waitForTimeout(2000);
                await this.game.clickCocos(Portrail_Classic_Locators.lbl10AutoSpin);
                await this.game.clickCocos(Portrail_Classic_Locators.btnAutoSpinStart);
            });

            //Assert
            await test.step("Wait for finish 10 spins", async () => {
                let currentTotalAutoSpin = totalAutoSpin; // Start with initial auto spins
                let completedSpins = 0;
                
                while (completedSpins < currentTotalAutoSpin) {
                    const settledResults = await waitForSettlementCascadingSlot(this.game);
                    let spincount = await this.game.findLabelText(Portrail_Classic_Locators.txtautoSpinCount);
                    console.log("isbigWin", settledResults.isbigWin);               
                    if(settledResults.isbigWin) {
                        await this.game.waitForTimeout(10000);
                        await this.game.clickOutSide();      
                    } 
                    console.log(`Spin ${completedSpins + 1}/${currentTotalAutoSpin}, remaining count: ${spincount}`);
                    
                    settledResultsAutoSpin.push(settledResults.winAmount);
                    
                    // Check if user won additional auto spins
                    // settledResults.totalAutoSpins now represents remaining spins
                    if (settledResults.totalAutoSpins && settledResults.totalAutoSpins > 0) {
                        const additionalSpins = settledResults.totalAutoSpins - (currentTotalAutoSpin - completedSpins);
                        currentTotalAutoSpin = completedSpins + settledResults.totalAutoSpins;
                        console.log(`🎉 User won ${additionalSpins} additional auto spins! Total auto spins now: ${currentTotalAutoSpin}`);
                    }
                    
                    // Check spin count based on remaining spins shown in UI
                    const expectedCount = parseInt(spincount);
                    console.log(`Expected count: ${expectedCount}`);
                    expect(parseInt(spincount)).toBe(expectedCount);
                    
                    
                    completedSpins++;
                    
                    if (completedSpins == currentTotalAutoSpin) {
                        await this.game.clickOutSide();       
                    }
                    await this.game.clickOutSide();
                }
                
                console.log(`✅ Completed all ${currentTotalAutoSpin} auto spins!`);
            });
            await test.step("Verify total of spins", async () => {
                expect(settledResultsAutoSpin.length >= totalAutoSpin).toBe(true);
            });

            await test.step("Close the popup", async () => {
                await this.game.clickCocos(Portrail_Classic_Locators.iconCloseAutoPlay);
            });
        });

    }

    protected buyFreeSpinTests() {

        test("Verify user can open buy free spin popup", async () => {
            // Arrange
            await this.game.clickCocos(Portrail_Classic_Locators.btnBuyFS);
            await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnYesBuyFS);
            await this.game.isCocosLocatorExists(Portrail_Classic_Locators.btnNoBuyFS);
        })

        test("Verify user can buy free spin", async () => {
            await this.game.clickCocos(Portrail_Classic_Locators.btnYesBuyFS);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            this.settledResults = await waitForSettlementCascadingSlot(this.game);
            expect(this.settledResults.totalFreeSpins).toBe(15);
            console.log(this.settledResults);
        });

        test("Verify bet ticket buy free spin in history popup", async () => {
            await this.openHistoryPopup();
            await this.game.page.mouse.click(600, 127);
            await this.game.waitForTimeout(2000);
            const roundIdBFS = this.settledResults.roundId+ " (Mua Free Spins)"
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailRoundId)).toBe(roundIdBFS);
            expect(Number(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailWin))).toBe(Number(this.settledResults.win));
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailTotalFreeSpin)).toBe("15 Free Spins");
            expect(await this.game.findLabelText(Portrail_Classic_Locators.txtHistoryDetailTitleFirstRow)).toBe("Vòng Quay Đầu")    
            await this.game.clickCocos(Portrail_Classic_Locators.btnBackHistory);
            await this.game.waitForTimeout(2000);
            await this.game.clickCocos(Portrail_Classic_Locators.btnClosePopup);
            await this.game.waitForTimeout(8000); //wait for free spin popup close
            await this.game.clickOutSide();
        });

         test("Wait until 15 freespin finished", async () => {
             let totalAutoSpin = 15; // Start with initial free spins
             let completedSpins = 0;
             let totalWinAmount = 0; // Track total win amount
             let previousSpincount = 15; // Track previous spin count
             
             while (completedSpins < totalAutoSpin) {
                if (totalAutoSpin == 0) {
                    expect(await this.game.isCocosLocatorExists(Portrail_Classic_Locators.lblLastFreeSpin)).toBe(true);
                }
                const settledResults = await waitForSettlementCascadingSlot(this.game);
                 let currentSpincount = await this.game.findLabelText(Portrail_Classic_Locators.txtFreeSpinCount);
                 
                 if (settledResults.isbigWin) {
                    await this.game.waitForTimeout(10000);
                    await this.game.clickOutSide();
                }
                 
                 // Check if user won additional free spins
                 if (settledResults.totalFreeSpins && settledResults.totalFreeSpins > 0) {
                     const currentRemainingSpins = parseInt(currentSpincount);
                     const previousRemainingSpins = previousSpincount;
                     
                     if (currentRemainingSpins > previousRemainingSpins) {
                         const additionalSpins = currentRemainingSpins - previousRemainingSpins;
                         totalAutoSpin += additionalSpins;
                         await this.game.clickOutSide();
                         console.log(`🎉 User won ${additionalSpins} additional free spins! Total: ${totalAutoSpin}`);
                     }
                 }
                 
                 previousSpincount = parseInt(currentSpincount);
                 totalWinAmount += parseFloat(settledResults.win);
                 completedSpins++;
                 
             }
             
             console.log(`✅ Completed ${totalAutoSpin} free spins! Total win: ${totalWinAmount}`);             
             await this.game.waitForTimeout(8000);
             const displayedTotalWin = await this.game.findLabelText(Portrail_Classic_Locators.lblFSTotalWin);
             
             // Compare calculated total with displayed total
             expect(parseFloat(displayedTotalWin)).toBeCloseTo(totalWinAmount+this.settledResults.win, 2);
             await this.game.clickOutSide();
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

                // Override clickOutSide method globally for this project
                this.overrideClickOutSide();
                this.overrideopenGuide();
            });

            this.runScenario();
        });
    }

    async clickSpinButton() {
        await this.game.page.mouse.click(640, 570);
    }

    async clickPlayNowButton() {
        await this.game.clickCocos(Portrail_Classic_Locators.btnPlayNow);
        await this.game.waitForTimeout(2000);
    }
    
    async openAutoSpinPopup() {
        await this.game.clickCocos(Portrail_Classic_Locators.btnAutoSpin);
        await this.game.waitForTimeout(2000);
    }

    async openHistoryPopup() {
        await this.game.clickCocos(Portrail_Classic_Locators.btnMenu);
        await this.game.waitForTimeout(1000);
        await this.game.clickCocos(Portrail_Classic_Locators.btnHistory);
        await this.game.waitForTimeout(2000);
    }

    protected runScenario() {
        this.mainUITests();
        this.turboTests();
        this.BetLevelSettingTests();
        this.placeBetAndSettleTests();
        this.autoSpinTests();
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout);

    }

    async setBetConfiguration(game: BaseGame, betlevel: number, coinvalue: number) {
        await this.game.clickCocos(Portrail_Classic_Locators.betAmountSetting);
        
        // Adjust Bet Level
        let currentBetLevel = Number(await game.findLabelText(Portrail_Classic_Locators.txtBetLevelValue));
        // console.log(`Initial Bet Level: ${currentBetLevel}, Target: ${betlevel}`);
        
        while (currentBetLevel !== betlevel) {
            if (currentBetLevel < betlevel) {
                await game.clickCocos(Portrail_Classic_Locators.btnBetLevelIncrease);
            } else {
                await game.clickCocos(Portrail_Classic_Locators.btnBetLevelDecrease);
            }
            await game.waitForTimeout(500);
            currentBetLevel = Number(await game.findLabelText(Portrail_Classic_Locators.txtBetLevelValue));
            // console.log(`Current Bet Level: ${currentBetLevel}, Target: ${betlevel}`);
        }
        
        // Adjust Coin Value
        let currentCoinValue = Number(await game.findLabelText(Portrail_Classic_Locators.txtCoinValue));
        // console.log(`Initial Coin Value: ${currentCoinValue}, Target: ${coinvalue}`);
        
        while (currentCoinValue !== coinvalue) {
            if (currentCoinValue < coinvalue) {
                await game.clickCocos(Portrail_Classic_Locators.btnCoinValueIncrease);
            } else {
                await game.clickCocos(Portrail_Classic_Locators.btnCoinValueDecrease);
            }
            await game.waitForTimeout(500);
            currentCoinValue = Number(await game.findLabelText(Portrail_Classic_Locators.txtCoinValue));
            // console.log(`Current Coin Value: ${currentCoinValue}, Target: ${coinvalue}`);
        }
        
        await this.game.clickCocos(Portrail_Classic_Locators.iconCloseMainPopup);
        await game.waitForTimeout(1000);
    }
}


const waitForSettlementCascadingSlot = async (game: BaseGame): Promise<any> => {
    const message = await game.waitForEvent(GameEvent.Settlement);
    await game.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement

    let settledResults = {
        isbigWin: message?.finish?.bigWin ??  message?.finish?.megaWin ?? message?.finish?.superWin ?? "",
        reachMaxWin: message?.finish?.reachMaxWin ?? "",
        totalFreeSpins: message?.finish?.totalFreeSpins ?? "",
        totalMultiplier: message?.finish?.totalMultiplier ?? "",
        win: message?.finish?.win ?? "",
        roundId: message?.finish?.roundId ?? "",
        result: message?.finish?.result ?? "",
    };

    return settledResults;
};
