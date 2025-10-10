import { LobbyLocator, UATLocator, PRODLocator, AdminLogin } from "./locators/index";
import { configs } from "./configs/config";
import { Page } from "@playwright/test";
import { createWorker } from "tesseract.js";
import { readFile, unlink } from "node:fs/promises";
import { fetch } from "undici";

export enum Environment {
    LOCAL = "local",
    LOCAL1 = "local1",
    LOCAL2 = "local2",
    LOCAL3 = "local3",
    SIT = "sit",
    UAT = "uat",
    PROD = "prod",
}

const getAppType = (projectCode: string): number => {
    if (projectCode.includes("mobi")) return 2;
    if (projectCode.includes("keno")) return 4;
    if (projectCode.includes("dedirect")) return 6;
    if (projectCode.includes("modirect")) return 7;
    return 1;
};

export const ssoToGame = async (page: Page, gameId: number, playerId: string, env: string, projectCode: string): Promise<void> => {
    const config = getConfig();
    const langCode = process.env.npm_config_langCode ?? "vn";
    let ssoLink;
    if (playerId === "") {
        throw new Error(`Missing Test Account or ProductId for game id ${gameId}!!!`);
    }

    if (env.includes("local")) {
        const memberSiteLink = config[`${projectCode}memberSite`] + `?obCustId=${playerId}&balance=200000`;
        const appType = getAppType(projectCode);
        await page.goto(memberSiteLink);
        console.log("Login Local", memberSiteLink);
        await page.click(LobbyLocator.advancelbl);
        await page.click(`//input[@id=${appType}]`);
        await page.locator(LobbyLocator.langDropdown).selectOption(LobbyLocator[`${langCode}LangOption`]);
        await page.click(LobbyLocator.tokenBtn);
        await page.waitForTimeout(2000);
        ssoLink = (await page.locator(LobbyLocator.ssoLink).textContent()) ?? "";
        global.ssoLink = `${ssoLink}&gameId=${gameId}`;
        await page.goto(global.ssoLink);
        const isCurrencyForm = await page.$$("id=currency");
        if (isCurrencyForm.length > 0) {
            await page.click("text=Submit");
        }
    } else {
        await loginMemberSite(page, config, env, playerId, langCode, projectCode, gameId);
    }
};

export const ssoToGame2 = async (page: Page, gameId: number, playerId: string, env: string, projectCode: string): Promise<void> => {
    const config = getConfig();
    const langCode = process.env.npm_config_langCode ?? "vn";
    let ssoLink;

    if (env.includes("local")) {
        const memberSiteLink = config[`${projectCode}memberSite`] + `?obCustId=${playerId}&balance=200000`;
        const appType = projectCode.includes("mobi")
            ? 2
            : projectCode.includes("keno")
              ? 4
              : projectCode.includes("dedirect")
                ? 6
                : projectCode.includes("modirect")
                  ? 7
                  : 1;
        await page.goto(memberSiteLink);
        console.log("Login Local", memberSiteLink);
        await page.click(LobbyLocator.advancelbl);
        await page.click(`//input[@id=${appType}]`);
        await page.locator(LobbyLocator.langDropdown).selectOption(LobbyLocator[`${langCode}LangOption`]);
        await page.click(LobbyLocator.tokenBtn);
        ssoLink = (await page.locator(LobbyLocator.ssoLink).textContent()) ?? "";
        global.ssoLink = `${ssoLink.replace("gameId=0", `gameId=${gameId}`)}`;
        await page.goto(global.ssoLink);
        const isCurrencyForm = await page.$$("id=currency");
        if (isCurrencyForm.length > 0) {
            await page.click("text=Submit");
        }
    } else {
        const memberSiteUrl = await readFile(".auth/membersiteurl.txt", "utf8");
        await page.goto(memberSiteUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("networkidle", { timeout: 25000 });
        const lobbyDomain = config[`${projectCode}lobbyDomain`];
        await goToGameLobby(page, lobbyDomain, gameId);
    }
};

export const getConfig = (): any => {
    const env = (process.env.npm_config_env ?? Environment.LOCAL).toLowerCase();

    return configs[env];
};

export const handlePromotionPopup = async (page: Page) => {
    await page.waitForTimeout(5000);
    const alertDialogSelector = "//div[contains(@class,'promo')]";
    await page.waitForSelector(alertDialogSelector, { timeout: 10000 }).catch(() => {
        console.log("Alert dialog not found within the timeout period.");
    });
    const alertDialogExists = await page.$(alertDialogSelector);
    if (alertDialogExists) {
        await page.addStyleTag({
            content: `#dialogMessage {display: none !important;}
            div[class*="promo"] {display: none !important;}
            a[class*="c-btn c-btn--bot"] {display: none !important;}`,
        });
    }
};

const loginMemberSite = async (
    page: Page,
    config: any,
    env: string,
    playerId: string,
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
        await page.goto(memberSiteLink, { waitUntil: "domcontentloaded", timeout: 30000 });
        try {
            await page.waitForLoadState("load", { timeout: 60000 });
        } catch (error) {
            console.log("Page load timeout exceeded, continuing to next step...");
        }
    }

    console.log(`Login ${playerId} - ${gameId} Member Site: ${memberSiteLink}`);

    const subPcode = projectCode === "gn" ? "gn" : projectCode.match(/^l[12]/)?.[0] ?? "l1";
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
        if (projectCode.includes("modirect")) {
            const domain = page.url().split("/");
            const protocol = page.url().includes("http") ? "http" : "https";
            await page.setViewportSize({
                width: 500,
                height: 608,
            });
            await page.goto(`${protocol}://${domain[2]}/${lobbyDomain}`);
            await page.waitForLoadState("load", { timeout: 10000 });
            await handlePromotionPopup(page);
            await page.frameLocator("//iframe[contains(@src,'https://direct')]").locator(`//img[@alt='game-${gameId}']`).click();
        } else {
            await goToGameLobby(page, lobbyDomain, gameId);
        }
    }
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
            await page.waitForLoadState("load", { timeout: 60000 });
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
            await page.waitForLoadState("load", { timeout: 60000 });
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
            await page.waitForLoadState("load", { timeout: 30000 });
        }
    }
    if (projectCode === "gn") {
        await page.fill("#txtID", accountId);
        await page.fill("#txtPW", pwd);
        await page.click("//button");
        await page.waitForTimeout(1000);
        await page.waitForLoadState("load", { timeout: 30000 });
        await page.locator("//div[contains(@class,'c-dropdown--lang')]").click();
        await page.locator("//span[contains(text(),'Tiếng Việt')]").click();
        await page.waitForLoadState("load", { timeout: 30000 });
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
            await page.setViewportSize({ width: 340, height: 667 });
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
            await page.waitForLoadState("load", { timeout: 10000 });
            await page.locator("#txtID").waitFor();
            await page.waitForTimeout(3000);
            await page.fill("#txtID", accountId);
            await page.fill("#txtPW", pwd);
            await page.click("//button");
            await page.waitForTimeout(15000);
            await page.locator("//div[contains(@class,'dropdown--lang')]").click();
            await page.locator("//div[@class='c-dropdown__item']/span[text()='Tiếng Việt']").click();
        }
    }
    if (projectCode === "gn") {
        await page.fill("#txtID", accountId);
        await page.fill("#txtPW", pwd);
        await page.click("//button");
        await page.waitForLoadState("load", { timeout: 10000 });
        await page.locator("//div[contains(@class,'c-dropdown--lang')]").click();
        await page.locator("//span[contains(text(),'Tiếng Việt')]").click();
        await page.waitForLoadState("load", { timeout: 10000 });
        await page.waitForTimeout(5000);
    }
};

const loginPROD = async (page: Page, accountId: string, pwd: string, langCode: string, projectCode: string, timeout: number = 15000) => {
    console.log(langCode);
    const alertDialogSelector = "//div[@class='modal modal--alert']//a[@class='btn btn--icon']";

    try {
        const alertDialog = await page.waitForSelector(alertDialogSelector, { timeout: 5000 });
        if (alertDialog) {
            await alertDialog.click();
        }
    } catch (error) {
        console.log("Alert dialog not found within the timeout period.");
    }

    if (projectCode === "l1") {
        if (process.env.npm_config_mobile === "true" || process.env.npm_config_project?.includes("modirect")) {
            await page.click("//div[@class='header-option']/div[1]");
            await page.click("//div[@class='header-option']/div[1]/div//span[text()='Mobile']");
            await page.waitForLoadState("load", { timeout: timeout });
        } else {
            await page.waitForLoadState("load", { timeout: timeout });
        }
        await page.click(PRODLocator.openLoginFormbtn);
        await page.fill(PRODLocator.usernameInput, accountId);
        await page.fill(PRODLocator.passwordInput, pwd);
        await page.click(PRODLocator.submitLoginbtn);
        await page.waitForTimeout(1000);
        await page.waitForLoadState("load", { timeout: timeout });
        await page.waitForTimeout(5000);
    }

    if (projectCode === "l2") {
        if (process.env.npm_config_mobile === "true" && !process.env.npm_config_project?.includes("credit")) {
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
            await page.waitForTimeout(1000);
            await page.waitForLoadState("load", { timeout: timeout });
            await page.waitForTimeout(8000);
            const iconSurvey = await page.$$(PRODLocator.l2iconClose);
            if (iconSurvey.length > 0) {
                await page.click(PRODLocator.l2iconClose);
            }
            await page.setViewportSize({
                width: 1280,
                height: 720,
            });
        }

        // CREDIT SITE VG
        if (process.env.npm_config_project?.includes("modirect") || process.env.npm_config_project?.includes("credit")) {
            await page.click("//div[@class='header-option']/div[1]");
            if (!process.env.npm_config_project?.includes("pingoal")) {
                await page.click("//div[@class='header-option']/div[1]/div//span[text()='Mobile']");
            }
            await page.click("//div[@class='header-login']/a[2]");
            await page.fill(PRODLocator.usernameInput, accountId);
            await page.fill(PRODLocator.passwordInput, pwd);
            await page.click("//div[@class='login-form']//a[@class='btn btn--secondary']");
            await page.waitForLoadState("load", { timeout: timeout });
            await page.waitForTimeout(5000);
        } else {
            const isSuccess = await loginWithCaptcha(page, accountId, pwd);
            if (!isSuccess) {
                console.log("Retry Login");
                await page.locator("//i[@class='icon-refresh']").click();
                await page.waitForTimeout(5000);
                await loginWithCaptcha(page, accountId, pwd);
            }
            await page.goto(configs.prod.l2memberSite); // navigate to language = vn
            await page.waitForLoadState("load", { timeout: timeout });
            await page.waitForTimeout(2000);
            await page.locator("#sportsFrame").waitFor({ state: "visible" });
            await page.waitForTimeout(5000);
        }
    }

    if (projectCode === "gn") {
        await page.click(PRODLocator.openLoginFormbtn);
        await page.fill(PRODLocator.usernameInput, accountId);
        await page.fill(PRODLocator.passwordInput, pwd);
        await page.click(PRODLocator.submitLoginbtn);
        await page.waitForTimeout(1000);
        await page.waitForLoadState("load", { timeout: timeout });
        await page.waitForTimeout(5000);
    }
};

const goToGameLobby = async (page: Page, lobbyDomain: string, gameId: number, timeout: number = 15000) => {
    await page.goto(await formatGameLobbyUrl(page.url(), page, lobbyDomain, gameId), { waitUntil: "domcontentloaded", timeout: timeout });
    global.ssoLink = page.url();
};

const formatGameLobbyUrl = async (url: string, page: Page, lobbyDomain: string, gameId: number): Promise<string> => {
    const domain = url.split("/");
    const protocol = domain.includes("http") ? "http" : "https";

    const project = process.env.npm_config_project || "l1";
    const env = process.env.npm_config_env || "local";

    if (project === "l2" && env === "prod") {
        const userAgent = await page.evaluate(() => navigator.userAgent); // Get User-Agent
        const cookies = await page.context().cookies();
        const sessionId = cookies.find((cookie) => cookie.name === "customSession" && cookie.domain === domain[2])?.value;

        const response = await fetch(`http://${domain[2]}/GamePage.aspx?Game=VGaming&refer=&betFrom=x&timeZone=7`, {
            method: "GET",
            headers: {
                "User-Agent": userAgent,
                Cookie: `customSession=${sessionId}`,
            },
        });
        const data = await response.text();
        const srcMatch = data.match(/<iframe[^>]+id=["']frmGame["'][^>]+src=["']([^"']+)["']/);
        const tokenMatch = srcMatch?.[1]?.match(/token=([^&]+)/); // Combined token extraction
        const token = tokenMatch ? tokenMatch[1] : null; // Get the token value or null if not found
        return `${lobbyDomain}/?token=${token}&lang=vi-VN&appType=1&gameId=${gameId}&partnerId=ONEworksVGCash&op=`;
    } else if (project === "l1") {
        await page.goto(`${protocol}://${domain[2]}/${lobbyDomain}1612`, { waitUntil: "domcontentloaded", timeout: 30000 });
        return page.url().replace("gameId=1", `gameId=${gameId}`);
    } else if (["l2keno", "l2mobi"].includes(project)) {
        // Simplified project check
        return lobbyDomain;
    } else if (project === "gn") {
        return `${protocol}://${domain[2]}/${lobbyDomain}`;
    } else {
        await page.goto(`${protocol}://${domain[2]}/${lobbyDomain}`, { waitUntil: "domcontentloaded", timeout: 30000 });
        return page.url().replace("gameId=0", `gameId=${gameId}`);
    }
};

export const loginAdmin = async (page: Page, projectCode: string) => {
    const config = getConfig();
    const timeout = config.lobbyTimeout;
    const adminLink = config[`${projectCode}admin`];
    const admin = { username: "admauto", pwd: "admauto" };
    await page.goto(adminLink);
    await page.waitForLoadState("load", { timeout: timeout });
    await page.fill(AdminLogin.usernameInput, admin.username);
    await page.fill(AdminLogin.pwdInput, admin.pwd);
    await page.click(AdminLogin.loginButton);
    await page.waitForLoadState("load", { timeout: timeout });
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
    await page.locator("//input[@id='validation']/following::img").screenshot({ path: "imgcapcha.png" });
    let capcha = await getTextLocator("imgcapcha.png");
    let retryCount = 0;
    while (capcha.length !== 4 && retryCount < 2) {
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForTimeout(5000);
        await page.locator("//input[@id='validation']/following::img").screenshot({ path: "imgcapcha.png" });
        capcha = await getTextLocator("imgcapcha.png");
        retryCount++;
    }
    try {
        await unlink("imgcapcha.png");
    } catch (error) {
        console.log("Failed to delete imgcapcha.png:", (error as Error).message);
    }
    return capcha;
};

const loginWithCaptcha = async (page: any, accountId: string, pwd: string) => {
    await page.locator(PRODLocator.usernameInput).waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    let capcha = await getCaptcha(page);
    console.log("capcha", capcha);
    await page.fill("#validation", capcha);
    await page.fill(PRODLocator.usernameInput, accountId);
    await page.fill(PRODLocator.passwordInput, pwd);
    await page.click(`//*[@data-tag="tabBtn"]`);
    await page.waitForTimeout(2000);
    const isFailedCaptcha = await page.isVisible('//*[@class="hint-absolute"]');
    if (isFailedCaptcha) {
        return false; // Login Failed
    } else {
        return true; // Login Success
    }
};
