package com.citidirect.cashstatement.engine;

import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.citidirect.cashstatement.statement.dto.TransactionRecord;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;

@Component("rtfReportEngine")
public class RtfReportEngine implements ReportExportEngine {

    private final DecimalFormat moneyFormat = new DecimalFormat("#,##0.00");

    @Override
    public byte[] export(StatementReportData reportData) throws Exception {
        StringBuilder rtf = new StringBuilder();
        rtf.append("{\\rtf1\\ansi\\deff0\n");
        rtf.append("{\\fonttbl{\\f0\\fswiss\\fcharset0 Helvetica;}{\\f1\\fmodern\\fcharset0 Courier;}}\n");
        rtf.append("{\\colortbl ;\\red0\\green45\\blue114;\\red34\\green48\\blue62;\\red182\\green0\\blue0;\\red240\\green244\\blue247;}\n");

        rtf.append("\\fs28\\b\\cf1 CITIBANK - CitiDirect BE(R)\\b0\\fs20\\par\n");
        rtf.append("\\fs24\\b\\cf1 Account Statement - Comprehensive Report\\b0\\fs20\\par\n");
        rtf.append("Report Date: ").append(reportData.getReportDate()).append(" GMT\\par\\par\n");

        for (AccountSummaryData account : reportData.getAccounts()) {
            rtf.append("--------------------------------------------------------------------------------------------------------------------\\par\n");
            rtf.append("\\b Bank Name:\\b0  ").append(account.getBankName())
               .append("   \\b Account Number:\\b0  ").append(account.getAccountNumber())
               .append("   \\b Currency:\\b0  ").append(account.getCurrency())
               .append("   \\b Statement Date:\\b0  ").append(account.getStatementDate()).append("\\par\n");

            rtf.append("\\b Customer Name:\\b0  ").append(account.getCustomerName())
               .append("   \\b Branch:\\b0  ").append(account.getBranchNumber()).append(" - ").append(account.getBranchName())
               .append("   \\b SWIFT:\\b0  ").append(account.getSwiftCode()).append("\\par\n");

            rtf.append("--------------------------------------------------------------------------------------------------------------------\\par\n");
            rtf.append("\\b Summary Balance Band:\\b0\\par\n");
            rtf.append("Opening Avail: ").append(moneyFormat.format(account.getOpeningAvailableBalance())).append(" ").append(account.getCurrency())
               .append(" | Intraday Bal: ").append(moneyFormat.format(account.getIntradayBalance() != null ? account.getIntradayBalance() : account.getClosingAvailableBalance())).append(" ").append(account.getCurrency())
               .append(" | Closing Avail: ").append(moneyFormat.format(account.getClosingAvailableBalance())).append(" ").append(account.getCurrency())
               .append(" | Credits: ").append(account.getCreditCount()).append(" (").append(moneyFormat.format(account.getTotalCreditAmount())).append(")")
               .append(" | Debits: ").append(account.getDebitCount()).append(" (").append(moneyFormat.format(account.getTotalDebitAmount())).append(")")
               .append(" | Net: ").append(moneyFormat.format(account.getNetTransactionAmount())).append("\\par\\par\n");

            rtf.append("\\b Transactions:\\b0\\par\n");
            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            for (TransactionRecord txn : account.getTransactions()) {
                String valDate = txn.getValueDate() != null ? txn.getValueDate().format(df) : "";
                String desc = txn.getDescription() != null ? txn.getDescription() : "";
                String party = "C".equalsIgnoreCase(txn.getDebitCredit()) ? txn.getOrderingPartyName() : txn.getBeneficiaryName();
                String amt = moneyFormat.format(txn.getAmount()) + ("D".equalsIgnoreCase(txn.getDebitCredit()) ? "-" : " ");
                String runBal = txn.getRunningBalance() != null ? moneyFormat.format(txn.getRunningBalance()) : "";

                rtf.append(valDate).append(" | ")
                   .append(txn.getBankReference()).append(" | ")
                   .append(desc).append(" | ")
                   .append(party != null ? party : "").append(" | ")
                   .append(txn.getDebitCredit()).append(" | ")
                   .append(amt);

                if (account.isRunningBalanceEnabled()) {
                    rtf.append(" | Running: ").append(runBal);
                }
                rtf.append("\\par\n");
            }

            rtf.append("\\par\n");
        }

        rtf.append("\\fs16\\cf2 = Indicates Calculated Balances   |   *Please note: For branches 920, 930 and 940, balances displayed are reflective of posted funds.\\par\n");
        rtf.append("}");

        return rtf.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String getContentType() {
        return "application/rtf";
    }

    @Override
    public String getFileExtension() {
        return "rtf";
    }
}
