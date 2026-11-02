package com.citidirect.cashstatement.engine;

import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.citidirect.cashstatement.statement.dto.TransactionRecord;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Component;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;

@Component("pdfReportEngine")
public class PdfReportEngine implements ReportExportEngine {

    private static final Color CITI_BLUE = new Color(0, 45, 114); // #002D72
    private static final Color CITI_BLUE_DARK = new Color(15, 32, 61); // #0F203D
    private static final Color CITI_BLUE_ACTION = new Color(0, 118, 212); // #0076D4
    private static final Color CITI_RED = new Color(182, 0, 0); // #B60000
    private static final Color SURFACE_SUB = new Color(240, 244, 247); // #F0F4F7
    private static final Color BORDER_GRID = new Color(200, 213, 225); // #C8D5E1
    private static final Color TEXT_PRIMARY = new Color(34, 48, 62); // #22303E

    private static final Font FONT_TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, CITI_BLUE);
    private static final Font FONT_HEADER_BRAND = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, CITI_BLUE);
    private static final Font FONT_SECTION = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, CITI_BLUE);
    private static final Font FONT_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, TEXT_PRIMARY);
    private static final Font FONT_VALUE = FontFactory.getFont(FontFactory.HELVETICA, 8, TEXT_PRIMARY);
    private static final Font FONT_TH = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, CITI_BLUE);
    private static final Font FONT_TD = FontFactory.getFont(FontFactory.HELVETICA, 7.5f, TEXT_PRIMARY);
    private static final Font FONT_TD_NUM = FontFactory.getFont(FontFactory.COURIER, 7.5f, TEXT_PRIMARY);
    private static final Font FONT_FOOTER = FontFactory.getFont(FontFactory.HELVETICA, 7, Color.DARK_GRAY);

    private final DecimalFormat moneyFormat = new DecimalFormat("#,##0.00");

    @Override
    public byte[] export(StatementReportData reportData) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 25, 25);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        writer.setPageEvent(new PdfPageEventHelper() {
            @Override
            public void onEndPage(PdfWriter writer, Document doc) {
                PdfContentByte cb = writer.getDirectContent();
                Phrase footerText = new Phrase("= Indicates Calculated Balances   |   *Please note: For branches 920, 930 and 940, balances displayed are reflective of posted funds. Any debits currently pending will not be reflected in this balance.", FONT_FOOTER);
                Phrase pageText = new Phrase("Page " + writer.getPageNumber() + "   |   " + reportData.getReportName() + "   |   " + reportData.getReportDate() + " GMT", FONT_FOOTER);
                
                ColumnText.showTextAligned(cb, Element.ALIGN_LEFT, footerText, doc.left(), doc.bottom() - 10, 0);
                ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT, pageText, doc.right(), doc.bottom() - 10, 0);
            }
        });

        document.open();

        for (int i = 0; i < reportData.getAccounts().size(); i++) {
            if (i > 0 && reportData.getCriteria().isPageBreaks()) {
                document.newPage();
            }

            AccountSummaryData account = reportData.getAccounts().get(i);
            renderAccountStatement(document, reportData, account);
        }

        document.close();
        return baos.toByteArray();
    }

    private void renderAccountStatement(Document document, StatementReportData reportData, AccountSummaryData account) throws Exception {
        // Top Header
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{50f, 50f});

        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        Paragraph brand = new Paragraph("citi", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, CITI_BLUE));
        logoCell.addElement(brand);
        headerTable.addCell(logoCell);

        PdfPCell citiDirectCell = new PdfPCell();
        citiDirectCell.setBorder(Rectangle.NO_BORDER);
        citiDirectCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph rightBrand = new Paragraph("CitiDirect BE®", FONT_HEADER_BRAND);
        rightBrand.setAlignment(Element.ALIGN_RIGHT);
        citiDirectCell.addElement(rightBrand);
        headerTable.addCell(citiDirectCell);

        document.add(headerTable);

        // Title
        Paragraph title = new Paragraph("Account Statement – Comprehensive Report", FONT_TITLE);
        title.setSpacingBefore(4);
        title.setSpacingAfter(8);
        document.add(title);

        // Account Metadata Block
        PdfPTable metaTable = new PdfPTable(4);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[]{22f, 28f, 22f, 28f});
        metaTable.getDefaultCell().setBorder(Rectangle.BOX);
        metaTable.getDefaultCell().setBorderColor(BORDER_GRID);
        metaTable.getDefaultCell().setPadding(3);

        addMetaCell(metaTable, "Bank Name:", account.getBankName());
        addMetaCell(metaTable, "Account Number/Name:", account.getAccountNumber() + " / " + account.getAccountName());
        addMetaCell(metaTable, "Customer Number/Name:", account.getCustomerNumber() + " / " + account.getCustomerName());
        addMetaCell(metaTable, "Account Currency/Type:", account.getCurrency() + " / " + account.getAccountType());
        addMetaCell(metaTable, "Branch Number/Name:", account.getBranchNumber() + " / " + account.getBranchName());
        addMetaCell(metaTable, "Statement Date:", account.getStatementDate());
        addMetaCell(metaTable, "SWIFT Code:", account.getSwiftCode());
        addMetaCell(metaTable, "Running Balance Status:", account.isRunningBalanceEnabled() ? "ENABLED (Per-Branch)" : "DISABLED");

        document.add(metaTable);

        // Summary Band Table
        Paragraph summaryHeader = new Paragraph("Summary Balance Band", FONT_SECTION);
        summaryHeader.setSpacingBefore(6);
        summaryHeader.setSpacingAfter(3);
        document.add(summaryHeader);

        PdfPTable summaryTable = new PdfPTable(8);
        summaryTable.setWidthPercentage(100);
        summaryTable.setWidths(new float[]{13f, 13f, 13f, 10f, 13f, 10f, 13f, 15f});

        addSummaryHeaderCell(summaryTable, "Opening Avail Bal");
        addSummaryHeaderCell(summaryTable, "Intraday Bal");
        addSummaryHeaderCell(summaryTable, "Current Closing Avail");
        addSummaryHeaderCell(summaryTable, "Credit Count");
        addSummaryHeaderCell(summaryTable, "Total Credit Amt");
        addSummaryHeaderCell(summaryTable, "Debit Count");
        addSummaryHeaderCell(summaryTable, "Total Debit Amt");
        addSummaryHeaderCell(summaryTable, "Net Txn Amt");

        addSummaryValueCell(summaryTable, moneyFormat.format(account.getOpeningAvailableBalance()) + " " + account.getCurrency());
        addSummaryValueCell(summaryTable, moneyFormat.format(account.getIntradayBalance() != null ? account.getIntradayBalance() : account.getClosingAvailableBalance()) + " " + account.getCurrency());
        addSummaryValueCell(summaryTable, moneyFormat.format(account.getClosingAvailableBalance()) + " " + account.getCurrency());
        addSummaryValueCell(summaryTable, String.valueOf(account.getCreditCount()));
        addSummaryValueCell(summaryTable, moneyFormat.format(account.getTotalCreditAmount()));
        addSummaryValueCell(summaryTable, String.valueOf(account.getDebitCount()));
        addSummaryValueCell(summaryTable, moneyFormat.format(account.getTotalDebitAmount()));
        addSummaryValueCell(summaryTable, moneyFormat.format(account.getNetTransactionAmount()));

        document.add(summaryTable);

        // Transaction Table
        Paragraph txnHeader = new Paragraph("Transaction Activity", FONT_SECTION);
        txnHeader.setSpacingBefore(8);
        txnHeader.setSpacingAfter(3);
        document.add(txnHeader);

        boolean runningBalEnabled = account.isRunningBalanceEnabled();
        int cols = runningBalEnabled ? 9 : 8;
        PdfPTable txnTable = new PdfPTable(cols);
        txnTable.setWidthPercentage(100);
        if (runningBalEnabled) {
            txnTable.setWidths(new float[]{9f, 11f, 11f, 18f, 16f, 13f, 4f, 10f, 11f});
        } else {
            txnTable.setWidths(new float[]{10f, 12f, 12f, 20f, 18f, 14f, 4f, 10f});
        }

        addThCell(txnTable, "Value Date");
        addThCell(txnTable, "Customer Ref");
        addThCell(txnTable, "Bank Ref");
        addThCell(txnTable, "Description");
        addThCell(txnTable, "Ordering / Beneficiary");
        addThCell(txnTable, "Remittance Info");
        addThCell(txnTable, "C/D");
        addThCell(txnTable, "Amount");
        if (runningBalEnabled) {
            addThCell(txnTable, "Running Bal");
        }

        DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        boolean even = false;

        for (TransactionRecord txn : account.getTransactions()) {
            Color rowBg = even ? Color.WHITE : SURFACE_SUB;
            even = !even;

            addTdCell(txnTable, txn.getValueDate() != null ? txn.getValueDate().format(df) : "", rowBg);
            addTdCell(txnTable, txn.getCustomerReference() != null ? txn.getCustomerReference() : "", rowBg);
            addTdCell(txnTable, txn.getBankReference() != null ? txn.getBankReference() : "", rowBg);
            addTdCell(txnTable, txn.getDescription() != null ? txn.getDescription() : "", rowBg);
            
            String party = "C".equalsIgnoreCase(txn.getDebitCredit()) ? txn.getOrderingPartyName() : txn.getBeneficiaryName();
            addTdCell(txnTable, party != null ? party : "", rowBg);
            addTdCell(txnTable, txn.getRemittanceInformation() != null ? txn.getRemittanceInformation() : "", rowBg);
            addTdCell(txnTable, txn.getDebitCredit(), rowBg);

            // Debits formatted with trailing '-' in PDF
            String formattedAmount = moneyFormat.format(txn.getAmount());
            if ("D".equalsIgnoreCase(txn.getDebitCredit())) {
                formattedAmount += "-";
            }
            addTdNumCell(txnTable, formattedAmount, rowBg);

            if (runningBalEnabled) {
                addTdNumCell(txnTable, txn.getRunningBalance() != null ? moneyFormat.format(txn.getRunningBalance()) : "", rowBg);
            }

            // Enhanced details row if enabled
            if (reportData.getCriteria().isShowEnhancedTransactionDetails()) {
                PdfPCell enhancedCell = new PdfPCell();
                enhancedCell.setColspan(cols);
                enhancedCell.setBackgroundColor(new Color(246, 248, 250));
                enhancedCell.setPadding(4);
                enhancedCell.setBorder(Rectangle.BOTTOM);
                enhancedCell.setBorderColor(BORDER_GRID);

                String details = String.format("Product: %s | Batch/Track: %s | Ordering Bank: %s | Beneficiary Bank: %s | Address: %s",
                        txn.getProductType() != null ? txn.getProductType() : "N/A",
                        txn.getBatchNumber() != null ? txn.getBatchNumber() : "N/A",
                        txn.getOrderingBank() != null ? txn.getOrderingBank() : "N/A",
                        txn.getBeneficiaryBank() != null ? txn.getBeneficiaryBank() : "N/A",
                        txn.getOrderingPartyAddress1() != null ? txn.getOrderingPartyAddress1() : "N/A");
                enhancedCell.addElement(new Paragraph(details, FONT_FOOTER));
                txnTable.addCell(enhancedCell);
            }
        }

        document.add(txnTable);
    }

    private void addMetaCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOX);
        cell.setBorderColor(BORDER_GRID);
        cell.setBackgroundColor(Color.WHITE);
        cell.setPadding(3);

        Paragraph p = new Paragraph();
        p.add(new Chunk(label + " ", FONT_LABEL));
        p.add(new Chunk(value != null ? value : "", FONT_VALUE));
        cell.addElement(p);
        table.addCell(cell);
    }

    private void addSummaryHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TH));
        cell.setBackgroundColor(SURFACE_SUB);
        cell.setBorderColor(BORDER_GRID);
        cell.setPadding(4);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addSummaryValueCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TD_NUM));
        cell.setBackgroundColor(Color.WHITE);
        cell.setBorderColor(BORDER_GRID);
        cell.setPadding(4);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addThCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TH));
        cell.setBackgroundColor(SURFACE_SUB);
        cell.setBorder(Rectangle.BOTTOM | Rectangle.TOP);
        cell.setBorderColorBottom(CITI_BLUE);
        cell.setBorderColorTop(BORDER_GRID);
        cell.setBorderWidthBottom(1.5f);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addTdCell(PdfPTable table, String text, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TD));
        cell.setBackgroundColor(bg);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        table.addCell(cell);
    }

    private void addTdNumCell(PdfPTable table, String text, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TD_NUM));
        cell.setBackgroundColor(bg);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(3);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(cell);
    }

    @Override
    public String getContentType() {
        return "application/pdf";
    }

    @Override
    public String getFileExtension() {
        return "pdf";
    }
}
