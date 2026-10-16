import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ShieldCheck } from "lucide-react";
import KpiCard from "./KpiCard";

describe("KpiCard Component", () => {
  it("renders title and value", () => {
    render(
      <KpiCard
        title="Pending Submissions"
        value={12}
        subtitle="Active Treaty Queue"
        icon={ShieldCheck}
      />,
    );

    expect(screen.getByText("Pending Submissions")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Active Treaty Queue")).toBeInTheDocument();
  });

  it("renders trend information when supplied", () => {
    render(
      <KpiCard
        title="Avg Risk Score"
        value="74/100"
        trend={{ value: "+5%", direction: "up" }}
      />,
    );

    expect(screen.getByText("Avg Risk Score")).toBeInTheDocument();
    expect(screen.getByText("74/100")).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });
});
