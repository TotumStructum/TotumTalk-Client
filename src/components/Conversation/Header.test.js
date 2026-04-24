import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ToggleSidebar, UpdateSidebarType } from "../../redux/slices/app";
import Header from "./Header";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../../redux/slices/app", () => ({
  ToggleSidebar: jest.fn(),
  UpdateSidebarType: jest.fn(),
}));

jest.mock("../StyledBadge", () => {
  return function MockStyledBadge({ children }) {
    return <div data-testid="styled-badge">{children}</div>;
  };
});

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
    },
    app: {
      sidebar: {
        open: false,
        type: "CONTACT",
      },
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
});
