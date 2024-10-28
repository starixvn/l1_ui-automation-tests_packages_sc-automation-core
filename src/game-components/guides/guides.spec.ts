import { Page } from "@playwright/test";
import { formatScreenshotFile } from "../../_shared";
import { test, BaseGame } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "./guides-locators";
import verifyImage from "../../expects/verify-image";
const isJackpot = process.env.npm_config_jackpot ? true : false

export class GameGuides {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests(timeout: number) {
        test(`Verify that player could open guide and clarify appropriate content @Guide`, async () => {
            // Arrange
            test.setTimeout(timeout);
            await test.step("Open game guide", async () => {
                await this.game.clickGuide(10000, isJackpot);
            });

            // Act
            await test.step("Verify guide content", async () => {
                await this.captureGuideContent();
            });

            //Post-Act
            await test.step("Click outside to close game guide", async () => {
                await this.game.clickOutSide(2000);
            });
        });
    }

    async captureGuideContent() {
        let guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);
        if (guidepages == 0){ //reopen guide if guide hasn't been load
            await this.game.clickOutSide(2000);
            await this.game.clickGuide(10000, isJackpot);
            guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);
        }
        expect(guidepages).toBeGreaterThan(0);
        for (let index = 1; index <= guidepages; index++) {
            const filename = isJackpot == true ? `guide-JP-${index}` : `guide-${index}`
            const element = `${GuideLocator.xpathItem}[${index}]`;
            await this.snapshot(this.game.page, filename, element);
            await verifyImage(this.game, filename, 0.03)
        }

    }

    async snapshot(page: Page, name : string, element: string) {
        //const imageName = formatName(name);
        let root:any = page;
        if (await page.frameLocator('#frmGame').frameLocator('#microsite').frameLocator('#webview').locator(`${GuideLocator.xpathItem}[1]`).isVisible()){
            root =  page.frameLocator('#frmGame').frameLocator('#microsite').frameLocator('#webview');
        } 
        else if (await page.frameLocator('#frmGame').frameLocator('iframe').locator(`${GuideLocator.xpathItem}[1]`).isVisible()){
            root = page.frameLocator('#frmGame').frameLocator('iframe');
        }          
        else if (await page.frameLocator("iframe").frameLocator("#webview").locator(`${GuideLocator.xpathItem}[1]`).isVisible()){
            root = page.frameLocator("iframe").frameLocator("#webview")
        }
        else {
            root = page.frameLocator("iframe")
        }
        await root.locator(element).screenshot({ path: formatScreenshotFile(name)});
    }
}
