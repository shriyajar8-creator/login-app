import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchEmployees = createAsyncThunk('employees/fetch', async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/api/employees', { params: { page, limit } });
    if (data.success) return data;
    return rejectWithValue(data);
  } catch (e) {
    return rejectWithValue({ message: e.message });
  }
});

export const createEmployee = createAsyncThunk('employees/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/api/employees', payload);
    if (data.success) return data;
    return rejectWithValue(data);
  } catch (e) {
    return rejectWithValue({ message: e.message });
  }
});

const employeesSlice = createSlice({
  name: 'employees',
  initialState: { list: [], meta: { total: 0, page: 1, limit: 10 }, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.list = action.payload.employees; state.meta = action.payload.meta; state.loading = false; })
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createEmployee.fulfilled, (state, action) => { state.list.unshift(action.payload.employee); state.meta.total += 1; });
  },
});

export default employeesSlice.reducer;
