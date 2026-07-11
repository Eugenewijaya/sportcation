const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('response', response => {
    if (response.url().includes('sign-in')) {
      console.log('Login response status:', response.status());
      response.text().then(text => console.log('Login response body:', text)).catch(() => {});
    }
  });

  try {
    await page.goto('https://sportcation-admin-rho.vercel.app/admin/login');
    await page.fill('input[type="email"]', 'superadmin@sportcation.local');
    await page.fill('input[type="password"]', 'sportcation2026');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(5000);
    
    console.log('Current URL:', page.url());
    const bodyText = await page.innerText('body');
    if (bodyText.includes('Invalid') || bodyText.includes('failed') || bodyText.includes('Error')) {
      console.log('Found error text on page:', bodyText);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
