import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useDispatch } from "react-redux";
import { TextMsg } from "./MsgTypes";
import { ToggleDirectMessageStar } from "../../redux/slices/conversation";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
}));

jest.mock("../../redux/slices/conversation", () => ({
  ToggleDirectMessageStar: jest.fn(),
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

    ToggleDirectMessageStar.mockImplementation((payload) => ({
      type: "conversation/toggleDirectMessageStar",
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
});
