import { z } from 'zod';

const booleanMap = new Map<'true' | 'false' | undefined, boolean>([
	['true', true],
	['false', false],
	[undefined, false],
]);

const env = {
	PLASMO_VERSION: { value: process.env.PLASMO_VERSION, validator: z.string().optional() },
	PLASMO_VERSION_NAME: { value: process.env.PLASMO_VERSION_NAME, validator: z.string().optional() },
	PLASMO_TARGET: {
		value: process.env.PLASMO_TARGET,
		validator: z
			.string()
			.default('')
			.transform((x) => x as typeof process.env.PLASMO_TARGET),
	},
	NODE_ENV: {
		value: process.env.NODE_ENV,
		validator: z
			.string()
			.optional()
			.transform((x) => x as typeof process.env.NODE_ENV),
	},
	PLASMO_DEBUG: {
		value: process.env.PLASMO_DEBUG,
		validator: z
			.boolean()
			.or(
				z
					.enum(['true', 'false'])
					// .optional()
					// .default('true')
					.transform((x) => booleanMap.get(x as keyof typeof booleanMap.keys)),
			)
			.default(false),
	},
	PLASMO_ENABLE_TRACKING: {
		value: process.env.PLASMO_ENABLE_TRACKING,
		validator: z
			.boolean()
			.or(
				z
					.enum(['true', 'false'])
					.optional()
					.default('false')
					.transform((x) => booleanMap.get(x as keyof typeof booleanMap.keys)),
			)
			.default(false),
	},
	PLASMO_HOME_URL: { value: process.env.PLASMO_HOME_URL, validator: z.string().optional() },
};

type Env = typeof env;

console.log({ env });

let envSchema = z.object(Object.fromEntries(Object.entries(env).map(([key, { validator }]) => [key, validator])) as { [K in keyof Env]: Env[K]['validator'] });
let envSelection = Object.fromEntries(Object.entries(env).map(([key, { value }]) => [key, value])) as (typeof process)['env'];
let sourceEnv: z.infer<typeof envSchema>;

try {
	sourceEnv = envSchema.parse(envSelection);
} catch (error) {
	const zerr = JSON.stringify((error as z.ZodError).flatten(), null, 2);
	console.error(zerr);
	throw new Error(zerr);
}

const envService = {
	...sourceEnv,
	get isProduction(): boolean {
		return /production/i.test(this.NODE_ENV);
	},
	get showDebugInfo(): boolean {
		return !this.isProduction;
	},
};

export { envService };
