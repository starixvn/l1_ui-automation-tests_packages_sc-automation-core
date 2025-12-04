import { test, BasePlayer, BaseGame } from "../components";
import { GameEvent } from "../_shared";
import { expect } from "../expects";
import { IBaseOptionsCocos } from "./base-options";
import { GameGuides } from "../game-components/guides/guides.spec";
import { RoundGame_Locators } from "../components/base-cocos-game-locator";

const projectName = process.env.npm_config_project?.includes("l1")
    ? "SG"
    : process.env.npm_config_project?.includes("l2")
      ? "VG"
      : process.env.npm_config_project;

export class RoundGameBaseCocos {
    protected game: BaseGame;
    protected player: BasePlayer;
    settledResults: any;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptionsCocos) {}

    private get locators() {
        return this.options.locators || RoundGame_Locators;
    }

    private overrideClickOutSide() {
        // Override the method globally for this project
        this.game.clickOutSide = async () => {
            await this.game.page.mouse.click(15, 15);
        };
    }

    private overrideopenGuide() {
        // Override the method globally for this project
        this.game.openGuide = async () => {
            await this.game.page.waitForTimeout(1000);
            const isMenuExpanded = await this.game.isCocosLocatorExists(this.locators.btnMenu);
            if (isMenuExpanded) {
                await this.game.clickCocos(this.locators.btnMenu,1000);
            }
            await this.game.clickCocos(this.locators.btnguide);
            await this.game.page.waitForTimeout(10000);
        };
    }

    private extractAmountFromLocator(amountLocator?: string): number | undefined {
        if (!amountLocator) return undefined;
        
        // Extract the last number from the path (e.g., "/1" or "/BetChips/1")
        const match = amountLocator.match(/\/(\d+)$/);
        return match ? parseInt(match[1], 10) : undefined;
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
        test("Test complete bet lifecycle: placement → settlement → validation", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            this.game.attachSocketAndCaptureEvent(GameEvent.EndBet);
            const amountLocator = this.options.placeBetAmount?.toString();
            const bet = { 
                choice: this.options.placeBetChoices?.[0], 
                amountLocator: amountLocator,
                amount: this.extractAmountFromLocator(amountLocator)
            };
            
            // Act - Place bet with retry until success
            const roundId = await this.placeBetWithRetry(bet.choice??'', bet.amountLocator?.toString());
            this.settledResults = await this.game.waitForSettlement();
            this.settledResults.amount = bet.amount;
            expect(roundId).toContain(this.settledResults.roundId.toString());
        });

        
        test("Verify bet ticket in history popup", async () => {
            await this.game.waitUntilPlaceBet();
            await this.openHistoryPopup();
            expect(await this.game.findLabelText(this.locators.txtHistoryRoundId)).toBe(this.settledResults.roundId.toString());
            expect(await this.game.findLabelText(this.locators.txtHistoryTotalBet)).toBe(this.settledResults.amount.toString());
        });

        test("Verify bet ticket detail data in history popup", async () => {
            // Only run this test if txtHistoryRoundId is clickable (has overflow = CLAMP or color = #3a97ff)
            const isClickable = await this.game.isLabelClickable(this.locators.txtHistoryRoundId);
            test.skip(!isClickable, "No Histor detail popup");
            
            await this.game.clickCocos(this.locators.txtHistoryRoundId, 1000);
            await this.game.waitForTimeout(2000);
            expect(await this.game.findLabelText(this.locators.txtHistoryDetailInfo)).toContain(this.settledResults.roundId.toString());
        });

        test("Verify user can close history popup", async () => {
            await this.game.clickCocos(this.locators.btnCloseHistoryDetail, 1000);
            await this.game.clickCocos(this.locators.btnCloseHistory, 1000);
            expect(await this.game.isCocosLocatorExists(this.locators.txtHistoryRoundId), "History round ID should not be visible after closing popup").toBe(false);
        });
    }

    protected hedgeBetTests() {
        test("Verify hedge betting is blocked with proper error handling", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const amountLocator = this.options.placeBetAmount?.[0] ?? '';
            const bet1Choice = this.options.placeBetChoices?.[0] ?? '';
            const bet2Choice = this.options.placeBetChoices?.[1] ?? '';
            const betBoard = this.game.gameConfiguration.betBoard ?? false;
            await this.game.waitForTimeout(5000);

            // Act
            await this.placeBetWithRetry(bet1Choice, amountLocator);
            await this.player.placeBetCocos(betBoard, bet2Choice, amountLocator);
            await this.game.waitForTimeout(1000);
            // Assert
            expect(await this.game.findLabelText(this.locators.lblMiniWarning)).toBe(this.locators.lblHedgeWarning);
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
                this.overrideopenGuide();
                this.overrideClickOutSide();
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameUITests();
        this.placeBetAndSettleTests();
        this.hedgeBetTests();
        this.gameGuides.cocosTests(this.options.gameConfiguration.maxTimeout, this.locators,false,projectName);
    }

    async openHistoryPopup() {
        const isMenuExpanded = await this.game.isCocosLocatorExists(this.locators.btnMenu);
        if (isMenuExpanded) {
            await this.game.clickCocos(this.locators.btnMenu,1000);
        }
        await this.game.clickCocos(this.locators.btnHistory,1000);

    }

    private async placeBetWithRetry(choice: string, amountLocator?: string): Promise<string> {
        let placeBetResponse: any;
        let retryCount = 0;
        const maxRetries = 20; // Prevent infinite loop
        
        do {
            // Place bet
            placeBetResponse = await this.player.placeBetCocos(this.game.gameConfiguration.betBoard??false, choice, amountLocator);
               
            // If endBet is -1, retry immediately
            if (placeBetResponse && placeBetResponse.endBet === -1 || placeBetResponse == '') {
                retryCount++;
                console.log(`Place bet failed (endBet: -1), retrying... (attempt ${retryCount})`);
                await this.game.waitForTimeout(500); // Small delay before retry
            } else {
                return await this.game.findLabelText(this.locators.lblRoundId);
            }
        } while (retryCount < maxRetries);
        
        throw new Error(`Failed to place bet after ${maxRetries} attempts`);
    }
}
