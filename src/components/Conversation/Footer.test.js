import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useSelector } from "react-redux";
import { socket } from "../../socket";
import Footer from "./Footer";

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../../socket", () => ({
  socket: {
    emit: jest.fn(),
  },
}));

jest.mock("@emoji-mart/react", () => {
  return function MockPicker() {
    return null;
  };
});

jest.mock("@emoji-mart/data", () => ({}));

jest.mock("../StyledInput", () => {
  return function MockStyledInput({
    value,
    onChange,
    onKeyDown,
    placeholder,
    InputProps = {},
  }) {
    return (
      <div>
        {InputProps.startAdornment}
        <input
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        {InputProps.endAdornment}
      </div>
    );
  };
});

describe("Conversation/Footer", () => {
  const baseState = {
    app: {
      room_id: "conversation-1",
    },
    conversation: {
      direct_chat: {
        current_conversation: {
          id: "conversation-1",
          user_id: "user-b",
          name: "John Doe",
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useSelector.mockImplementation((selector) => selector(baseState));
  });

  it("sends a plain text message as Text and clears the input", () => {
    render(<Footer />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, { target: { value: "Hello there" } });

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[2];

    fireEvent.click(sendButton);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("text_message", {
      to: "user-b",
      message: "Hello there",
      conversation_id: "conversation-1",
      type: "Text",
    });

    expect(input).toHaveValue("");
  });

  it("sends a message containing a url as Link", () => {
    render(<Footer />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, {
      target: { value: "Check this https://example.com" },
    });

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[2];

    fireEvent.click(sendButton);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("text_message", {
      to: "user-b",
      message: "Check this https://example.com",
      conversation_id: "conversation-1",
      type: "Link",
    });
  });

  it("does not send an empty or whitespace-only message", () => {
    render(<Footer />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, { target: { value: "   " } });

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[2];

    fireEvent.click(sendButton);

    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("does not send a message when there is no active conversation", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: null,
        },
        conversation: {
          direct_chat: {
            current_conversation: null,
          },
        },
      }),
    );

    render(<Footer />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, { target: { value: "Hello there" } });

    const buttons = screen.getAllByRole("button");
    const sendButton = buttons[2];

    fireEvent.click(sendButton);

    expect(socket.emit).not.toHaveBeenCalled();
  });
});
