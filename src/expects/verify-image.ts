import { expect } from "@playwright/test";

const verifyImage = async (game: any, locatorName: string, maxDiffPixelRatio = 0) => {
    const image = await game.captureLocator(locatorName);
    expect(image.image).toMatchSnapshot(image.name, { maxDiffPixelRatio });
};

export default verifyImage;
