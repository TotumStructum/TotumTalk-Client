import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SharedMessages from "./SharedMessages";
import { ToggleSidebar, UpdateSidebarType } from "../redux/slices/app";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  ToggleSidebar: jest.fn(),
  UpdateSidebarType: jest.fn(),
}));

const renderSharedMessages = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <SharedMessages />
    </ThemeProvider>,
  );

describe("SharedMessages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem("user_id", "user-a");
    useDispatch.mockReturnValue(jest.fn());

    ToggleSidebar.mockReturnValue({
      type: "app/toggleSidebar",
    });

    UpdateSidebarType.mockImplementation((type) => ({
      type: "app/updateSidebarType",
      payload: type,
    }));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders shared media, links and documents from the active group chat", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          chat_type: "group",
        },
        conversation: {
          direct_chat: {
            current_messages: [
              {
                _id: "direct-media",
                type: "Media",
                file: "http://localhost:3000/uploads/media/direct-image.png",
                from: "user-b",
              },
            ],
          },
          group_chat: {
            current_messages: [
              {
                _id: "group-media",
                type: "Media",
                file: "http://localhost:3000/uploads/media/group-image.png",
                from: {
                  _id: "user-b",
                },
              },
              {
                _id: "group-link",
                type: "Link",
                text: "youtube.com",
                from: {
                  _id: "user-c",
                },
              },
              {
                _id: "group-document",
                type: "Document",
                text: "Group document caption",
                file: "http://localhost:3000/uploads/documents/group-file.pdf",
                from: {
                  _id: "user-b",
                },
              },
            ],
          },
        },
      }),
    );

    renderSharedMessages();

    expect(screen.getByAltText("Shared media")).toHaveAttribute(
      "src",
      "http://localhost:3000/uploads/media/group-image.png",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Links" }));

    expect(screen.getByText("youtube.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Docs" }));

    expect(screen.getByText("group-file.pdf")).toBeInTheDocument();
    expect(screen.getByText("Group document caption")).toBeInTheDocument();
  });

  it("closes sidebar when pressing back from shared messages in group chat", () => {
    const dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);

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
            current_messages: [],
          },
        },
      }),
    );

    renderSharedMessages();

    fireEvent.click(screen.getByRole("button"));

    expect(UpdateSidebarType).toHaveBeenCalledWith("GROUP_INFO");
    expect(ToggleSidebar).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: "GROUP_INFO",
    });
  });

  it("returns to contact panel when pressing back from shared messages in direct chat", () => {
    const dispatch = jest.fn();
    useDispatch.mockReturnValue(dispatch);

    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          chat_type: "individual",
        },
        conversation: {
          direct_chat: {
            current_messages: [],
          },
          group_chat: {
            current_messages: [],
          },
        },
      }),
    );

    renderSharedMessages();

    fireEvent.click(screen.getByRole("button"));

    expect(UpdateSidebarType).toHaveBeenCalledWith("CONTACT");
    expect(ToggleSidebar).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: "CONTACT",
    });
  });
});
