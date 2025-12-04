import { test, BasePlayer, BaseGame } from "../components";
import { IBaseOptions } from "./base-options";
import { Portrail_Classic_Locators } from "../components/base-cocos-game-locator";
import { expect } from "../expects";
import { GameEvent } from "../_shared";
import { GameGuides } from "../game-components/guides/guides.spec";
import { Promotion} from "../game-components/promotion/promotion.spec";
const projectName = process.env.npm_config_project?.includes("l1")
    ? "SG"
    : process.env.npm_config_project?.includes("l2")
      ? "VG"
      : process.env.npm_config_project;

export interface SlotGameOptions extends IBaseOptions {
    placeBetAmount?: number;
    isJackpot?: boolean;
    isPromotion?: boolean;
}

export class PortrailClassicGameBase {
    game: BaseGame;
    player: BasePlayer;
    settledResults: any;
    protected gameGuides: GameGuides = new GameGuides();
    protected promotion: Promotion = new Promotion();
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

        test("Verify welcome screen and Play Now button exists", async () => {
            expect(await this.game.isCocosLocatorExists(this.locators.btnPlayNow), "Play Now button not found").toBe(true);
        });

        test("Verify User can click Play Now button and navigate to game", async () => {
            await this.clickPlayNowButton();
            await this.game.waitForTimeout(5000);
            expect(await this.game.isCocosLocatorExists(this.locators.btnSpin), "Spin button not found").toBe(true);
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

        if (this.options.isJackpot) {
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
            if (this.options.isJackpot) {
                expect(await this.game.isCocosLocatorExists(this.locators.btnHallOfFame), "Top button not found").toBe(true);
             }
        });

        test("Verify User can open Line setting popup", async () => {
            await this.game.clickCocos(this.locators.btnLine);
            expect(await this.game.isCocosLocatorExists(this.locators.popupLineSelection), "Line setting popup not found").toBe(true);
            await this.game.clickCocos(this.locators.btnClose);
        });

        if (this.options.isJackpot) {
            test("Verify Hall Of Fame exists", async () => {
                await this.game.clickCocos(this.locators.btnMenu, 1000);
                await this.game.clickCocos(this.locators.btnHallOfFame,1000);
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
                await this.game.clickCocos(this.locators.iconCloseHallOfFame);
            });
        }


    }


    protected placeBetAndSettleTests() {
        test("Verify that player be able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.Settlement);
            this.game.attachSocketAndCaptureEvent(GameEvent.Bonuses);
            this.game.attachSocketAndCaptureEvent(GameEvent.Jackpot);
            // Act
            await this.game.clickCocos(this.locators.btnTurbo);
            await this.setBetConfiguration(this.game.gameConfigs.betLevels[1]);
            const totalBet = await this.game.findLabelText(this.locators.txtbottomTotalBet);
            await this.clickSpinButton();

            await test.step("Get bet result", async () => {
                this.settledResults = await waitForSettlementClassicSlot(this.game);
            });

            await handleFreeSpinClassicSlotResults(this.game,this.locators,this.settledResults.totalFreeSpins);

            this.settledResults.totalBet = totalBet;
            this.settledResults.betLevel = this.game.gameConfigs.betLevels[1];

            console.log(this.settledResults);

        });

        test("Verify total win result", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(5000);// wait for animation
            if(this.settledResults.win > 0) {
                expect(parseFloat(await this.game.findLabelText(this.locators.txtbottomWin))).toBeCloseTo(this.settledResults.win, 2);
            } else {
                expect(await this.game.findLabelText(this.locators.txtbottomWin)).toBe("0");
            }
        });

        test("Verify bet ticket in history popup", async () => {
            await this.openHistoryPopup();

            expect(await this.game.findLabelText(this.locators.lblHistoryRoundPath + this.settledResults.roundId + "/node/round/lblRound")).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.lblHistoryRoundPath + this.settledResults.roundId + "/node/total-bet")).toBe(this.settledResults.totalBet.toString());
            expect(Number(await this.game.findLabelText(this.locators.lblHistoryRoundPath + this.settledResults.roundId + "/node/total-win"))).toBe(Number(this.settledResults.win));
        });

        test("Verify bet ticket detail data in history popup", async () => {
            await this.game.clickCocos(this.locators.lblHistoryRoundPath + this.settledResults.roundId + "/node/round", 1000);
            expect(await this.game.findLabelText(this.locators.txtHistoryDetailRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.txtHistoryDetailBetLevel)).toBe(this.settledResults.betLevel.toString());
            expect(Number(await this.game.findLabelText(this.locators.txtHistoryDetailTotalBet))).toBe(Number(this.settledResults.totalBet));
            expect(Number(await this.game.findLabelText(this.locators.txtHistoryDetailWin))).toBe(Number(this.settledResults.win));
        });

        test("Verify user can close history popup", async () => {
            await this.game.clickCocos(this.locators.btnBackHistory,2000);
            await this.game.clickCocos(this.locators.iconCloseHistory,2000);
            expect(await this.game.isCocosLocatorExists(this.locators.txtHistoryRoundId), "History round ID should not be visible after closing popup").toBe(false);
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

        test.describe.serial(`${projectName} - ${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.gameGuides.init(this.game);
                this.promotion.init(this.game);
                // Override clickOutSide method globally for this project
                this.overrideClickOutSide();
                this.overrideopenGuide();
            });

            this.runScenario();
        });
    }

    async clickSpinButton() {
        await this.game.page.mouse.click(640, 580);
        await this.game.waitForTimeout(200);
    }

    async clickPlayNowButton() {
        await this.game.clickCocos(this.locators.btnPlayNow,2000);
    }
    
    async openAutoSpinPopup() {
        await this.game.clickCocos(this.locators.btnAutoSpin,1000);
    }

    async openHistoryPopup() {
        await this.game.clickCocos(this.locators.btnMenu,1000);
        await this.game.clickCocos(this.locators.btnHistory,1000);

    }

    protected runScenario() {
        this.mainUITests();
        this.placeBetAndSettleTests();
        this.promotion.runPromotion(this.options.isPromotion);
        this.gameGuides.cocosTests(this.options.gameConfiguration.maxTimeout, this.locators, this.options.isJackpot);
    }

    async setBetConfiguration(betamount: number) {
        await this.game.clickCocos(this.locators.betAmountSetting,1000);
        // Adjust Bet Level
        expect(await this.game.isCocosLocatorExists(`bet-level-${betamount.toString()}`), "Bet level button not found").toBe(true);
        await this.game.clickCocos(`bet-level-${betamount.toString()}`,1000);
        await this.game.clickOutSide();
        await this.game.waitForTimeout(1000);
    }
}


const waitForSettlementClassicSlot = async (game: BaseGame): Promise<any> => {
    const bonuses = await game.latestCaptureEvent(GameEvent.Bonuses);
    const jackpot = await game.latestCaptureEvent(GameEvent.Jackpot);
    
    // Handle special events immediately if they occur
    if (jackpot?.jackpot?.prizes > 0) {
        await handleJackpotClassicSlotResults(game, jackpot.jackpot.prizes);
    }
    if (bonuses?.bonuses?.bonus > 0) {
        await handleBonusesClassicSlotResults(game, bonuses.bonuses.bonus);
    }
     
    // Always wait for Settlement event to get complete game data
    let message = await game.latestCaptureEvent(GameEvent.Settlement);
    if(message == null||message == ''||message == 'undefined'){
        message = await game.waitForEvent(GameEvent.Settlement);
    }


    const settledResults = {
        isbigWin: message?.finish?.bigWin  ?? "",
        totalFreeSpins: message?.finish?.totalOfFreeSpins ?? "",
        win: message?.finish?.betWin ?? 0,
        bonuses: bonuses?.bonuses?.bonus ?? 0,
        jackpot: jackpot?.jackpot?.prizes ?? 0,
        roundId: message?.finish?.roundId ?? "",
        result: message?.finish?.result ?? "",
        settlementResult:  message?.finish?.settlementResult,
    };

    return settledResults;
};

const handleFreeSpinClassicSlotResults = async (game: BaseGame,locators: any,totalFreeSpin: number): Promise<any> => {
    if(totalFreeSpin > 0) {
        let totalAutoSpin = totalFreeSpin; // Start with initial free spins
             let completedSpins = 0;
             let totalWinAmount = 0; // Track total win amount
             let previousSpincount = 15; // Track previous spin count
             await game.clickOutSide();
             while (completedSpins < totalAutoSpin) {
                if (totalAutoSpin == 0) {
                    expect(await game.isCocosLocatorExists(locators.lblLastFreeSpin)).toBe(true);
                }
                const settledResults = await waitForSettlementClassicSlot(game);
                 let currentSpincount = await game.findLabelText(locators.txtFreeSpinCount);
                 
                 if (settledResults.isbigWin) {
                    await game.waitForTimeout(10000);
                    await game.clickOutSide();
                }
                 
                 // Check if user won additional free spins
                 if (settledResults.totalFreeSpins && settledResults.totalFreeSpins > 0) {
                     const currentRemainingSpins = parseInt(currentSpincount);
                     const previousRemainingSpins = previousSpincount;
                     
                     if (currentRemainingSpins > previousRemainingSpins) {
                         const additionalSpins = currentRemainingSpins - previousRemainingSpins;
                         totalAutoSpin += additionalSpins;
                         await game.clickOutSide();
                         console.log(`🎉 User won ${additionalSpins} additional free spins! Total: ${totalAutoSpin}`);
                     }
                 }
                 
                 previousSpincount = parseInt(currentSpincount);
                 totalWinAmount += parseFloat(settledResults.win);
                 completedSpins++;
                 
                 if (completedSpins == totalAutoSpin) {
                     await game.waitForTimeout(5000);
                 }
             }
             
             console.log(`✅ Completed ${totalAutoSpin} free spins! Total win: ${totalWinAmount}`);             
             await game.waitForTimeout(8000);             
             await game.clickOutSide();
    }
}

const handleBonusesClassicSlotResults = async (game: BaseGame,bonuses: number): Promise<any> => {
    if (bonuses > 0) {
        await game.waitForTimeout(5000);
        for (let i = 0; i <= bonuses; i++) {
            await game.clickCocos(`bonus${i}`,0);
        }
    }
}

const handleJackpotClassicSlotResults = async (game: BaseGame,jackpot: number): Promise<any> => {
    if (jackpot > 0) {
        await game.waitForTimeout(5000);
        await game.clickCocos(`jackpot-0`,0);
    }
}

