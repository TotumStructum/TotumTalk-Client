import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Contact from "./Contact";
import {
  ResetConversationSelection,
  ToggleSidebar,
  showSnackbar,
} from "../redux/slices/app";
import {
  ClearCurrentConversation,
  DeleteDirectConversation,
} from "../redux/slices/conversation";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  ResetConversationSelection: jest.fn(),
  ToggleSidebar: jest.fn(),
  UpdateSidebarType: jest.fn(),
  showSnackbar: jest.fn(),
}));

jest.mock("../redux/slices/conversation", () => ({
  ClearCurrentConversation: jest.fn(),
  DeleteDirectConversation: jest.fn(),
}));

const renderContact = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <Contact />
    </ThemeProvider>,
  );

describe("Contact", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatch.mockReturnValue(dispatch);

    DeleteDirectConversation.mockImplementation((payload) => ({
      type: "conversation/deleteDirectConversation",
      payload,
    }));

    ResetConversationSelection.mockReturnValue({
      type: "app/resetConversationSelection",
    });

    ClearCurrentConversation.mockReturnValue({
      type: "conversation/clearCurrentConversation",
    });

    ToggleSidebar.mockReturnValue({
      type: "app/toggleSidebar",
    });

    showSnackbar.mockImplementation((payload) => ({
      type: "app/openSnackbar",
      payload,
    }));

    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            current_conversation: {
              id: "conversation-1",
              name: "John Doe",
              email: "john@example.com",
              online: false,
              img: "",
              about: "Test user",
            },
            current_messages: [],
          },
        },
      }),
    );
  });

  it("deletes conversation only for current user from delete dialog", async () => {
    renderContact();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete for me/i }));

    await waitFor(() => {
      expect(DeleteDirectConversation).toHaveBeenCalledWith({
        conversation_id: "conversation-1",
        scope: "me",
      });
    });

    expect(dispatch).toHaveBeenCalledWith({
      type: "conversation/deleteDirectConversation",
      payload: {
        conversation_id: "conversation-1",
        scope: "me",
      },
    });

    expect(ResetConversationSelection).toHaveBeenCalledTimes(1);
    expect(ClearCurrentConversation).toHaveBeenCalledTimes(1);
    expect(ToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it("requires second confirmation before deleting conversation for everyone", async () => {
    renderContact();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /delete for everyone/i }),
    );

    expect(
      screen.getByText(
        "This will permanently delete this conversation and all messages for both users. This action cannot be undone.",
      ),
    ).toBeInTheDocument();

    expect(DeleteDirectConversation).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", {
        name: /^delete for everyone$/i,
      }),
    );

    await waitFor(() => {
      expect(DeleteDirectConversation).toHaveBeenCalledWith({
        conversation_id: "conversation-1",
        scope: "everyone",
      });
    });
  });

  it("shows AI assistant label and hides delete actions for TotumAI contact", () => {
    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            current_conversation: {
              id: "conversation-ai",
              name: "TotumAI Assistant",
              email: "totumai@system.local",
              online: true,
              img: "",
              about: "",
              isAI: true,
              isSystem: true,
            },
            current_messages: [],
          },
        },
      }),
    );

    renderContact();

    expect(screen.getByText("AI assistant")).toBeInTheDocument();
    expect(
      screen.getByText("Virtual AI interlocutor in TotumTalk."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });
});
