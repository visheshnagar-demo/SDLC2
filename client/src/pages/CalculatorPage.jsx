import React, { useState } from "react";
import KPIStatsBar from "../components/KPIStatsBar";
import QuoteFormCard from "../components/QuoteFormCard";
import PremiumSummaryCard from "../components/PremiumSummaryCard";
import ItemizedFactorBreakdown from "../components/ItemizedFactorBreakdown";
import { calculateQuote } from "../services/api";

export default function CalculatorPage({ onQuoteCreated, recentQuotes = [] }) {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleCalculate = async (formData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const result = await calculateQuote(formData);
      // Ensure result has the form input metadata if backend omitted it
      const completeQuote = {
        ...formData,
        ...result,
        id:
          result.id ||
          result.quote_id ||
          `Q-${Date.now().toString(36).toUpperCase()}`,
        calculated_at:
          result.calculated_at || result.created_at || new Date().toISOString(),
      };

      setCurrentQuote(completeQuote);
      if (onQuoteCreated) {
        onQuoteCreated(completeQuote);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to calculate insurance quote. Please check connection to rating engine backend.";
      setApiError(
        typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage),
      );
      setCurrentQuote(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute average from recent quotes
  const totalCount = recentQuotes.length;
  const avgPremium =
    totalCount > 0
      ? recentQuotes.reduce(
          (acc, q) => acc + Number(q.total_premium || q.premium || 0),
          0,
        ) / totalCount
      : 1200;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Executive KPI Stats Bar */}
      <KPIStatsBar quoteCount={totalCount} averagePremium={avgPremium} />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (7 cols) */}
        <div className="lg:col-span-7">
          <QuoteFormCard
            onCalculate={handleCalculate}
            isLoading={isLoading}
            apiError={apiError}
          />
        </div>

        {/* Right Column: Hero Premium Summary & Itemized Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <PremiumSummaryCard quote={currentQuote} />
          {currentQuote && <ItemizedFactorBreakdown quote={currentQuote} />}
        </div>
      </div>
    </div>
  );
}
