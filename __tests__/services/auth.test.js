/* eslint-disable @typescript-eslint/camelcase */
import { authenticate } from '../../src/services/api/auth';

describe('auth', () => {
  it('authenticate', async () => {
    const mockResponse = {
      status: 200,
      json: () =>
        Promise.resolve({
          access_token:
            '00D0k0000009BZv!AQsAQBsfvqj2WsGla54T27iiyhWgR4uFbf1C273NRdBaB74bYGtgo6YAui9Qz74ANk5YZwryd.0b0UQg27bB4dwJ2DB69lYi',
          instance_url: 'https://example.my.salesforce.com',
        }),
    };
    global.fetch = jest.fn().mockResolvedValueOnce(mockResponse);
    global.storage = { save: jest.fn() };

    const response = await authenticate('example@example.com', 'password');
    expect(response.access_token).toBeTruthy();
    expect(response.instance_url).toBeTruthy();
  });
});
