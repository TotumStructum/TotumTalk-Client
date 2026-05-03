import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import Body from "./Body";
import { ThemeProvider, createTheme } from "@mui/material/styles";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../../redux/slices/conversation", () => ({
  DeleteDirectMessageForMe: jest.fn(),
  SelectDirectReplyMessage: jest.fn(),
  ToggleDirectMessageStar: jest.fn(),
}));

const renderBody = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <Body menu={false} />
    </ThemeProvider>,
  );

describe("Conversation/Body", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem("user_id", "user-a");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("shows sender name for incoming group messages only", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: "group-1",
          chat_type: "group",
        },
        conversation: {
          direct_chat: {
            current_messages: [],
          },
          group_chat: {
            current_messages: [
              {
                _id: "message-1",
                type: "Text",
                text: "Hello group",
                from: {
                  _id: "user-b",
                  firstName: "John",
                  lastName: "Doe",
                },
              },
              {
                _id: "message-2",
                type: "Text",
                text: "My reply",
                from: {
                  _id: "user-a",
                  firstName: "Alice",
                  lastName: "Current",
                },
              },
            ],
          },
        },
      }),
    );

    renderBody();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Hello group")).toBeInTheDocument();
    expect(screen.getByText("My reply")).toBeInTheDocument();

    expect(screen.queryByText("Alice Current")).not.toBeInTheDocument();
  });

  it("does not show sender name for direct chat messages", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: "conversation-1",
          chat_type: "individual",
        },
        conversation: {
          direct_chat: {
            current_messages: [
              {
                _id: "message-1",
                type: "Text",
                text: "Direct hello",
                from: {
                  _id: "user-b",
                  firstName: "John",
                  lastName: "Doe",
                },
              },
            ],
          },
          group_chat: {
            current_messages: [],
          },
        },
      }),
    );

    renderBody();

    expect(screen.getByText("Direct hello")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });

  it("renders group document and media messages with incoming sender names", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: "group-1",
          chat_type: "group",
        },
        conversation: {
          direct_chat: {
            current_messages: [],
          },
          group_chat: {
            current_messages: [
              {
                _id: "document-message",
                type: "Document",
                text: "Document caption",
                file: "http://localhost:3000/uploads/documents/group-file.pdf",
                from: {
                  _id: "user-b",
                  firstName: "John",
                  lastName: "Doe",
                },
              },
              {
                _id: "media-message",
                type: "Media",
                text: "Media caption",
                file: "http://localhost:3000/uploads/media/group-image.png",
                from: {
                  _id: "user-c",
                  firstName: "Jane",
                  lastName: "Smith",
                },
              },
            ],
          },
        },
      }),
    );

    renderBody();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    expect(screen.getByText("group-file.pdf")).toBeInTheDocument();
    expect(screen.getByText("Document caption")).toBeInTheDocument();

    expect(screen.getByAltText("Media message")).toHaveAttribute(
      "src",
      "http://localhost:3000/uploads/media/group-image.png",
    );
    expect(screen.getByText("Media caption")).toBeInTheDocument();
  });

  it("renders reply preview for direct messages", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: "conversation-1",
          chat_type: "individual",
        },
        conversation: {
          direct_chat: {
            current_messages: [
              {
                _id: "reply-message",
                type: "Text",
                text: "This is a reply",
                from: "user-b",
                replyTo: {
                  messageId: "original-message",
                  type: "Text",
                  text: "Original direct message",
                  file: "",
                },
              },
            ],
          },
          group_chat: {
            current_messages: [],
          },
        },
      }),
    );

    renderBody();

    expect(screen.getByText("Reply")).toBeInTheDocument();
    expect(screen.getByText("Original direct message")).toBeInTheDocument();
    expect(screen.getByText("This is a reply")).toBeInTheDocument();
  });
});
