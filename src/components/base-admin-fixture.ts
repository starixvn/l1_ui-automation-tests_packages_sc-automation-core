import { test as base } from "@playwright/test";
import { ImageLocator } from "./base-image-locator";
import { GameConfiguration } from "./game-configuration";
import { BaseGame } from "./base-game";
import { BaseAdmin } from "./base-admin";
global.logMsg = [];

type AdminBaseFixtures = {
    gameConfigurations: GameConfiguration;
    locators: Array<ImageLocator>;
    baseGame: BaseGame;
    baseAdmin: BaseAdmin;
};

export const test = base.extend<AdminBaseFixtures>({
    gameConfigurations: new GameConfiguration(),

    locators: new Array<ImageLocator>(),

    baseGame: async ({ browser, locators, gameConfigurations }, use) => {
        const page = await browser.newPage();
        const game = new BaseGame(page, locators, gameConfigurations);
        await game.login();
        await use(game);
    },

    baseAdmin: async ({ browser, gameConfigurations }, use) => {
        const adminpage = await browser.newPage();
        const admin = new BaseAdmin(adminpage, gameConfigurations);
        await admin.login()
        await use(admin);
    },
});

test.beforeEach(async ({}, testInfo) => {
    testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;
});

test.afterAll(async ({ browser }) => {
    await browser.close();
});
