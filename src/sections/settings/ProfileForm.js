import React, { useEffect } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Stack } from "@mui/system";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import FormProvider, { RHFTextField } from "../../components/hook-form";
import axios from "../../utils/axios";
import { showSnackbar } from "../../redux/slices/app";

const ProfileForm = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    about: Yup.string().nullable(),
    avatar: Yup.string().nullable(),
  });

  const defaultValues = {
    firstName: "",
    lastName: "",
    about: "",
    avatar: "",
  };

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/user/me", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        reset({
          firstName: response.data.data.firstName || "",
          lastName: response.data.data.lastName || "",
          about: response.data.data.about || "",
          avatar: response.data.data.avatar || "",
        });
      } catch (error) {
        dispatch(
          showSnackbar({
            severity: "error",
            message:
              error?.response?.data?.message ||
              error?.message ||
              "Failed to load profile",
          }),
        );
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token, reset, dispatch]);

  const onSubmit = async (data) => {
    try {
      const response = await axios.patch("/user/update-me", data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      reset({
        firstName: response.data.data.firstName || "",
        lastName: response.data.data.lastName || "",
        about: response.data.data.about || "",
        avatar: response.data.data.avatar || "",
      });

      dispatch(
        showSnackbar({
          severity: "success",
          message: response.data.message,
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update profile",
        }),
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField
          name="firstName"
          label="First name"
          helperText="This name is visible to your contacts"
        />

        <RHFTextField
          name="lastName"
          label="Last name"
          helperText="This surname is visible to your contacts"
        />

        <RHFTextField
          multiline
          rows={3}
          maxRows={5}
          name="about"
          label="About"
        />

        <RHFTextField
          name="avatar"
          label="Avatar URL"
          helperText="Paste an image URL for now"
        />

        <Stack direction={"row"} justifyContent={"end"}>
          <Button
            color="primary"
            size="large"
            type="submit"
            variant="outlined"
            disabled={isSubmitting}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;
