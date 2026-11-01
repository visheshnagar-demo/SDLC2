package com.citidirect.cashstatement.engine;

import com.citidirect.cashstatement.statement.dto.StatementReportData;

public interface ReportExportEngine {

    byte[] export(StatementReportData reportData) throws Exception;

    String getContentType();

    String getFileExtension();
}
