import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
const projectName = process.env.npm_config_project?.includes("l1")? "SG" : process.env.npm_config_project?.includes("l2")? "VG" : process.env.npm_config_project;

export class ISGameBase {
    protected game: BaseGame;
    protected player: BasePlayer;

    constructor(protected options: IBaseOptions) {}

    protected preCondition() {
        test("preCondition is instant games offered", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const currentUrl = this.game.page.url();
            const url = new URL(currentUrl);
            const domain = url.hostname;
            await this.game.page.goto('https://'+domain+'/#Sports/s=1_0&d=l')
            await this.game.page.reload()
            await this.game.page.waitForLoadState('domcontentloaded')
            await this.game.waitForTimeout(5000);
            const isPromotionPopup = await this.game.page.locator("//div[contains(@class,'promo-highlight__btn')]/label").count();
            if (isPromotionPopup>0) {
              await this.game.page.locator("//div[contains(@class,'promo-highlight__btn')]/label").click();
              await this.game.page.locator("//div[contains(@class,'promo-highlight__btn')]/a").click();
              await this.game.waitForTimeout(1000);
              await this.game.page.locator("//div[@id='dialogMessage']//a").click();
            }
        });
    }

    protected openInstantGame(): void {
        test(`Smoke Tests ${this.options.gameConfiguration.name}`, async () => {
            await this.game.click(this.options.locators.gameIcon)
            await this.game.waitUntilGameUiLoad(1)
            await this.game.waitForTimeout(3000)
            await this.game.page.frameLocator('iframe').first().locator('#GameCanvas').scrollIntoViewIfNeeded()
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {           // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const choice = this.options.placeBetChoices[0]
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            await this.game.waitUntilPlaceBet()
            await this.game.page.frameLocator('iframe').locator('#GameCanvas').click({position:{x: this.options.locators[choice]["x"],y: this.options.locators[choice]["y"]}})
            // Act
            const settledResults = await this.game.waitForSettlement();

            // Assert
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
            locators: [this.options.locators],
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
