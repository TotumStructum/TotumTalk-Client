import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatElement from "./ChatElement";
import { useDispatch, useSelector } from "react-redux";
import { SelectConversation } from "../redux/slices/app";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  SelectConversation: jest.fn(),
}));

describe("ChatElement", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: null,
        },
      }),
    );

    SelectConversation.mockImplementation(({ room_id }) => ({
      type: "app/selectConversation",
      payload: { room_id },
    }));
  });

  it("renders chat name, preview message and time", () => {
    render(
      <ChatElement
        id="conversation-1"
        name="John Doe"
        img=""
        msg="Hello there"
        time="12:45"
        unread={0}
        online={false}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("12:45")).toBeInTheDocument();
  });

  it("shows unread badge when unread is greater than zero", () => {
    render(
      <ChatElement
        id="conversation-1"
        name="John Doe"
        img=""
        msg="Hello there"
        time="12:45"
        unread={3}
        online={false}
      />,
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("does not show unread badge when unread is zero", () => {
    render(
      <ChatElement
        id="conversation-1"
        name="John Doe"
        img=""
        msg="Hello there"
        time="12:45"
        unread={0}
        online={false}
      />,
    );

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("dispatches conversation selection on click", () => {
    render(
      <ChatElement
        id="conversation-42"
        name="John Doe"
        img=""
        msg="Hello there"
        time="12:45"
        unread={0}
        online={false}
      />,
    );

    fireEvent.click(screen.getByText("John Doe"));

    expect(SelectConversation).toHaveBeenCalledWith({
      room_id: "conversation-42",
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/selectConversation",
      payload: { room_id: "conversation-42" },
    });
  });
});
