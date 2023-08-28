import { test } from '@playwright/test';
import { expect } from "../../expects";
import { Environment } from "../../auth/auth";
import { configs } from "../../auth/configs";


const lstLangCode =  ["vi","en","zh_tw","id","th","zh_cn"]


export class GameGuideBase {
    gameConfig: object;
    gameId: number;
    gameName: string;
    snapshotFolderPath: string;

   constructor(gameConfig : object, gameId : number, gameName : string, snapshotFolderPath: string) {
        this.gameConfig = gameConfig;
        this.gameId = gameId;
        this.gameName = gameName;
        this.snapshotFolderPath = snapshotFolderPath;
   }


    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.snapshotFolderPath + "-snapshots/" + name
                return snapshotPath;
            };
        });

        test.describe.serial(`${this.gameName} Game Guide Testing`, () => {
            this.runScenario();
        });

        test.afterAll(async ({ browser }) => {
            await browser.close();
        });
    }
    
    protected guideTest = async(langCode) => {

        test(`Verify game guide content in ${langCode}`, async ({ page }) => {
            
            const config = getConfig();

            const projectCode = process.env.npm_config_project ?? "l1"

            const gameGuideURL = 
                projectCode === "l1"
                    ? `${config.guideLink}/${langCode}?gId=${this.gameId}&t=dark&displayName=${this.gameName}&f=sc&p=false&fof=false&`
                    : `${config.guideLinkL2}/${langCode}?gId=${this.gameId}&t=dark&displayName=${this.gameName}&f=sc&p=false&fof=false&`

            await page.goto(gameGuideURL);
            await page.setViewportSize({
                width: 759,
                height: 2000,
            });

            const inItRequest = {
                url: config.guideLink,
                body:  JSON.stringify(this.gameConfig),
            };

            await page.evaluate(inItRequest => {
                window.postMessage(inItRequest.body,inItRequest.url);
            }, inItRequest);

            await page.waitForTimeout(5000)
            expect(await page.screenshot({path: `imgGuide-${langCode}.png`, fullPage: true})).toMatchSnapshot(`imgGuide-${langCode}.png`,{maxDiffPixelRatio:0});
            
        });
    }

    protected runScenario = async() => {
        lstLangCode.forEach(lang => {
                this.guideTest(lang);
        });
    }
  }

const getConfig = (): any => {
    const env = (process.env.npm_config_env ?? Environment.LOCAL).toLowerCase();
    return configs[env];
};

