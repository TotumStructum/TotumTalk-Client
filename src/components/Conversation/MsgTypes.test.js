import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { TextMsg } from "./MsgTypes";
import {
  DeleteDirectMessageForMe,
  SelectDirectReplyMessage,
  ToggleDirectMessageStar,
  SelectGroupReplyMessage,
} from "../../redux/slices/conversation";
import { socket } from "../../socket";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../redux/slices/conversation", () => ({
  DeleteDirectMessageForMe: jest.fn(),
  SelectDirectReplyMessage: jest.fn(),
  ToggleDirectMessageStar: jest.fn(),
  SelectGroupReplyMessage: jest.fn(),
}));

jest.mock("../../socket", () => ({
  socket: {
    emit: jest.fn(),
  },
}));

const renderTextMsg = (el) =>
  render(
    <ThemeProvider theme={createTheme()}>
      <TextMsg el={el} menu />
    </ThemeProvider>,
  );

describe("MessageOptions", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem("user_id", "user-a");
    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            conversations: [
              {
                id: "conversation-1",
                name: "Current Chat",
                img: "",
                msg: "Current message",
              },
              {
                id: "conversation-2",
                name: "Jane Smith",
                img: "",
                msg: "Target chat",
              },
            ],
          },
        },
      }),
    );

    ToggleDirectMessageStar.mockImplementation((payload) => ({
      type: "conversation/toggleDirectMessageStar",
      payload,
    }));

    DeleteDirectMessageForMe.mockImplementation((payload) => ({
      type: "conversation/deleteDirectMessageForMe",
      payload,
    }));

    SelectDirectReplyMessage.mockImplementation((payload) => ({
      type: "conversation/selectDirectReplyMessage",
      payload,
    }));

    SelectGroupReplyMessage.mockImplementation((payload) => ({
      type: "conversation/selectGroupReplyMessage",
      payload,
    }));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("stars a direct message from the message menu", async () => {
    renderTextMsg({
      incoming: true,
      message: "Important message",
      messageId: "message-1",
      conversationId: "conversation-1",
      chatType: "individual",
      starredBy: [],
    });

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(await screen.findByText("Star message"));

    expect(ToggleDirectMessageStar).toHaveBeenCalledWith({
      conversation_id: "conversation-1",
      message_id: "message-1",
      starred: true,
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "conversation/toggleDirectMessageStar",
      payload: {
        conversation_id: "conversation-1",
        message_id: "message-1",
        starred: true,
      },
    });
  });

  it("unstars a direct message from the message menu when already starred", async () => {
    renderTextMsg({
      incoming: true,
      message: "Important message",
      messageId: "message-1",
      conversationId: "conversation-1",
      chatType: "individual",
      starredBy: ["user-a"],
    });

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(await screen.findByText("Unstar message"));

    expect(ToggleDirectMessageStar).toHaveBeenCalledWith({
      conversation_id: "conversation-1",
      message_id: "message-1",
      starred: false,
    });
  });

  it("disables starring for group messages for now", async () => {
    renderTextMsg({
      incoming: true,
      message: "Group message",
      messageId: "message-1",
      conversationId: "group-1",
      chatType: "group",
      starredBy: [],
    });

    fireEvent.click(screen.getByRole("button"));

    const menu = await screen.findByRole("menu");
    const starMenuItem = within(menu).getByRole("menuitem", {
      name: /star message/i,
    });

    expect(starMenuItem).toHaveAttribute("aria-disabled", "true");
  });

  it("deletes a direct message from the message menu", async () => {
    renderTextMsg({
      incoming: true,
      message: "Message to delete",
      messageId: "message-1",
      conversationId: "conversation-1",
      chatType: "individual",
      starredBy: [],
    });

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(await screen.findByText("Delete Message"));

    expect(DeleteDirectMessageForMe).toHaveBeenCalledWith({
      conversation_id: "conversation-1",
      message_id: "message-1",
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "conversation/deleteDirectMessageForMe",
      payload: {
        conversation_id: "conversation-1",
        message_id: "message-1",
      },
    });
  });

  it("selects a direct message for reply from the message menu", async () => {
    renderTextMsg({
      incoming: true,
      senderName: "John Doe",
      message: "Original message",
      messageId: "message-1",
      conversationId: "conversation-1",
      chatType: "individual",
      messageType: "Text",
      starredBy: [],
    });

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(await screen.findByText("Reply"));

    expect(SelectDirectReplyMessage).toHaveBeenCalledWith({
      message: {
        messageId: "message-1",
        type: "Text",
        text: "Original message",
        file: "",
        incoming: true,
        senderName: "John Doe",
      },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "conversation/selectDirectReplyMessage",
      payload: {
        message: {
          messageId: "message-1",
          type: "Text",
          text: "Original message",
          file: "",
          incoming: true,
          senderName: "John Doe",
        },
      },
    });
  });

  it("forwards a direct message to another direct conversation", async () => {
    renderTextMsg({
      incoming: true,
      message: "Message to forward",
      messageId: "message-1",
      conversationId: "conversation-1",
      chatType: "individual",
      messageType: "Text",
      starredBy: [],
    });

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(await screen.findByText("Forward message"));

    expect(
      screen.getByRole("heading", { name: "Forward message" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.queryByText("Current Chat")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /jane smith/i }));

    expect(socket.emit).toHaveBeenCalledWith("forward_message", {
      source_conversation_id: "conversation-1",
      message_id: "message-1",
      target_conversation_id: "conversation-2",
    });
  });

  it("renders forwarded label for forwarded direct messages", () => {
    renderTextMsg({
      incoming: true,
      message: "Forwarded text",
      messageId: "message-1",
      conversationId: "conversation-1",
      chatType: "individual",
      messageType: "Text",
      forwardedFrom: {
        messageId: "original-message",
        type: "Text",
        text: "Original text",
      },
      starredBy: [],
    });

    expect(screen.getByText("Forwarded")).toBeInTheDocument();
    expect(screen.getByText("Forwarded text")).toBeInTheDocument();
  });

  it("selects a group message for reply from the message menu", async () => {
    renderTextMsg({
      incoming: true,
      senderName: "Jane Group",
      message: "Original group message",
      messageId: "group-message-1",
      conversationId: "group-1",
      chatType: "group",
      messageType: "Text",
      starredBy: [],
    });

    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(await screen.findByText("Reply"));

    expect(SelectGroupReplyMessage).toHaveBeenCalledWith({
      message: {
        messageId: "group-message-1",
        type: "Text",
        text: "Original group message",
        file: "",
        incoming: true,
        senderName: "Jane Group",
      },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "conversation/selectGroupReplyMessage",
      payload: {
        message: {
          messageId: "group-message-1",
          type: "Text",
          text: "Original group message",
          file: "",
          incoming: true,
          senderName: "Jane Group",
        },
      },
    });
  });
});
