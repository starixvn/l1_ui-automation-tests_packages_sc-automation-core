import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptionsCocos } from "./base-options";
import { performanceTest } from "../game-components/performance/performance";
import { GameGuides } from "../game-components/guides/guides.spec";
import { CrashGame_Locators } from "../components/base-cocos-game-locator";


const projectName = process.env.npm_config_project?.includes("l1")
    ? "SG"
    : process.env.npm_config_project?.includes("l2")
      ? "VG"
      : process.env.npm_config_project;

export class CrashGameBaseCocos {
    protected game: BaseGame;
    protected player: BasePlayer;
    performanceTest: performanceTest = new performanceTest();
    protected gameGuides: GameGuides = new GameGuides();
    settledResults: any;

    constructor(protected options: IBaseOptionsCocos) {}

    private get locators() {
        return this.options.locators || CrashGame_Locators
    }


    protected inGameUITests() {
        test("Verify User Can Find All UI Elements", async () => {
            await test.step("Verify User Can Find All UI Elements", async () => {
                // Get list of locators to verify, default to lblRoundId if not specified
            const locatorsToVerify = this.options.uiLocatorsToVerify ?? {lblRoundId: "Phien"};
                
                for (const [locatorKey, locatorValue] of Object.entries(locatorsToVerify)) {
                    expect(
                        await this.game.isCocosLocatorExists(locatorValue),
                        `${locatorKey} not found`
                    ).toBe(true);
                }
            });
        });
    }


    protected placeBetAndSettleTests() {

        test("Verify user can setting client seed in PF popup", async () => {
            await this.game.clickCocos(this.locators.btnPfSetting, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.iconPFGuideSetting)).toBe(true);
            expect(await this.game.isCocosLocatorExists(this.locators.btnCopyServerSeed)).toBe(true);
            await this.game.clickCocos(this.locators.ckbRandomSeed, 1000);
            const randomSeed = await this.game.findLabelText(this.locators.txtRandomSeed);
            this.settledResults.clientSeed = randomSeed;
            await this.game.clickCocos(this.locators.btnClosePFSetting, 1000);

        });

        test("Test complete bet lifecycle: placement → settlement → validation", async (    ) => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
            await this.game.waitUntilPlaceBet();
            const amount = this.options.placeBetAmount[0];

            await test.step("Verify that the bet is successfully placed", async () => {
                const recentBet = await this.placeBet(amount);
                let roundId = (await this.game.findLabelText(this.locators.lblRoundId)).replace('#', '');
                let isCrashed = await this.game.latestCaptureEvent(GameEvent.Settlement);
                const savedClientSeed = this.settledResults.clientSeed;
                if (isCrashed === "" || isCrashed === undefined) {
                    //Have not crash yet
                    await this.game.waitForTimeout(8000);
                    await this.game.clickCocos(this.locators.btnCashoutFull, 100); //click cash out
                    this.settledResults = await this.game.waitForSettlement();
                } else {
                    this.settledResults = await this.game.waitForSettlement();              
            }
                this.settledResults.roundId = roundId;
                this.settledResults.amount = recentBet.endBet;
                if (savedClientSeed) {
                    this.settledResults.clientSeed = savedClientSeed;
                }
            });
            console.log(this.settledResults, "settledResults");
        });

        
        test("Verify bet ticket in history popup", async () => {
            await this.game.waitForTimeout(5000);
            await this.openHistoryPopup();
            expect(await this.game.findLabelText(this.locators.lblHistoryRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.lblHistoryTotalBet)).toBe(this.settledResults.amount.toString());
            expect(await this.game.findLabelText(this.locators.lblHistoryWin)).toBe(this.settledResults.winAmount.toString());
        });

        test("Verify bet ticket detail data in history popup", async () => {
            const isClickable = await this.game.isLabelClickable(this.locators.lblHistoryRoundId);
            test.skip(!isClickable, "No Histor detail popup");

            await this.game.clickCocos(this.locators.lblHistoryRoundId, 1000);
            expect(await this.game.findLabelText(this.locators.lblHistoryDetailRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.lblHistoryDetailTotalBet)).toContain(this.settledResults.amount.toString());
            await this.game.clickCocos(this.locators.btnCloseHistoryDetail, 1000);
        });

        test("Verify user can verify pf data", async () => {
            const isClickable = await this.game.isLabelClickable(this.locators.btnHistoryPF);
            test.skip(!isClickable, "No PF detail popup");

            await this.game.clickCocos(this.locators.btnHistoryPF, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.iconHistoryPFGuide)).toBe(true);
            expect(await this.game.findLabelText(this.locators.lblHistoryPFRoundId)).toBe(this.settledResults.roundId.toString());
            await this.game.clickCocos(this.locators.btnCloseHistorPF, 1000);
        });

        test("Verify user can close history popup", async () => {
            await this.game.clickCocos(this.locators.btnCloseHistory, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.lblHistoryRoundId)).toBe(false);
        });
    }


    start(): void {
        test.beforeAll(async ({ baseGame }) => {
            this.game = baseGame;
            this.player = new BasePlayer(this.game);
            this.settledResults = {};
            this.gameGuides.init(this.game);
        });

        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                return `${this.options.snapshotFolderPath}-snapshots/${name}`;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: [this.options.locators],
        });

        test.describe.serial(`${projectName} - ${this.options.gameConfiguration.name} Smoke Tests`, () => {
            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameUITests();
        this.placeBetAndSettleTests();
        this.gameGuides.cocosTests(this.options.gameConfiguration.maxTimeout, this.locators,false,projectName);
    }

    async openHistoryPopup() {        
        const isMenuExpanded = await this.game.isCocosLocatorExists(this.locators.btnMenu);
        if (isMenuExpanded) {
            await this.game.clickCocos(this.locators.btnMenu,1000);
        }
        await this.game.clickCocos(this.locators.btnHistory,1000)

    }

    async selectBetAmount(amountLocator: any) {
        await this.game.clickCocos(this.locators.btnBetAmount,1000);
        await this.game.dynamicClick(amountLocator);
        await this.game.clickCocos(this.locators.btnConfirmBetAmount,1000);
    }

    async placeBet(amountLocator: any) {
        await this.selectBetAmount(amountLocator);
        await this.game.clickCocos(this.locators.btnPlaceBet, 300);
        return await this.game.latestCaptureEvent(GameEvent.EndBet);
    }
 
}
