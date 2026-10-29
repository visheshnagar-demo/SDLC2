export interface CdmFieldMapping {
  fieldId: string;
  sourceField: string;
  sourceType: string;
  targetCdmField: string;
  targetType: string;
  transformationRule: string;
  confidenceScore: number; // 0-100
  status: 'AUTO_MAPPED' | 'MANUAL_REVIEW' | 'VERIFIED' | 'REJECTED';
}

export interface TransformWorkspaceData {
  reportId: string;
  reportTitle: string;
  sourceSql: string;
  generatedTypeScriptSchema: string;
  aiConfidence: number;
  mappings: CdmFieldMapping[];
}
