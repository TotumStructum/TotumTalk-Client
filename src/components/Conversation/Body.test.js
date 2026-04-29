import React from "react";
import { render, screen } from "@testing-library/react";
import { useSelector } from "react-redux";
import Body from "./Body";
import { ThemeProvider, createTheme } from "@mui/material/styles";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
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
});
