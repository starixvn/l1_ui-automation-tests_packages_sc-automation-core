import { LobbyLocator, UATLocator, PRODLocator, GroupCurrencyLocator, AdminLogin } from "./locators/index";
import { configs } from "./configs/config";
import { Page } from "@playwright/test";
import { createWorker } from "tesseract.js";

export enum Environment {
    LOCAL = "local",
    LOCAL1 = "local1",
    LOCAL2 = "local2",
    LOCAL3 = "local3",
    SIT = "sit",
    UAT = "uat",
    PROD = "prod",
}

export const ssoToGame = async (
    page: Page,
    gameId: number,
    playerId: string,
    productId: string,
    env: string,
    projectCode: string,
): Promise<void> => {
    const config = getConfig();
    const langCode = process.env.npm_config_langCode ?? "vn";
    let ssoLink;
    if (playerId === "" || productId === "") {
        throw new Error(`Missing Test Account or ProductId for game id ${gameId}!!!`);
    }

    if (env.includes("local")) {
        const memberSiteLink = config[`${projectCode}memberSite`] + `?obCustId=${playerId}&balance=200000`;
        const appType = projectCode.includes("mobi") ? 2 : projectCode.includes("keno") ? 4 : 1;
        await page.goto(memberSiteLink);
        console.log("Login Local", memberSiteLink);
        await page.click(LobbyLocator.advancelbl);
        await page.click(`//input[@id=${appType}]`);
        await page.locator(LobbyLocator.langDropdown).selectOption(LobbyLocator[`${langCode}LangOption`]);
        if (projectCode == "gn") {
            const env =
                process.env.npm_config_env == "local" ? "#local-0" : "#local-" + (process.env.npm_config_env ?? "local1").split("").pop();
            await page.click(env);
            await page.waitForTimeout(500);
        }
        await page.click(LobbyLocator.tokenBtn);
        await page.waitForTimeout(500);
        if (projectCode == "gn") {
            ssoLink = (await page.locator("#link-local").textContent()) ?? "";
        } else {
            ssoLink = (await page.locator(LobbyLocator.ssoLink).textContent()) ?? "";
        }
        await page.goto(`${ssoLink.replace("gameId=0", `gameId=${gameId}`)}`);
        global.ssoLink = `${ssoLink.replace("gameId=0", `gameId=${gameId}`)}`;
        const isCurrencyForm = await page.$$("id=currency");
        if (isCurrencyForm.length > 0) {
            await page.click("text=Submit");
        }
    } else {
        await loginMemberSite(page, config, env, playerId, productId, langCode, projectCode, gameId);
    }
};

export const getConfig = (): any => {
    const env = (process.env.npm_config_env ?? Environment.LOCAL).toLowerCase();

    return configs[env];
};

const loginMemberSite = async (
    page: Page,
    config: any,
    env: string,
    playerId: string,
    productId: string,
    langCode: string,
    projectCode: string,
    gameId: number,
) => {
    const timeout = config.lobbyTimeout;
    const memberSiteLink =
        process.env.npm_config_mobile === "true" ? config[`${projectCode}memberSiteMobile`] : config[`${projectCode}memberSite`];
    const pwd = projectCode.includes("l1") ? config["l1pwd"] : projectCode.includes("l2") ? config["l2pwd"] : config[`${projectCode}pwd`];

    const lobbyDomain =
        process.env.npm_config_mobile === "true" ? config[`${projectCode}lobbyDomainMobile`] : config[`${projectCode}lobbyDomain`];
    if (memberSiteLink.includes("@")) {
        // Handle basic authentication popup for desktop membersite
        const username = "demo";
        const password = "one23";
        const authHeader = "Basic " + btoa(username + ":" + password);
        console.log(authHeader);
        await page.setExtraHTTPHeaders({ Authorization: authHeader });
        await page.goto(memberSiteLink.replace("@", ""));
    } else {
        await page.goto(memberSiteLink);
    }

    console.log(`Login ${playerId} - ${gameId} Member Site: ${memberSiteLink}`);
    await page.waitForLoadState("domcontentloaded", { timeout });
    const subPcode = projectCode.match(/^l[12]/)?.[0] ?? "l1";
    switch (env) {
        case Environment.UAT:
            await loginUAT(page, playerId, pwd, langCode, subPcode, timeout);
            break;

        case Environment.PROD:
            await loginPROD(page, playerId, pwd, langCode, subPcode, timeout);
            break;

        default:
            await loginSIT(page, playerId, pwd, subPcode, timeout);
    }
    if (!projectCode.includes("is")) {
        if (projectCode === "ultra888") {
            await goToUltra888GameLobby(page, gameId);
        } else {
            await goToGameLobby(page, lobbyDomain, productId);
        }
        await selectCurrencyGroup(page);
    }
};

const selectCurrencyGroup = async (page: Page) => {
    await page.waitForTimeout(2000);
    global.ssoLink = page.url();
    const frameExists = await page.$("#frmGame");
    if (frameExists) {
        await page.frameLocator("#frmGame").locator(GroupCurrencyLocator.submitButton).click();
    } else {
        await page.locator(GroupCurrencyLocator.submitButton).waitFor();
        await page.click(GroupCurrencyLocator.submitButton);
    }
    await page.waitForLoadState();
};

const loginUAT = async (page: Page, accountId: string, pwd: string, langCode: string, projectCode: string, timeout: number = 15000) => {
    if (projectCode === "l1") {
        if (process.env.npm_config_mobile === "true") {
            await page.setViewportSize({
                width: 340,
                height: 667,
            });
            await page.selectOption(UATLocator.langDropdown, { value: UATLocator.enLangOption });
            await page.fill(PRODLocator.l2memberIdInput, accountId);
            await page.fill(PRODLocator.l2pwdInput, pwd);
            await page.click(PRODLocator.l2loginButton);
            await page.waitForLoadState("networkidle", { timeout: timeout });
            const isCloseExist = await page.$$(PRODLocator.l2iconClose);
            if (isCloseExist.length > 0) {
                await page.click(PRODLocator.l2iconClose);
            }
            await page.click(PRODLocator.l2iconMe);
            await page.click(UATLocator.l2langDropdown);
            await page.click(PRODLocator[`l2${langCode}LangOption`]);
            await page.setViewportSize({
                width: 1280,
                height: 720,
            });
        } else {
            await page.fill("#txtID", accountId);
            await page.fill("#txtPW", pwd);
            await page.click("//button");
            await page.waitForLoadState("load", { timeout });
        }
    }
    if (projectCode === "l2") {
        if (process.env.npm_config_mobile === "true") {
            await page.setViewportSize({
                width: 340,
                height: 667,
            });
            await page.selectOption(UATLocator.langDropdown, { value: UATLocator.enLangOption });
            await page.fill(PRODLocator.l2memberIdInput, accountId);
            await page.fill(PRODLocator.l2pwdInput, pwd);
            await page.click(PRODLocator.l2loginButton);
            await page.waitForLoadState("networkidle", { timeout: timeout });
            const isCloseExist = await page.$$(PRODLocator.l2iconClose);
            if (isCloseExist.length > 0) {
                await page.click(PRODLocator.l2iconClose);
            }
            await page.click(PRODLocator.l2iconMe);
            await page.click(UATLocator.l2langDropdown);
            await page.click(PRODLocator[`l2${langCode}LangOption`]);
            await page.setViewportSize({
                width: 1280,
                height: 720,
            });
        } else {
            await page.click(UATLocator.loginDiv);
            await page.selectOption(UATLocator.langDropdown, { value: UATLocator.vnLangOption });
            await page.fill(UATLocator.memberIdInput, accountId);
            await page.fill(UATLocator.pwdInput, pwd);
            await page.click(UATLocator.loginButton);
            await page.waitForLoadState("load", { timeout });
        }
    }
    if (projectCode === "gn") {
        await page.fill("#txtID", accountId);
        await page.fill("#txtPW", pwd);
        await page.click("//button");
        await page.waitForLoadState("load", { timeout });
        await page.locator("//div[contains(@class,'c-dropdown--lang')]").click();
        await page.locator("//span[contains(text(),'Tiếng Việt')]").click();
        await page.waitForLoadState("load", { timeout });
        await page.waitForTimeout(5000);
    }
};

const loginPROD = async (page: Page, accountId: string, pwd: string, langCode: string, projectCode: string, timeout: number = 15000) => {
    if (projectCode === "l1") {
        if (process.env.npm_config_mobile === "true") {
            // will be implemented later
        } else {
            await page.click(PRODLocator.openLoginFormbtn);
            await page.fill(PRODLocator.usernameInput, accountId);
            await page.fill(PRODLocator.passwordInput, pwd);
            await page.click(PRODLocator.submitLoginbtn);
            await page.waitForLoadState("domcontentloaded");
            await page.waitForTimeout(5000);
            console.log(langCode);
        }
    }
    if (projectCode === "l2") {
        if (process.env.npm_config_mobile === "true") {
            await page.setViewportSize({
                width: 340,
                height: 667,
            });
            await page.goto(configs.prod.l2memberSiteMobile);
            await page.waitForTimeout(3000);
            await page.locator(PRODLocator.l2memberIdInput).waitFor();
            await page.fill(PRODLocator.l2memberIdInput, accountId);
            await page.fill(PRODLocator.l2pwdInput, pwd);
            await page.click(PRODLocator.l2loginButton);
            await page.waitForLoadState("domcontentloaded", { timeout: timeout });
            await page.waitForTimeout(8000);
            const iconSurvey = await page.$$(PRODLocator.l2iconClose);
            if (iconSurvey.length > 0) {
                await page.click(PRODLocator.l2iconClose);
            }
            await page.setViewportSize({
                width: 1280,
                height: 720,
            });
        } else {
            const isSuccess = await loginWithCaptcha(page, accountId, pwd);
            if (!isSuccess) {
                console.log("Retry Login");
                await page.locator("//i[@class='icon-refresh']").click();
                await page.waitForTimeout(5000);
                await loginWithCaptcha(page, accountId, pwd);
            }
            await page.waitForLoadState("domcontentloaded");
            await page.waitForTimeout(2000);
            await page.locator("#sportsFrame").waitFor({ state: "visible" });
            await page.waitForTimeout(5000);
        }
    }
    if (projectCode === "ultra888") {
        const isConfirm = await page.$$(PRODLocator.ultra888popupconfirm);
        if (isConfirm.length > 0) {
            await page.click(PRODLocator.ultra888popupconfirm);
        }
        await page.waitForTimeout(2000);
        await page.selectOption(PRODLocator.ultra888langDropdown, { value: "vn" });
        await page.fill(PRODLocator.ultra888memberIdInput, "01862081667");
        await page.fill(PRODLocator.ultra888pwdInput, "Bb1111");
        await page.click(PRODLocator.ultra888loginButton);
        await page.waitForTimeout(2000);
        await page.waitForLoadState("domcontentloaded", { timeout });
        await page.waitForTimeout(10000);
    }
    if (projectCode === "gn") {
        await page.click(PRODLocator.openLoginFormbtn);
        await page.fill(PRODLocator.usernameInput, accountId);
        await page.fill(PRODLocator.passwordInput, pwd);
        await page.click(PRODLocator.submitLoginbtn);
        await page.waitForLoadState();
        await page.waitForTimeout(5000);
    }
};

const loginSIT = async (page: Page, accountId: string, pwd: string, projectCode: string, timeout: number = 15000) => {
    if (projectCode === "l1") {
        if (process.env.npm_config_mobile === "true") {
            await page.setViewportSize({ width: 340, height: 667 });
            await page.click(UATLocator.loginDiv);

            await page.selectOption(UATLocator.langDropdown, { value: UATLocator.vnLangOption });
            await page.fill(UATLocator.memberIdInput, accountId);
            await page.fill(UATLocator.pwdInput, pwd);
            await page.click(UATLocator.loginButton);
            await page.waitForLoadState("networkidle", { timeout: timeout });
            const isCloseExist = await page.$$(PRODLocator.l2iconClose);
            if (isCloseExist.length > 0) {
                await page.click(PRODLocator.l2iconClose);
            }
            await page.setViewportSize({
                width: 1280,
                height: 720,
            });
        } else {
            // be implemented later
        }
    }
    if (projectCode === "l2") {
        if (process.env.npm_config_mobile === "true") {
            // be implemented later
        } else {
            await page.waitForLoadState("domcontentloaded", { timeout: timeout });
            await page.locator(PRODLocator.usernameInput).waitFor();
            await page.waitForTimeout(3000);
            await page.fill(PRODLocator.usernameInput, accountId);
            await page.fill(PRODLocator.passwordInput, pwd);
            let capcha = await getCaptcha(page);
            console.log("capcha", capcha);
            await page.fill("id=validation", capcha);
            await page.click(`//*[@data-tag="tabBtn"]`);
            await page.waitForTimeout(2000);
            const isElementVisible = await page.isVisible('//*[@class="hint-absolute"]');
            if (isElementVisible) {
                await page.locator("//i[@class='icon-refresh']").click();
                await page.waitForTimeout(5000);
                await page.fill(PRODLocator.usernameInput, accountId);
                await page.fill(PRODLocator.passwordInput, pwd);
                capcha = await getCaptcha(page);
                await page.fill("id=validation", capcha);
                await page.click(`//*[@data-tag="tabBtn"]`);
            }
            await page.waitForTimeout(20000);
        }
    }
    if (projectCode === "gn") {
        await page.fill("#txtID", accountId);
        await page.fill("#txtPW", pwd);
        await page.click("//button");
        await page.waitForLoadState("load", { timeout });
        await page.locator("//div[contains(@class,'c-dropdown--lang')]").click();
        await page.locator("//span[contains(text(),'Tiếng Việt')]").click();
        await page.waitForLoadState("load", { timeout });
        await page.waitForTimeout(5000);
    }
};

const goToUltra888GameLobby = async (page: Page, productId: any, timeout = 15000) => {
    const ultra888MapGameIds = {
        2: `//*/div[contains(@style,"Vgaming_SeDie.")]/parent::div`,
        10: `//*/div[contains(@style,"Vgaming_Baccarat")]/parent::div`,
        21: `//*/div[contains(@style,"Vgaming_Roulette")]/parent::div`,
        23: `//*/div[contains(@style,"Vgaming_Blackjack")]/parent::div`,
        25: `//*/div[contains(@style,"Vgaming_SicBo")]/parent::div`,
        26: `//*/div[contains(@style,"Vgaming_VIPFishPrawnCrab")]/parent::div`,
        28: `//*/div[contains(@style,"Vgaming_SeDieWar")]/parent::div`,
        31: `//*/div[contains(@style,"Vgaming_RNGLottery")]/parent::div`,
        35: `//*/div[contains(@style,"Vgaming_ThreeCards")]/parent::div`,
        39: `//*/div[contains(@style,"Vgaming_CasinoHold'emPoker")]/parent::div`,
        42: `//*/div[contains(@style,"Vgaming_TexasHold'emPoker")]/parent::div`,
        52: `//*/div[contains(@style,"Vgaming_MegaKeno")]/parent::div`,
        59: `//*/div[contains(@style,"Vgaming_FruitSlot")]/parent::div`,
        60: `//*/div[contains(@style,"Vgaming_FanTan")]/parent::div`,
        61: `//*/div[contains(@style,"Vgaming_WinThreeCards")]/parent::div`,
    };
    await page.click(`//*/div[contains(@class,"table")]`);
    await page.waitForTimeout(3000);
    await page.waitForLoadState("load", { timeout });
    console.log("productId", productId, ultra888MapGameIds[productId]);
    await page.click(ultra888MapGameIds[productId]);
    await page.waitForLoadState("load", { timeout });
};

const goToGameLobby = async (page: Page, lobbyDomain: string, productId: string, timeout: number = 15000) => {
    await page.goto(formatGameLobbyUrl(page.url(), lobbyDomain, productId));
    await page.waitForLoadState("load", { timeout });
};

const formatGameLobbyUrl = (url: string, lobbyDomain: string, productId: string): string => {
    const domain = url.split("/");
    if (url.includes("athena") || url.includes("qa") || url.includes("/m.")) {
        return `http://${domain[2]}/${lobbyDomain}${productId}`;
    } else return `https://${domain[2]}/${lobbyDomain}${productId}`;
};

export const loginAdmin = async (page: Page, projectCode: string) => {
    const config = getConfig();
    const timeout = config.lobbyTimeout;
    const adminLink = config[`${projectCode}admin`];
    const admin = { username: "admauto", pwd: "admauto" };
    await page.goto(adminLink);
    await page.waitForLoadState("domcontentloaded", { timeout });
    await page.fill(AdminLogin.usernameInput, admin.username);
    await page.fill(AdminLogin.pwdInput, admin.pwd);
    await page.click(AdminLogin.loginButton);
    await page.waitForLoadState("domcontentloaded", { timeout });
};

const getTextLocator = async (img: any, whitelist: string = "0123456789", lang: string = "eng") => {
    const worker = await createWorker();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
    await worker.setParameters({
        tessedit_char_whitelist: whitelist,
    });

    const {
        data: { text },
    } = await worker.recognize(img);
    await worker.terminate();
    return text.trim();
};

const getCaptcha = async (page: any) => {
    await page.screenshot({ path: "imgcapcha.png", clip: { x: 1114, y: 18, width: 35, height: 12 } });
    let capcha = await getTextLocator("imgcapcha.png");
    let retryCount = 0;
    while (capcha.length !== 4 && retryCount < 2) {
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(5000);
        await page.screenshot({ path: "imgcapcha.png", clip: { x: 1114, y: 18, width: 35, height: 12 } });
        capcha = await getTextLocator("imgcapcha.png");
        retryCount++;
    }
    return capcha;
};

const loginWithCaptcha = async (page: any, accountId: string, pwd: string) => {
    await page.locator(PRODLocator.usernameInput).waitFor({ state: "visible" });
    await page.fill(PRODLocator.usernameInput, accountId);
    await page.fill(PRODLocator.passwordInput, pwd);
    let capcha = await getCaptcha(page);
    console.log("capcha", capcha);
    await page.fill("#validation", capcha);
    await page.click(`//*[@data-tag="tabBtn"]`);
    await page.waitForTimeout(2000);
    const isFailedCaptcha = await page.isVisible('//*[@class="hint-absolute"]');
    if (isFailedCaptcha) {
        return false; // Login Failed
    } else {
        return true; // Login Success
    }
};
