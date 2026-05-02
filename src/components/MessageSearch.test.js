import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import MessageSearch from "./MessageSearch";
import { UpdateSidebarType } from "../redux/slices/app";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  UpdateSidebarType: jest.fn(),
}));

const renderMessageSearch = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <MessageSearch />
    </ThemeProvider>,
  );

describe("MessageSearch", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useDispatch.mockReturnValue(dispatch);

    UpdateSidebarType.mockImplementation((type) => ({
      type: "app/updateSidebarType",
      payload: { type },
    }));

    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          direct_chat: {
            current_messages: [
              {
                _id: "message-1",
                type: "Text",
                text: "Important meeting notes",
              },
              {
                _id: "message-2",
                type: "Link",
                text: "youtube.com",
              },
              {
                _id: "message-3",
                type: "Document",
                text: "Project specification",
              },
            ],
          },
        },
      }),
    );
  });

  it("filters direct messages by search query", () => {
    renderMessageSearch();

    fireEvent.change(screen.getByPlaceholderText("Search messages..."), {
      target: {
        value: "meeting",
      },
    });

    expect(screen.getByText("Important meeting notes")).toBeInTheDocument();
    expect(screen.queryByText("youtube.com")).not.toBeInTheDocument();
  });

  it("shows empty state when no messages match query", () => {
    renderMessageSearch();

    fireEvent.change(screen.getByPlaceholderText("Search messages..."), {
      target: {
        value: "missing",
      },
    });

    expect(screen.getByText("No messages found")).toBeInTheDocument();
  });

  it("returns to contact sidebar when pressing back", () => {
    renderMessageSearch();

    fireEvent.click(screen.getByRole("button"));

    expect(UpdateSidebarType).toHaveBeenCalledWith("CONTACT");
    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: { type: "CONTACT" },
    });
  });
});
