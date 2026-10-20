import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import DecisionWorkspacePage from "./DecisionWorkspacePage";

vi.mock("../services/api", () => ({
  api: {
    getDocuments: vi
      .fn()
      .mockResolvedValue([
        { id: "doc-1", file_name: "Treaty_A.pdf", file_type: "PDF" },
      ]),
    createDecision: vi
      .fn()
      .mockResolvedValue({ id: "dec-1", decision: "APPROVED" }),
  },
}));

describe("DecisionWorkspacePage Component", () => {
  it("renders side by side comparison and underwriter decision form", () => {
    render(
      <BrowserRouter>
        <DecisionWorkspacePage />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Side-by-Side Clause Wording Comparison/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Underwriter Sign-off & Decision Recording/i),
    ).toBeInTheDocument();
  });
});
