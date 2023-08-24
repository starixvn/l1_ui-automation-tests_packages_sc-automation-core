import { test } from '@playwright/test';
import { expect } from "../../expects";
import { Environment } from "../../auth/auth";
import { configs } from "../../auth/configs";


const lstLangCode =  ["vn","en","zh_tw","id","th","zh_cn"]


export class GameGuideBase {
    gameConfig: object;
    gameId: number;
    gameName: string;
    snapshotFolderPath: string;

   constructor(gameConfig : object, gameId : number, gameName : string, snapshotFolderPath) {
    this.gameConfig = gameConfig;
    this.gameId = gameId;
    this.snapshotFolderPath = snapshotFolderPath;
    this.gameName = gameName;
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
                    ? `${config.guideLink}${langCode}?gId=67&t=dark&f=sc&p=false&fof=false&minBet=1&maxBet=2000`
                    : `${config.guideLinkL2}${langCode}?gId=67&t=dark&f=sc&p=false&fof=false&minBet=1&maxBet=2000`
            
           // const page = await this.browser.newPage();
            // const GameConfigs = {
            //     minBet: 1,
            //     maxBet: 2000,
            //     maxBetPerChoices: {
            //     dragon: 2000,
            //     tiger: 2000,
            //     tie: 500,
            //     redDragon: 1000,
            //     blackDragon: 1000,
            //     redTiger: 1000,
            //     blackTiger: 1000,
            //     },
            //     odds: {
            //     dragon: 2,
            //     tiger: 2,
            //     tie: 11,
            //     redDragon: 1.9,
            //     blackDragon: 1.9,
            //     redTiger: 1.9,
            //     blackTiger: 1.9,
            //     },
            //     originalOdds: {
            //     dragon: 2,
            //     tiger: 2,
            //     tie: 11,
            //     redDragon: 1.9,
            //     blackDragon: 1.9,
            //     redTiger: 1.9,
            //     blackTiger: 1.9,
            //     }
            // };
        
            //const guidelink = 'https://l1-guide-3.luminetsoft.com/vi?gId=67&t=dark&f=sc&p=false&fof=false&minBet=1&maxBet=2000';


            await page.goto(gameGuideURL);
            await page.setViewportSize({
                width: 1084,
                height: 3000,
            });

            const inItRequest = {
                url: config.guideLink,
                body:  JSON.stringify(this.gameConfig),
            };

            await page.evaluate(inItRequest => {
                window.postMessage(inItRequest.body,inItRequest.url);
            }, inItRequest);

            await page.waitForTimeout(5000)
            expect(await page.screenshot({path: `imgGuide${langCode}`, fullPage: true})).toMatchSnapshot(`imgGuide${langCode}`,{maxDiffPixelRatio:0});
            
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

