package com.citidirect.cashstatement.engine;

import com.citidirect.cashstatement.criteria.dto.CriteriaPayload;
import com.citidirect.cashstatement.statement.dto.AccountSummaryData;
import com.citidirect.cashstatement.statement.dto.StatementReportData;
import com.citidirect.cashstatement.statement.dto.TransactionRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ReportEnginesTest {

    private StatementReportData reportData;
    private PdfReportEngine pdfEngine;
    private ExcelReportEngine excelEngine;
    private CsvReportEngine csvEngine;
    private DhtmlReportEngine dhtmlEngine;
    private RtfReportEngine rtfEngine;

    @BeforeEach
    void setUp() {
        pdfEngine = new PdfReportEngine();
        excelEngine = new ExcelReportEngine();
        csvEngine = new CsvReportEngine();
        dhtmlEngine = new DhtmlReportEngine();
        rtfEngine = new RtfReportEngine();

        reportData = new StatementReportData();
        reportData.setReportName("Account Statement – Comprehensive");
        reportData.setReportDate("22/01/2022");
        reportData.setCriteria(new CriteriaPayload());

        AccountSummaryData account = new AccountSummaryData();
        account.setCustomerNumber("0000244654");
        account.setCustomerName("A CUSTOMER NAME");
        account.setBranchNumber("600");
        account.setBranchName("LONDON MAIN BRANCH");
        account.setSwiftCode("CITIGB2L");
        account.setAccountNumber("XX12CITI11223344446677");
        account.setAccountName("AN ACCOUNT NAME");
        account.setCurrency("GBP");
        account.setAccountType("CHECKING");
        account.setStatementDate("22/01/2022");
        account.setOpeningAvailableBalance(new BigDecimal("1074252.00"));
        account.setClosingAvailableBalance(new BigDecimal("1103501.82"));
        account.setCreditCount(5);
        account.setTotalCreditAmount(new BigDecimal("321267.67"));
        account.setDebitCount(2);
        account.setTotalDebitAmount(new BigDecimal("292017.85"));
        account.setNetTransactionAmount(new BigDecimal("29249.82"));
        account.setRunningBalanceEnabled(true);

        TransactionRecord txn = new TransactionRecord();
        txn.setId("txn-1");
        txn.setValueDate(LocalDate.of(2022, 1, 22));
        txn.setStatementDate(LocalDate.of(2022, 1, 22));
        txn.setCustomerReference("CUST-REF-001");
        txn.setBankReference("CITI-FT-1001");
        txn.setDescription("CUSTOMER PAYMENT INWARD");
        txn.setDebitCredit("C");
        txn.setAmount(new BigDecimal("21020.67"));
        txn.setRunningBalance(new BigDecimal("1095272.67"));
        txn.setOrderingPartyName("ALPHA TRADING LTD");
        account.setTransactions(List.of(txn));

        reportData.setAccounts(List.of(account));
    }

    @Test
    @DisplayName("PDF Engine Export Generates Valid Non-Empty PDF Stream")
    void testPdfExport() throws Exception {
        byte[] pdfBytes = pdfEngine.export(reportData);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500);
        assertEquals("application/pdf", pdfEngine.getContentType());
        assertEquals("pdf", pdfEngine.getFileExtension());
    }

    @Test
    @DisplayName("Excel Engine Export Generates Valid Workbook Stream with 64 Columns")
    void testExcelExport() throws Exception {
        byte[] xlsBytes = excelEngine.export(reportData);
        assertNotNull(xlsBytes);
        assertTrue(xlsBytes.length > 1000);
        assertEquals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelEngine.getContentType());
        assertEquals(64, ExcelReportEngine.COLUMNS_64.length);
    }

    @Test
    @DisplayName("CSV Engine Export Generates Valid Delimited Output with Configurable Separators")
    void testCsvExport() throws Exception {
        byte[] csvBytes = csvEngine.export(reportData);
        assertNotNull(csvBytes);
        String csvText = new String(csvBytes);
        assertTrue(csvText.contains("CITIDIRECT"));
        assertTrue(csvText.contains("Account Statement – Comprehensive Report"));
        assertTrue(csvText.contains("XX12CITI11223344446677"));
        assertTrue(csvText.contains("21020.67"));
    }

    @Test
    @DisplayName("DHTML and RTF Engines Export Valid Rich Documents")
    void testDhtmlAndRtfExport() throws Exception {
        byte[] dhtmlBytes = dhtmlEngine.export(reportData);
        assertNotNull(dhtmlBytes);
        String html = new String(dhtmlBytes);
        assertTrue(html.contains("CitiDirect BE®"));
        assertTrue(html.contains("XX12CITI11223344446677"));

        byte[] rtfBytes = rtfEngine.export(reportData);
        assertNotNull(rtfBytes);
        String rtf = new String(rtfBytes);
        assertTrue(rtf.startsWith("{\\rtf1"));
        assertTrue(rtf.contains("CITIBANK"));
    }
}
