import { test } from "@playwright/test";
import { expect } from "../../expects";
import { Environment } from "../../auth/auth";
import { configs } from "../../auth/configs";

const lstLangCode = ["vi", "en", "zh_tw", "id", "th", "zh_cn"];

export class GameGuideBase {
    gameConfig: object;
    gameId: number;
    gameName: object;
    snapshotFolderPath: string;
    guideType: any;



    constructor(gameConfig: object, gameId: number, gameName: object, snapshotFolderPath: string, guideType?: any) {
        this.gameConfig = gameConfig;
        this.gameId = gameId;
        this.gameName = gameName;
        this.snapshotFolderPath = snapshotFolderPath;
        this.guideType = guideType;
    }

    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                return `${this.snapshotFolderPath}-snapshots/${name}`;
            };
        });

        test.describe.parallel(`${this.gameName["en"]} Game Guide Testing`, () => {
            this.runScenario();
        });

        test.afterAll(async ({ browser }) => {
            await browser.close();
        });
    }

    protected guideTest = async (langCode: string) => {
        
        const guideType = this.guideType ?? "sc";

        test(`Verify game guide ${guideType} content in ${langCode}`, async ({ page }) => {
            const config = getConfig();

            const projectCode = process.env.npm_config_project ?? "l1";


            const gameGuideURL =
                projectCode === "l2"
                    ? `${config.guideLinkL2}/${langCode}?gId=${this.gameId}&t=dark&displayName=${this.gameName[langCode]}&f=${guideType}&p=false&fof=false&`
                    : `${config.guideLinkL1}/${langCode}?gId=${this.gameId}&t=dark&displayName=${this.gameName[langCode]}&f=${guideType}&p=false&fof=false&`;

            await page.goto(gameGuideURL);
            await page.setViewportSize({
                width: 1084,
                height: 2000,
            });
            
            const inItRequest = {
                url: projectCode === "l2" ? config.guideLinkL2 : config.guideLinkL1,
                body: JSON.stringify(this.gameConfig),
            };

            await page.evaluate((inItRequest) => {
                window.postMessage(inItRequest.body, inItRequest.url);
            }, inItRequest);
            await page.waitForLoadState("networkidle")
            await page.waitForTimeout(10000)
            const screenshotName = guideType === "sc" 
                ?  `imgGuide-${projectCode}-${langCode}.png`
                : `imgGuide${this.guideType}-${projectCode}-${langCode}.png`
            expect
                .soft(await page.screenshot({ path: `screenshots/${screenshotName}`, fullPage: true }))
                .toMatchSnapshot(`${screenshotName}`, { maxDiffPixelRatio: 0 });
        });
    };

    protected runScenario() {
        lstLangCode.forEach((lang) => {
            this.guideTest(lang);
        });
    }
}

const getConfig = () => {
    const env = (process.env.npm_config_env ?? Environment.LOCAL).toLowerCase();
    return configs[env];
};
