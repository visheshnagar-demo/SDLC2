import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import QuoteFormCard from "./QuoteFormCard";

describe("QuoteFormCard", () => {
  it("renders form inputs with initial values", () => {
    const handleCalculate = vi.fn();
    render(<QuoteFormCard onCalculate={handleCalculate} isLoading={false} />);

    expect(screen.getByLabelText(/Vehicle Make/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Manufacture Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Vehicle Value/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Driver Age/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Driving Experience/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Calculate Premium Quote/i }),
    ).toBeInTheDocument();
  });

  it("submits valid form data on button click", () => {
    const handleCalculate = vi.fn();
    render(<QuoteFormCard onCalculate={handleCalculate} isLoading={false} />);

    const submitBtn = screen.getByRole("button", {
      name: /Calculate Premium Quote/i,
    });
    fireEvent.click(submitBtn);

    expect(handleCalculate).toHaveBeenCalledWith({
      vehicle_make: "Toyota",
      vehicle_year: 2022,
      vehicle_value: 25000,
      driver_age: 30,
      driving_experience: 5,
      coverage_type: "Comprehensive",
    });
  });

  it("blocks submission and shows error on invalid inputs (age < 16 or negative car value)", () => {
    const handleCalculate = vi.fn();
    render(<QuoteFormCard onCalculate={handleCalculate} isLoading={false} />);

    const ageInput = screen.getByLabelText(/Driver Age/i);
    fireEvent.change(ageInput, { target: { value: "14" } });

    const valInput = screen.getByLabelText(/Vehicle Value/i);
    fireEvent.change(valInput, { target: { value: "-5000" } });

    const submitBtn = screen.getByRole("button", {
      name: /Calculate Premium Quote/i,
    });
    fireEvent.click(submitBtn);

    expect(handleCalculate).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
