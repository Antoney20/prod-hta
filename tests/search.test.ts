// import MockAdapter from 'axios-mock-adapter';
// import { searchInterventions } from '@/app/api/new/search/index';

// // The search module uses the authenticated api instance from @/app/api/auth.
// // We reach it via the same axios instance it imports.
// jest.mock('@/app/api/auth', () => {
//   const axios = require('axios');
//   return {
//     __esModule: true,
//     default: axios.create(),
//   };
// });

// import api from '@/app/api/auth';
// import axios from 'axios';

// const mock = new MockAdapter(api as unknown as typeof axios);

// afterEach(() => mock.reset());

// describe('searchInterventions', () => {
//   it('returns results for a valid query', async () => {
//     const fakeResults = [
//       { id: '1', reference_number: 'REF-001', intervention_name: 'Malaria vaccine', county: 'Nairobi', intervention_type: 'Vaccine' },
//     ];
//     mock.onGet('/v3/interventions/search/').reply(200, { data: fakeResults });
//     const results = await searchInterventions('malaria');
//     expect(results).toHaveLength(1);
//     expect(results[0].intervention_name).toBe('Malaria vaccine');
//   });

//   it('returns empty array for empty query', async () => {
//     const results = await searchInterventions('');
//     expect(results).toEqual([]);
//   });

//   it('returns empty array for whitespace-only query', async () => {
//     const results = await searchInterventions('   ');
//     expect(results).toEqual([]);
//   });

//   it('truncates query to 20 characters before sending', async () => {
//     mock.onGet('/v3/interventions/search/').reply(200, { data: [] });
//     await searchInterventions('a'.repeat(50));
//     const params = mock.history.get[0].params;
//     expect(params.q.length).toBeLessThanOrEqual(20);
//   });

//   it('returns empty array on network error', async () => {
//     mock.onGet('/v3/interventions/search/').networkError();
//     const results = await searchInterventions('diabetes');
//     expect(results).toEqual([]);
//   });

//   it('returns empty array when data field is missing', async () => {
//     mock.onGet('/v3/interventions/search/').reply(200, {});
//     const results = await searchInterventions('hiv');
//     expect(results).toEqual([]);
//   });
// });
