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

export const buildResponse = (status: 200 | 400 | 500, extra: any = {}) => {
    return {
        statusCode: status,
        body: JSON.stringify({
          success: status === 200,
          ... extra
        }),
      };
} 
