import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RequirementsStage from "./RequirementsStage";

describe("RequirementsStage Component", () => {
  const dummyProject = {
    id: "proj-123",
    status: "NOT_STARTED",
  };

  it("renders stage heading and form elements", () => {
    render(
      <RequirementsStage project={dummyProject} onProjectUpdated={vi.fn()} />,
    );

    expect(
      screen.getByText(/Stage 1: Requirement Ingestion & Structured Parsing/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ingest Requirements/i }),
    ).toBeInTheDocument();
  });

  it("allows editing requirement text and format", () => {
    render(
      <RequirementsStage project={dummyProject} onProjectUpdated={vi.fn()} />,
    );

    const textarea = screen.getByPlaceholderText(
      /Paste Markdown, user stories, or functional requirements here.../i,
    );
    fireEvent.change(textarea, {
      target: { value: "New Test Requirement Content" },
    });
    expect(textarea.value).toBe("New Test Requirement Content");
  });
});
