import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  FriendComponent,
  FriendRequestComponent,
  SentFriendRequestComponent,
} from "./Friends";
import { socket } from "../socket";

jest.mock("../socket", () => ({
  socket: {
    emit: jest.fn(),
  },
}));

const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

describe("FriendRequestComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("emits accept_request when accepting a friend request", () => {
    renderWithTheme(
      <FriendRequestComponent
        id="request-1"
        firstName="John"
        lastName="Doe"
        status="Offline"
        avatar=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accept" }));

    expect(socket.emit).toHaveBeenCalledWith("accept_request", {
      request_id: "request-1",
    });
  });

  it("emits reject_request when declining a friend request", () => {
    renderWithTheme(
      <FriendRequestComponent
        id="request-1"
        firstName="John"
        lastName="Doe"
        status="Offline"
        avatar=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Decline" }));

    expect(socket.emit).toHaveBeenCalledWith("reject_request", {
      request_id: "request-1",
    });
  });
});

describe("FriendComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("emits start_conversation when starting a chat with a friend", () => {
    renderWithTheme(
      <FriendComponent
        _id="friend-1"
        firstName="John"
        lastName="Doe"
        status="Offline"
        avatar=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Start chat" }));

    expect(socket.emit).toHaveBeenCalledWith("start_conversation", {
      to: "friend-1",
    });
  });

  it("opens confirmation dialog before removing a friend", () => {
    renderWithTheme(
      <FriendComponent
        _id="friend-1"
        firstName="John"
        lastName="Doe"
        status="Offline"
        avatar=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove friend" }));

    expect(
      screen.getByText(
        "Are you sure you want to remove John Doe from your friends?",
      ),
    ).toBeInTheDocument();

    expect(socket.emit).not.toHaveBeenCalledWith("remove_friend", {
      friend_id: "friend-1",
    });
  });

  it("emits remove_friend after confirming friend removal", () => {
    renderWithTheme(
      <FriendComponent
        _id="friend-1"
        firstName="John"
        lastName="Doe"
        status="Offline"
        avatar=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove friend" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(socket.emit).toHaveBeenCalledWith("remove_friend", {
      friend_id: "friend-1",
    });
  });
});

describe("SentFriendRequestComponent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("emits cancel_request when cancelling an outgoing friend request", () => {
    renderWithTheme(
      <SentFriendRequestComponent
        id="request-1"
        firstName="John"
        lastName="Doe"
        status="Offline"
        avatar=""
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(socket.emit).toHaveBeenCalledWith("cancel_request", {
      request_id: "request-1",
    });
  });
});
