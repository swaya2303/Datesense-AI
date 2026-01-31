import { redirect } from '@sveltejs/kit';

export const load = ({ locals }: { locals: App.Locals }) => {
	if (locals.user) {
		throw redirect(302, '/dashboard');
	}
	return {};
};
