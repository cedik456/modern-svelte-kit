import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { ensureUserUsername } from '$lib/server/users';

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) throw redirect(302, '/');
	return {};
};

export const actions: Actions = {
	signUpEmail: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name')?.toString() ?? '';
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			const result = await auth.api.signUpEmail({
				body: { name, email, password, callbackURL: '/' }
			});
			await ensureUserUsername({
				id: result.user.id,
				name: result.user.name,
				email: result.user.email
			});
		} catch (error) {
			if (error instanceof APIError)
				return fail(400, { message: error.message || 'Signup failed' });
			return fail(500, { message: 'Unexpected error' });
		}

		throw redirect(302, '/');
	}
};
