import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import SharedMessages from "./SharedMessages";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  UpdateSidebarType: jest.fn((type) => ({
    type: "app/updateSidebarType",
    payload: type,
  })),
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
});
