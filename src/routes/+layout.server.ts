// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { ensureUserUsername } from '$lib/server/users';

export const load: LayoutServerLoad = async ({ locals }) => {
	const publicUsername = locals.user
		? await ensureUserUsername({
				id: locals.user.id,
				name: locals.user.name,
				email: locals.user.email
			})
		: null;

	return {
		user: locals.user,
		publicUsername
	};
};
