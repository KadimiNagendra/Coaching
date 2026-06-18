# UI Wireframes

## Mobile Layout

```mermaid
flowchart TD
  MobileTop[Top App Bar] --> MobileDrawer[Menu Drawer]
  MobileTop --> MobileContent[Page Content]
  MobileContent --> StatCards[Stacked Summary Cards]
  MobileContent --> DataList[Tables or Lists]
  MobileContent --> FloatingAction[Primary Action Button]
```

## Desktop Layout

```mermaid
flowchart LR
  Sidebar[Left Navigation] --> Content[Main Content]
  Content --> Header[Page Header]
  Content --> Cards[Metric Cards]
  Content --> Tables[Operational Tables]
  Content --> Charts[Dashboard Charts]
```

## Main Screens

- Dashboard: total students, active students, classes today, monthly income, monthly expenses, net profit, pending fees, attendance summary, upcoming exams, recent payments.
- Students: searchable table, add/edit form, parent details, class, subjects, batch, fee, active/inactive status.
- Fees: payment history, dues, partial payments, payment mode, receipt-ready data.
- Attendance: daily records and absence status.
- Exams: scheduled tests and results entry path.
- Homework: assignment list and completion tracking path.
- Expenses and Income: monthly finance entry and review.
- Reports: export cards for CSV downloads.
- Notifications: queued parent communication log.
