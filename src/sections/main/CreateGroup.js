import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Slide,
  Stack,
} from "@mui/material";
import React, { useEffect } from "react";
import FormProvider from "../../components/hook-form/FormProvider";
import RHFTextField from "../../components/hook-form/RHFTextField";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import RHFAutocomplete from "../../components/hook-form/RHFAutocomplete";
import { useDispatch, useSelector } from "react-redux";
import {
  CreateGroupConversation,
  FetchFriends,
  showSnackbar,
} from "../../redux/slices/app";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getFriendName = (friend) => {
  return (
    `${friend?.firstName || ""} ${friend?.lastName || ""}`.trim() ||
    friend?.email ||
    "Unknown user"
  );
};

const CreateGroupForm = ({ handleClose }) => {
  const dispatch = useDispatch();
  const { friends } = useSelector((state) => state.app);

  const friendOptions = Array.isArray(friends)
    ? friends
    : (friends?.friends ?? []);

  useEffect(() => {
    dispatch(FetchFriends());
  }, [dispatch]);

  const NewGroupSchema = Yup.object().shape({
    title: Yup.string()
      .trim()
      .required("Title is required")
      .max(80, "Title must be shorter than 80 characters"),
    members: Yup.array().min(2, "Must have at least 2 members"),
  });

  const defaultValues = {
    title: "",
    members: [],
  };

  const methods = useForm({
    resolver: yupResolver(NewGroupSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await dispatch(
        CreateGroupConversation({
          title: data.title.trim(),
          members: data.members.map((member) => member._id),
        }),
      );

      dispatch(
        showSnackbar({
          severity: "success",
          message: "Group conversation created",
        }),
      );

      reset(defaultValues);
      handleClose();
    } catch (error) {
      dispatch(
        showSnackbar({
          severity: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to create group conversation",
        }),
      );
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="title" label="Title" />

        <RHFAutocomplete
          name="members"
          label="Members"
          multiple
          options={friendOptions}
          getOptionLabel={(option) =>
            typeof option === "string" ? option : getFriendName(option)
          }
          isOptionEqualToValue={(option, value) => option._id === value._id}
          ChipProps={{ size: "medium" }}
          helperText={
            friendOptions.length < 2
              ? "You need at least 2 friends to create a group"
              : undefined
          }
        />

        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="end"
        >
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || friendOptions.length < 2}
          >
            Create
          </Button>
        </Stack>
      </Stack>
    </FormProvider>
  );
};

const CreateGroup = ({ open, handleClose }) => {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      sx={{ p: 4 }}
    >
      <DialogTitle sx={{ mb: 3 }}>Create New Group</DialogTitle>

      <DialogContent>
        <CreateGroupForm handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroup;
