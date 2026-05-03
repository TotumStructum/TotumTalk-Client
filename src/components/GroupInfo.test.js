import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import GroupInfo from "./GroupInfo";
import {
  AddGroupParticipants,
  FetchFriends,
  LeaveGroupConversation,
  RemoveGroupParticipants,
  ToggleSidebar,
  UpdateSidebarType,
  showSnackbar,
} from "../redux/slices/app";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  AddGroupParticipants: jest.fn(),
  FetchFriends: jest.fn(),
  LeaveGroupConversation: jest.fn(),
  RemoveGroupParticipants: jest.fn(),
  ToggleSidebar: jest.fn(),
  UpdateSidebarType: jest.fn(),
  showSnackbar: jest.fn(),
}));

const renderGroupInfo = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <GroupInfo />
    </ThemeProvider>,
  );

describe("GroupInfo", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    window.localStorage.setItem("user_id", "user-a");

    useDispatch.mockReturnValue(dispatch);

    ToggleSidebar.mockReturnValue({
      type: "app/toggleSidebar",
    });

    UpdateSidebarType.mockImplementation((type) => ({
      type: "app/updateSidebarType",
      payload: type,
    }));

    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          friends: [
            {
              _id: "user-c",
              firstName: "Alice",
              lastName: "Cooper",
              email: "alice@example.com",
              avatar: "",
            },
          ],
        },
        conversation: {
          group_chat: {
            current_conversation: {
              _id: "group-1",
              title: "Study Group",
              creator: {
                _id: "user-a",
              },
              participants: [
                {
                  _id: "user-a",
                  firstName: "John",
                  lastName: "Doe",
                  email: "john@example.com",
                  avatar: "",
                },
                {
                  _id: "user-b",
                  firstName: "Jane",
                  lastName: "Smith",
                  email: "jane@example.com",
                  avatar: "",
                },
              ],
            },
            current_messages: [
              {
                _id: "media-1",
                type: "Media",
                file: "http://localhost:3000/uploads/media/group-image.png",
              },
              {
                _id: "link-1",
                type: "Link",
                text: "youtube.com",
              },
              {
                _id: "doc-1",
                type: "Document",
                file: "http://localhost:3000/uploads/documents/group-file.pdf",
              },
            ],
          },
        },
      }),
    );

    LeaveGroupConversation.mockImplementation(({ group_id }) => ({
      type: "app/leaveGroupConversation",
      payload: { group_id },
    }));

    showSnackbar.mockImplementation((payload) => ({
      type: "app/openSnackbar",
      payload,
    }));

    FetchFriends.mockReturnValue({
      type: "app/fetchFriends",
    });

    AddGroupParticipants.mockImplementation(({ group_id, members }) => ({
      type: "app/addGroupParticipants",
      payload: { group_id, members },
    }));
  });

  RemoveGroupParticipants.mockImplementation(({ group_id, members }) => ({
    type: "app/removeGroupParticipants",
    payload: { group_id, members },
  }));

  it("renders group title, members and shared message count", () => {
    renderGroupInfo();

    expect(screen.getByText("Study Group")).toBeInTheDocument();
    expect(screen.getByText("2 members")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3/i })).toBeInTheDocument();
  });

  it("opens shared messages from group info", () => {
    renderGroupInfo();

    fireEvent.click(screen.getByRole("button", { name: /3/i }));

    expect(UpdateSidebarType).toHaveBeenCalledWith("SHARED");
    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: "SHARED",
    });
  });

  it("closes group info sidebar", () => {
    renderGroupInfo();

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(ToggleSidebar).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: "app/toggleSidebar",
    });
  });

  it("confirms and leaves the current group", async () => {
    renderGroupInfo();

    fireEvent.click(screen.getByRole("button", { name: /leave group/i }));

    expect(screen.getByText("Leave group?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^leave group$/i }));

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith({
        severity: "success",
        message: "You left the group",
      });
    });

    expect(LeaveGroupConversation).toHaveBeenCalledWith({
      group_id: "group-1",
    });

    expect(ToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("opens add participants dialog for group creator", () => {
    renderGroupInfo();

    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    expect(FetchFriends).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("heading", { name: "Add participants" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Friends")).toBeInTheDocument();
  });

  it("adds selected participants to the current group", async () => {
    renderGroupInfo();

    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));

    fireEvent.change(screen.getByLabelText("Friends"), {
      target: {
        value: "Alice",
      },
    });

    fireEvent.click(await screen.findByText("Alice Cooper"));

    fireEvent.click(
      screen.getByRole("button", {
        name: /^add participants$/i,
      }),
    );

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith({
        severity: "success",
        message: "Participants added",
      });
    });

    expect(AddGroupParticipants).toHaveBeenCalledWith({
      group_id: "group-1",
      members: ["user-c"],
    });
  });

  it("confirms and removes a group participant", async () => {
    renderGroupInfo();

    fireEvent.click(
      screen.getByRole("button", {
        name: /remove jane smith/i,
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Remove participant?" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^remove participant$/i,
      }),
    );

    await waitFor(() => {
      expect(showSnackbar).toHaveBeenCalledWith({
        severity: "success",
        message: "Participant removed",
      });
    });

    expect(RemoveGroupParticipants).toHaveBeenCalledWith({
      group_id: "group-1",
      members: ["user-b"],
    });
  });
});
