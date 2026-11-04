package com.citidirect.cashstatement.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportEngineService {

    public static class TransactionRecord {
        private String postingDate;
        private String valueDate;
        private String refNumber;
        private String txnCode;
        private String description;
        private String chequeNo;
        private BigDecimal debit;
        private BigDecimal credit;
        private BigDecimal balance;

        public TransactionRecord(String postingDate, String valueDate, String refNumber, String txnCode,
                                 String description, String chequeNo, BigDecimal debit, BigDecimal credit, BigDecimal balance) {
            this.postingDate = postingDate;
            this.valueDate = valueDate;
            this.refNumber = refNumber;
            this.txnCode = txnCode;
            this.description = description;
            this.chequeNo = chequeNo;
            this.debit = debit;
            this.credit = credit;
            this.balance = balance;
        }

        public String getPostingDate() { return postingDate; }
        public String getValueDate() { return valueDate; }
        public String getRefNumber() { return refNumber; }
        public String getTxnCode() { return txnCode; }
        public String getDescription() { return description; }
        public String getChequeNo() { return chequeNo; }
        public BigDecimal getDebit() { return debit; }
        public BigDecimal getCredit() { return credit; }
        public BigDecimal getBalance() { return balance; }
    }

    private List<TransactionRecord> getSampleTransactions() {
        return List.of(
            new TransactionRecord("2026-05-01", "2026-05-01", "TXN-902101", "SWIFT-IN", "Incoming Wire - Apex Semi", "-", null, new BigDecimal("1250000.00"), new BigDecimal("4500210.50")),
            new TransactionRecord("2026-05-03", "2026-05-03", "TXN-902102", "ACH-DEB", "Payroll Clearing Batch 05A", "-", new BigDecimal("350000.00"), null, new BigDecimal("4150210.50")),
            new TransactionRecord("2026-05-07", "2026-05-07", "TXN-902103", "FX-SWAP", "EUR/USD Treasury Hedge", "-", new BigDecimal("500000.00"), null, new BigDecimal("3650210.50")),
            new TransactionRecord("2026-05-12", "2026-05-12", "TXN-902104", "CHQ-DEP", "Dividend Cheque Deposit", "CHQ-4401", null, new BigDecimal("850000.00"), new BigDecimal("4500210.50")),
            new TransactionRecord("2026-05-18", "2026-05-18", "TXN-902105", "INT-CR", "End of Period Interest Credit", "-", null, new BigDecimal("14500.00"), new BigDecimal("4514710.50"))
        );
    }

    private String formatTrailingNegative(BigDecimal amount) {
        if (amount == null) return "-";
        DecimalFormat df = new DecimalFormat("#,##0.00");
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            return df.format(amount.abs()) + "-";
        }
        return df.format(amount);
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "-";
        DecimalFormat df = new DecimalFormat("#,##0.00");
        return df.format(amount);
    }

    public byte[] generatePdfReport(String reportName, String accountNumber, String currency) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);
            document.open();

            // Header Banner
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, new Color(0, 45, 98));
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

            Paragraph header = new Paragraph("CITIDIRECT ONLINE BANKING — CASH STATEMENT REPORT", titleFont);
            header.setAlignment(Element.ALIGN_LEFT);
            document.add(header);

            Paragraph meta = new Paragraph("Report: " + reportName + " | Account: " + accountNumber + " | Currency: " + currency +
                " | Generated: " + LocalDate.now().format(DateTimeFormatter.ISO_DATE), subTitleFont);
            meta.setSpacingAfter(12);
            document.add(meta);

            // KPI Summary Card Table
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15);

            addKpiCell(kpiTable, "Opening Balance", "USD 3,250,210.50");
            addKpiCell(kpiTable, "Total Credits (+)", "USD 2,114,500.00");
            addKpiCell(kpiTable, "Total Debits (-)", "USD 850,000.00-");
            addKpiCell(kpiTable, "Closing Balance", "USD 4,514,710.50");
            document.add(kpiTable);

            // 9-Column Ledger Table
            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{10, 10, 12, 10, 24, 10, 12, 12, 12});

            String[] columns = {"Posting Date", "Value Date", "Ref Number", "Txn Code", "Description", "Cheque No", "Debit (-)", "Credit (+)", "Running Balance"};
            for (String col : columns) {
                PdfPCell cell = new PdfPCell(new Phrase(col, headerFont));
                cell.setBackgroundColor(new Color(0, 45, 98));
                cell.setPadding(5);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            List<TransactionRecord> records = getSampleTransactions();
            for (TransactionRecord r : records) {
                table.addCell(createDataCell(r.getPostingDate(), dataFont, Element.ALIGN_CENTER));
                table.addCell(createDataCell(r.getValueDate(), dataFont, Element.ALIGN_CENTER));
                table.addCell(createDataCell(r.getRefNumber(), dataFont, Element.ALIGN_CENTER));
                table.addCell(createDataCell(r.getTxnCode(), dataFont, Element.ALIGN_CENTER));
                table.addCell(createDataCell(r.getDescription(), dataFont, Element.ALIGN_LEFT));
                table.addCell(createDataCell(r.getChequeNo(), dataFont, Element.ALIGN_CENTER));
                table.addCell(createDataCell(r.getDebit() != null ? formatTrailingNegative(r.getDebit()) : "-", dataFont, Element.ALIGN_RIGHT));
                table.addCell(createDataCell(r.getCredit() != null ? formatAmount(r.getCredit()) : "-", dataFont, Element.ALIGN_RIGHT));
                table.addCell(createDataCell(formatAmount(r.getBalance()), dataFont, Element.ALIGN_RIGHT));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }
    }

    private void addKpiCell(PdfPTable table, String label, String value) {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, Color.GRAY);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(0, 45, 98));

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(new Color(241, 245, 249));
        cell.setPadding(6);
        cell.setBorderColor(new Color(203, 213, 225));
        cell.addElement(new Paragraph(label, labelFont));
        cell.addElement(new Paragraph(value, valueFont));
        table.addCell(cell);
    }

    private PdfPCell createDataCell(String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(4);
        cell.setHorizontalAlignment(alignment);
        return cell;
    }

    public byte[] generateExcelReport(String reportName, String accountNumber, String currency) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Cash Statement Ledger");

            // Title Row
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("CitiDirect Online Banking — " + reportName + " (" + accountNumber + " - " + currency + ")");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] columns = {"Posting Date", "Value Date", "Ref Number", "Txn Code", "Description", "Cheque No", "Debit (-)", "Credit (+)", "Running Balance"};
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(2);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            List<TransactionRecord> records = getSampleTransactions();
            int rowIdx = 3;
            for (TransactionRecord r : records) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getPostingDate());
                row.createCell(1).setCellValue(r.getValueDate());
                row.createCell(2).setCellValue(r.getRefNumber());
                row.createCell(3).setCellValue(r.getTxnCode());
                row.createCell(4).setCellValue(r.getDescription());
                row.createCell(5).setCellValue(r.getChequeNo());
                row.createCell(6).setCellValue(r.getDebit() != null ? formatTrailingNegative(r.getDebit()) : "-");
                row.createCell(7).setCellValue(r.getCredit() != null ? formatAmount(r.getCredit()) : "-");
                row.createCell(8).setCellValue(formatAmount(r.getBalance()));
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }

    public byte[] generateCsvReport(String reportName, String accountNumber, String currency) {
        StringWriter writer = new StringWriter();
        writer.append("# CitiDirect Online Banking - ").append(reportName).append("\n");
        writer.append("# Account: ").append(accountNumber).append(" | Currency: ").append(currency).append("\n");
        writer.append("Posting Date,Value Date,Ref Number,Txn Code,Description,Cheque No,Debit,Credit,Running Balance\n");

        List<TransactionRecord> records = getSampleTransactions();
        for (TransactionRecord r : records) {
            writer.append(r.getPostingDate()).append(",")
                  .append(r.getValueDate()).append(",")
                  .append(r.getRefNumber()).append(",")
                  .append(r.getTxnCode()).append(",")
                  .append("\"").append(r.getDescription()).append("\",")
                  .append(r.getChequeNo()).append(",")
                  .append(r.getDebit() != null ? formatTrailingNegative(r.getDebit()) : "").append(",")
                  .append(r.getCredit() != null ? formatAmount(r.getCredit()) : "").append(",")
                  .append(formatAmount(r.getBalance())).append("\n");
        }

        return writer.toString().getBytes();
    }
}
