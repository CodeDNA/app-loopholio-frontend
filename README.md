# LoopHolio - Terms of Service Analyzer - Implementation Guide

# Current Veresion

### v1.1.2

## Overview

This is a dedicated UI for analyzing Terms of Service documents. Users can upload PDFs, DOCX, images-png/jpeg/jpg, or paste text, and the backend AI agent analyzes the content to identify key risks, clauses, and compliance issues.

## Main Components

### 1. UploadArea (`components/upload-area.tsx`)

- Handles file uploads (PDF, PNG, JPG) via drag-and-drop or file picker
- Allows users to paste text directly
- Validates file types
- Shows selected file with option to remove and retry with text
- Disables submit button until content is provided

### 2. AnalysisDisplay (`components/analysis-display.tsx`)

- Displays analysis results in a structured format
- Shows risk summary (count of High/Medium/Low risks)
- Renders individual risk cards with:
  - Risk Level & Confidence
  - Category
  - Reason
  - Why This Matters
  - Recommendation
  - Exact Clause from Document - part of a paragraph/section
  - Source Text - complete paragraph/section
- Risk cards use color coding: Red (High), Yellow (Medium), Green (Low)

### 3. HistorySidebar(also has a mobile friendly drawer version with burger menu) (`components/history-sidebar.tsx`)

- Left sidebar (hidden on mobile, visible on desktop)
- Shows list of past analyses
- Each item displays: filename(if a file was uploaded) or pasted text, upload date/time, total number of high, medium and low risks found in the analysis
- Clicking an item loads that analysis
- "Delete All" button to deletes all history items
- Persists history to localStorage (will move to a database soon)

## Data Types (`types/analysis.ts`)

```typescript
interface RiskLevel {
  chunk_id: string;
  clause_id: string;
  level: "High" | "Medium" | "Low";
  confidence: number;
  category: string;
  reason: string;
  whyMatters: string;
  recommendation: string;
  exactClause: string; // exact quote from the from the section in question
  source_text: string; // exact text/section in question
  section_title: string;
}

export interface Analysis {
  id: string;
  fileName: string;
  title?: string; // Title from backend for pasted text, or derived from filename for files
  uploadedAt: Date;
  documentPreview: string; // First 100 chars of the document
  riskLevels: RiskLevel[] | [];
  overallRiskLevel: "High" | "Medium" | "Low";
  isStreaming: boolean;
  highRiskCount?: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
  error?: any; // Details when backend returns an error
}

export interface HistoryItem {
  id: string;
  fileName: string;
  uploadedAt: Date;
  overallRiskLevel: "High" | "Medium" | "Low";
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}
```

## State Management

Uses React hooks (useState, useEffect, useRef) with localStorage for persistence:

- `analyses`: All historical analyses
- `currentAnalysis`: Currently displayed analysis
- `isLoading`: Loading state during API call
- `showFileUpload`: Toggle for file upload visibility on mobile

## Streaming Implementation

The frontend expects server-sent events (SSE) format from the backend:

```
data: {"type": "overall_risk", "content": "High"} -
data: {"type": "risk_item", "content": {...}}
data: {"type": "risk_item", "content": {...}}
data: {"type": "done"}
```

Each message is prefixed with `data: ` and contains JSON. The frontend parses these and updates the UI in real-time.

## API Endpoint (`app/api/analyze-tos/route.ts`)

**Expected Request:**

```
POST /api/analyze-tos
Content-Type: multipart/form-data

{
  file: File (optional - PDF or image)
  text: string (optional - pasted text)
}
```

**Expected Response (Streaming):**

```
Content-Type: text/event-stream

data: {"type": "overall_risk", "content": "High"}

data: {"type": "risk_item", "content": {
  "level": "High",
  "confidence": 95,
  "category": "Mandatory Arbitration",
  "reason": "...",
  "whyMatters": "...",
  "recommendation": "...",
  "exactClause": "..."
}}

data: {"type": "done"}
```

## Connecting Your Backend

To replace the sample API with your actual backend:

## localStorage Key

History is persisted using the key: `tos_analysis_history`
