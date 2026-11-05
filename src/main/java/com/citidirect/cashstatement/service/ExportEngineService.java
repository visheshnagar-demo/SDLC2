package com.citidirect.cashstatement.service;

import com.citidirect.cashstatement.entity.GeneratedReport;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportEngineService {

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##0.00");

    public byte[] generatePdfExport(GeneratedReport report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);
            document.open();

            // Colors
            Color primaryNavy = new Color(0, 45, 98);
            Color secondaryBlue = new Color(0, 112, 186);
            Color headerBg = new Color(241, 245, 249);
            Color zebraLight = new Color(248, 250, 252);

            // Fonts
            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, primaryNavy);
            com.lowagie.text.Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
            com.lowagie.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
            com.lowagie.text.Font kpiTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryNavy);
            com.lowagie.text.Font kpiValueFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);

            // Title Header
            Paragraph title = new Paragraph("CITIBANK N.A. — CASH STATEMENT REPORT", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);

            Paragraph meta = new Paragraph(
                    "Report Name: " + report.getReportName() + " | Report ID: " + report.getId() + "\n" +
                    "Accounts: " + String.join(", ", report.getAccountNumbers()) + " | Branch: " + (report.getBranchCode() != null ? report.getBranchCode() : "N/A") + " | Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " UTC\n\n",
                    subtitleFont
            );
            document.add(meta);

            // KPI Summary Card Table
            PdfPTable kpiTable = new PdfPTable(4);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15f);

            addKpiCell(kpiTable, "Opening Balance", "USD 45,000,000.00", kpiTitleFont, kpiValueFont, headerBg);
            addKpiCell(kpiTable, "Total Debits (-)", "3,420,150.00-", kpiTitleFont, kpiValueFont, headerBg);
            addKpiCell(kpiTable, "Total Credits (+)", "USD 6,940,450.50", kpiTitleFont, kpiValueFont, headerBg);
            addKpiCell(kpiTable, "Closing Balance", "USD 48,520,300.50", kpiTitleFont, kpiValueFont, headerBg);
            document.add(kpiTable);

            // 9-Column Transaction Ledger Table
            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.2f, 2.2f, 3.0f, 2.0f, 5.0f, 2.0f, 2.8f, 2.8f, 3.2f});

            String[] headers = {
                    "Posting Date", "Value Date", "Reference No.", "Txn Code",
                    "Description", "Cheque No.", "Debit (-)", "Credit (+)", "Running Balance"
            };

            for (String headerText : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(headerText, headerFont));
                cell.setBackgroundColor(primaryNavy);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6f);
                table.addCell(cell);
            }

            // Sample rows with trailing negative formatting
            String[][] sampleData = {
                    {"2026-05-18", "2026-05-18", "TXN-99401201", "SWIFT_OUT", "Supplier Wire Settlement - APAC Global", "-", "1,250,000.00-", "-", "43,750,000.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401202", "ACH_CREDIT", "Customer Invoice Inbound Coll #8819", "-", "-", "2,450,000.00", "46,200,000.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401203", "ZBA_SWEEP", "Automated Target Zero Balance Sweep", "-", "2,170,150.00-", "-", "44,029,850.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401204", "FED_WIRE_IN", "Treasury Inter-Company Liquidity Transfer", "-", "-", "4,490,450.50", "48,520,300.50"}
            };

            boolean alt = false;
            for (String[] row : sampleData) {
                Color bg = alt ? zebraLight : Color.WHITE;
                for (int i = 0; i < row.length; i++) {
                    PdfPCell cell = new PdfPCell(new Phrase(row[i], dataFont));
                    cell.setBackgroundColor(bg);
                    cell.setPadding(5f);
                    if (i >= 6) {
                        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    } else {
                        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
                    }
                    table.addCell(cell);
                }
                alt = !alt;
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF export: " + e.getMessage(), e);
        }
    }

    private void addKpiCell(PdfPTable table, String title, String value, com.lowagie.text.Font titleFont, com.lowagie.text.Font valueFont, Color bg) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(8f);
        cell.addElement(new Paragraph(title, titleFont));
        cell.addElement(new Paragraph(value, valueFont));
        table.addCell(cell);
    }

    public byte[] generateExcelExport(GeneratedReport report) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Cash Statement");

            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Title Row
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Citibank N.A. — Cash Statement Report: " + report.getReportName());

            // Header Row
            String[] headers = {
                    "Posting Date", "Value Date", "Reference Number", "Transaction Code",
                    "Description", "Cheque No.", "Debit (-)", "Credit (+)", "Running Balance"
            };

            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(2);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            String[][] sampleData = {
                    {"2026-05-18", "2026-05-18", "TXN-99401201", "SWIFT_OUT", "Supplier Wire Settlement - APAC Global", "-", "1250000.00-", "-", "43750000.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401202", "ACH_CREDIT", "Customer Invoice Inbound Coll #8819", "-", "-", "2450000.00", "46200000.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401203", "ZBA_SWEEP", "Automated Target Zero Balance Sweep", "-", "2170150.00-", "-", "44029850.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401204", "FED_WIRE_IN", "Treasury Inter-Company Liquidity Transfer", "-", "-", "4490450.50", "48520300.50"}
            };

            int rowIdx = 3;
            for (String[] rowData : sampleData) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                for (int i = 0; i < rowData.length; i++) {
                    row.createCell(i).setCellValue(rowData[i]);
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel export: " + e.getMessage(), e);
        }
    }

    public byte[] generateCsvExport(GeneratedReport report) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            String[] headers = {
                    "Posting Date", "Value Date", "Reference Number", "Transaction Code",
                    "Description", "Cheque No.", "Debit (-)", "Credit (+)", "Running Balance"
            };
            writer.writeNext(headers);

            String[][] sampleData = {
                    {"2026-05-18", "2026-05-18", "TXN-99401201", "SWIFT_OUT", "Supplier Wire Settlement - APAC Global", "-", "1250000.00-", "-", "43750000.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401202", "ACH_CREDIT", "Customer Invoice Inbound Coll #8819", "-", "-", "2450000.00", "46200000.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401203", "ZBA_SWEEP", "Automated Target Zero Balance Sweep", "-", "2170150.00-", "-", "44029850.00"},
                    {"2026-05-18", "2026-05-18", "TXN-99401204", "FED_WIRE_IN", "Treasury Inter-Company Liquidity Transfer", "-", "-", "4490450.50", "48520300.50"}
            };

            for (String[] row : sampleData) {
                writer.writeNext(row);
            }

            writer.flush();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate CSV export: " + e.getMessage(), e);
        }
    }
}
