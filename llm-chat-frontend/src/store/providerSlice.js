import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { providerApi } from '../api/providerApi';
import { BUILTIN_PROVIDER_PROFILES } from '../config/models';

export const fetchProviders = createAsyncThunk('providers/fetchProviders', async (_, { rejectWithValue }) => {
  try {
    return await providerApi.fetchProviders();
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createProviderAsync = createAsyncThunk('providers/createProvider', async (payload, { rejectWithValue }) => {
  try {
    return await providerApi.createProvider(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const updateProviderAsync = createAsyncThunk('providers/updateProvider', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await providerApi.updateProvider(id, payload);
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deleteProviderAsync = createAsyncThunk('providers/deleteProvider', async (id, { rejectWithValue }) => {
  try {
    await providerApi.deleteProvider(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState = {
  builtinProfiles: BUILTIN_PROVIDER_PROFILES,
  customProfiles: [],
  isLoading: false,
  error: null,
};

const providerSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customProfiles = (action.payload || []).filter((profile) => !profile.isBuiltin);
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProviderAsync.fulfilled, (state, action) => {
        state.customProfiles.unshift(action.payload);
      })
      .addCase(updateProviderAsync.fulfilled, (state, action) => {
        const idx = state.customProfiles.findIndex((profile) => profile.id === action.payload.id);
        if (idx >= 0) state.customProfiles[idx] = action.payload;
      })
      .addCase(deleteProviderAsync.fulfilled, (state, action) => {
        state.customProfiles = state.customProfiles.filter((profile) => profile.id !== action.payload);
      });
  },
});

export const selectAllProviderProfiles = (state) => [...state.providers.builtinProfiles, ...state.providers.customProfiles];
export const selectProviderByKey = (state, key) => selectAllProviderProfiles(state).find((profile) => profile.id === key) || selectAllProviderProfiles(state).find((profile) => profile.providerType === key) || null;

export default providerSlice.reducer;
