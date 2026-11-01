package com.citidirect.cashstatement.engine;

import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.citidirect.cashstatement.statement.dto.TransactionRecord;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;

@Component("dhtmlReportEngine")
public class DhtmlReportEngine implements ReportExportEngine {

    private final DecimalFormat moneyFormat = new DecimalFormat("#,##0.00");

    @Override
    public byte[] export(StatementReportData reportData) throws Exception {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n");
        html.append("<title>").append(reportData.getReportTitle()).append("</title>\n");
        html.append("<style>\n");
        html.append("body { font-family: 'Overpass', Arial, sans-serif; background-color: #F6F8FA; color: #22303E; margin: 20px; }\n");
        html.append(".citi-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #002D72; padding-bottom: 10px; margin-bottom: 15px; }\n");
        html.append(".citi-logo { font-size: 24px; font-weight: bold; color: #002D72; }\n");
        html.append(".citidirect-brand { font-size: 16px; font-weight: bold; color: #002D72; }\n");
        html.append(".report-title { font-size: 18px; font-weight: bold; color: #002D72; margin-bottom: 12px; }\n");
        html.append(".card { background: #FFFFFF; border: 1px solid #D9E2EA; border-radius: 2px; padding: 15px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }\n");
        html.append(".meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 12px; margin-bottom: 15px; background: #F0F4F7; padding: 10px; border: 1px solid #C8D5E1; }\n");
        html.append(".meta-label { font-weight: bold; color: #002D72; }\n");
        html.append(".summary-band { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; font-size: 11px; text-align: center; background: #FFFFFF; border: 1px solid #002D72; margin-bottom: 15px; }\n");
        html.append(".summary-item { padding: 8px 4px; }\n");
        html.append(".summary-item.th { background: #F0F4F7; font-weight: bold; color: #002D72; border-bottom: 1px solid #C8D5E1; }\n");
        html.append("table.txn-table { width: 100%; border-collapse: collapse; font-size: 11px; }\n");
        html.append("table.txn-table th { background: #F0F4F7; color: #002D72; font-weight: bold; text-align: left; padding: 6px; border-bottom: 2px solid #002D72; }\n");
        html.append("table.txn-table td { padding: 6px; border-bottom: 1px solid #E9EEF3; }\n");
        html.append("table.txn-table tr:nth-child(even) { background-color: #FAFBFC; }\n");
        html.append(".num-cell { text-align: right; font-family: monospace; }\n");
        html.append(".footer { margin-top: 15px; font-size: 10px; color: #4F6F90; border-top: 1px solid #D9E2EA; padding-top: 10px; display: flex; justify-content: space-between; }\n");
        html.append("</style>\n</head>\n<body>\n");

        for (AccountSummaryData account : reportData.getAccounts()) {
            html.append("<div class=\"card\">\n");
            html.append("<div class=\"citi-header\">\n");
            html.append("  <div class=\"citi-logo\">citi</div>\n");
            html.append("  <div class=\"citidirect-brand\">CitiDirect BE®</div>\n");
            html.append("</div>\n");

            html.append("<div class=\"report-title\">Account Statement – Comprehensive Report</div>\n");

            html.append("<div class=\"meta-grid\">\n");
            html.append("  <div><span class=\"meta-label\">Bank Name:</span> ").append(account.getBankName()).append("</div>\n");
            html.append("  <div><span class=\"meta-label\">Account Number:</span> ").append(account.getAccountNumber()).append("</div>\n");
            html.append("  <div><span class=\"meta-label\">Customer Name:</span> ").append(account.getCustomerName()).append("</div>\n");
            html.append("  <div><span class=\"meta-label\">Currency/Type:</span> ").append(account.getCurrency()).append(" / ").append(account.getAccountType()).append("</div>\n");
            html.append("  <div><span class=\"meta-label\">Branch:</span> ").append(account.getBranchNumber()).append(" - ").append(account.getBranchName()).append("</div>\n");
            html.append("  <div><span class=\"meta-label\">Statement Date:</span> ").append(account.getStatementDate()).append("</div>\n");
            html.append("  <div><span class=\"meta-label\">SWIFT Code:</span> ").append(account.getSwiftCode()).append("</div>\n");
            html.append("  <div><span class=\"meta-label\">Running Bal:</span> ").append(account.isRunningBalanceEnabled() ? "ENABLED" : "DISABLED").append("</div>\n");
            html.append("</div>\n");

            // Summary Band
            html.append("<div class=\"summary-band\">\n");
            html.append("  <div class=\"summary-item th\">Opening Available</div>\n");
            html.append("  <div class=\"summary-item th\">Closing Available</div>\n");
            html.append("  <div class=\"summary-item th\">Credits</div>\n");
            html.append("  <div class=\"summary-item th\">Total Credit</div>\n");
            html.append("  <div class=\"summary-item th\">Debits</div>\n");
            html.append("  <div class=\"summary-item th\">Total Debit</div>\n");
            html.append("  <div class=\"summary-item th\">Net Amount</div>\n");

            html.append("  <div class=\"summary-item num-cell\">").append(moneyFormat.format(account.getOpeningAvailableBalance())).append(" ").append(account.getCurrency()).append("</div>\n");
            html.append("  <div class=\"summary-item num-cell\">").append(moneyFormat.format(account.getClosingAvailableBalance())).append(" ").append(account.getCurrency()).append("</div>\n");
            html.append("  <div class=\"summary-item num-cell\">").append(account.getCreditCount()).append("</div>\n");
            html.append("  <div class=\"summary-item num-cell\">").append(moneyFormat.format(account.getTotalCreditAmount())).append("</div>\n");
            html.append("  <div class=\"summary-item num-cell\">").append(account.getDebitCount()).append("</div>\n");
            html.append("  <div class=\"summary-item num-cell\">").append(moneyFormat.format(account.getTotalDebitAmount())).append("</div>\n");
            html.append("  <div class=\"summary-item num-cell\">").append(moneyFormat.format(account.getNetTransactionAmount())).append("</div>\n");
            html.append("</div>\n");

            // Table
            html.append("<table class=\"txn-table\">\n<thead>\n<tr>\n");
            html.append("  <th>Value Date</th>\n  <th>Cust Ref</th>\n  <th>Bank Ref</th>\n  <th>Description</th>\n  <th>Ordering / Beneficiary</th>\n  <th>Remittance Info</th>\n  <th>C/D</th>\n  <th class=\"num-cell\">Amount</th>\n");
            if (account.isRunningBalanceEnabled()) {
                html.append("  <th class=\"num-cell\">Running Balance</th>\n");
            }
            html.append("</tr>\n</thead>\n<tbody>\n");

            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            for (TransactionRecord txn : account.getTransactions()) {
                html.append("<tr>\n");
                html.append("  <td>").append(txn.getValueDate() != null ? txn.getValueDate().format(df) : "").append("</td>\n");
                html.append("  <td>").append(txn.getCustomerReference() != null ? txn.getCustomerReference() : "").append("</td>\n");
                html.append("  <td>").append(txn.getBankReference() != null ? txn.getBankReference() : "").append("</td>\n");
                html.append("  <td>").append(txn.getDescription() != null ? txn.getDescription() : "").append("</td>\n");
                String party = "C".equalsIgnoreCase(txn.getDebitCredit()) ? txn.getOrderingPartyName() : txn.getBeneficiaryName();
                html.append("  <td>").append(party != null ? party : "").append("</td>\n");
                html.append("  <td>").append(txn.getRemittanceInformation() != null ? txn.getRemittanceInformation() : "").append("</td>\n");
                html.append("  <td>").append(txn.getDebitCredit()).append("</td>\n");

                String amtDisplay = moneyFormat.format(txn.getAmount());
                if ("D".equalsIgnoreCase(txn.getDebitCredit())) {
                    amtDisplay += "-";
                }
                html.append("  <td class=\"num-cell\">").append(amtDisplay).append("</td>\n");

                if (account.isRunningBalanceEnabled()) {
                    html.append("  <td class=\"num-cell\">").append(txn.getRunningBalance() != null ? moneyFormat.format(txn.getRunningBalance()) : "").append("</td>\n");
                }
                html.append("</tr>\n");
            }

            html.append("</tbody>\n</table>\n");

            html.append("<div class=\"footer\">\n");
            html.append("  <div>= Indicates Calculated Balances | *Please note: For branches 920, 930 and 940, balances displayed are reflective of posted funds.</div>\n");
            html.append("  <div>").append(reportData.getReportName()).append(" | ").append(reportData.getReportDate()).append(" GMT</div>\n");
            html.append("</div>\n");

            html.append("</div>\n");
        }

        html.append("</body>\n</html>");
        return html.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public String getContentType() {
        return "text/html";
    }

    @Override
    public String getFileExtension() {
        return "html";
    }
}
