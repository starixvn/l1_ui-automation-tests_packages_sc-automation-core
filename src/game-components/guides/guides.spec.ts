import { Page } from "@playwright/test";
import { formatScreenshotFile } from "../../_shared";
import { test, BaseGame } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "./guides-locators";
import verifyImage from "../../expects/verify-image";

export class GameGuides {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests(timeout: number, isJackpot: boolean = false, extName: string = "") {
        test(`Verify that player could open guide and clarify appropriate content @Guide`, async () => {
            // Arrange
            test.setTimeout(timeout);
            await test.step("Open game guide", async () => {
                await this.game.openGuide(10000, isJackpot);
            });

            // Act
            await test.step("Verify guide content", async () => {
                await this.captureGuideContent(isJackpot,extName);
            });

            //Post-Act
            await test.step("Click outside to close game guide", async () => {
                await this.game.clickOutSide(2000);
            });
        });
    }

    cocosTests(timeout: number, locators: any ,isJackpot: boolean = false,projectCode: string = "") {
        test(`Verify that player could open guide and clarify appropriate content @Guide`, async () => {
            // Arrange
            test.setTimeout(timeout);
            await test.step("Open game guide", async () => {
                const isGuideVisible = await this.game.isCocosLocatorExists(locators.btnguide);
                if(!isGuideVisible) {
                    await this.game.clickCocos(locators.btnMenu);
                    await this.game.waitForTimeout(2000);
                }
                await this.game.clickCocos(locators.btnguide,10000);
            });

            // Act
            await test.step("Verify guide content", async () => {
                await this.verifyGuideContent(isJackpot,projectCode);
            });

            //Post-Act
            await test.step("Click outside to close game guide", async () => {
                await this.game.clickCocos(locators.btnCloseGuide,2000);
            });
        });
    }

    cocosTestsPFguide(timeout: number, locators: any ) {
        test(`Verify that player could open PF guide and clarify appropriate content @Guide`, async () => {
            // Arrange
            test.setTimeout(timeout);
            await test.step("Open PF popup", async () => {
                const isGuideVisible = await this.game.isCocosLocatorExists(locators.btnPfSetting);
                if(!isGuideVisible) {
                    await this.game.clickCocos(locators.btnMenu);
                    await this.game.waitForTimeout(2000);
                }
                await this.game.clickCocos(locators.btnPfSetting, 2000);
            });

            await test.step("Open PF guide", async () => {
                await this.game.clickCocos(locators.iconPFGuideSetting, 10000);
            });

            // Act
            await test.step("Verify guide content", async () => {
                await this.verifyGuidePFContent();
            });

            //Post-Act
            await test.step("Close PF guide", async () => {
                await this.game.clickCocos(locators.btnClosePFGuide, 2000);
            });
        });
    }

    async captureGuideContent(isJackpot: boolean = false, extName: string = "") {
        let guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);
        if (guidepages == 0) {
            //reopen guide if guide hasn't been load
            await this.game.clickOutSide(2000);
            await this.game.openGuide(10000, isJackpot);
            guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);
        }
        expect(guidepages).toBeGreaterThan(0);
        for (let index = 1; index <= guidepages; index++) {
            const filename = isJackpot == true ? `${extName}guide-JP-${index}` : `${extName}guide-${index}`;
            const element = `${GuideLocator.xpathItem}[${index}]`;
            await this.snapshot(this.game.page, filename, element);
            await verifyImage(this.game, filename, 0.05);
        }
    }

    async verifyGuideContent(isJackpot: boolean = false, projectCode: string = "") {
        let guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);
        expect(guidepages).toBeGreaterThan(0);
        
        const root = await this.getRootLocator(this.game.page);
        
        for (let index = 1; index <= guidepages; index++) {
            const filename = isJackpot == true ? `${projectCode}guide-JP-${index}` : `${projectCode}guide-${index}`;
            const element = `${GuideLocator.xpathItem}[${index}]`;
            const elementLocator = root.locator(element);
            
            // Scroll element into view and wait for stability
            await elementLocator.scrollIntoViewIfNeeded();
            await this.game.waitForTimeout(500); // Wait for UI to stabilize after scroll
            
            await expect.soft(elementLocator).toHaveScreenshot(filename+'.png', { 
                maxDiffPixels: 3000,
                maxDiffPixelRatio: 0.3,
                animations: 'disabled'
            });
        }

        await this.game.page.mouse.click(640, 15);
        await this.game.waitForTimeout(1000);
    }

    async verifyGuidePFContent() {
        let guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItemPF);
        expect(guidepages).toBeGreaterThan(0);
        
        const root = await this.getRootLocator(this.game.page);
        
        for (let index = 1; index <= guidepages; index++) {
            const filename = `PF-guide-${index}`;
            const element = `${GuideLocator.xpathItemPF}[${index}]`;
            const elementLocator = root.locator(element);
            
            // Scroll element into view and wait for stability
            await elementLocator.scrollIntoViewIfNeeded();
            await this.game.waitForTimeout(500); // Wait for UI to stabilize after scroll
            
            await expect.soft(elementLocator).toHaveScreenshot(filename+'.png', { 
                maxDiffPixels: 3000,
                maxDiffPixelRatio: 0.3,
                animations: 'disabled'
            });
        }
    }

    async snapshot(page: Page, name: string, element: string) {
        const root = await this.getRootLocator(page);
        await root.locator(element).screenshot({ path: formatScreenshotFile(name) });
    }

    private async getRootLocator(page: Page) {
        try {
            if (
                await page
                    .frameLocator("#frmGame")
                    .frameLocator("#microsite")
                    .frameLocator("#webview")
                    .locator(`${GuideLocator.xpathItem}[1]`)
                    .isVisible()
            ) {
                return page.frameLocator("#frmGame").frameLocator("#microsite").frameLocator("#webview");
            }
        } catch (e) {
            // Continue to next check
        }

        try {
            if (await page.frameLocator("#frmGame").frameLocator("iframe").first().locator(`${GuideLocator.xpathItem}[1]`).isVisible()) {
                return page.frameLocator("#frmGame").frameLocator("iframe").first();
            }
        } catch (e) {
            // Continue to next check
        }

        try {
            if (await page.frameLocator("iframe").first().frameLocator("#webview").locator(`${GuideLocator.xpathItem}[1]`).isVisible()) {
                return page.frameLocator("iframe").first().frameLocator("#webview");
            }
        } catch (e) {
            // Continue to next check
        }

        try {
            if (await page.frameLocator('//iframe[contains(@title,"Gaming")]').first().frameLocator('//iframe[contains(@title,"Game")]').first().frameLocator('#webview').locator(`${GuideLocator.xpathItem}[1]`).isVisible()) {
                return page.frameLocator('//iframe[contains(@title,"Gaming")]').first().frameLocator('//iframe[contains(@title,"Game")]').first().frameLocator('#webview');
            }
        } catch (e) {
            // Continue to next check
        }

        // Try to find the iframe that contains the guide element
        const iframeCount = await page.locator("iframe").count();
        for (let i = 0; i < iframeCount; i++) {
            try {
                const isVisible = await page.frameLocator("iframe").nth(i).locator(`${GuideLocator.xpathItem}[1]`).isVisible();
                if (isVisible) {
                    return page.frameLocator("iframe").nth(i);
                }
            } catch (e) {
                // Continue to next iframe
            }
        }
        
        // Fallback to first iframe
        return page.frameLocator("iframe").first();
    }

}
