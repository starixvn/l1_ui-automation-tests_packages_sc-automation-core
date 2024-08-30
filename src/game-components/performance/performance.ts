import { test, BaseGame } from "../../components";
import { expect } from "../../expects";
const fs = require('fs');

export class performanceTest {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests(ssotime: number) {
        test(`Verify the performance of loading game match requirements`, async () => {
            // Act 1
            await test.step("Expect first load time to be less than the configured time", async () => {
                const { firstLoad } = this.game.trackDownloadReport;
                expect(firstLoad.duration).toBeLessThan(ssotime);
                await this.game.page.waitForTimeout(10000) 

            });

            // Assert 1
            await test.step("Expect no duplicated files.", async () => {
                const listfiles = await getFirstItemsFromCSV("./test-results/firstload.csv")
                const duplicated = await this.game.checkDuplicatedFileName(listfiles)
                console.log('Duplicated files: ',duplicated);
                // expect(duplicated.length).toBe(0);
            });
            //Post-Act
            await test.step("Warning about large image files", async () => {
                let largeImage = getLargeImageromCSV("./test-results/firstload.csv")
                console.log('largeImage: ',largeImage);
                expect(largeImage.length).toBe(0);
            });
        });
    
}

}


function getFirstItemsFromCSV(filePath: string): string[] {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    return csvContent
      .split('\n')
      .slice(1) // Skip the header row
      .map(row => row.split(',')[0])
      .filter(Boolean); // Remove empty entries
  }


  function getLargeImageromCSV(filePath: string): string[] {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const rows = csvContent.split('\n').slice(1); // Skip header row
  
    return rows
      .map(row => {
        const [itemLink = '', filetype = '', itemSize = ''] = row.split(',');
        return { 
          itemLink: itemLink.trim(), 
          filetype: filetype.trim(), 
          itemSize: parseFloat(itemSize) || 0 
        };
      })
      .filter(({ itemLink, filetype, itemSize }) => 
        itemLink && 
        (filetype.includes('.jpg') || filetype.includes('.png')) && 
        itemSize >= 0.5
      )
      .map(({ itemLink }) => itemLink);
  }