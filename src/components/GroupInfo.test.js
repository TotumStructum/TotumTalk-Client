import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import GroupInfo from "./GroupInfo";
import { ToggleSidebar, UpdateSidebarType } from "../redux/slices/app";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../redux/slices/app", () => ({
  ToggleSidebar: jest.fn(),
  UpdateSidebarType: jest.fn(),
}));

const renderGroupInfo = () =>
  render(
    <ThemeProvider theme={createTheme()}>
      <GroupInfo />
    </ThemeProvider>,
  );

describe("GroupInfo", () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useDispatch.mockReturnValue(dispatch);

    ToggleSidebar.mockReturnValue({
      type: "app/toggleSidebar",
    });

    UpdateSidebarType.mockImplementation((type) => ({
      type: "app/updateSidebarType",
      payload: type,
    }));

    useSelector.mockImplementation((selector) =>
      selector({
        conversation: {
          group_chat: {
            current_conversation: {
              _id: "group-1",
              title: "Study Group",
              participants: [
                {
                  _id: "user-a",
                  firstName: "John",
                  lastName: "Doe",
                  email: "john@example.com",
                  avatar: "",
                },
                {
                  _id: "user-b",
                  firstName: "Jane",
                  lastName: "Smith",
                  email: "jane@example.com",
                  avatar: "",
                },
              ],
            },
            current_messages: [
              {
                _id: "media-1",
                type: "Media",
                file: "http://localhost:3000/uploads/media/group-image.png",
              },
              {
                _id: "link-1",
                type: "Link",
                text: "youtube.com",
              },
              {
                _id: "doc-1",
                type: "Document",
                file: "http://localhost:3000/uploads/documents/group-file.pdf",
              },
            ],
          },
        },
      }),
    );
  });

  it("renders group title, members and shared message count", () => {
    renderGroupInfo();

    expect(screen.getByText("Study Group")).toBeInTheDocument();
    expect(screen.getByText("2 members")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3/i })).toBeInTheDocument();
  });

  it("opens shared messages from group info", () => {
    renderGroupInfo();

    fireEvent.click(screen.getByRole("button", { name: /3/i }));

    expect(UpdateSidebarType).toHaveBeenCalledWith("SHARED");
    expect(dispatch).toHaveBeenCalledWith({
      type: "app/updateSidebarType",
      payload: "SHARED",
    });
  });

  it("closes group info sidebar", () => {
    renderGroupInfo();

    fireEvent.click(screen.getAllByRole("button")[0]);

    expect(ToggleSidebar).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({
      type: "app/toggleSidebar",
    });
  });
});
