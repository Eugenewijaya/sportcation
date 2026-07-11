import { auth } from './packages/shared-lib/auth';

async function run() {
  const headers = new Headers();
  // Mimic the cookie we got from the successful login
  headers.set('Cookie', '__Secure-sportcation.session_token=XIhS12TnAv854DZtPIruXbNMTWZq5rfZ.egppiKJUIOzLtiEHOcqi77KZN7PWQGRo%2Fr6IGTNOlXw%3D');
  headers.set('Host', 'sportcation-admin-rho.vercel.app');
  headers.set('Origin', 'https://sportcation-admin-rho.vercel.app');
  headers.set('x-forwarded-host', 'sportcation-admin-rho.vercel.app');
  
  try {
    const session = await auth.api.getSession({ headers });
    console.log("SESSION:", session);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
