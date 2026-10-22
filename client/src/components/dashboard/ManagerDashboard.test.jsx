import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import ManagerDashboard from "./ManagerDashboard";

describe("ManagerDashboard component", () => {
  it("renders portfolio metrics and executive dashboard headings", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ManagerDashboard />
        </AuthProvider>
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Executive Underwriting Dashboard & Portfolio Analytics/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/Quote-to-Bind Ratio/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Limit Exposed/i)).toBeInTheDocument();
    });
  });
});
