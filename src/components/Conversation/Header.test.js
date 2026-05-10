import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResetConversationSelection,
  ToggleSidebar,
  UpdateSidebarType,
} from "../../redux/slices/app";
import {
  ClearCurrentConversation,
  ClearCurrentGroupConversation,
} from "../../redux/slices/conversation";
import Header from "./Header";
import { StartOutgoingCall } from "../../redux/slices/call";
import uuidv4 from "../../utils/uuidv4";
import { socket } from "../../socket";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../redux/slices/app", () => ({
  ResetConversationSelection: jest.fn(),
  ToggleSidebar: jest.fn(),
  UpdateSidebarType: jest.fn(),
}));

jest.mock("../../redux/slices/conversation", () => ({
  ClearCurrentConversation: jest.fn(),
  ClearCurrentGroupConversation: jest.fn(),
}));

jest.mock("../StyledBadge", () => {
  return function MockStyledBadge({ children }) {
    return <div data-testid="styled-badge">{children}</div>;
  };
});

jest.mock("../../redux/slices/call", () => ({
  StartOutgoingCall: jest.fn(),
}));

jest.mock("../../utils/uuidv4", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("../../socket", () => ({
  socket: {
    emit: jest.fn(),
  },
}));

describe("Conversation/Header", () => {
  const dispatch = jest.fn();

  const baseState = {
    conversation: {
      direct_chat: {
        current_conversation: {
          id: "conversation-1",
          user_id: "user-b",
          name: "John Doe",
          online: true,
          img: "",
        },
      },
      group_chat: {
        current_conversation: null,
      },
    },
    app: {
      chat_type: "individual",
      sidebar: {
        open: false,
        type: "CONTACT",
      },
    },
    call: {
      status: "idle",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatch.mockReturnValue(dispatch);
    useSelector.mockImplementation((selector) => selector(baseState));

    ToggleSidebar.mockImplementation(() => ({
      type: "app/toggleSidebar",
    }));

    UpdateSidebarType.mockImplementation((type) => ({
      type: "app/updateSidebarType",
      payload: { type },
    }));

    ResetConversationSelection.mockReturnValue({
      type: "app/resetConversationSelection",
    });

    ClearCurrentConversation.mockReturnValue({
      type: "conversation/clearCurrentConversation",
    });

    ClearCurrentGroupConversation.mockReturnValue({
      type: "conversation/clearCurrentGroupConversation",
    });

    uuidv4.mockReturnValue("call-1");

    StartOutgoingCall.mockImplementation((payload) => ({
      type: "call/startOutgoingCall",
      payload,
    }));

    socket.emit.mockClear();
  });

  it("renders current conversation name and online status", () => {
    render(<Header />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders nothing when there is no current conversation", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        ...baseState,
        conversation: {
          ...baseState.conversation,
          direct_chat: {
            current_conversation: null,
          },
        },
      }),
    );

    render(<Header />);

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Online")).not.toBeInTheDocument();
  });

  it("opens contact sidebar when clicking the conversation info and sidebar is closed", () => {
    render(<Header />);

    fireEvent.click(screen.getByText("John Doe"));

    expect(UpdateSidebarType).toHaveBeenCalledWith("CONTACT");
    expect(ToggleSidebar).toHaveBeenCalledTimes(1);

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: { type: "CONTACT" },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/toggleSidebar",
    });
  });

  it("only updates sidebar type when sidebar is already open on a different panel", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        ...baseState,
        app: {
          ...baseState.app,
          sidebar: {
            open: true,
            type: "SHARED",
          },
        },
      }),
    );

    render(<Header />);

    fireEvent.click(screen.getByText("John Doe"));

    expect(UpdateSidebarType).toHaveBeenCalledWith("CONTACT");
    expect(ToggleSidebar).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: { type: "CONTACT" },
    });
  });

  it("closes sidebar when contact sidebar is already open and arrow button is clicked", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        ...baseState,
        app: {
          ...baseState.app,
          sidebar: {
            open: true,
            type: "CONTACT",
          },
        },
      }),
    );

    render(<Header />);

    const buttons = screen.getAllByRole("button");
    const arrowButton = buttons[3];

    fireEvent.click(arrowButton);

    expect(ToggleSidebar).toHaveBeenCalledTimes(1);
    expect(UpdateSidebarType).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/toggleSidebar",
    });
  });

  it("opens group info sidebar when clicking group conversation info", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            current_conversation: null,
          },
          group_chat: {
            current_conversation: {
              _id: "group-1",
              title: "Study Group",
              participants: [],
            },
          },
        },
        app: {
          chat_type: "group",
          sidebar: {
            open: false,
            type: "CONTACT",
          },
        },
      }),
    );

    render(<Header />);

    fireEvent.click(screen.getByText("Study Group"));

    expect(UpdateSidebarType).toHaveBeenCalledWith("GROUP_INFO");
    expect(ToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("opens message search sidebar when clicking search button in direct chat", () => {
    render(<Header />);

    fireEvent.click(screen.getByRole("button", { name: "Search messages" }));

    expect(UpdateSidebarType).toHaveBeenCalledWith("MESSAGE_SEARCH");
    expect(ToggleSidebar).toHaveBeenCalledTimes(1);

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: { type: "MESSAGE_SEARCH" },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "app/toggleSidebar",
    });
  });

  it("renders AI assistant status and disables call buttons for TotumAI conversation", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        ...baseState,
        conversation: {
          ...baseState.conversation,
          direct_chat: {
            current_conversation: {
              id: "conversation-ai",
              user_id: "totum-ai",
              name: "TotumAI Assistant",
              online: false,
              img: "",
              isAI: true,
              isSystem: true,
            },
          },
        },
      }),
    );

    render(<Header />);

    expect(screen.getByText("TotumAI Assistant")).toBeInTheDocument();
    expect(screen.getByText("AI assistant")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Start video call" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Start voice call" }),
    ).toBeDisabled();
  });

  it("starts a video call from direct chat header", () => {
    render(<Header />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Start video call",
      }),
    );

    expect(StartOutgoingCall).toHaveBeenCalledWith({
      call: {
        call_id: "call-1",
        conversation_id: "conversation-1",
        call_type: "video",
        peer: {
          _id: "user-b",
          name: "John Doe",
          avatar: "",
        },
      },
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "call/startOutgoingCall",
      payload: {
        call: {
          call_id: "call-1",
          conversation_id: "conversation-1",
          call_type: "video",
          peer: {
            _id: "user-b",
            name: "John Doe",
            avatar: "",
          },
        },
      },
    });

    expect(socket.emit).toHaveBeenCalledWith("call_invite", {
      to: "user-b",
      conversation_id: "conversation-1",
      call_id: "call-1",
      call_type: "video",
    });
  });

  it("disables call buttons while another call is active", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        ...baseState,
        call: {
          status: "active",
        },
      }),
    );

    render(<Header />);

    expect(
      screen.getByRole("button", {
        name: "Start video call",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Start voice call",
      }),
    ).toBeDisabled();
  });
});
