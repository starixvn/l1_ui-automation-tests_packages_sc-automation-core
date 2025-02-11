import { test, BasePlayer, BaseGame } from "../../components";
import { IBaseOptions } from "../../smoke-bases/base-options";
import { GameGuides } from "./guides.spec";
//import { expect } from "../../expects";
import { LobbyLocator } from "../../auth/locators";

const lstLocalLangCode = ["vn", "en", "tw", "id", "th", "cn"];
const lstProdLangCode = ["vn", "en,", "tw"];
let langPath = process.env.npm_config_langCode === "all" ? "vn" : process.env.npm_config_langCode;

export class GameGuideBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}

    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath =
                    langPath === "vn"
                        ? this.options.snapshotFolderPath + "-snapshots/" + name
                        : this.options.snapshotFolderPath + "-snapshots/" + langPath + "/" + name;
                return snapshotPath;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: [this.options.locators],
        });

        test.describe.serial(`${this.options.gameConfiguration.name} Game Guide Testing`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
                this.gameGuides.init(this.game);
            });

            this.runScenario();
        });
    }

    protected guideTest(inputLang: string, isTestAllLang: boolean) {
        test("AND player could open guide and clarify appropriate content in " + LobbyLocator[`${inputLang}LangOption`], async () => {
            // Relogin with the next languague
            if (isTestAllLang && inputLang != "vn") {
                //do test for Vietnamese first so don't need to relogin
                langPath = inputLang;
                process.env.npm_config_langCode = inputLang;
                await this.game.login();
            }
            // Arrange
            test.setTimeout(this.game.gameConfiguration.maxTimeout);
            await this.game.openGuide(3000);
            // Act
            //  const guideContents = await this.gameGuides.captureGuideContent();

            //  // Assert
            //  guideContents.forEach((content) => {
            //      expect(content.image).toMatchSnapshot(content.name);
            //  });
        });
    }

    protected runScenario(): void {
        const langCode = process.env.npm_config_langCode ?? "vn";
        const isLocalEnv = process.env.npm_config_env?.includes("local");

        if (langCode === "all") {
            const langCodes = isLocalEnv ? lstLocalLangCode : lstProdLangCode;
            langCodes.forEach((lang) => {
                this.guideTest(lang, true);
            });
        } else {
            this.guideTest(langCode, false);
        }
    }
}
