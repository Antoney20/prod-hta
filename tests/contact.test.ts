// import axios from 'axios';
// import MockAdapter from 'axios-mock-adapter';
// import { validateContactForm, submitContactForm } from '@/app/api/contact/index';

// const mock = new MockAdapter(axios);

// afterEach(() => mock.reset());

// // ─── Validation ────────────────────────────────────────────────────────────────

// describe('validateContactForm', () => {
//   const valid = {
//     fullName: 'Jane Doe',
//     email: 'jane@example.com',
//     subject: 'Panel inquiry',
//     message: 'Please send me more information about the process.',
//   };

//   it('passes for a complete valid form', () => {
//     const result = validateContactForm(valid);
//     expect(result.isValid).toBe(true);
//     expect(result.errors).toHaveLength(0);
//   });

//   it('fails when fullName is empty', () => {
//     const result = validateContactForm({ ...valid, fullName: '' });
//     expect(result.isValid).toBe(false);
//     expect(result.errors).toContain('Full name is required');
//   });

//   it('fails when fullName is a single character', () => {
//     const result = validateContactForm({ ...valid, fullName: 'A' });
//     expect(result.isValid).toBe(false);
//     expect(result.errors.some((e) => e.includes('at least 2'))).toBe(true);
//   });

//   it('fails for an invalid email', () => {
//     const result = validateContactForm({ ...valid, email: 'not-an-email' });
//     expect(result.isValid).toBe(false);
//     expect(result.errors.some((e) => e.toLowerCase().includes('email'))).toBe(true);
//   });

//   it('fails when subject is too short', () => {
//     const result = validateContactForm({ ...valid, subject: 'Hi' });
//     expect(result.isValid).toBe(false);
//     expect(result.errors.some((e) => e.includes('Subject'))).toBe(true);
//   });

//   it('fails when message is shorter than 10 characters', () => {
//     const result = validateContactForm({ ...valid, message: 'Short' });
//     expect(result.isValid).toBe(false);
//     expect(result.errors.some((e) => e.includes('Message'))).toBe(true);
//   });

//   it('collects multiple errors at once', () => {
//     const result = validateContactForm({ fullName: '', email: 'bad', subject: '', message: '' });
//     expect(result.errors.length).toBeGreaterThan(1);
//   });
// });

// // ─── Submission ────────────────────────────────────────────────────────────────

// describe('submitContactForm', () => {
//   const data = {
//     fullName: 'Jane Doe',
//     email: 'jane@example.com',
//     organization: 'MOH',
//     subject: 'Panel inquiry',
//     message: 'Please send me more information about the BPTAP process.',
//   };

//   it('returns success on 200', async () => {
//     mock.onPost('/api/v1/contact/').reply(200, { success: true, message: 'Message sent.' });
//     const result = await submitContactForm(data);
//     expect(result.success).toBe(true);
//     expect(result.message).toBe('Message sent.');
//   });

//   it('maps full_name correctly in the request body', async () => {
//     mock.onPost('/api/v1/contact/').reply(200, { success: true, message: 'ok' });
//     await submitContactForm(data);
//     const body = JSON.parse(mock.history.post[0].data);
//     expect(body.full_name).toBe('Jane Doe');
//   });

//   it('returns validation errors from 400 response', async () => {
//     mock.onPost('/api/v1/contact/').reply(400, {
//       message: 'Validation failed.',
//       errors: { email: ['Invalid email format.'] },
//     });
//     const result = await submitContactForm(data);
//     expect(result.success).toBe(false);
//     expect(result.errors).toBeDefined();
//   });

//   it('returns failure on server error', async () => {
//     mock.onPost('/api/v1/contact/').reply(500, { message: 'Internal server error.' });
//     const result = await submitContactForm(data);
//     expect(result.success).toBe(false);
//   });

//   it('returns network error message when connection fails', async () => {
//     mock.onPost('/api/v1/contact/').networkError();
//     const result = await submitContactForm(data);
//     expect(result.success).toBe(false);
//     expect(result.message).toMatch(/network/i);
//   });
// });
