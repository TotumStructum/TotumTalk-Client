import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Camera } from "phosphor-react";
import useResponsive from "../../hooks/useResponsive";
import FormProvider, { RHFTextField } from "../../components/hook-form";
import axios from "../../utils/axios";
import { SetCurrentUser, showSnackbar } from "../../redux/slices/app";

const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_AVATAR_SIZE_IN_BYTES = 5 * 1024 * 1024;

const ProfileForm = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const isMobile = useResponsive("down", "md");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    about: Yup.string().nullable(),
    avatar: Yup.string().nullable(),
  });

  const methods = useForm({
    resolver: yupResolver(ProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      about: "",
      avatar: "",
    },
  });

  const {
    reset,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const avatarValue = watch("avatar");

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

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type)) {
      dispatch(
        showSnackbar({
          severity: "error",
          message: "Only JPG, PNG, WEBP and GIF images are allowed.",
        }),
      );
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_IN_BYTES) {
      dispatch(
        showSnackbar({
          severity: "error",
          message: "Avatar image must be smaller than 5 MB.",
        }),
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploadingAvatar(true);

      const response = await axios.patch("/user/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setValue("avatar", response.data.data.avatar || "", {
        shouldDirty: false,
        shouldValidate: true,
      });

      dispatch(SetCurrentUser(response.data.data));

      dispatch(
        showSnackbar({
          severity: "success",
          message: response.data.message || "Avatar updated successfully",
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to upload avatar",
        }),
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsUploadingAvatar(true);

      const response = await axios.delete("/user/avatar", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setValue("avatar", response.data.data.avatar || "", {
        shouldDirty: false,
        shouldValidate: true,
      });

      dispatch(SetCurrentUser(response.data.data));

      dispatch(
        showSnackbar({
          severity: "success",
          message: response.data.message || "Avatar removed successfully",
        }),
      );
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to remove avatar",
        }),
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await axios.patch(
        "/user/update-me",
        {
          firstName: data.firstName,
          lastName: data.lastName,
          about: data.about,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

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
      <Stack spacing={isMobile ? 2 : 3}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "100%",
            p: {
              xs: 2.5,
              sm: 3,
            },
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) => theme.palette.background.paper,
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          <Avatar
            src={avatarValue || ""}
            alt="Profile avatar"
            sx={{
              width: {
                xs: 96,
                sm: 104,
              },
              height: {
                xs: 96,
                sm: 104,
              },
              flexShrink: 0,
            }}
          />

          <Stack
            spacing={0.75}
            alignItems="center"
            sx={{
              width: "100%",
              maxWidth: 280,
              minWidth: 0,
            }}
          >
            <Typography variant="subtitle2">Profile photo</Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                width: "100%",
                lineHeight: 1.5,
              }}
            >
              Upload JPG, PNG, WEBP or GIF. Max size: 5 MB.
            </Typography>

            {avatarValue ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  width: "100%",
                  lineHeight: 1.5,
                }}
              >
                Avatar is saved in your profile.
              </Typography>
            ) : null}
          </Stack>

          <Stack
            direction="column"
            spacing={1}
            alignItems="stretch"
            sx={{
              width: "100%",
              maxWidth: 280,
            }}
          >
            <Button
              component="label"
              variant="outlined"
              disabled={isUploadingAvatar || isSubmitting}
              fullWidth
              startIcon={<Camera size={20} />}
              sx={{ whiteSpace: "nowrap" }}
            >
              {isUploadingAvatar
                ? "Uploading..."
                : avatarValue
                  ? "Change photo"
                  : "Upload photo"}

              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarUpload}
              />
            </Button>

            {avatarValue ? (
              <Button
                color="error"
                disabled={isUploadingAvatar || isSubmitting}
                fullWidth
                onClick={handleRemoveAvatar}
                sx={{ whiteSpace: "nowrap" }}
              >
                Remove
              </Button>
            ) : null}
          </Stack>
        </Box>

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

        <Stack direction="row" justifyContent="end">
          <Button
            color="primary"
            size="large"
            type="submit"
            variant="outlined"
            disabled={isSubmitting || isUploadingAvatar}
            fullWidth={isMobile}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

export default ProfileForm;
