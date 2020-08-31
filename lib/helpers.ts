export const getIntEnvValue = (envName: string, defaultValue?: number): number => {
    const envValue = process.env[envName];
    if (envValue) {
        const parsed = parseInt(envValue, 10);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    return defaultValue;
}
