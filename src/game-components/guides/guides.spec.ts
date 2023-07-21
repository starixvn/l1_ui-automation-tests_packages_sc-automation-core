import { test, BaseGame, BaseElementLocator, ImageSnapshot } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "./guides-locators";
export class GameGuides {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests(timeout: number) {
        test(`AND player could open guide and clarify appropriate content`, async () => {
            // Arrange
            test.setTimeout(timeout);
            await test.step("Open game guide", async () => {
                await this.game.clickGuide(3000);
            });

            // Act
            let guideContents;
            await test.step("Get guide content", async () => {
                guideContents = await this.captureGuideContent();
            });

            // Assert
            await test.step("Verify guide content", async () => {
                guideContents.forEach((content) => {
                    expect(content.image).toMatchSnapshot(content.name);
                });
            });

            //Post-Act
            await test.step("Click outside to close game guide", async () => {
                this.game.clickOutSide(1000);
            });
        });
    }

    async captureGuideContent(): Promise<ImageSnapshot[]> {
        const images = new Array<ImageSnapshot>();
        const guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);

        for (let index = 1; index <= guidepages; index++) {
            const contentFrame = new BaseElementLocator(`guide-${index}`, `${GuideLocator.xpathItem}[${index}]`);
            const contentImage = await contentFrame.snapshot(this.game.page);

            images.push(contentImage);
        }

        return images;
    }
}
