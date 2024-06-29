import { createSlice } from "@reduxjs/toolkit";

import { dispatch } from "../store";

const initialState = {
  sidebar: {
    open: false,
    type: "CONTACT", // CONTACT, STARRED, SHARED
  },
};

const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    toggleSidebar(state, action) {
      state.sidebar.open = !state.sidebat.open;
    },
    updateSidebarType(state, action) {
      state.sidebar.type = action.payload.type;
    },
  },
});

export default slice.reducer;
