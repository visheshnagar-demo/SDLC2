package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.entity.StatementLineItem;
import com.citidirect.cashstatement.entity.StatementReport;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.List;

@Service
public class ExportService {

    private final DecimalFormat amountFormatter = new DecimalFormat("#,##0.00");

    private String formatTrailingNegative(BigDecimal amount, boolean isDebit) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) {
            return "0.00";
        }
        String formatted = amountFormatter.format(amount.abs());
        if (isDebit || amount.compareTo(BigDecimal.ZERO) < 0) {
            return formatted + "-";
        }
        return formatted;
    }

    public byte[] generatePdfExport(StatementReport report, List<StatementLineItem> lineItems) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            // A4 Portrait with 15mm margins (~42.52 points)
            float margin = 42.52f;
            Document document = new Document(PageSize.A4, margin, margin, margin, margin);
            PdfWriter.getInstance(document, out);
            document.open();

            // Styling fonts
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(13, 30, 59));
            com.lowagie.text.Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 9, new Color(79, 111, 144));
            com.lowagie.text.Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(0, 45, 114));
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, new Color(0, 45, 114));
            com.lowagie.text.Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 7, new Color(34, 48, 62));
            com.lowagie.text.Font debitFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, new Color(182, 0, 0));

            // Header Section
            Paragraph title = new Paragraph("CitiDirect Online Banking — Cash Statement Report", titleFont);
            title.setSpacingAfter(4f);
            document.add(title);

            Paragraph meta = new Paragraph(String.format(
                "Report: %s | Account: %s | Branch: %s | Currency: %s | Statement Date: %s",
                report.getReportName(), report.getAccountNumber(), report.getBranchCode(), report.getCurrency(), report.getStatementDate()
            ), subTitleFont);
            meta.setSpacingAfter(12f);
            document.add(meta);

            // KPI Summary Card Table
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15f);

            addKpiCell(kpiTable, "OPENING BALANCE", amountFormatter.format(report.getOpeningBalance()) + " " + report.getCurrency(), sectionFont, bodyFont);
            addKpiCell(kpiTable, "TOTAL DEBITS", formatTrailingNegative(report.getTotalDebits(), true) + " " + report.getCurrency(), sectionFont, debitFont);
            addKpiCell(kpiTable, "TOTAL CREDITS", amountFormatter.format(report.getTotalCredits()) + " " + report.getCurrency(), sectionFont, bodyFont);
            addKpiCell(kpiTable, "CLOSING BALANCE", amountFormatter.format(report.getClosingBalance()) + " " + report.getCurrency(), sectionFont, sectionFont);
            document.add(kpiTable);

            // 9-Column Ledger Table
            Paragraph ledgerTitle = new Paragraph("Statement Transactions (Financial Ledger)", sectionFont);
            ledgerTitle.setSpacingAfter(6f);
            document.add(ledgerTitle);

            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.0f, 1.0f, 1.5f, 2.5f, 1.2f, 1.2f, 1.3f, 0.8f, 1.0f});

            // Table Headers
            String[] headers = {"Txn Date", "Value Date", "Reference", "Description", "Debit (-)", "Credit", "Balance", "Curr", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(225, 236, 244));
                cell.setPadding(4f);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            // Line items
            boolean zebra = false;
            for (StatementLineItem item : lineItems) {
                Color rowBg = zebra ? new Color(250, 251, 252) : Color.WHITE;
                zebra = !zebra;

                addTableRow(table, item.getTxnDate() != null ? item.getTxnDate() : "-", bodyFont, rowBg, Element.ALIGN_CENTER);
                addTableRow(table, item.getValueDate() != null ? item.getValueDate() : "-", bodyFont, rowBg, Element.ALIGN_CENTER);
                addTableRow(table, item.getTxnReference() != null ? item.getTxnReference() : "-", bodyFont, rowBg, Element.ALIGN_LEFT);
                addTableRow(table, item.getDescription() != null ? item.getDescription() : "-", bodyFont, rowBg, Element.ALIGN_LEFT);
                
                // Trailing negative for debit
                String debitText = (item.getDebitAmount() != null && item.getDebitAmount().compareTo(BigDecimal.ZERO) > 0)
                        ? formatTrailingNegative(item.getDebitAmount(), true)
                        : "-";
                addTableRow(table, debitText, debitFont, rowBg, Element.ALIGN_RIGHT);

                String creditText = (item.getCreditAmount() != null && item.getCreditAmount().compareTo(BigDecimal.ZERO) > 0)
                        ? amountFormatter.format(item.getCreditAmount())
                        : "-";
                addTableRow(table, creditText, bodyFont, rowBg, Element.ALIGN_RIGHT);

                String balanceText = item.getBalanceAfter() != null ? amountFormatter.format(item.getBalanceAfter()) : "0.00";
                addTableRow(table, balanceText, bodyFont, rowBg, Element.ALIGN_RIGHT);
                addTableRow(table, report.getCurrency(), bodyFont, rowBg, Element.ALIGN_CENTER);
                addTableRow(table, "POSTED", bodyFont, rowBg, Element.ALIGN_CENTER);
            }

            document.add(table);

            // Footer disclaimer
            Paragraph footer = new Paragraph("\n* Generated securely via CitiDirect Online Banking. Trailing minus sign (-) indicates debit transaction.", subTitleFont);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF export: " + e.getMessage(), e);
        }
    }

    private void addKpiCell(PdfPTable table, String label, String value, com.lowagie.text.Font titleFont, com.lowagie.text.Font valFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(235, 243, 251));
        cell.setPadding(6f);
        Paragraph pLabel = new Paragraph(label, titleFont);
        Paragraph pVal = new Paragraph(value, valFont);
        cell.addElement(pLabel);
        cell.addElement(pVal);
        table.addCell(cell);
    }

    private void addTableRow(PdfPTable table, String text, com.lowagie.text.Font font, Color bg, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(4f);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    public byte[] generateExcelExport(StatementReport report, List<StatementLineItem> lineItems) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cash Statement");

            // Header Style
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.DARK_BLUE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);

            // Title row
            Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("CitiDirect Online Banking — " + report.getReportName());

            // Summary row
            Row summaryRow = sheet.createRow(2);
            summaryRow.createCell(0).setCellValue("Account: " + report.getAccountNumber());
            summaryRow.createCell(2).setCellValue("Currency: " + report.getCurrency());
            summaryRow.createCell(4).setCellValue("Opening: " + amountFormatter.format(report.getOpeningBalance()));
            summaryRow.createCell(6).setCellValue("Closing: " + amountFormatter.format(report.getClosingBalance()));

            // 9 Column headers
            String[] headers = {"Txn Date", "Value Date", "Reference", "Description", "Debit Amount", "Credit Amount", "Balance After", "Currency", "Status"};
            Row headerRow = sheet.createRow(4);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 5;
            for (StatementLineItem item : lineItems) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getTxnDate() != null ? item.getTxnDate() : "");
                row.createCell(1).setCellValue(item.getValueDate() != null ? item.getValueDate() : "");
                row.createCell(2).setCellValue(item.getTxnReference() != null ? item.getTxnReference() : "");
                row.createCell(3).setCellValue(item.getDescription() != null ? item.getDescription() : "");
                row.createCell(4).setCellValue(formatTrailingNegative(item.getDebitAmount(), true));
                row.createCell(5).setCellValue(amountFormatter.format(item.getCreditAmount()));
                row.createCell(6).setCellValue(amountFormatter.format(item.getBalanceAfter()));
                row.createCell(7).setCellValue(report.getCurrency());
                row.createCell(8).setCellValue("POSTED");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel export: " + e.getMessage(), e);
        }
    }

    public String generateCsvExport(StatementReport report, List<StatementLineItem> lineItems) {
        StringWriter writer = new StringWriter();
        try (CSVPrinter printer = new CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                "Txn Date", "Value Date", "Reference", "Description", "Debit Amount", "Credit Amount", "Running Balance", "Currency", "Status"
        ))) {
            for (StatementLineItem item : lineItems) {
                printer.printRecord(
                    item.getTxnDate(),
                    item.getValueDate(),
                    item.getTxnReference(),
                    item.getDescription(),
                    formatTrailingNegative(item.getDebitAmount(), true),
                    amountFormatter.format(item.getCreditAmount()),
                    amountFormatter.format(item.getBalanceAfter()),
                    report.getCurrency(),
                    "POSTED"
                );
            }
            return writer.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate CSV export: " + e.getMessage(), e);
        }
    }
}
