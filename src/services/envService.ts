import { boolean, object, optional, parse, picklist, pipe, string, transform, ValiError, type InferOutput } from 'valibot';

const env = {
	PLASMO_PUBLIC_SHORTCUT: { value: process.env.PLASMO_PUBLIC_SHORTCUT, validator: string() },
	PLASMO_PUBLIC_VERSION: { value: process.env.PLASMO_PUBLIC_VERSION, validator: string() },
	PLASMO_PUBLIC_VERSION_NAME: { value: process.env.PLASMO_PUBLIC_VERSION_NAME, validator: string() },
	PLASMO_PUBLIC_TARGET: {
		value: process.env.PLASMO_PUBLIC_TARGET,
		validator: string(),
	},
	NODE_ENV: {
		value: process.env.NODE_ENV,
		validator: pipe(
			string(),
			transform((input) => input as typeof process.env.NODE_ENV),
		),
	},
	PLASMO_PUBLIC_DEBUG: {
		value: process.env.PLASMO_PUBLIC_DEBUG,
		validator: pipe(
			optional(picklist(['TRUE', 'FALSE'] as const), 'FALSE'),
			transform((input) => ({ TRUE: true, FALSE: false, '': false })[input]),
			boolean(),
		),
	},
	PLASMO_PUBLIC_ENABLE_TRACKING: {
		value: process.env.PLASMO_PUBLIC_ENABLE_TRACKING,
		validator: pipe(
			optional(picklist(['TRUE', 'FALSE'] as const), 'FALSE'),
			transform((input) => ({ TRUE: true, FALSE: false })[input] ?? false),
			boolean(),
		),
	},
	PLASMO_PUBLIC_HOME_URL: { value: process.env.PLASMO_PUBLIC_HOME_URL, validator: optional(string(), '') },
};

type Env = typeof env;

console.log({ env });

let envSchema = object(Object.fromEntries(Object.entries(env).map(([key, { validator }]) => [key, validator])) as { [K in keyof Env]: Env[K]['validator'] });
let envSelection = Object.fromEntries(Object.entries(env).map(([key, { value }]) => [key, value])) as (typeof process)['env'];
let sourceEnv: InferOutput<typeof envSchema>;

try {
	sourceEnv = parse(envSchema, envSelection);
} catch (error) {
	const zerr = JSON.stringify(error as typeof ValiError, null, 2);
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

console.log({ envService });

export { envService };
