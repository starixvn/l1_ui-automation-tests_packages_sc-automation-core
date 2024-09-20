import { Page } from "@playwright/test";
import { formatName, formatScreenshotFile } from "../../_shared";
import { test, BaseGame, ImageSnapshot } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "./guides-locators";
const isJackpot = process.env.npm_config_jackpot ? true : false
const projectCode = process.env.npm_config_project ?? "l1"

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
                await this.game.clickGuide(4000, isJackpot);
            });

            // Act
            let guideContents;
            await test.step("Get guide content", async () => {
                guideContents = await this.captureGuideContent();
            });

            // Assert
            await test.step("Verify guide content", async () => {
                guideContents.forEach((content) => { 
                    expect(content.image).toMatchSnapshot(content.name, {maxDiffPixelRatio:0.05});
                });
            });

            //Post-Act
            await test.step("Click outside to close game guide", async () => {
                await this.game.clickOutSide(2000);
            });
        });
    }

    async captureGuideContent(): Promise<ImageSnapshot[]> {
        const images = new Array<ImageSnapshot>();
        const guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);
        expect(guidepages).toBeGreaterThan(0);
        for (let index = 1; index <= guidepages; index++) {
            const filename = isJackpot == true ? `guide-JP-${index}` : `guide${projectCode}-${index}`
            const element = `${GuideLocator.xpathItem}[${index}]`;
            const contentImage = await this.snapshot(this.game.page, filename, element);
            images.push(contentImage);
        }

        return images;
    }

    async snapshot(page: Page, name : string, element: string): Promise<ImageSnapshot> {
        const imageName = formatName(name);
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
        const image = await root.locator(element).screenshot({ path: formatScreenshotFile(name) });

        return { name: imageName, image };
    }
}
