import type { Page } from "@playwright/test";
import { formatScreenshotFile, formatName } from "../_shared";
import { ImageSnapshot } from "./base-image-locator";

export class BaseElementLocator {
    element: string;
    name: string;

    constructor(name: string, element: string) {
        this.element = element;
        this.name = name;
    }

    async snapshot(page: Page, isFrame = true): Promise<ImageSnapshot> {
        const imageName = formatName(this.name);

        let root:any = page;
        if (isFrame) {
            const subiframe = await page.frameLocator("iframe").locator("id=webview-wrapper").count()
            root = subiframe > 0 ? page.frameLocator("iframe").frameLocator("#webview") : page.frameLocator("iframe")
        }

        const image = await root.locator(this.element).screenshot({ path: formatScreenshotFile(this.name) });

        return { name: imageName, image };
    }
}
