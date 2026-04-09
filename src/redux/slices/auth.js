import { createSlice } from "@reduxjs/toolkit";
import axios from "../../utils/axios";
import { showSnackbar } from "./app";
import { disconnectSocket } from "../../socket";

const token = window.localStorage.getItem("token");

const initialState = {
  isLoading: false,
  isLoggedIn: Boolean(token),
  token: token || "",
  email: "",
  error: false,
};

const getErrorMessage = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.message || fallbackMessage;
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    logIn(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
    },
    signOut(state) {
      state.isLoggedIn = false;
      state.token = "";
    },
    updateRegisterEmail(state, action) {
      state.email = action.payload.email;
    },
  },
});

export default slice.reducer;

export function LoginUser(formValues) {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        "/auth/login",
        { ...formValues },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(
        slice.actions.logIn({
          isLoggedIn: true,
          token: response.data.token,
        }),
      );

      window.localStorage.setItem("user_id", response.data.user_id);
      window.localStorage.setItem("token", response.data.token);

      dispatch(
        showSnackbar({
          severity: "success",
          message: response.data.message || "Logged in successfully",
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message: getErrorMessage(error, "Login failed"),
        }),
      );
    }
  };
}

export function LogoutUser() {
  return async (dispatch) => {
    disconnectSocket();
    window.localStorage.removeItem("user_id");
    window.localStorage.removeItem("token");
    dispatch(slice.actions.signOut());
  };
}

export function ForgotPassword(formValues) {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        "/auth/forgot-password",
        { ...formValues },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(
        showSnackbar({
          severity: "success",
          message:
            response.data.message || "Password reset email sent successfully",
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message: getErrorMessage(error, "Failed to send reset email"),
        }),
      );
    }
  };
}

export function NewPassword(formValues) {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        "/auth/reset-password",
        { ...formValues },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(
        slice.actions.logIn({
          isLoggedIn: true,
          token: response.data.token,
        }),
      );

      window.localStorage.setItem("user_id", response.data.user_id);
      window.localStorage.setItem("token", response.data.token);

      dispatch(
        showSnackbar({
          severity: "success",
          message: response.data.message || "Password reset successfully",
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message: getErrorMessage(error, "Failed to reset password"),
        }),
      );
    }
  };
}

export function RegisterUser(formValues) {
  return async (dispatch) => {
    dispatch(slice.actions.updateIsLoading({ isLoading: true, error: false }));

    try {
      const response = await axios.post(
        "/auth/register",
        { ...formValues },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(slice.actions.updateRegisterEmail({ email: formValues.email }));
      dispatch(
        slice.actions.updateIsLoading({ isLoading: false, error: false }),
      );

      dispatch(
        showSnackbar({
          severity: "success",
          message:
            response.data.message ||
            "Registration successful. Please verify your email.",
        }),
      );

      window.location.href = "/auth/verify";
    } catch (error) {
      dispatch(
        slice.actions.updateIsLoading({ isLoading: false, error: true }),
      );

      dispatch(
        showSnackbar({
          severity: "error",
          message: getErrorMessage(error, "Registration failed"),
        }),
      );
    }
  };
}

export function VerifyEmail(formValues) {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        "/auth/verify",
        { ...formValues },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      dispatch(
        slice.actions.logIn({
          isLoggedIn: true,
          token: response.data.token,
        }),
      );

      window.localStorage.setItem("user_id", response.data.user_id);
      window.localStorage.setItem("token", response.data.token);

      dispatch(
        showSnackbar({
          severity: "success",
          message: response.data.message || "Email verified successfully",
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message: getErrorMessage(error, "Email verification failed"),
        }),
      );
    }
  };
}
