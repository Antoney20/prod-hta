// import axios from 'axios';
// import MockAdapter from 'axios-mock-adapter';
// import { submitProposal, checkSubmissionStatus, checkMultipleSubmissions } from '@/app/api/interventions/index';
// import type { FormData } from '@/types/form';

// const mock = new MockAdapter(axios);

// afterEach(() => mock.reset());

// const validForm: FormData = {
//   name: 'John Kamau',
//   phone: '0700000000',
//   email: 'john@example.com',
//   profession: 'Doctor',
//   organization: 'MOH',
//   county: 'Nairobi',
//   interventionName: 'Malaria Rapid Test Kit',
//   interventionType: 'Diagnostic',
//   beneficiary: 'Children under 5',
//   justification: 'High malaria burden in the region',
//   expectedImpact: 'Reduce child mortality by 20%',
//   signature: 'John Kamau',
//   date: '2026-04-13',
//   additionalInfo: '',
//   uploadedDocument: null,
// };

// describe('submitProposal', () => {
//   it('returns success on 200', async () => {
//     mock.onPost('/api/v1/intervention-proposal/').reply(200, {
//       success: true,
//       message: 'Proposal submitted.',
//       submission_id: 'abc-123',
//     });
//     const result = await submitProposal(validForm);
//     expect(result.success).toBe(true);
//     expect(result.submission_id).toBe('abc-123');
//   });

//   it('sends form as multipart/form-data', async () => {
//     mock.onPost('/api/v1/intervention-proposal/').reply(200, { success: true, message: 'ok' });
//     await submitProposal(validForm);
//     const headers = mock.history.post[0].headers;
//     expect(headers?.['Content-Type']).toMatch(/multipart\/form-data/i);
//   });

//   it('returns failure with server error message on 400', async () => {
//     mock.onPost('/api/v1/intervention-proposal/').reply(400, { message: 'Invalid data.' });
//     const result = await submitProposal(validForm);
//     expect(result.success).toBe(false);
//     expect(result.message).toBe('Invalid data.');
//   });

//   it('returns network error when request fails', async () => {
//     mock.onPost('/api/v1/intervention-proposal/').networkError();
//     const result = await submitProposal(validForm);
//     expect(result.success).toBe(false);
//     expect(result.message).toMatch(/network/i);
//   });

//   it('returns generic error for unexpected throw', async () => {
//     mock.onPost('/api/v1/intervention-proposal/').reply(() => { throw new Error('unexpected'); });
//     const result = await submitProposal(validForm);
//     expect(result.success).toBe(false);
//   });
// });

// describe('checkSubmissionStatus', () => {
//   it('returns submission status for a valid id', async () => {
//     const fakeStatus = {
//       submission_id: 'abc-123',
//       status: 'pending',
//       attempts: 1,
//       submitted_at: '2026-04-13T10:00:00Z',
//       completed_at: null,
//       proposal_id: null,
//     };
//     mock.onGet('/api/v1/intervention-proposal/').reply(200, fakeStatus);
//     const result = await checkSubmissionStatus('abc-123');
//     expect(result).not.toBeNull();
//     expect(result?.status).toBe('pending');
//   });

//   it('returns null on error', async () => {
//     mock.onGet('/api/v1/intervention-proposal/').networkError();
//     const result = await checkSubmissionStatus('abc-123');
//     expect(result).toBeNull();
//   });
// });

// describe('checkMultipleSubmissions', () => {
//   it('returns array of statuses', async () => {
//     const fakeSubmissions = [
//       { submission_id: 'id-1', status: 'completed', attempts: 1, submitted_at: '2026-04-13T10:00:00Z', completed_at: '2026-04-13T11:00:00Z', proposal_id: 42 },
//     ];
//     mock.onPost('/api/v1/check-multiple-submissions/').reply(200, { submissions: fakeSubmissions });
//     const result = await checkMultipleSubmissions(['id-1']);
//     expect(result).toHaveLength(1);
//     expect(result[0].status).toBe('completed');
//   });

//   it('returns empty array on error', async () => {
//     mock.onPost('/api/v1/check-multiple-submissions/').networkError();
//     const result = await checkMultipleSubmissions(['id-1', 'id-2']);
//     expect(result).toEqual([]);
//   });
// });
