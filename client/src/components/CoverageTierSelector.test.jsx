import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CoverageTierSelector from "./CoverageTierSelector";

describe("CoverageTierSelector", () => {
  it("renders all three coverage tier options", () => {
    const handleChange = vi.fn();
    render(
      <CoverageTierSelector value="Comprehensive" onChange={handleChange} />,
    );

    expect(screen.getByText("Third Party")).toBeInTheDocument();
    expect(screen.getByText("Third Party Fire & Theft")).toBeInTheDocument();
    expect(screen.getByText("Comprehensive")).toBeInTheDocument();
  });

  it("triggers onChange when another tier is clicked", () => {
    const handleChange = vi.fn();
    render(
      <CoverageTierSelector value="Comprehensive" onChange={handleChange} />,
    );

    const thirdPartyBtn = screen.getByText("Third Party").closest("button");
    fireEvent.click(thirdPartyBtn);

    expect(handleChange).toHaveBeenCalledWith("Third Party");
  });
});
