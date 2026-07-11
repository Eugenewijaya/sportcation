const { chromium } = require('playwright');

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('request', request => {
    if (request.url().includes('/api/auth/')) {
      console.log('AUTH REQUEST:', request.method(), request.url());
    }
  });
  page.on('response', response => {
    if (response.url().includes('/api/auth/')) {
      console.log('AUTH RESPONSE:', response.url(), response.status());
      const headers = response.headers();
      if (headers['set-cookie']) {
        console.log('SET-COOKIE:', headers['set-cookie']);
      }
    }
  });

  try {
    console.log('Navigating to login page...');
    await page.goto('https://sportcation-admin-rho.vercel.app/admin/login');

    console.log('Filling login form...');
    await page.fill('input[type="email"]', 'superadmin@sportcation.local');
    await page.fill('input[type="password"]', 'sportcation2026');
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation after login...');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(e => console.log('Navigation timeout or already loaded'));
    
    // Wait for the dashboard to render (Stats or the specific UI)
    console.log('Waiting for dashboard to render...');
    await page.waitForTimeout(5000); // Give it some time to fetch and render

    const url = page.url();
    console.log('Current URL:', url);

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'D:/sportcation/v0-landing-page-sportcation/dashboard-screenshot.png', fullPage: true });

    console.log('Checking page text content...');
    const bodyText = await page.innerText('body');
    if (bodyText.includes('Loading')) {
      console.log('WARNING: Still seeing loading state');
    }
    if (bodyText.includes('Sportcation') || bodyText.includes('Overview') || bodyText.includes('Total')) {
      console.log('SUCCESS: Dashboard elements found');
    }

    console.log('Done.');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
