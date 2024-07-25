import type { Page } from "@playwright/test";
import { expect } from "../expects";
import type { WebSocket as PlaywrightWs } from "playwright-core";
import { GameEvent, waitForMessage, parseSocketPayload, waitForSpecificMessage } from "./../_shared";
import { ssoToGame, getConfig } from "./../auth/auth";
import { ImageLocator, ImageSnapshot } from "./base-image-locator";
import { GameConfiguration } from "./game-configuration";
import { createWorker } from "tesseract.js";
import { baseLocatorNames } from "./base-game-locator";
import * as accounts from "../auth/configs/config.account";
import * as numberGameLocator from "./base-number-game-locator";
import fs from "fs";
const PNG = require("pngjs").PNG;

export class BaseGame {
    readonly BetBoardPostfix: string = "BetBoard";

    readonly page: Page;
    readonly locators: Array<ImageLocator>;
    readonly gameConfiguration: GameConfiguration;
    readonly device: any;

    msgpack: boolean;
    gameSocket: PlaywrightWs;
    capturedEvents: any;
    odds: any = null;
    gameConfigs: any = null;

    constructor(page: Page, locators: Array<ImageLocator>, gameConfiguration: GameConfiguration, device?: any) {
        this.page = page;
        this.locators = locators;
        this.gameConfiguration = gameConfiguration;
        this.capturedEvents = {};
        this.device = device;
    }

    async swipeLocator(fromLocator: string, toLocator: string): Promise<void> {
        const flo = (await this.page.locator(fromLocator).boundingBox()) || { x: 0, y: 0, width: 0, height: 0 };
        const tlo = (await this.page.locator(toLocator).boundingBox()) || { x: 0, y: 0, width: 0, height: 0 };
        const cen1 = { x: flo.x + flo.width / 2, y: flo.y + flo.height / 2 };
        const cen2 = { x: tlo.x + tlo.width / 2, y: tlo.y + tlo.height / 2 };
        await this.device.input.swipe({ x: cen1.x, y: cen1.y }, [{ x: cen2.x, y: cen2.y }], 1);
    }

    async swipePos(fromPos: Pos, toPos: Pos): Promise<void> {
        await this.device.input.swipe({ x: fromPos.x, y: fromPos.y }, [{ x: toPos.x, y: toPos.y }], 1);
    }

    async login() {
        const env = (process.env.npm_config_env ?? "local").toLowerCase();
        const projectCode = process.env.npm_config_project ?? "l1";
        let account: string;
        if (env.includes("local")) {
            account = this.gameConfiguration.accounts[env];
        } else {
            account = projectCode != "ultra888" ? accounts[`${projectCode}${env}`][this.gameConfiguration.id] : this.gameConfiguration.id;
        }
        const startTime = performance.now(); // Measure start time
        await ssoToGame(this.page, this.gameConfiguration.id, account, this.gameConfiguration.productId[projectCode], env, projectCode);
        this.msgpack = getConfig().enabledMsgPack;
        this.page.on("websocket", async (ws) => {
            if (!ws.url().includes("notification")) {
                this.gameSocket = ws;

                ws.on("framereceived", async (msg: any) => {
                    const { payload } = msg ?? "";

                    if (this.odds === null && payload.includes(GameEvent.GameConfig)) {
                        const ingameResponse = parseSocketPayload(payload, this.msgpack).message;
                        this.odds = ingameResponse.gameConfigs?.odds || ingameResponse.odds;
                        this.gameConfigs = ingameResponse.gameConfigs;
                    }

                    Object.keys(this.capturedEvents)?.forEach((event) => {
                        if (payload.includes(event)) {
                            this.capturedEvents[event] = parseSocketPayload(payload, this.msgpack).message;
                        }
                    });
                });
            }
        });

        await this.logConsole();
        if (this.gameConfiguration.id === 0) {
            await this.waitUntilGameLobbyUiLoad();
        } else {
            switch (projectCode) {
                case "gn":
                    await this.waitUntilXdGameUiLoad();
                    break;
                default:
                    if (projectCode.includes("mobi") || projectCode.includes("keno")) {
                        await this.waitUntilMobiGameUiLoad(projectCode);
                    } else if (!projectCode.includes("is")) {
                        await this.waitUntilGameUiLoad();
                    }
                    break;
            }
        }
        const endTime = performance.now(); // Measure end time
        console.log(`Total login time: ${endTime - startTime} ms`);
    }

    async waitUntilGameUiLoad(waitRange: number = 2) {
        await this.page.screenshot({ path: `./test-results/beforeInGame.png` });
        await this.page.waitForTimeout(1000);
        let filterA: string[] = [];
        const searchString = "LoadScene";
        this.page.on("console", (msg) => {
            if (msg.text().includes(searchString) && !msg.text().includes(searchString + " db")) {
                filterA.push(msg.text());
            }
        });

        while (filterA.length < waitRange) {
            await this.page.waitForTimeout(500);
        }
        await this.page.waitForTimeout(1000);
        console.log("Game UI ready for testing");
        await this.page.screenshot({ path: `./test-results/afterInGame.png` });
    }

    async waitUntilMobiGameUiLoad(projectCode: string) {
        if (projectCode.includes("l2")) {
            await this.page.locator("//iframe[@id='frmGame']").waitFor();
        } else {
            await this.page.locator("//div[contains(@class,'games_game-list')]").waitFor();
        }
        console.log("Game UI ready for testing");
        await this.page.screenshot({ path: `./test-results/afterInGame.png` });
    }

    async waitUntilXdGameUiLoad() {
        await this.page.locator(numberGameLocator.commonControls.lblUserName).waitFor();
    }

    async waitUntilGameLobbyUiLoad() {
        let filterA: string[] = [];
        const searchString = "LoadScene Lobby";
        this.page.on("console", (msg) => {
            if (msg.text().includes(searchString)) {
                filterA.push(msg.text());
            }
        });

        while (filterA.length < 1) {
            await this.page.waitForTimeout(3000);
        }
        await this.page.waitForTimeout(3000);
        console.log("GameLobby UI load success");
    }

    async getTextLocator(locatorName: string, whitelist: string = "0123456789/:.", lang: string = "eng") {
        const worker = await createWorker();
        await worker.loadLanguage(lang);
        await worker.initialize(lang);
        await worker.setParameters({
            tessedit_char_whitelist: whitelist,
        });

        const buffer = await this.capture(locatorName);
        const {
            data: { text },
        } = await worker.recognize(buffer.image);
        await worker.terminate();
        return text;
    }

    attachSocketAndCaptureEvent(event: string) {
        this.capturedEvents[event] = "";
    }

    latestCaptureEvent(event: string): any | undefined {
        const message = this.capturedEvents[event];
        delete this.capturedEvents[event];

        return message;
    }

    private getGameName(subGameName?: string): string {
        return subGameName ?? this.gameConfiguration.name;
    }

    async waitForEvent(event: string, subGameName?: string): Promise<any> {
        return await waitForMessage(this.gameSocket, event, this.getGameName(subGameName), this.msgpack);
    }

    async waitForSpecificEvent(validate: Function, subGameName?: string): Promise<any> {
        return await waitForSpecificMessage(this.gameSocket, validate, this.getGameName(subGameName), this.msgpack);
    }

    async waitUntilNextRound(subGameName?: string): Promise<any> {
        this.capturedEvents[GameEvent.WinStatus] = "";

        return await this.waitForEvent(GameEvent.StartRound, subGameName);
    }

    async waitUntilPlaceBet(subGameName?: string): Promise<void> {
        await this.waitForEvent(GameEvent.StartPlaceBet, subGameName);
        await this.waitForTimeout(4000);
    }

    async gnWaitUntilPlaceBet(timeout = 3000): Promise<void> {
        const odds = await this.waitForEvent(GameEvent.Odds);
        await this.waitForEvent(GameEvent.StartPlaceBet);
        await this.waitForTimeout(timeout);
        return odds.odds;
    }

    async waitForEndBet(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.EndBet, subGameName);
    }

    async waitForDeal(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.Deal, subGameName);
    }

    async waitForEndDeal(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.EndDeal, subGameName);
    }

    async waitForStandBet(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.Stand, subGameName);
    }

    async waitForSettlement(subGameName?: string): Promise<any> {
        const message = await this.waitForEvent(GameEvent.Settlement, subGameName);
        await this.page.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement
        const winningByChoice = this.latestCaptureEvent(GameEvent.WinStatus);

        let settledResults = {
            settlementResult: message?.finish?.settlementResult,
            odds: this.odds,
            winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
            roundId: message.finish.roundId || 0,
        };
        if (this.gameConfiguration.slotsgame) {
            settledResults["winAmount"] = message?.finish?.betWin ?? 0;
        } else {
            settledResults["winAmount"] = winningByChoice.status.win ? winningByChoice.status.bet : 0;
        }
        return settledResults;
    }

    async gnWaitForSettlement(subGameName?: string): Promise<any> {
        let winningByChoice = this.latestCaptureEvent(GameEvent.WinStatus);
        const message = await this.waitForEvent(GameEvent.Settlement, subGameName);
        if (!winningByChoice) {
            winningByChoice = await this.waitForEvent(GameEvent.WinStatus);
        }

        let settledResults = {
            settlementResult: message?.finish?.settlementResult,
            roundId: message.finish.roundId || 0,
            drawId: message.finish.drawId || 0,
            winStatus: typeof winningByChoice == "object" ? winningByChoice.status.win : "",
            winAmount: winningByChoice.status.win ? winningByChoice.status.bet : 0,
            result: message.finish.result,
            pf: message.finish.pf,
        };

        return settledResults;
    }

    async waitForTimeout(time = 5000): Promise<void> {
        await this.page.waitForTimeout(time);
    }

    async capture(locatorName: string): Promise<ImageSnapshot> {
        const locator = this.locator(locatorName);

        return locator ? await locator.snapshot(this.page) : Promise.resolve({ name: "", image: Buffer.from("") });
    }

    async captureDealer(): Promise<ImageSnapshot> {
        return this.capture("dealer");
    }

    async captureChoice(choice: string): Promise<ImageSnapshot> {
        return this.capture(`${choice}Choice`);
    }

    async captureOwnbet(choice: string): Promise<ImageSnapshot> {
        return this.capture(`${choice}Ownbet`);
    }

    async captureHistory(): Promise<ImageSnapshot> {
        return this.capture(`historyPopup`);
    }

    async captureLocator(locator: string): Promise<ImageSnapshot> {
        return this.capture(locator);
    }

    async clickToChoice(choice: string): Promise<void> {
        const postfix = this.gameConfiguration.betBoard ? this.BetBoardPostfix : "";
        await this.clickLocator(`${choice}Choice${postfix}`, 0);
    }

    async clickToSlotsChoice(choice: string): Promise<void> {
        await this.clickLocator("choiceMenu", 2000);
        await this.clickLocator("clearChoices", 2000);
        await this.clickLocator(`${choice}Choice`, 3500);
        await this.clickLocator("submitPayline");
    }

    async clickLocator(element: string, wait = 500): Promise<void> {
        const locator = this.locator(element);
        if (locator) {
            await locator.click(this.page);
            await this.waitForTimeout(wait);
        }
    }

    locator(name: string): ImageLocator | undefined {
        return this.locators.find((x) => x.name === name);
    }

    async clickHistory(waitTime: number = 800): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(baseLocatorNames.mnuHamburger);
        const historyMenu = this.locator("historyMenu") || this.locator(baseLocatorNames.icoHistory);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
        if (historyMenu) {
            await historyMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
    }

    async clickJackpot(waitTime: number = 500): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(baseLocatorNames.mnuHamburger);
        const jackpotMenu = this.locator("jackpotMenu") || this.locator(baseLocatorNames.icoJackpot);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
        if (jackpotMenu) {
            await jackpotMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
    }

    async clickHome(waitTime: number = 1000, btnhome: string): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(baseLocatorNames.mnuHamburger);
        const btnHome = this.locator("btnHome") || this.locator(btnhome);

        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(waitTime);
        }
        if (btnHome) {
            await btnHome.click(this.page);
        }
    }

    async clickGuide(waitTime: number = 500, isJP: boolean = false): Promise<void> {
        const hamburgerMenu = this.locator("hamburgerMenu") || this.locator(baseLocatorNames.mnuHamburger);
        let guideMenu = this.locator("guideMenu") || this.locator(baseLocatorNames.icoGuide);
        if (isJP) {
            guideMenu = this.locator(baseLocatorNames.icoGuideJP);
        }
        if (hamburgerMenu) {
            await hamburgerMenu.click(this.page);
            await this.waitForTimeout(500);
        }

        if (guideMenu) {
            await guideMenu.click(this.page);
            await this.page.waitForLoadState("load");
            await this.waitForTimeout(waitTime);
        }
    }

    async getGuideContent() {
        await this.page.locator("iframe").waitFor();
        await this.page.frameLocator("iframe").locator("id=container-guide").waitFor();
        const getguidecontent = this.page.frameLocator("iframe").locator("id=container-guide").innerText();
        return getguidecontent;
    }

    async captureErrorMessage(): Promise<ImageSnapshot> {
        return this.capture(`errorMessage`);
    }

    async captureErrorBetLimit(): Promise<ImageSnapshot> {
        return this.capture(`msgMaxbetLimit`);
    }

    async clickStake(amount: number = 1): Promise<void> {
        await this.locator(`stake${amount}`)?.click(this.page);
    }

    async clickStand(): Promise<void> {
        await this.waitForTimeout(6000);
        await this.clickLocator("standcard", 0);
    }

    async clickSlotsStake(amount: number = 1): Promise<void> {
        await this.clickLocator("stakeMenu");
        await this.waitForTimeout(500);
        await this.clickLocator(`stake${amount}`);
    }

    async clickSubmitBet(): Promise<void> {
        await this.waitForTimeout(500);

        let submitButton = this.locator(`submit${this.BetBoardPostfix}`);
        let spinButton = this.locator("spin") || this.locator(baseLocatorNames.btnSpin);

        if (submitButton) {
            await submitButton.click(this.page);
        } else if (spinButton) {
            await spinButton.click(this.page);
        } else {
            await this.locator("hitcard")?.click(this.page);
        }
    }

    async clickOutSide(timeout = 500): Promise<void> {
        const locator = this.locator("outside") || this.locator(baseLocatorNames.btnClosePopup);
        if (locator) {
            await locator.click(this.page);
        }
        await this.waitForTimeout(timeout);
    }

    async mouseDragDrop(from: Pos, to: Pos): Promise<void> {
        const { x: fromX, y: fromY } = from;
        const { x: toX, y: toY } = to;

        await this.page.mouse.move(fromX, fromY);
        await this.page.mouse.down();
        await this.page.waitForTimeout(500);
        await this.page.mouse.move(toX, toY);
        await this.page.waitForTimeout(1000);
        await this.page.mouse.up();
    }

    async mouseWhell(to: Pos): Promise<void> {
        const { x, y } = to;
        await this.page.mouse.wheel(x, y);
    }

    async getCountFrameLocator(locator: string) {
        const countframecocos2 = await this.page.frameLocator("iframe").locator(locator).count();
        const returnvalue =
            countframecocos2 == 0
                ? await this.page.frameLocator("iframe").frameLocator("#webview").locator(locator).count()
                : countframecocos2;
        return returnvalue;
    }

    async keyboardPress(key: string) {
        return this.page.keyboard.press(key);
    }

    async logConsole() {
        this.page.on("console", (msg) => {
            if (msg.text().length < 3) {
                global.logMsg.push(msg.text());
            }
            console.log(msg.text());
        });
    }

    async waitForFreeSpin(settledResults: any) {
        const totalFreeSpin = settledResults.settlementResult?.freeSpins?.count ?? 0;

        for (let index = 0; index < totalFreeSpin; index++) {
            const newSettledResults = await this.waitForSettlement();
            await this.waitForFreeSpin(newSettledResults);
        }
    }

    async detectImageLocation(bigImagePath: string, smallImagePath: string, threshold: number = 10) {
        try {
            const [bigImage, smallImage] = await Promise.all([loadImage(bigImagePath) as any, loadImage(smallImagePath) as any]);

            const bigWidth = bigImage.width;
            const bigHeight = bigImage.height;
            const smallWidth = smallImage.width;
            const smallHeight = smallImage.height;

            // Iterate over the big image to find differences with the small image
            for (let y = 0; y < bigHeight - smallHeight; y++) {
                for (let x = 0; x < bigWidth - smallWidth; x++) {
                    let match = true;

                    // Compare the pixels of the small image with the corresponding region of the big image
                    for (let j = 0; j < smallHeight; j++) {
                        for (let i = 0; i < smallWidth; i++) {
                            const bigIndex = (bigWidth * (y + j) + (x + i)) << 2;
                            const smallIndex = (smallWidth * j + i) << 2;

                            // Compare RGBA values with the threshold
                            if (
                                !comparePixels(
                                    [
                                        bigImage.data[bigIndex],
                                        bigImage.data[bigIndex + 1],
                                        bigImage.data[bigIndex + 2],
                                        bigImage.data[bigIndex + 3],
                                    ],
                                    [
                                        smallImage.data[smallIndex],
                                        smallImage.data[smallIndex + 1],
                                        smallImage.data[smallIndex + 2],
                                        smallImage.data[smallIndex + 3],
                                    ],
                                    threshold,
                                )
                            ) {
                                match = false;
                            }
                        }
                    }

                    if (match) {
                        return { x: x + smallWidth / 2, y: y + smallHeight / 2 };
                    }
                }
            }

            console.log("Small image not found in the big image.");
            return null;
        } catch (error) {
            console.error("Error occurred while loading images:", error);
            return null;
        }
    }

    async click(locator: string, waittime = 500) {
        await this.page.locator(locator).waitFor({ state: "visible" });
        await this.page.locator(locator).first().click();
        await this.waitForTimeout(waittime);
    }

    async verifyImageLocators(expectSnapshot: object) {
        for (const key in expectSnapshot) {
            await expect(this.page.locator(key), { message: `${key} does not match expected screenshot` }).toHaveScreenshot(
                expectSnapshot[key],
                { animations: "disabled" },
            );
        }
    }

    async verifyValueLocators(expectedValue?: object) {
        for (const key in expectedValue) {
            expect(await this.page.locator(key).innerText(), { message: `${key} does not have text ${expectedValue}` }).toBe(
                expectedValue[key],
            );
        }
    }

    async verifyLocatorsVisible(locators: string[]) {
        for (const locator of locators) {
            expect(await this.page.locator(locator).isVisible(), { message: `${locator} is not visible` }).toBe(true);
        }
    }

    async verifyFrameLocatorsVisible(frame: string, locators: string[]) {
        const iframe = await this.page.frameLocator(frame);
        for (const locator of locators) {
            expect(await iframe.locator(locator).isVisible(), { message: `${locator} is not visible` }).toBe(true);
        }
    }

    async textLocatorShouldBe(locator: string, expectedValue: string) {
        await expect(this.page.locator(locator), { message: `${locator} does not have text ${expectedValue}` }).toHaveText(
            expectedValue.toString(),
        );
    }

    async getText(locator: string, datatype: string = "innerText") {
        if (datatype == "innerHTML") {
            return await this.page.locator(locator).innerHTML();
        } else {
            return await this.page.locator(locator).innerText();
        }
    }

    async verifyDateTimeFormat(locator: string) {
        const isTrue = isDateTimeFormat(await this.getText(locator));
        expect(isTrue).toBeTruthy();
    }
}

function loadImage(path: string) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path)
            .pipe(new PNG())
            .on("error", reject)
            .on("parsed", function (this: any) {
                resolve(this); // Pass the PNG instance to resolve
            });
    });
}

function comparePixels(pixel1: number[], pixel2: number[], threshold: number): boolean {
    const [r1, g1, b1, a1] = pixel1;
    const [r2, g2, b2, a2] = pixel2;

    // Calculate the difference between RGBA values
    const diffR = Math.abs(r1 - r2);
    const diffG = Math.abs(g1 - g2);
    const diffB = Math.abs(b1 - b2);
    const diffA = Math.abs(a1 - a2);

    // Compare the differences with the threshold
    return diffR <= threshold && diffG <= threshold && diffB <= threshold && diffA <= threshold;
}

export interface Pos {
    x: number;
    y: number;
}

export function isDateTimeFormat(dateString: string) {
    // Regular expression for "hh:mm:ss dd/mm/yyyy" format
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]\s(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/(19|20)\d\d$/;

    // Test the date string against the regex
    return regex.test(dateString);
}
