const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    // Using absolute path for Windows
    await page.goto('file:///D:/www/WEB_HDC_AI_Poster.html', { waitUntil: 'networkidle' });
    await page.pdf({ 
      path: 'D:/www/WEB_HDC_AI_Poster.pdf', 
      format: 'A4', 
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });
    await browser.close();
    console.log('PDF generated successfully: D:/www/WEB_HDC_AI_Poster.pdf');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
