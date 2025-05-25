import React, { useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFTextField } from "../../components/hook-form";
import { Stack } from "@mui/system";
import { Alert, Button, IconButton, InputAdornment, Link } from "@mui/material";
import { Eye, EyeSlash } from "phosphor-react";
import { useDispatch } from "react-redux";
import { NewPassword } from "../../redux/slices/auth";

const NewPasswordForm = () => {
  const [queryParameters] = useSearchParams();
  const dispatch = useDispatch();
  const [showNewPassword, setShowNewPassword] = useState(false); // Стан для нового пароля
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Стан для підтвердження пароля

  const NewPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    passwordConfirm: Yup.string()
      .required("Password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  });

  const defaultValues = {
    password: "",
    passwordConfirm: "",
  };

  const methods = useForm({
    resolver: yupResolver(NewPasswordSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async (data) => {
    try {
      //submit data for backend
      dispatch(NewPassword({ ...data, token: queryParameters.get("token") }));
    } catch (error) {
      console.log(error);
      reset();
      setError("afterSubmit", {
        ...error,
        message: error.message,
      });
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error">{errors.afterSubmit.message}</Alert>
        )}

        <RHFTextField
          name="password"
          label="New Password"
          type={showNewPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)} // Окремий стан для нового пароля
                >
                  {showNewPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <RHFTextField
          name="passwordConfirm"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Окремий стан для підтвердження пароля
                >
                  {showConfirmPassword ? <Eye /> : <EyeSlash />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          fullWidth
          color="inherit"
          size="large"
          type="submit"
          variant="contained"
          sx={{
            bgcolor: "text.primary",
            color: (theme) =>
              theme.palette.mode === "light" ? "common.white" : "grey.800",
            "&:hover": {
              bgColor: "text.primary",
              color: (theme) =>
                theme.palette.mode === "light" ? "common.white" : "grey.800",
            },
          }}
        >
          Submit
        </Button>
      </Stack>
    </FormProvider>
  );
};

export default NewPasswordForm;
