import { test as base } from "@playwright/test";
import { ImageLocator } from "./base-image-locator";
import { GameConfiguration } from "./game-configuration";
import { BaseGame } from "./base-game";
import { _android as android } from "playwright";
global.logMsg = [];
global.ssoLink;

type BaseFixtures = {
    gameConfigurations: GameConfiguration;
    locators: Array<ImageLocator>;
    baseGame: BaseGame;
    device: any;
};

export const test = base.extend<BaseFixtures>({
    gameConfigurations: new GameConfiguration(),
    locators: new Array<ImageLocator>(),
    baseGame: async ({ browser, locators, gameConfigurations }, use) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        if (process.env.npm_config_android) {
            const [device] = await android.devices();
            console.log(`Model: ${device.model()} - Serial: ${device.serial()}`);
            const browser = await device.launchBrowser();
            const [page] = browser.pages();
            const game = new BaseGame(page, locators, gameConfigurations, device);
            await game.login();
            await use(game);
        } else {
            try {
                const game = new BaseGame(page, locators, gameConfigurations);
                await game.login();
                await use(game);
            } catch (error) {
                throw new Error(`************ Login member site failed ********** ${error}`); // Explicitly fail the test
            }
        }
    },
});

test.beforeEach(async ({}, testInfo) => {
    testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;
});

test.afterAll(async ({ browser }) => {
    await browser.close();
});
