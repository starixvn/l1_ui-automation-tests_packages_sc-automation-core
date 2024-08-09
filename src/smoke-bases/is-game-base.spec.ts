import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { MemberSiteLocators } from "./../auth/locators";
let skipTests = false;
const projectName = process.env.npm_config_project?.includes("l1")? "SG" : process.env.npm_config_project?.includes("l2")? "VG" : process.env.npm_config_project;

export class ISGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected preCondition() {
        test("preCondition is instant games offered", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            if (await this.game.page.locator("#TW_Close_Btn").isVisible()) {
                await this.game.page.click("#TW_Close_Btn");
            }
            skipTests = !(await this.game.page.locator(MemberSiteLocators.instantPlayIcon).isVisible());
            console.log("isIS:", !skipTests);
        });
    }

    protected openInstantGame(): void {
        test(`Smoke Tests Mini Sedie`, async () => {
            test.skip(skipTests, "Skipping test Because Instant Play game does not support at this time");
            await test.step(`Verify that game mini Sedie can be opened.`, async () => {
                await this.game.page.focus(MemberSiteLocators.rightCollapseMenu);
                await this.game.click(MemberSiteLocators.MiniGamesbtn, 1000);
                await this.game.click(MemberSiteLocators.instantPlayIcon, 1000);
                let firstGameIcon = await this.game.page.locator(MemberSiteLocators.MiniSeDiegame).isVisible();
                while (!firstGameIcon) {
                    await this.game.click("text=→", 1000);
                }
                await this.game.page.locator(MemberSiteLocators.MiniSeDiegame).focus();
                await this.game.click(MemberSiteLocators.MiniSeDiegame, 1000);
                await this.game.page
                    .frameLocator("div >> internal:has-text=/^Instant Play←→$/ >> iframe")
                    .getByRole("button", { name: "Submit" })
                    .click();
                await this.game.page.frameLocator("div >> internal:has-text=/^Instant Play←→$/ >> iframe").locator("#GameCanvas").focus();
                await this.game.waitForTimeout(8000);

                if (this.options.isconfig.gameIndex == 2) {
                    await this.game.page.mouse.click(1120, 290);
                    await this.game.waitForTimeout(3000);
                } else if (this.options.isconfig.gameIndex > 2) {
                    for (let index = 1; index < this.options.isconfig.clickCount; index++) {
                        await this.game.page.mouse.click(1180, 290);
                        await this.game.waitForTimeout(3000);
                    }
                    await this.game.waitForTimeout(10000);
                }
            });
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            test.skip(skipTests, "Skipping test Because Instant Play game does not support at this time");
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(settledResults.settlementResult).toMatchBetOptions(this.options.gameConfiguration.choices);
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

        test.describe.serial(`${projectName} - ${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.preCondition();
        this.openInstantGame();
        this.placeBetAndSettleTests();
    }
}
