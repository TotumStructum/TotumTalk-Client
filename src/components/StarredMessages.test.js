import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import StarredMessages from "./StarredMessages";
import { UpdateSidebarType } from "../redux/slices/app";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  UpdateSidebarType: jest.fn(),
}));

const renderStarredMessages = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <StarredMessages />
    </ThemeProvider>,
  );

describe("StarredMessages", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem("user_id", "user-a");
    useDispatch.mockReturnValue(dispatch);

    UpdateSidebarType.mockImplementation((type) => ({
      type: "app/updateSidebarType",
      payload: type,
    }));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders only messages starred by the current user", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            current_messages: [
              {
                _id: "starred-text",
                type: "Text",
                text: "Important text message",
                from: "user-b",
                starredBy: ["user-a"],
              },
              {
                _id: "not-starred-text",
                type: "Text",
                text: "Regular text message",
                from: "user-b",
                starredBy: [],
              },
              {
                _id: "starred-media",
                type: "Media",
                text: "Important image",
                file: "http://localhost:3000/uploads/media/image.png",
                from: "user-a",
                starredBy: ["user-a"],
              },
              {
                _id: "starred-doc",
                type: "Document",
                text: "Important document",
                file: "http://localhost:3000/uploads/documents/file.pdf",
                from: "user-b",
                starredBy: ["user-a"],
              },
            ],
          },
        },
      }),
    );

    renderStarredMessages();

    expect(screen.getByText("Important text message")).toBeInTheDocument();
    expect(screen.queryByText("Regular text message")).not.toBeInTheDocument();

    expect(screen.getByAltText("Starred media")).toHaveAttribute(
      "src",
      "http://localhost:3000/uploads/media/image.png",
    );
    expect(screen.getByText("Important image")).toBeInTheDocument();

    expect(screen.getByText("file.pdf")).toBeInTheDocument();
    expect(screen.getByText("Important document")).toBeInTheDocument();
  });

  it("shows an empty state when there are no starred messages", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            current_messages: [
              {
                _id: "not-starred",
                type: "Text",
                text: "Regular message",
                from: "user-b",
                starredBy: [],
              },
            ],
          },
        },
      }),
    );

    renderStarredMessages();

    expect(screen.getByText("No starred messages yet")).toBeInTheDocument();
  });

  it("returns to contact sidebar when pressing back", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            current_messages: [],
          },
        },
      }),
    );

    renderStarredMessages();

    fireEvent.click(screen.getByRole("button"));

    expect(UpdateSidebarType).toHaveBeenCalledWith("CONTACT");
    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: "CONTACT",
    });
  });

  it("renders starred group messages with sender name", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          chat_type: "group",
        },
        conversation: {
          direct_chat: {
            current_messages: [],
          },
          group_chat: {
            current_conversation: {
              _id: "group-1",
              title: "Study Group",
            },
            current_messages: [
              {
                _id: "group-starred",
                type: "Text",
                text: "Important group decision",
                from: {
                  _id: "user-b",
                  firstName: "Jane",
                  lastName: "Group",
                  email: "jane@example.com",
                },
                starredBy: ["user-a"],
              },
              {
                _id: "group-not-starred",
                type: "Text",
                text: "Regular group message",
                from: {
                  _id: "user-b",
                  firstName: "Jane",
                  lastName: "Group",
                },
                starredBy: [],
              },
            ],
          },
        },
      }),
    );

    renderStarredMessages();

    expect(screen.getByText("Jane Group")).toBeInTheDocument();
    expect(screen.getByText("Important group decision")).toBeInTheDocument();
    expect(screen.queryByText("Regular group message")).not.toBeInTheDocument();
  });

  it("returns to group info when opened from a group chat", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          chat_type: "group",
        },
        conversation: {
          direct_chat: {
            current_messages: [],
          },
          group_chat: {
            current_conversation: {
              _id: "group-1",
              title: "Study Group",
            },
            current_messages: [],
          },
        },
      }),
    );

    renderStarredMessages();

    fireEvent.click(
      screen.getByRole("button", {
        name: /back to chat details/i,
      }),
    );

    expect(UpdateSidebarType).toHaveBeenCalledWith("GROUP_INFO");
    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: "GROUP_INFO",
    });
  });
});
