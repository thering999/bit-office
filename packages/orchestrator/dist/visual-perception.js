import path from "path";
import { mkdirSync, existsSync } from "fs";
import { homedir } from "os";
import { nanoid } from "nanoid";
const SCREENSHOT_DIR = path.join(homedir(), ".bit-office", "screenshots");
export class VisualPerception {
    browser = null;
    constructor() {
        if (!existsSync(SCREENSHOT_DIR)) {
            mkdirSync(SCREENSHOT_DIR, { recursive: true });
        }
    }
    async getBrowser() {
        if (!this.browser) {
            const { chromium } = await import("playwright");
            this.browser = await chromium.launch({
                headless: true,
            });
        }
        return this.browser;
    }
    async captureScreenshot(url, options = {}) {
        const browser = await this.getBrowser();
        const context = await browser.newContext({
            viewport: {
                width: options.width || 1280,
                height: options.height || 800,
            },
        });
        const page = await context.newPage();
        try {
            console.log(`[VisualPerception] Capturing screenshot of ${url}...`);
            await page.goto(url, { waitUntil: "networkidle" });
            const filename = `screenshot-${nanoid()}.png`;
            const filepath = path.join(SCREENSHOT_DIR, filename);
            await page.screenshot({ path: filepath, fullPage: true });
            await context.close();
            return filepath;
        }
        catch (err) {
            console.error("[VisualPerception] Failed to capture screenshot:", err);
            await context.close();
            throw err;
        }
    }
    async captureState(agentId, prompt) {
        // Placeholder for multimodal state capture
        if (agentId)
            console.log(`[VisualPerception] Capturing state for ${agentId}...`);
        return null;
    }
    async dispose() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}
export const visualPerception = new VisualPerception();
//# sourceMappingURL=visual-perception.js.map