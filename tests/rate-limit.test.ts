// import axios from 'axios';
// import MockAdapter from 'axios-mock-adapter';
// import { submitContactForm } from '@/app/api/contact/index';
// import { subscribeToNewsletter } from '@/app/api/newsletter/index';

// const mock = new MockAdapter(axios);

// afterEach(() => mock.reset());

// const validContact = {
//   fullName: 'Jane Doe',
//   email: 'jane@example.com',
//   subject: 'Inquiry',
//   message: 'Hello, I have a question about the process.',
// };

// describe('rate limit handling — contact form', () => {
//   it('returns a clear message when 429 is returned', async () => {
//     mock.onPost('/api/v1/contact/').reply(429, { message: 'Too many requests. Try again later.' });
//     const result = await submitContactForm(validContact);
//     expect(result.success).toBe(false);
//     expect(result.message).toMatch(/too many|limit|contact us directly/i);
//   });

//   it('falls back to default message when 429 has no body message', async () => {
//     mock.onPost('/api/v1/contact/').reply(429, {});
//     const result = await submitContactForm(validContact);
//     expect(result.success).toBe(false);
//     expect(result.message).toBeTruthy();
//   });
// });

// describe('rate limit handling — newsletter', () => {
//   it('returns failure message when 429 is returned', async () => {
//     mock.onPost('/api/v1/newsletter/').reply(429, { message: 'Subscription rate limit exceeded.' });
//     const result = await subscribeToNewsletter({ email: 'user@example.com' });
//     expect(result.success).toBe(false);
//     expect(result.message).toBeTruthy();
//   });
// });

// describe('timeout handling', () => {
//   it('contact form returns timeout message on ECONNABORTED', async () => {
//     mock.onPost('/api/v1/contact/').timeout();
//     const result = await submitContactForm(validContact);
//     expect(result.success).toBe(false);
//     expect(result.message).toMatch(/timed out|timeout/i);
//   });

//   it('newsletter returns timeout message on ECONNABORTED', async () => {
//     mock.onPost('/api/v1/newsletter/').timeout();
//     const result = await subscribeToNewsletter({ email: 'user@example.com' });
//     expect(result.success).toBe(false);
//     expect(result.message).toMatch(/timed out/i);
//   });
// });
