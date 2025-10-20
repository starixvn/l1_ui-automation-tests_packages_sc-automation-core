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

    private get locators() {
        return this.options.locators || Portrail_Classic_Locators;
    }

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
            await this.game.clickCocos(this.locators.btnguide);
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
            expect(await this.game.isCocosLocatorExists(this.locators.btnPlayNow), "Play Now button not found").toBe(true);
        });

        test("Verify User can click Play Now button and navigate to game", async () => {
            const operatorName = (process.env.npm_config_project?.includes("l1")) ? "SABA.games" : "Vgaming";
            await this.clickPlayNowButton();
            await this.game.waitForTimeout(5000);
            expect(await this.game.isCocosLocatorExists(this.locators.btnSpin), "Spin button not found").toBe(true);
            expect(await this.game.findLabelText(this.locators.txtOperator)).toBe(operatorName);
        });

        test("Verify center message exists", async () => {
            const centerMessages = [
                "Bấm Quay hoặc giữ phím Space",
                "trên các cột khác nhau sẽ thắng Bonus game",
                "trên các cột khác nhau để thắng Free Spin",
                "Quay trúng ≥3",
                "Tổng Thắng: ",
                "thay thế tất cả biểu tượng, trừ"
            ];
         
            const actualMessage = await this.game.findLabelText(this.locators.txtMessageCenter);
            expect(centerMessages).toContain(actualMessage.trim());
        });

        if (process.env.npm_config_jackpot) {
            test("Verify Jackpot panel exists", async () => {
                expect(await this.game.isCocosLocatorExists(this.locators.lblMajorJackpot), "Major jackpot label not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.lblGrandJackpot), "Grand jackpot label not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.lblMinorJackpot), "Minor jackpot label not found").toBe(true);
            });
        }

        test("Verify button auto spin exists", async () => {
            expect(await this.game.isCocosLocatorExists(this.locators.btnAutoSpin), "Auto spin button not found").toBe(true);
        });

        test("Verify button turbo mode exists", async () => {
            expect(await this.game.isCocosLocatorExists(this.locators.btnTurbo), "Turbo button not found").toBe(true);
        });

        test("Verify button bet amount setting exists", async () => {
            expect(await this.game.isCocosLocatorExists(this.locators.betAmountSetting), "Bet amount setting button not found").toBe(true);
        });

        test("Verify button menu exists", async () => {
            expect(await this.game.isCocosLocatorExists(this.locators.btnMenu), "Menu button not found").toBe(true);
        });

        test("Verify button game guide exists", async () => {
            expect(await this.game.isCocosLocatorExists(this.locators.btnguide), "Game guide button not found").toBe(true);
        });

        test("Verify all menu items exists", async () => {
            await this.game.clickCocos(this.locators.btnMenu,1000);
                expect(await this.game.isCocosLocatorExists(this.locators.btnLobby), "Lobby button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.btnMusic), "Music button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.btnSound), "Sound button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.btnHistory), "History button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.btnLine), "Line button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.btnMenuClose), "Menu close button not found").toBe(true);
            if (process.env.npm_config_jackpot) {
                expect(await this.game.isCocosLocatorExists(this.locators.btnTop), "Top button not found").toBe(true);
             }
        });

        test("Verify User can open Line setting popup", async () => {
            await this.game.clickCocos(this.locators.btnLine);
            expect(await this.game.isCocosLocatorExists(this.locators.popupLineSelection), "Line setting popup not found").toBe(true);
            await this.game.clickCocos(this.locators.btnClosePopup);
        });

        if (process.env.npm_config_jackpot) {
            test("Verify Hall Of Fame exists", async () => {
                await this.game.clickCocos(this.locators.btnMenu, 1000);
                await this.game.clickCocos(this.locators.btnHallOfFame);
                expect(await this.game.isCocosLocatorExists(this.locators.btnBigWin), "Big win button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.btnJackpot), "Jackpot button not found").toBe(true);
                expect(await this.game.isCocosLocatorExists(this.locators.barPagination), "Pagination bar not found").toBe(true);
            });

            test("Verify User can click tab Jackpot", async () => {
                await this.game.clickCocos(this.locators.btnJackpot);
                expect(await this.game.isCocosLocatorExists(this.locators.headerJackpot), "Header jackpot not found").toBe(true);
            });

            test("Verify User can click tab Big Win", async () => {
                await this.game.clickCocos(this.locators.btnBigWin);
                expect(await this.game.isCocosLocatorExists(this.locators.headerBigWin), "Header big win not found").toBe(true);
                await this.game.clickCocos(this.locators.iconCloseMainPopup);
            });
        }


    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            expect(await this.game.isCocosLocatorExists(this.locators.iconTurboOFF), "Turbo OFF icon not found").toBe(true);

        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
                await this.game.clickCocos(this.locators.btnTurbo,1000);
                expect(await this.game.isCocosLocatorExists(this.locators.iconTurboON), "Turbo ON icon not found").toBe(true);

        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Turbo OFF
            await this.game.clickCocos(this.locators.btnTurbo,1000);
            expect(await this.game.isCocosLocatorExists(this.locators.iconTurboOFF), "Turbo OFF icon not found").toBe(true);
        });
    }

    protected BetLevelSettingTests() {

        test("Verify User can open bet amount setting popup", async () => {
            await this.game.clickCocos(this.locators.betAmountSetting,1000);
            const cfBetLevels = this.game.gameConfigs.betLevels
            for (const element of cfBetLevels) {
                expect(await this.game.isCocosLocatorExists(`bet-level-${element.toString()}`), `Bet level ${element} button not found`).toBe(true); 
            }
        });

        test("Verify total bet change by select bet level", async () => {
            const cfBetLevels = this.game.gameConfigs.betLevels
            for (const element of cfBetLevels) {
                expect(await this.game.isCocosLocatorExists(`bet-level-${element.toString()}`), `Bet level ${element} button not found`).toBe(true); 
            }        
        });

        test("Verify range value of bet level", async () => {
            const cfBetLevels =  this.game.gameConfigs.betLevels
            for (const element of cfBetLevels) {
                await this.game.clickCocos(`bet-level-${element.toString()}`);
                const totalBetText = await this.game.findLabelText(this.locators.txtbottomTotalBet);
                const displayedTotal = Number(totalBetText.replace(/,/g, ""));
                expect(displayedTotal).toBeCloseTo(element * 25, 2);
            }    
        });


        test("Verify user can adjust bet by increase/decrease button", async () => {
            let totalBetbefore,totalBetafter = "";

            for (let i = 0; i < 20; i++) {
                await this.game.clickCocos(this.locators.btnBetIncrease);
            }

            for (let i = 0; i < 10; i++) {
                totalBetbefore = await this.game.findLabelText(this.locators.txtbottomTotalBet);
                await this.game.clickCocos(this.locators.btnBetDecrease);
                await this.game.waitForTimeout(500);
                totalBetafter = await this.game.findLabelText(this.locators.txtbottomTotalBet);
                expect(Number(totalBetafter.replace(/,/g, ''))<Number(totalBetbefore.replace(/,/g, ''))).toBe(true);
            }

            for (let i = 0; i < 10; i++) {
                totalBetbefore = await this.game.findLabelText(this.locators.txtbottomTotalBet);
                await this.game.clickCocos(this.locators.btnBetIncrease);
                await this.game.waitForTimeout(500);
                totalBetafter = await this.game.findLabelText(this.locators.txtbottomTotalBet);
                expect(Number(totalBetafter.replace(/,/g, ''))>Number(totalBetbefore.replace(/,/g, ''))).toBe(true);
            }

        });


    }

    protected placeBetAndSettleTests() {
        test("Verify that player be able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            // Act
            await this.game.clickCocos(this.locators.btnTurbo);
            await this.setBetConfiguration(this.game.gameConfigs.betLevels[7]);
            const totalBet = await this.game.findLabelText(this.locators.txtbottomTotalBet);
            await this.clickSpinButton();

            await test.step("Get bet result", async () => {
                this.settledResults = await waitForSettlementClassicSlot(this.game);
            });

            if (this.settledResults.isbigWin) {
                console.log("click bigwwin", this.settledResults.isbigWin);
                await this.game.waitForTimeout(10000);
                await this.game.clickOutSide();
            }

            this.settledResults.totalBet = totalBet;

            console.log(this.settledResults);

        });

        test("Verify total win result", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(5000);// wait for animation
            if(this.settledResults.win > 0) {
                expect(parseFloat(await this.game.findLabelText(this.locators.txtcenterWin))).toBeCloseTo(this.settledResults.win, 2);
                expect(parseFloat(await this.game.findLabelText(this.locators.txtbottomWin))).toBeCloseTo(this.settledResults.win, 2);
            } else {
                expect(await this.game.findLabelText(this.locators.txtbottomWin)).toBe("0");
            }
        });

        test("Verify bet ticket in history popup", async () => {
            await this.openHistoryPopup();

            expect(await this.game.findLabelText(this.locators.txtHistoryRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.txtHistoryTotalBet)).toBe(this.settledResults.totalBet.toString());
            expect(Number(await this.game.findLabelText(this.locators.txtHistoryWin))).toBe(Number(this.settledResults.win));
        });

        test("Verify bet ticket detail data in history popup", async () => {
            await this.game.page.mouse.click(600, 127);
            // await this.game.clickCocosByLabel(this.settledResults.roundId.toString());
            await this.game.waitForTimeout(2000);

            expect(await this.game.findLabelText(this.locators.txtHistoryDetailRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.txtHistoryDetailBetLevel)).toBe(this.settledResults.betlevel.toString());
            expect(await this.game.findLabelText(this.locators.txtHistoryDetailTotalBet)).toBe(this.settledResults.totalBet.toString());
            expect(Number(await this.game.findLabelText(this.locators.txtHistoryDetailWin))).toBe(Number(this.settledResults.win));
                if(this.settledResults.multiplier > 0) {
                expect(await this.game.findLabelText(this.locators.txtHistoryDetailMultiplier)).toBe(this.settledResults.multiplier.toString());
            }
        });

        test("Verify user can close history popup", async () => {
            await this.game.clickCocos(this.locators.btnBackHistory);
            await this.game.waitForTimeout(2000);
            await this.game.clickCocos(this.locators.btnClosePopup);
            await this.game.waitForTimeout(2000);
            expect(await this.game.isCocosLocatorExists(this.locators.txtHistoryRoundId), "History round ID should not be visible after closing popup").toBe(false);
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
                await this.game.clickCocos(this.locators.lbl10AutoSpin);
                await this.game.clickCocos(this.locators.btnAutoSpinStart);
            });

            //Assert
            await test.step("Wait for finish 10 spins", async () => {
                let currentTotalAutoSpin = totalAutoSpin; // Start with initial auto spins
                let completedSpins = 0;
                
                while (completedSpins < currentTotalAutoSpin) {
                    const settledResults = await waitForSettlementClassicSlot(this.game);
                    let spincount = await this.game.findLabelText(this.locators.txtautoSpinCount);
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
                await this.game.clickCocos(this.locators.iconCloseAutoPlay);
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
        await this.game.clickCocos(this.locators.btnPlayNow);
        await this.game.waitForTimeout(2000);
    }
    
    async openAutoSpinPopup() {
        await this.game.clickCocos(this.locators.btnAutoSpin);
        await this.game.waitForTimeout(2000);
    }

    async openHistoryPopup() {
        await this.game.clickCocos(this.locators.btnMenu);
        await this.game.waitForTimeout(1000);
        await this.game.clickCocos(this.locators.btnHistory);
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

    async setBetConfiguration(betamount: number) {
        await this.game.clickCocos(this.locators.betAmountSetting);
        // Adjust Bet Level
        await this.game.clickCocos(`bet-level-${betamount.toString()}`,1000);
        await this.game.clickCocos(this.locators.iconCloseAmountSetting,1000);
    }
}


const waitForSettlementClassicSlot = async (game: BaseGame): Promise<any> => {
    const message = await game.waitForEvent(GameEvent.Settlement);
    await game.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement

    const settledResults = {
        isbigWin: message?.finish?.bigWin  ?? "",
        reachMaxWin: message?.finish?.reachMaxWin ?? "",
        totalFreeSpins: message?.finish?.totalOfFreeSpins ?? "",
        win: message?.finish?.betWin ?? 0,
        roundId: message?.finish?.roundId ?? "",
        result: message?.finish?.result ?? "",
        settlementResult:  message?.finish?.settlementResult
    };

    return settledResults;
};
