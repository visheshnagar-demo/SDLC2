import React, { useState, useEffect } from "react";
import QuoteAuditTable from "../components/QuoteAuditTable";
import QuoteAuditDrawer from "../components/QuoteAuditDrawer";
import { listQuotes, getQuoteById } from "../services/api";

export default function QuoteAuditPage({ localQuotes = [] }) {
  const [quotes, setQuotes] = useState(localQuotes);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRemoteQuotes = async () => {
    setIsLoading(true);
    try {
      const data = await listQuotes();
      const remoteList = Array.isArray(data)
        ? data
        : data.items || data.quotes || [];

      // Merge remote quotes with local session quotes, deduplicating by ID
      const map = new Map();
      [...localQuotes, ...remoteList].forEach((q) => {
        const id = q.id || q.quote_id;
        if (id) {
          map.set(id, q);
        }
      });

      setQuotes(Array.from(map.values()));
    } catch (err) {
      // If backend doesn't have list endpoint yet, fallback to localQuotes
      setQuotes(localQuotes);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoteQuotes();
  }, [localQuotes]);

  const handleSelectQuote = async (quote) => {
    const id = quote.id || quote.quote_id;
    if (id && (!quote.factors || quote.factors.length === 0)) {
      try {
        const fullDetail = await getQuoteById(id);
        setSelectedQuote({ ...quote, ...fullDetail });
      } catch (err) {
        setSelectedQuote(quote);
      }
    } else {
      setSelectedQuote(quote);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedQuote(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <QuoteAuditTable
        quotes={quotes}
        onSelectQuote={handleSelectQuote}
        onRefresh={fetchRemoteQuotes}
        isLoading={isLoading}
      />

      <QuoteAuditDrawer
        quote={selectedQuote}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
