# Reports Design

## Reports

- Student Report
- Attendance Report
- Fee Collection Report
- Expense Report
- Income Report
- Profit & Loss Report
- Exam Performance Report

## Current MVP Export

CSV endpoints are implemented at `/api/v1/reports/{type}.csv` for high-value operational exports. These are easy to open in Excel or Google Sheets and are reliable for small tuition centers.

## PDF and Excel Extension

Recommended production libraries:

- PDF: OpenPDF, Flying Saucer, or JasperReports for formatted receipts and progress reports.
- Excel: Apache POI for `.xlsx` exports.

## Profit and Loss Formula

```text
Net Profit = Total Income + Fee Collections - Total Expenses
```

The dashboard calculates current monthly income, expenses, net profit, pending fees, attendance counts, upcoming exams, and recent payments.
