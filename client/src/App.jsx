import React, { useState } from "react";
import CalculatorAppShell from "./components/CalculatorAppShell";
import CalculatorPage from "./pages/CalculatorPage";
import QuoteAuditPage from "./pages/QuoteAuditPage";

const INITIAL_QUOTES = [
  {
    id: "9b1deb4d-3b7d-4bad-9821-4318721c4310",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    vehicle_make: "Toyota",
    vehicle_year: 2022,
    vehicle_value: 25000,
    driver_age: 30,
    driving_experience: 5,
    coverage_type: "Comprehensive",
    base_premium: 500,
    total_premium: 1200,
    currency: "USD",
    factors: [
      {
        factor_name: "Base Tariff Premium",
        description: "Standard statutory baseline motor risk charge",
        amount: 500,
        factor_type: "base",
      },
      {
        factor_name: "Vehicle Value Loading (1.2%)",
        description: "Asset value replacement risk loading ($25,000 * 1.2%)",
        amount: 300,
        factor_type: "loading",
      },
      {
        factor_name: "Driver Age Adjustment (26-35)",
        description: "Standard adult driver baseline age surcharge",
        amount: 100,
        factor_type: "loading",
      },
      {
        factor_name: "Driving Experience Discount (5 yrs)",
        description: "Low-claims risk discount for 5+ years licensed driving",
        amount: -100,
        factor_type: "discount",
      },
      {
        factor_name: "Comprehensive Coverage Surcharge",
        description:
          "Collision, fire, theft, and third-party protection package",
        amount: 400,
        factor_type: "surcharge",
      },
    ],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("calculator");
  const [recentQuotes, setRecentQuotes] = useState(INITIAL_QUOTES);

  const handleQuoteCreated = (newQuote) => {
    setRecentQuotes((prev) => [newQuote, ...prev]);
  };

  return (
    <CalculatorAppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "calculator" ? (
        <CalculatorPage
          onQuoteCreated={handleQuoteCreated}
          recentQuotes={recentQuotes}
        />
      ) : (
        <QuoteAuditPage localQuotes={recentQuotes} />
      )}
    </CalculatorAppShell>
  );
}
