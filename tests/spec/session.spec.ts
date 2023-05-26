import request from 'supertest';
import testServerPromise, { TestServer } from '../test-server';

let testServer: TestServer;
beforeAll(async () => {
  testServer = await testServerPromise;
});

describe('POST /user/session/:sessionId', () => {
  test('sessionId URL param is required', async () => {
    request(testServer.server)
      .post('/api/user/session/notanexistingid')
      .expect('Content-Type', /json/)
      .expect(404);
  });
});
