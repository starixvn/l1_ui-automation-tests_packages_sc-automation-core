import { test, BaseGame } from "../../components";
import { expect } from "../../expects";
import { HyperSpin_Locators } from "../../components/base-cocos-game-locator";

export class HyperSpinTest {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests( locators: any = HyperSpin_Locators ) {
        test(`Testing Hyper Spin game`, async () => {
            // Act 1
            await test.step("Verify hyper spin button is visible", async () => {
                const btnHyperSpin = await this.game.isCocosLocatorExists(locators.btnHyperSpin);
                expect(btnHyperSpin).toBeTruthy();
            });

            await test.step("Verify user can click hyper spin button and navigate to hyper spin game", async () => {
                await this.game.clickCocos(locators.btnHyperSpin,2000);
                const mainLocators = [locators.hyperSpinHeader, locators.totalWinHeader, locators.btnSetting,
                   locators.btnSimpleMode, locators.btnSpin, locators.lblBalance, locators.lblTotalBet, locators.lblTotalWin];

                for (const locator of mainLocators) {
                  await test.step(`Verify ${locator} is visible`, async () => {
                      const setting = await this.game.isCocosLocatorExists(locator);
                      expect(setting).toBeTruthy();
                  });
              }
            });

            await test.step("Verify default settings controls are expanded", async () => {
              const settingsLocators = [locators.btnDecreaseTotalBetSlider, locators.btnIncreaseTotalBetSlider, 
                locators.btnDecreaseStopOnProfit, locators.btnIncreaseStopOnProfit, 
                locators.btnDecreaseStopOnLoss, locators.btnIncreaseStopOnLoss, locators.btnStopOnFeature];
              for (const locator of settingsLocators) {
                  await test.step(`Verify ${locator} is visible`, async () => {
                      const setting = await this.game.isCocosLocatorExists(locator);
                      expect(setting).toBeTruthy();
                  });
              }

            });

            await test.step("Verify settings controls are collapsed", async () => {
              await this.game.clickCocos(locators.btnSetting,2000);
              const settingsLocators = [locators.btnDecreaseTotalBetSlider, locators.btnIncreaseTotalBetSlider, 
                locators.btnDecreaseStopOnProfit, locators.btnIncreaseStopOnProfit, 
                locators.btnDecreaseStopOnLoss, locators.btnIncreaseStopOnLoss, locators.btnStopOnFeature];
              for (const locator of settingsLocators) {
                  await test.step(`Verify ${locator} is visible`, async () => {
                      const setting = await this.game.isCocosLocatorExists(locator);
                      expect(setting).not.toBeTruthy();
                  });
              }
            });



        });

        test(`Testing increase bet amount function by increase button`, async () => {
          const loopCount = 10;
          for (let i = 0; i < loopCount; i++) {
            await this.game.clickCocos(locators.btnIncreaseBetAmount,500);
            expect(await this.game.findLabelText(locators.lblTotalBet)).toBe(await this.game.findLabelText(locators.lblTotalBetSliderValue));
          }

        });
 
        test(`Testing decrease bet amount function by decrease button`, async () => {
          const loopCount = 10;
          for (let i = 0; i < loopCount; i++) {
            await this.game.clickCocos(locators.btnDecreaseBetAmount,500);
            expect(await this.game.findLabelText(locators.lblTotalBet)).toBe(await this.game.findLabelText(locators.lblTotalBetSliderValue));
          }

        });

        test(`Testing Number of Spins function`, async () => {

        });

        test(`Testing Stop on Profit function`, async () => {
          await test.step("Default value is 0", async () => {
            const lblStopOnProfitValue = await this.game.findLabelText(locators.lblStopOnProfitValue);
            expect(lblStopOnProfitValue).toBe("0");
          });
        });

        test(`Testing Stop on Loss function`, async () => {
          await test.step("Default value is 0", async () => {
            const lblStopOnLossValue = await this.game.findLabelText(locators.lblStopOnLossValue);
            expect(lblStopOnLossValue).toBe("0");
          });
        });

        test(`Testing Stop on Feature function`, async () => {
          await test.step("Default state is OFF", async () => {
            const cbOffStopOnProfit = await this.game.isCocosLocatorExists(locators.cbOffStopOnProfit);
            expect(cbOffStopOnProfit).toBeTruthy();
          });

          await test.step("Click on cbOnStopOnProfit", async () => {
            await this.game.clickCocos(locators.btnStopOnFeature,500);
            const cbOnStopOnProfit = await this.game.isCocosLocatorExists(locators.cbOnStopOnProfit);
            expect(cbOnStopOnProfit).toBeTruthy();
          });
        });
    }
}
