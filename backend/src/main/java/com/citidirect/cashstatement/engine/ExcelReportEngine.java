package com.citidirect.cashstatement.engine;

import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.citidirect.cashstatement.statement.dto.TransactionRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Component("excelReportEngine")
public class ExcelReportEngine implements ReportExportEngine {

    public static final String[] COLUMNS_64 = {
        "Report Name", "Customer Number", "Customer Name", "Branch Number", "Branch Name",
        "SWIFT Code", "Account Number", "Account Name", "Account Currency", "Account Type",
        "Statement Date", "Value Date", "Entry Date", "Customer Reference", "Bank Reference",
        "Transaction Description", "Debit Credit Indicator", "Transaction Amount", "Signed Amount", "Running Balance",
        "Opening Available Balance", "Current Closing Available Balance", "Total Credit Count", "Total Credit Amount", "Total Debit Count",
        "Total Debit Amount", "Net Transaction Amount", "Ultimate Ordering Party Account", "Ultimate Ordering Party Name", "Ordering Party Account",
        "Ordering Party Name", "Ordering Party Address Line 1", "Ordering Party Address Line 2", "Ordering Party Address Line 3", "Ordering Party Address Line 4",
        "Ordering Party Country", "Ordering Bank Name", "Ordering Bank BIC", "Ordering Bank Clearing ID", "Beneficiary Party Account",
        "Beneficiary Party Name", "Beneficiary Party Address Line 1", "Beneficiary Party Address Line 2", "Beneficiary Party Address Line 3", "Beneficiary Party Country",
        "Beneficiary Bank Name", "Beneficiary Bank BIC", "Beneficiary Bank Clearing ID", "Remittance Information Line 1", "Remittance Information Line 2",
        "Remittance Information Line 3", "Remittance Information Line 4", "Citi Transaction Code", "SWIFT Message Type", "Product Type",
        "Batch Track Number", "Clearing Channel", "Payment Priority", "FX Exchange Rate", "Base Currency Code",
        "Base Currency Equivalent Amount", "Cheque Number", "Value Timestamp GMT", "Reconciliation Status Flag"
    };

    @Override
    public byte[] export(StatementReportData reportData) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        SXSSFWorkbook workbook = new SXSSFWorkbook(100);
        SXSSFSheet sheet = workbook.createSheet("Account Statement");

        // Styling
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());

        CellStyle titleStyle = workbook.createCellStyle();
        titleStyle.setFont(titleFont);

        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);

        CellStyle currencyStyle = workbook.createCellStyle();
        DataFormat df = workbook.createDataFormat();
        currencyStyle.setDataFormat(df.getFormat("#,##0.00;(#,##0.00)"));

        int rowIdx = 0;

        // Row 0: "CITIDIRECT"
        Row r0 = sheet.createRow(rowIdx++);
        Cell c0 = r0.createCell(0);
        c0.setCellValue("CITIDIRECT");
        c0.setCellStyle(titleStyle);

        // Row 1: "Account Statement – Comprehensive Report"
        Row r1 = sheet.createRow(rowIdx++);
        Cell c1 = r1.createCell(0);
        c1.setCellValue("Account Statement – Comprehensive Report");
        c1.setCellStyle(titleStyle);

        // Row 2: "Report Date <dd/mm/yyyy>"
        Row r2 = sheet.createRow(rowIdx++);
        Cell c2 = r2.createCell(0);
        c2.setCellValue("Report Date " + reportData.getReportDate());

        rowIdx++; // Blank row

        // Header Row with 64 Columns
        Row headerRow = sheet.createRow(rowIdx++);
        for (int i = 0; i < COLUMNS_64.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(COLUMNS_64[i]);
            cell.setCellStyle(headerStyle);
        }

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (AccountSummaryData account : reportData.getAccounts()) {
            for (TransactionRecord txn : account.getTransactions()) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(reportData.getReportName());
                row.createCell(1).setCellValue(account.getCustomerNumber());
                row.createCell(2).setCellValue(account.getCustomerName());
                row.createCell(3).setCellValue(account.getBranchNumber());
                row.createCell(4).setCellValue(account.getBranchName());
                row.createCell(5).setCellValue(account.getSwiftCode());
                row.createCell(6).setCellValue(account.getAccountNumber());
                row.createCell(7).setCellValue(account.getAccountName());
                row.createCell(8).setCellValue(account.getCurrency());
                row.createCell(9).setCellValue(account.getAccountType());
                row.createCell(10).setCellValue(account.getStatementDate());
                row.createCell(11).setCellValue(txn.getValueDate() != null ? txn.getValueDate().format(dateFmt) : "");
                row.createCell(12).setCellValue(txn.getStatementDate() != null ? txn.getStatementDate().format(dateFmt) : "");
                row.createCell(13).setCellValue(txn.getCustomerReference() != null ? txn.getCustomerReference() : "");
                row.createCell(14).setCellValue(txn.getBankReference() != null ? txn.getBankReference() : "");
                row.createCell(15).setCellValue(txn.getDescription() != null ? txn.getDescription() : "");
                row.createCell(16).setCellValue(txn.getDebitCredit());

                // 17: Amount
                Cell amtCell = row.createCell(17);
                amtCell.setCellValue(txn.getAmount().doubleValue());
                amtCell.setCellStyle(currencyStyle);

                // 18: Signed Amount
                Cell signedAmtCell = row.createCell(18);
                double signedVal = "D".equalsIgnoreCase(txn.getDebitCredit()) ? -txn.getAmount().doubleValue() : txn.getAmount().doubleValue();
                signedAmtCell.setCellValue(signedVal);
                signedAmtCell.setCellStyle(currencyStyle);

                // 19: Running Balance
                Cell runBalCell = row.createCell(19);
                if (txn.getRunningBalance() != null) {
                    runBalCell.setCellValue(txn.getRunningBalance().doubleValue());
                } else {
                    runBalCell.setCellValue(0.0);
                }
                runBalCell.setCellStyle(currencyStyle);

                // Balances & Summary
                Cell openBalCell = row.createCell(20);
                openBalCell.setCellValue(account.getOpeningAvailableBalance().doubleValue());
                openBalCell.setCellStyle(currencyStyle);

                Cell closeBalCell = row.createCell(21);
                closeBalCell.setCellValue(account.getClosingAvailableBalance().doubleValue());
                closeBalCell.setCellStyle(currencyStyle);

                row.createCell(22).setCellValue(account.getCreditCount());
                Cell totCreditCell = row.createCell(23);
                totCreditCell.setCellValue(account.getTotalCreditAmount().doubleValue());
                totCreditCell.setCellStyle(currencyStyle);

                row.createCell(24).setCellValue(account.getDebitCount());
                Cell totDebitCell = row.createCell(25);
                totDebitCell.setCellValue(account.getTotalDebitAmount().doubleValue());
                totDebitCell.setCellStyle(currencyStyle);

                Cell netTxnCell = row.createCell(26);
                netTxnCell.setCellValue(account.getNetTransactionAmount().doubleValue());
                netTxnCell.setCellStyle(currencyStyle);

                // Parties & Ordering
                row.createCell(27).setCellValue(txn.getOrderingPartyAccount() != null ? txn.getOrderingPartyAccount() : "");
                row.createCell(28).setCellValue(txn.getOrderingPartyName() != null ? txn.getOrderingPartyName() : "");
                row.createCell(29).setCellValue(txn.getOrderingPartyAccount() != null ? txn.getOrderingPartyAccount() : "");
                row.createCell(30).setCellValue(txn.getOrderingPartyName() != null ? txn.getOrderingPartyName() : "");
                row.createCell(31).setCellValue(txn.getOrderingPartyAddress1() != null ? txn.getOrderingPartyAddress1() : "");
                row.createCell(32).setCellValue(txn.getOrderingPartyAddress2() != null ? txn.getOrderingPartyAddress2() : "");
                row.createCell(33).setCellValue("");
                row.createCell(34).setCellValue("");
                row.createCell(35).setCellValue("GBR");
                row.createCell(36).setCellValue(txn.getOrderingBank() != null ? txn.getOrderingBank() : "");
                row.createCell(37).setCellValue("CITIGB2L");
                row.createCell(38).setCellValue("CLR-6001");

                // Beneficiary
                row.createCell(39).setCellValue(txn.getBeneficiaryAccount() != null ? txn.getBeneficiaryAccount() : "");
                row.createCell(40).setCellValue(txn.getBeneficiaryName() != null ? txn.getBeneficiaryName() : "");
                row.createCell(41).setCellValue("");
                row.createCell(42).setCellValue("");
                row.createCell(43).setCellValue("");
                row.createCell(44).setCellValue("GBR");
                row.createCell(45).setCellValue(txn.getBeneficiaryBank() != null ? txn.getBeneficiaryBank() : "");
                row.createCell(46).setCellValue("CITIGB2L");
                row.createCell(47).setCellValue("CLR-6002");

                // Remittance
                row.createCell(48).setCellValue(txn.getRemittanceInformation() != null ? txn.getRemittanceInformation() : "");
                row.createCell(49).setCellValue("");
                row.createCell(50).setCellValue("");
                row.createCell(51).setCellValue("");

                // Codes & Classification
                row.createCell(52).setCellValue(txn.getTransactionCode() != null ? txn.getTransactionCode() : "CITI001");
                row.createCell(53).setCellValue("MT103");
                row.createCell(54).setCellValue(txn.getProductType() != null ? txn.getProductType() : "WIRE");
                row.createCell(55).setCellValue(txn.getBatchNumber() != null ? txn.getBatchNumber() : "BATCH-001");
                row.createCell(56).setCellValue("CITIDIRECT_CORE");
                row.createCell(57).setCellValue("HIGH");
                row.createCell(58).setCellValue(1.0);
                row.createCell(59).setCellValue("USD");
                row.createCell(60).setCellValue(txn.getAmount().doubleValue());
                row.createCell(61).setCellValue("");
                row.createCell(62).setCellValue(txn.getValueDate() + " 12:00:00");
                row.createCell(63).setCellValue("POSTED_RECONCILED");
            }
        }

        workbook.write(baos);
        workbook.dispose();
        workbook.close();

        return baos.toByteArray();
    }

    @Override
    public String getContentType() {
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    @Override
    public String getFileExtension() {
        return "xlsx";
    }
}
