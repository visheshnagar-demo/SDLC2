import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import DocumentsPage from "./DocumentsPage";

vi.mock("../services/api", () => ({
  api: {
    getDocuments: vi.fn().mockResolvedValue([
      {
        id: "doc-1",
        file_name: "SwissRe_Treaty.pdf",
        file_type: "PDF",
        status: "INGESTED",
        extracted_metadata: { ceding_company: "Swiss Re" },
      },
    ]),
    uploadDocument: vi.fn().mockResolvedValue({ id: "doc-new" }),
  },
}));

describe("DocumentsPage Component", () => {
  it("renders upload area and document repository headers", () => {
    render(
      <BrowserRouter>
        <DocumentsPage />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/Ingest Reinsurance Documents/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Drag & Drop Reinsurance Slips & Claims Logs/i),
    ).toBeInTheDocument();
  });
});
