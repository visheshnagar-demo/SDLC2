import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SLAIndicatorBadge from "./SLAIndicatorBadge";

describe("SLAIndicatorBadge Component", () => {
  it("renders on track status when within SLA", () => {
    const recentDate = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    render(<SLAIndicatorBadge createdAt={recentDate} />);
    expect(screen.getByText(/On Track/i)).toBeInTheDocument();
  });

  it("renders SLA breached when past duration", () => {
    const pastDate = new Date(Date.now() - 30 * 3600 * 1000).toISOString();
    render(<SLAIndicatorBadge createdAt={pastDate} />);
    expect(screen.getByText(/SLA Breached/i)).toBeInTheDocument();
  });
});
