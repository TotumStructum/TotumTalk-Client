import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { FriendRequestComponent } from "./Friends";
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
