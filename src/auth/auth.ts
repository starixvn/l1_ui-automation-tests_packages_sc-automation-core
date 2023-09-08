import { LobbyLocator, SITLocator, UATLocator, PRODLocator, GroupCurrencyLocator } from "./locators/index";
import { configs } from "./configs/config";
import { Page } from "@playwright/test";

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
    projectCode: string
): Promise<void> => {
    const config = getConfig();
    const langCode = process.env.npm_config_langCode ?? "vn";

    if (playerId === "" || productId === "") {
        throw new Error(`Missing Test Account or ProductId for game id ${gameId}!!!`);
    }

    if (env.includes("local")) {
        const memberSiteLink =
            projectCode === "l1"
                ? `${config.memberSite}?obCustId=${playerId}&balance=20000`
                : `${config.l2memberSite}?obCustId=${playerId}&balance=2000000`;
        await page.goto(memberSiteLink);
        console.log("Login Local", memberSiteLink);
        await page.click(LobbyLocator.advancelbl);
        await page.locator(LobbyLocator.langDropdown).selectOption(LobbyLocator[`${langCode}LangOption`]);
        await page.click(LobbyLocator.tokenBtn);
        await page.waitForTimeout(500);
        const ssoLink = (await page.locator(LobbyLocator.ssoLink).textContent()) ?? "";

        await page.goto(`${ssoLink.replace("gameId=0", `gameId=${gameId}`)}`);
        const isCurrencyForm = await page.$$('id=currency')
        if (isCurrencyForm.length>0) {
            await page.click("text=Submit");
        }
    } else {
        await loginMemberSite(page, config, env, playerId, productId, langCode, projectCode);
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
    projectCode: string
) => {
    const timeout = config.lobbyTimeout;
    const memberSiteLink = projectCode === "l1" ? config.memberSite : config.l2memberSite;
    const pwd = projectCode === "l1" ? config.pwd : config.l2pwd;
    const lobbyDomain = projectCode === "l1" ? config.lobbyDomain : config.l2lobbyDomain;

    await page.goto(memberSiteLink);
    console.log("Login Member Site: ", memberSiteLink);
    await page.waitForLoadState("networkidle", { timeout });

    switch (env) {
        case Environment.UAT:
            await loginUAT(page, playerId, pwd, langCode, projectCode, timeout);
            break;

        case Environment.PROD:
            await loginPROD(page, playerId, pwd, langCode, projectCode, timeout);
            break;

        default:
            await loginSIT(page, playerId, pwd, timeout);
    }

    await goToGameLobby(page, lobbyDomain, productId);

    if (mustSelectCurrencyGroup(env)) {
        await selectCurrencyGroup(page, timeout);
    }
};

const selectCurrencyGroup = async (page: Page, timeout: number = 15000) => {
    await page.click(GroupCurrencyLocator.submitButton);

    await page.waitForLoadState("domcontentloaded", { timeout });
};

const loginUAT = async (page: Page, accountId: string, pwd: string, langCode: string, projectCode: string, timeout: number = 15000) => {
    if (projectCode === "l1") {
        await page.click(UATLocator.loginDiv);
        await page.selectOption(UATLocator.langDropdown, { value: UATLocator.vnLangOption });
        await page.fill(UATLocator.memberIdInput, accountId);
        await page.fill(UATLocator.pwdInput, pwd);
        await page.click(UATLocator.loginButton);
        await page.waitForLoadState("networkidle", { timeout });
    } else {
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
    }
};

const loginPROD = async (page: Page, accountId: string, pwd: string, langCode: string, projectCode: string, timeout: number = 15000) => {
    if (projectCode === "l1") {
        await page.fill(PRODLocator.memberIdInput, accountId);
        await page.fill(PRODLocator.pwdInput, pwd);
        await page.click(PRODLocator.loginButton);
        await page.waitForLoadState("networkidle", { timeout: timeout });
        await page.click(PRODLocator.langDropdown);
        await page.click(PRODLocator[`${langCode}LangOption`]);
    } else {
        await page.setViewportSize({
            width: 340,
            height: 667,
        });
        await page.fill(PRODLocator.l2memberIdInput, accountId);
        await page.fill(PRODLocator.l2pwdInput, pwd);
        await page.click(PRODLocator.l2loginButton);
        await page.waitForLoadState("networkidle", { timeout: timeout });
        await page.waitForTimeout(5000)
        const iconSurvey = await page.$$(PRODLocator.l2iconClose);
        if (iconSurvey.length>0) {
            await page.click(PRODLocator.l2iconClose)
        }
        await page.setViewportSize({
            width: 1280,
            height: 720,
        });
    }
};

const loginSIT = async (page: Page, accountId: string, pwd: string, timeout: number = 15000) => {
    await page.fill(SITLocator.memberIdInput, accountId);
    await page.fill(SITLocator.pwdInput, pwd);
    await page.click(SITLocator.loginButton);
    await page.waitForLoadState("networkidle", { timeout });
    await page.click(SITLocator.langDropdown);
    await page.click(SITLocator.vnLangOption);
};

const goToGameLobby = async (page: Page, lobbyDomain: string, productId: string, timeout: number = 15000) => {
    await page.goto(formatGameLobbyUrl(page.url(), lobbyDomain, productId));
    await page.waitForLoadState("networkidle", { timeout });
};

const formatGameLobbyUrl = (url: string, lobbyDomain: string, productId: string): string => {
    const domain = url.split("/");
    if (url.includes("athena") || url.includes("qa")) {
        return `http://${domain[2]}/${lobbyDomain}${productId}`;
    } else return `https://${domain[2]}/${lobbyDomain}${productId}`;
};

const mustSelectCurrencyGroup = (env: string): boolean => {
    return env !== Environment.SIT;
};
