// import axios from 'axios';
// import MockAdapter from 'axios-mock-adapter';
// import { subscribeToNewsletter, unsubscribeFromNewsletter } from '@/app/api/newsletter/index';

// const mock = new MockAdapter(axios);

// afterEach(() => mock.reset());

// describe('subscribeToNewsletter', () => {
//   it('returns success on 200', async () => {
//     mock.onPost('/api/v1/newsletter/').reply(200, { success: true, message: 'Subscribed!' });
//     const result = await subscribeToNewsletter({ email: 'user@example.com' });
//     expect(result.success).toBe(true);
//     expect(result.message).toBe('Subscribed!');
//   });

//   it('trims and lowercases the email before sending', async () => {
//     mock.onPost('/api/v1/newsletter/').reply(200, { success: true, message: 'ok' });
//     await subscribeToNewsletter({ email: '  User@Example.COM  ' });
//     const body = JSON.parse(mock.history.post[0].data);
//     expect(body.email).toBe('user@example.com');
//   });

//   it('returns failure when server responds with error', async () => {
//     mock.onPost('/api/v1/newsletter/').reply(400, { message: 'Already subscribed.' });
//     const result = await subscribeToNewsletter({ email: 'user@example.com' });
//     expect(result.success).toBe(false);
//     expect(result.message).toBe('Already subscribed.');
//   });

//   it('returns network error message on timeout', async () => {
//     mock.onPost('/api/v1/newsletter/').timeout();
//     const result = await subscribeToNewsletter({ email: 'user@example.com' });
//     expect(result.success).toBe(false);
//     expect(result.message).toMatch(/timed out|network/i);
//   });

//   it('returns network error message when no response received', async () => {
//     mock.onPost('/api/v1/newsletter/').networkError();
//     const result = await subscribeToNewsletter({ email: 'user@example.com' });
//     expect(result.success).toBe(false);
//     expect(result.message).toMatch(/network/i);
//   });
// });

// describe('unsubscribeFromNewsletter', () => {
//   it('returns success on 200', async () => {
//     mock.onPost('/api/newsletter/unsubscribe/').reply(200, { success: true, message: 'Unsubscribed.' });
//     const result = await unsubscribeFromNewsletter({ email: 'user@example.com' });
//     expect(result.success).toBe(true);
//   });

//   it('returns failure when server responds with error', async () => {
//     mock.onPost('/api/newsletter/unsubscribe/').reply(404, { message: 'Email not found.' });
//     const result = await unsubscribeFromNewsletter({ email: 'unknown@example.com' });
//     expect(result.success).toBe(false);
//     expect(result.message).toBe('Email not found.');
//   });
// });
