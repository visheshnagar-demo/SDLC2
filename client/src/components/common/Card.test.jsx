import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Card } from "./Card";

describe("Card component", () => {
  it("renders title and subtitle when provided", () => {
    render(
      <Card title="Test Title" subtitle="Test Subtitle">
        <div>Card Content</div>
      </Card>,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });
});
