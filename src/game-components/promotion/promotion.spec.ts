import fs from 'fs';
import path from 'path';
import {test, BaseGame } from "../../components";
//import { baseLocatorNames } from "../../components/base-game-locator";
import {  } from "../../components/base-game-locator";
import { PromotionLocators, Portrail_Classic_Locators, Portrail_Cascading_Locators } from '../../components/base-cocos-game-locator';

let promotionCode: string = "";
const locator = {
      claimBtn: [702 , 116],
      randomClick: [473 , 128],
      closeEndFS: [615 , 431], 
      redeemIcon : [602, 78],
  redeemInput: [517, 381],
  redeemBtn: [739, 382],
  playNowBtn: [688, 527],
};
export class Promotion {
  protected game: BaseGame;

  init(game: BaseGame) {
    this.game = game;
  }
  

  loadPromotionCode() {
    const rootDir = path.resolve(__dirname, '../../../../../');
    const filePath = path.join(rootDir, '.auth', 'promotionCode.txt');

    if (fs.existsSync(filePath)) {
      promotionCode = fs.readFileSync(filePath, { encoding: 'utf-8' });
      console.log(`Read value from file: ${promotionCode}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  }
  async setBetConfigurationClassic(betamount: number) {
    await this.game.clickCocos(Portrail_Classic_Locators.betAmountSetting,1000);
    // Adjust Bet Level
    await this.game.isCocosLocatorExists(`bet-level-${betamount.toString()}`);
    await this.game.clickCocos(`bet-level-${betamount.toString()}`,1000);
    await this.game.clickOutSide();
    await this.game.waitForTimeout(1000);
  }
  async setBetConfigurationCascading(betlevel: number, coinvalue: number) {
    await this.game.clickCocos(Portrail_Cascading_Locators.betAmountSetting);        
    // Adjust Bet Level
    let currentBetLevel = Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtBetLevelValue));        
    while (currentBetLevel !== betlevel) {
      if (currentBetLevel < betlevel) {
        await this.game.clickCocos(Portrail_Cascading_Locators.btnBetLevelIncrease);
      } else {
        await this.game.clickCocos(Portrail_Cascading_Locators.btnBetLevelDecrease);
      }
      await this.game.waitForTimeout(500);
      currentBetLevel = Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtBetLevelValue));
    }        
    // Adjust Coin Value
    let currentCoinValue = Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtCoinValue));
        
    while (currentCoinValue !== coinvalue) {
      if (currentCoinValue < coinvalue) {
        await this.game.clickCocos(Portrail_Cascading_Locators.btnCoinValueIncrease);
        } else {
          await this.game.clickCocos(Portrail_Cascading_Locators.btnCoinValueDecrease);
        }
        await this.game.waitForTimeout(500);
        currentCoinValue = Number(await this.game.findLabelText(Portrail_Cascading_Locators.txtCoinValue));
    }
        
    await this.game.clickCocos(Portrail_Cascading_Locators.iconCloseMainPopup);
    await this.game.waitForTimeout(1000);
    }
  runPromotion(isPromotion: boolean = false) {   
    if(isPromotion == true){
      this.loadPromotionCode(); // load file trước
      test("Verify User can Redeem and Play Promotion", async () => {
        await test.step("Click Icon Reddem", async () => {
          await this.game.page.mouse.click(locator.redeemIcon[0],locator.redeemIcon[1], { delay: 2000 } );
          await this.game.waitForTimeout(3000);
        });
      //console.log(baseLocatorNames., 5000)
        await test.step("Verify input gift code", async () => {
          await this.game.page.mouse.click(locator.redeemInput[0],locator.redeemInput[1], { delay: 2000 });
          for (const ch of promotionCode.split("")) {
            await this.game.page.keyboard.press(ch);
            await this.game.page.waitForTimeout(100);
          }
        });
        await test.step("Verify click submit Gift Code", async () => {
          await this.game.page.mouse.click(locator.redeemBtn[0],locator.redeemBtn[1] ,{ delay: 2000 });
          await this.game.waitForTimeout(4000);
        });

        await test.step("Verify click Play Now", async () => {
          await this.game.page.mouse.click(locator.playNowBtn[0],locator.playNowBtn[1], { delay: 2000 });
          await this.game.waitForTimeout(5000);
          let self = await this.game.isCocosLocatorExists(PromotionLocators.endFS);
          await this.game.clickCocos(PromotionLocators.btnTurbo);
          let counter = 0;
          while (self !== true) {
          try {
            await this.game.waitForTimeout(1000);
            self = await this.game.isCocosLocatorExists(PromotionLocators.endFS);
            let isFsEffect = await this.game.isCocosLocatorExists(PromotionLocators.fsEffect);
            if (isFsEffect === true) {
              await this.game.page.mouse.click(locator.randomClick[0],locator.randomClick[1],{ delay: 2000 });
            }
            counter++;
            if (counter >= 100) {
              console.error("Error: Free Spin did not finish after 100 iterations!");
              break;
            } 
          }catch (error) {     
            break;
            }
          }    
          await this.game.waitForTimeout(4000); 
        });

        await test.step("Verify Place Bet Turover", async () => {
          const totalBonusWin = await this.game.findLabelText(PromotionLocators.bonusWin);
          console.log("Total Bonus Win: " + totalBonusWin);
          await this.game.clickCocos(PromotionLocators.endFS);  
          let perProgress = await this.game.findLabelText(PromotionLocators.percentage);
          console.log(perProgress);
          const gameTpye = await this.game.isCocosLocatorExists(Portrail_Classic_Locators.betAmountSetting);
          if (gameTpye == true){
            this.setBetConfigurationClassic(40);
          }else {
            this.setBetConfigurationCascading(10,1)
          }
          while (perProgress !== "100%") {
          try {
            await this.game.page.mouse.click(640, 570);
            await this.game.waitForTimeout(5000);
            perProgress = await this.game.findLabelText(PromotionLocators.percentage);
            console.log(perProgress);
          } catch (error) {
            break;
            }
          }
          const balanceBefore = await this.game.findLabelText(PromotionLocators.banlaceLbl);
          console.log("Balance before claim bonus: " + balanceBefore);
        });

        await test.step("Verify click claim bonus", async () => {
          if (locator.claimBtn) {
            await this.game.page.mouse.click(locator.claimBtn[0],locator.claimBtn[1],{ delay: 2000 });
            await this.game.waitForTimeout(500); 
          }
          if (PromotionLocators.promotionEndPopup) {
            await this.game.clickCocos(PromotionLocators.promotionEndPopup);
            await this.game.waitForTimeout(500); 
          }
        });

    });
    }   
  }
}
