import { auth } from './packages/shared-lib/auth';
import { getConfiguredAuthBaseURL } from './packages/shared-lib/auth-config';

async function run() {
  const headers = new Headers();
  headers.set('Cookie', '__Secure-sportcation.session_token=XIhS12TnAv854DZtPIruXbNMTWZq5rfZ.egppiKJUIOzLtiEHOcqi77KZN7PWQGRo%2Fr6IGTNOlXw%3D');
  
  // Set Host to something random to simulate mismatch
  headers.set('Host', 'sportcation-admin-rho.vercel.app');
  headers.set('x-forwarded-host', 'sportcation-admin-rho.vercel.app');

  const customHeaders = new Headers(headers);
  const configuredBaseURL = getConfiguredAuthBaseURL();
  if (configuredBaseURL) {
    const url = new URL(configuredBaseURL);
    customHeaders.set("Host", url.host);
    customHeaders.set("X-Forwarded-Host", url.host);
  }
  
  try {
    const session = await auth.api.getSession({ headers: customHeaders });
    console.log("SESSION:", session ? "FOUND" : "NULL");
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
