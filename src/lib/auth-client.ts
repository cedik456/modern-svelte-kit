import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/client';

// /client instead of /svelte (recommended version)

export const authClient = createAuthClient({
	plugins: [adminClient()]
});
