// Minimal ambient declarations for the serverless runtime.
//
// Vercel supplies Node's types when it builds this directory, but the local
// `tsc -p api/tsconfig.json` check has no @types/node — and adding that
// dependency purely to type two globals is not worth it. Declaring exactly
// what is used keeps the local check honest without touching package.json.
declare const process: { env: Record<string, string | undefined> };
