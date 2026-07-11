const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  page.on('response', response => {
    if (response.url().includes('/api/auth/sign-in/email')) {
      console.log('LOGIN RESPONSE STATUS:', response.status());
      response.text().then(text => console.log('LOGIN RESPONSE BODY:', text));
      response.headersArray().then(headers => {
        const setCookie = headers.find(h => h.name.toLowerCase() === 'set-cookie');
        console.log('LOGIN SET-COOKIE:', setCookie ? setCookie.value : 'NULL');
      });
    }
  });

  await page.goto('https://sportcation-admin-rho.vercel.app/admin/login');
  await page.fill('input[type="email"]', 'superadmin@sportcation.local');
  await page.fill('input[type="password"]', 'sportcation2026');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('URL:', page.url());
  await browser.close();
})();
