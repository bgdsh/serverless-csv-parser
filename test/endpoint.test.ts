import { config as dotEnvConfig } from 'dotenv';
import axios, { AxiosInstance } from 'axios';

dotEnvConfig();

describe('the API works', () => {
    let httpClient: AxiosInstance;
    beforeAll(() => {
        httpClient = axios.create({
            baseURL: process.env.ENDPOINT
        })
    })

    it('should return success when a valid data file provided', async () => {
        const res = await httpClient.post('', { key: 'test-data.csv' });
        expect(res.data.success).toBeTruthy();
    });

    it('should reutrn 400 when a non-exist file provided', async () => {
        try {
            await httpClient.post('', { key: 'test-data1.csv' });
        } catch (error) {
            expect(error.response.status).toBe(400);
        }
    });

    // it('should reutrn 400 when a very large file provided', async () => {

    // });

    // it('should reutrn 400 when a wrong data structure file provided', async () => {

    // });
});