import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Header from "./Header";

describe("Header component", () => {
  it("renders application branding and title", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("RESECURE")).toBeInTheDocument();
    expect(screen.getByText("FACULTATIVE")).toBeInTheDocument();
  });

  it("renders role selector dropdown and active user", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/active portal role/i)).toBeInTheDocument();
    expect(screen.getByText(/Sarah Jenkins/i)).toBeInTheDocument();
  });
});
