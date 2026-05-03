import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

function toUsernameBase(value: string) {
	const slug = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 24);

	return slug || 'runner';
}

export async function createUniqueUsername(seed: string) {
	const base = toUsernameBase(seed);

	for (let index = 0; index < 50; index += 1) {
		const candidate = index === 0 ? base : `${base}-${index + 1}`;
		const [existingUser] = await db
			.select({ id: user.id })
			.from(user)
			.where(eq(user.username, candidate))
			.limit(1);

		if (!existingUser) return candidate;
	}

	return `${base}-${randomUUID().slice(0, 8)}`;
}

export async function ensureUserUsername(options: {
	id: string;
	name?: string | null;
	email?: string | null;
}) {
	const [existingUser] = await db
		.select({
			username: user.username,
			name: user.name,
			email: user.email
		})
		.from(user)
		.where(eq(user.id, options.id))
		.limit(1);

	if (!existingUser) return null;
	if (existingUser.username) return existingUser.username;

	const username = await createUniqueUsername(
		options.name ?? existingUser.name ?? options.email ?? existingUser.email ?? options.id
	);

	await db.update(user).set({ username }).where(eq(user.id, options.id));

	return username;
}
