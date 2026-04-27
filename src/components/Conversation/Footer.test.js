jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

jest.mock("../../socket", () => ({
  socket: {
    emit: jest.fn(),
  },
}));

jest.mock("../../utils/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
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

const React = require("react");
const {
  render,
  screen,
  fireEvent,
  waitFor,
} = require("@testing-library/react");
const { useSelector } = require("react-redux");
const { socket } = require("../../socket");
const axios = require("../../utils/axios").default;
const Footer = require("./Footer").default;

describe("Conversation/Footer", () => {
  const baseState = {
    app: {
      room_id: "conversation-1",
    },
    auth: {
      token: "test-token",
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

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("text_message", {
      to: "user-b",
      message: "Hello there",
      conversation_id: "conversation-1",
      type: "Text",
    });

    expect(input).toHaveValue("");
  });

  it("sends a message containing a bare domain url as Link", () => {
    render(<Footer />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, {
      target: { value: "Check this youtube.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("text_message", {
      to: "user-b",
      message: "Check this youtube.com",
      conversation_id: "conversation-1",
      type: "Link",
    });
  });

  it("does not send an empty or whitespace-only message", () => {
    render(<Footer />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, { target: { value: "   " } });

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("does not send a text message when there is no active conversation", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: null,
        },
        auth: {
          token: "test-token",
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

    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    expect(socket.emit).not.toHaveBeenCalled();
  });

  it("uploads a document and sends it as a Document file message", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          fileUrl: "http://localhost:3000/uploads/documents/test-document.pdf",
        },
      },
    });

    render(<Footer />);

    const input = screen.getByPlaceholderText("Write a message...");
    fireEvent.change(input, { target: { value: "Document caption" } });

    const documentInput = screen.getByLabelText("Document file input");

    const file = new File(["document content"], "test-document.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(documentInput, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/upload/document",
        expect.any(FormData),
        {
          headers: {
            Authorization: "Bearer test-token",
          },
        },
      );
    });

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith("file_message", {
        to: "user-b",
        conversation_id: "conversation-1",
        file: "http://localhost:3000/uploads/documents/test-document.pdf",
        type: "Document",
        text: "Document caption",
      });
    });

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("uploads media and sends it as a Media file message", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          fileUrl: "http://localhost:3000/uploads/media/test-image.png",
        },
      },
    });

    render(<Footer />);

    const mediaInput = screen.getByLabelText("Media file input");

    const file = new File(["image content"], "test-image.png", {
      type: "image/png",
    });

    fireEvent.change(mediaInput, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/upload/media",
        expect.any(FormData),
        {
          headers: {
            Authorization: "Bearer test-token",
          },
        },
      );
    });

    await waitFor(() => {
      expect(socket.emit).toHaveBeenCalledWith("file_message", {
        to: "user-b",
        conversation_id: "conversation-1",
        file: "http://localhost:3000/uploads/media/test-image.png",
        type: "Media",
        text: "",
      });
    });
  });

  it("does not upload a file when there is no active conversation", async () => {
    useSelector.mockImplementation((selector) =>
      selector({
        app: {
          room_id: null,
        },
        auth: {
          token: "test-token",
        },
        conversation: {
          direct_chat: {
            current_conversation: null,
          },
        },
      }),
    );

    render(<Footer />);

    const documentInput = screen.getByLabelText("Document file input");

    const file = new File(["document content"], "test-document.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(documentInput, {
      target: {
        files: [file],
      },
    });

    expect(axios.post).not.toHaveBeenCalled();
    expect(socket.emit).not.toHaveBeenCalled();
  });
});
