package com.citidirect.cashstatement.engine;

import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.citidirect.cashstatement.statement.dto.TransactionRecord;
import com.opencsv.CSVWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;

@Component("csvReportEngine")
public class CsvReportEngine implements ReportExportEngine {

    private final DecimalFormat moneyFormat = new DecimalFormat("0.00");

    @Override
    public byte[] export(StatementReportData reportData) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        char separator = ',';
        if (reportData.getCriteria() != null && reportData.getCriteria().getCsvSeparator() != null) {
            String sepStr = reportData.getCriteria().getCsvSeparator();
            if (sepStr.equals(";") || sepStr.equals("\t") || sepStr.equals("|")) {
                separator = sepStr.charAt(0);
            }
        }

        try (OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw, separator, CSVWriter.DEFAULT_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, CSVWriter.DEFAULT_LINE_END)) {

            // Title Rows
            writer.writeNext(new String[]{"CITIDIRECT"});
            writer.writeNext(new String[]{"Account Statement – Comprehensive Report"});
            writer.writeNext(new String[]{"Report Date " + reportData.getReportDate()});
            writer.writeNext(new String[]{""}); // Blank

            // 64 Header Columns
            writer.writeNext(ExcelReportEngine.COLUMNS_64);

            DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            for (AccountSummaryData account : reportData.getAccounts()) {
                for (TransactionRecord txn : account.getTransactions()) {
                    String[] row = new String[64];
                    row[0] = reportData.getReportName();
                    row[1] = account.getCustomerNumber();
                    row[2] = account.getCustomerName();
                    row[3] = account.getBranchNumber();
                    row[4] = account.getBranchName();
                    row[5] = account.getSwiftCode();
                    row[6] = account.getAccountNumber();
                    row[7] = account.getAccountName();
                    row[8] = account.getCurrency();
                    row[9] = account.getAccountType();
                    row[10] = account.getStatementDate();
                    row[11] = txn.getValueDate() != null ? txn.getValueDate().format(dateFmt) : "";
                    row[12] = txn.getStatementDate() != null ? txn.getStatementDate().format(dateFmt) : "";
                    row[13] = txn.getCustomerReference() != null ? txn.getCustomerReference() : "";
                    row[14] = txn.getBankReference() != null ? txn.getBankReference() : "";
                    row[15] = txn.getDescription() != null ? txn.getDescription() : "";
                    row[16] = txn.getDebitCredit();
                    row[17] = moneyFormat.format(txn.getAmount());

                    double signedVal = "D".equalsIgnoreCase(txn.getDebitCredit()) ? -txn.getAmount().doubleValue() : txn.getAmount().doubleValue();
                    row[18] = moneyFormat.format(signedVal);
                    row[19] = txn.getRunningBalance() != null ? moneyFormat.format(txn.getRunningBalance()) : "0.00";

                    row[20] = moneyFormat.format(account.getOpeningAvailableBalance());
                    row[21] = moneyFormat.format(account.getClosingAvailableBalance());
                    row[22] = String.valueOf(account.getCreditCount());
                    row[23] = moneyFormat.format(account.getTotalCreditAmount());
                    row[24] = String.valueOf(account.getDebitCount());
                    row[25] = moneyFormat.format(account.getTotalDebitAmount());
                    row[26] = moneyFormat.format(account.getNetTransactionAmount());

                    row[27] = txn.getOrderingPartyAccount() != null ? txn.getOrderingPartyAccount() : "";
                    row[28] = txn.getOrderingPartyName() != null ? txn.getOrderingPartyName() : "";
                    row[29] = txn.getOrderingPartyAccount() != null ? txn.getOrderingPartyAccount() : "";
                    row[30] = txn.getOrderingPartyName() != null ? txn.getOrderingPartyName() : "";
                    row[31] = txn.getOrderingPartyAddress1() != null ? txn.getOrderingPartyAddress1() : "";
                    row[32] = txn.getOrderingPartyAddress2() != null ? txn.getOrderingPartyAddress2() : "";
                    row[33] = "";
                    row[34] = "";
                    row[35] = "GBR";
                    row[36] = txn.getOrderingBank() != null ? txn.getOrderingBank() : "";
                    row[37] = "CITIGB2L";
                    row[38] = "CLR-6001";

                    row[39] = txn.getBeneficiaryAccount() != null ? txn.getBeneficiaryAccount() : "";
                    row[40] = txn.getBeneficiaryName() != null ? txn.getBeneficiaryName() : "";
                    row[41] = "";
                    row[42] = "";
                    row[43] = "";
                    row[44] = "GBR";
                    row[45] = txn.getBeneficiaryBank() != null ? txn.getBeneficiaryBank() : "";
                    row[46] = "CITIGB2L";
                    row[47] = "CLR-6002";

                    row[48] = txn.getRemittanceInformation() != null ? txn.getRemittanceInformation() : "";
                    row[49] = "";
                    row[50] = "";
                    row[51] = "";

                    row[52] = txn.getTransactionCode() != null ? txn.getTransactionCode() : "CITI001";
                    row[53] = "MT103";
                    row[54] = txn.getProductType() != null ? txn.getProductType() : "WIRE";
                    row[55] = txn.getBatchNumber() != null ? txn.getBatchNumber() : "BATCH-001";
                    row[56] = "CITIDIRECT_CORE";
                    row[57] = "HIGH";
                    row[58] = "1.0000";
                    row[59] = "USD";
                    row[60] = moneyFormat.format(txn.getAmount());
                    row[61] = "";
                    row[62] = txn.getValueDate() + " 12:00:00";
                    row[63] = "POSTED_RECONCILED";

                    writer.writeNext(row);
                }
            }
        }

        return baos.toByteArray();
    }

    @Override
    public String getContentType() {
        return "text/csv";
    }

    @Override
    public String getFileExtension() {
        return "csv";
    }
}
