const envKeys = [
    "PRIVY_APP_SECRET",
    "PRIVY_APP_ID",
    "DB_URI",
    "NODE_ENV",
] as const;

type ENV = Record<typeof envKeys[number], string>;

let env: ENV = {} as any;

export function ensureEnv() {
    for (const key of envKeys) {
        if (!Bun.env[key]) {
            throw new Error(`Environment variable ${key} is not set`);
        }
    }

    env = Object.fromEntries(
        envKeys.map((key) => [key, Bun.env[key]]),
    ) as ENV;
}
ensureEnv();

export default env;
