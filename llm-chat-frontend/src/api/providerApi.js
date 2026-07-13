import axiosClient from './axiosClient';

export const providerApi = {
  fetchProviders: async () => {
    const res = await axiosClient.get('/providers');
    return res.data.data || res.data.providers || res.data;
  },
  createProvider: async (payload) => {
    const res = await axiosClient.post('/providers', payload);
    return res.data.data || res.data.provider || res.data;
  },
  updateProvider: async (id, payload) => {
    const res = await axiosClient.put(`/providers/${id}`, payload);
    return res.data.data || res.data.provider || res.data;
  },
  deleteProvider: async (id) => {
    const res = await axiosClient.delete(`/providers/${id}`);
    return res.data;
  },
};
