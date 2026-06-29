import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel,
  Table, TableHead, TableRow, TableCell, TableBody, Tabs, Tab, Stack, Chip, Dialog, DialogTitle, Divider,
  DialogContent, DialogActions, Avatar, alpha, Tooltip, Alert, LinearProgress, Switch,
  FormControlLabel, Badge, Popover
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend,
  PieChart, Pie, Cell, LineChart, Line, Tooltip as ChartTooltip
} from 'recharts';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PeopleIcon from '@mui/icons-material/People';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SecurityIcon from '@mui/icons-material/Security';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// DB and API imports
import { getUser, homePath, api } from '../api/client';
import {
  clarityHomeDb, Income, Expense, Budget, Bill, SavingsGoal,
  Loan, Investment, Asset, Debt, WishlistItem, Notification,
  ActivityLog, FamilyMember, PaymentMethod, ClarityHomeSettings
} from '../utils/clarityHomeDb';

const CATEGORY_COLORS = [
  '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#6366f1', '#14b8a6', '#f43f5e',
  '#a855f7', '#d946ef', '#0d9488', '#ea580c', '#84cc16'
];

export default function ClarityHomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'dashboard';

  const tabMap: Record<string, number> = {
    'dashboard': 0,
    'income-expenses': 1,
    'budgets-bills': 2,
    'loans-emis': 3,
    'investments': 4,
    'assets-debts': 5,
    'family-payments': 6,
    'reports-exporter': 7,
    'system-settings': 8
  };

  const activeTab = tabMap[tabParam] ?? 0;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mounted, setMounted] = useState(false);

  // User Profile
  const user = getUser();
  const backPath = homePath(user?.role);

  // Database lists
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [settings, setSettings] = useState<ClarityHomeSettings | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Modals / Trigger states
  const [toastMessage, setToastMessage] = useState<{ text: string; severity: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [selectedMemberCreds, setSelectedMemberCreds] = useState<any>(null);

  // Forms states
  const [incomeForm, setIncomeForm] = useState<Omit<Income, 'id'>>({
    title: '', category: 'Salary', amount: 0, date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank Transfer', notes: '', recurring: 'none'
  });
  const [expenseForm, setExpenseForm] = useState<Omit<Expense, 'id'>>({
    expenseName: '', category: 'Food', amount: 0, date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'UPI', vendor: '', notes: '', tags: [], recurring: 'none', familyMember: 'Self', isBusiness: false
  });
  const [tagInput, setTagInput] = useState('');
  const [budgetForm, setBudgetForm] = useState<Omit<Budget, 'id'>>({
    category: 'Food', amount: 0, period: 'monthly', year: 2026, month: 6
  });
  const [billForm, setBillForm] = useState<Omit<Bill, 'id'>>({
    title: '', category: 'Electricity', amount: 0, dueDate: new Date().toISOString().slice(0, 10),
    status: 'Unpaid', reminderDays: 5, autoRecurring: true
  });
  const [goalForm, setGoalForm] = useState<Omit<SavingsGoal, 'id'>>({
    goalName: '', targetAmount: 0, currentAmount: 0, category: 'Emergency Fund', targetDate: new Date().toISOString().slice(0, 10)
  });
  const [loanForm, setLoanForm] = useState<Omit<Loan, 'id'>>({
    loanName: '', loanType: 'Personal Loan', loanAmount: 0, interestRate: 8, emiAmount: 0,
    dueDate: new Date().toISOString().slice(0, 10), remainingBalance: 0, paymentHistory: []
  });
  const [investmentForm, setInvestmentForm] = useState<Omit<Investment, 'id'>>({
    name: '', type: 'Mutual Funds', investedAmount: 0, currentValue: 0, purchaseDate: new Date().toISOString().slice(0, 10)
  });
  const [assetForm, setAssetForm] = useState<Omit<Asset, 'id'>>({
    name: '', assetType: 'Bank Accounts', estimatedValue: 0
  });
  const [debtForm, setDebtForm] = useState<Omit<Debt, 'id'>>({
    personName: '', type: 'borrowed', amount: 0, dueDate: new Date().toISOString().slice(0, 10),
    interestRate: 0, paidStatus: 'Unpaid'
  });
  const [wishlistForm, setWishlistForm] = useState<Omit<WishlistItem, 'id'>>({
    itemName: '', estimatedPrice: 0, priority: 'Medium', targetDate: new Date().toISOString().slice(0, 10), notes: ''
  });
  const [familyMemberForm, setFamilyMemberForm] = useState({ name: '', relationship: '', avatarColor: '#3f51b5' });
  const [paymentMethodForm, setPaymentMethodForm] = useState({ name: '', type: 'UPI' as const });

  // Filters / Search
  const [globalSearch, setGlobalSearch] = useState('');
  const [expenseFilterCategory, setExpenseFilterCategory] = useState('All');
  const [expenseFilterFamily, setExpenseFilterFamily] = useState('All');
  const [expenseFilterPayment, setExpenseFilterPayment] = useState('All');
  const [expenseFilterType, setExpenseFilterType] = useState('All'); // All, Personal, Business



  // Credentials reset states
  const [newUsername, setNewUsername] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');

  // Reports filters
  const [reportType, setReportType] = useState<'income' | 'expense' | 'savings' | 'budget' | 'family'>('expense');
  const [reportRange, setReportRange] = useState<'month' | 'year' | 'all'>('month');

  // Notifications Popover Anchor State
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenNotifications = (event: React.MouseEvent<HTMLButtonElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchorEl(null);
  };

  const [dbLoading, setDbLoading] = useState(true);

  // In-memory reference to the full payload – source of truth for server syncs
  const dbRef = useRef<Record<string, any>>({});

  /** Populate React state from the given server payload */
  const applyPayload = (data: Record<string, any>) => {
    dbRef.current = data;
    setIncome((data['ch_income'] ?? []) as Income[]);
    setExpenses((data['ch_expenses'] ?? []) as Expense[]);
    setBudgets((data['ch_budgets'] ?? []) as Budget[]);
    setBills((data['ch_bills'] ?? []) as Bill[]);
    setGoals((data['ch_savings_goals'] ?? []) as SavingsGoal[]);
    setLoans((data['ch_loans'] ?? []) as Loan[]);
    setInvestments((data['ch_investments'] ?? []) as Investment[]);
    setAssets((data['ch_assets'] ?? []) as Asset[]);
    setDebts((data['ch_debts'] ?? []) as Debt[]);
    setWishlist((data['ch_wishlist'] ?? []) as WishlistItem[]);
    setNotifications((data['ch_notifications'] ?? []) as Notification[]);
    setFamilyMembers((data['ch_family_members'] ?? []) as FamilyMember[]);
    setPaymentMethods((data['ch_payment_methods'] ?? []) as PaymentMethod[]);
    setSettings((data['ch_settings'] ?? null) as ClarityHomeSettings | null);
    setActivityLogs((data['ch_activity_logs'] ?? []) as ActivityLog[]);
  };

  /** Persist the full in-memory payload to the server and re-apply from response */
  const saveToServer = (patch: Record<string, any>): Promise<void> => {
    const payload = { ...dbRef.current, ...patch };
    dbRef.current = payload;
    return api.saveClarityHomeData(payload)
      .then((updatedData) => {
        if (updatedData && Object.keys(updatedData).length > 0) {
          applyPayload(updatedData);
        }
      })
      .catch(err => {
        console.error('Failed to save Clarity Home data to server', err);
      });
  };

  const handleResetCredentials = () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      triggerToast('Username and password cannot be empty.', 'error');
      return;
    }
    api.resetCredentials(newUsername, newPassword)
      .then(() => {
        triggerToast('Credentials successfully updated. Redirecting to login...', 'success');
        setTimeout(() => {
          localStorage.removeItem('tm_token');
          localStorage.removeItem('tm_user');
          window.location.href = '/login';
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to reset credentials', err);
        let message = 'Failed to update credentials.';
        if (err.message) {
          try {
            const parsed = JSON.parse(err.message);
            message = parsed.message || parsed.error || message;
          } catch {
            message = err.message;
          }
        }
        triggerToast(message, 'error');
      });
  };

  useEffect(() => {
    clarityHomeDb.init(); // only runs the recurring scheduler, no seeding
    api.getClarityHomeData()
      .then((data) => {
        applyPayload(data && Object.keys(data).length > 0 ? data : {});
        setMounted(true);
        setDbLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch Clarity Home data from server', err);
        setMounted(true);
        setDbLoading(false);
      });
  }, []);



  const triggerToast = (text: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToastMessage({ text, severity });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Dashboard Metrics Calculators
  const dashboardStats = useMemo(() => {
    const totalInc = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
    const currentBalance = totalInc - totalExp;

    const totalSaved = goals.reduce((sum, item) => sum + item.currentAmount, 0);

    // Budget utilization
    const activeBudgetsSum = budgets.reduce((sum, b) => sum + b.amount, 0);
    const currentSpentInBudgetedCategories = budgets.reduce((sum, b) => {
      const spent = expenses
        .filter(e => e.category === b.category)
        .reduce((s, e) => s + e.amount, 0);
      return sum + Math.min(spent, b.amount);
    }, 0);
    const budgetUtilization = activeBudgetsSum > 0 ? (currentSpentInBudgetedCategories / activeBudgetsSum) * 100 : 0;

    const upcomingBillsCount = bills.filter(b => b.status === 'Unpaid').length;

    return {
      totalIncome: totalInc,
      totalExpenses: totalExp,
      currentBalance,
      totalSaved,
      budgetUtilization,
      upcomingBillsCount
    };
  }, [income, expenses, budgets, bills, goals]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Chart data formatting
  const categoryChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      categories[e.category] = (categories[e.category] || 0) + e.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const incomeVsExpensePieData = useMemo(() => {
    return [
      { name: 'Total Income', value: dashboardStats.totalIncome, color: '#10b981' },
      { name: 'Total Expenses', value: dashboardStats.totalExpenses, color: '#ef4444' }
    ];
  }, [dashboardStats]);

  const incomeVsExpenseChartData = useMemo(() => {
    const data: Record<string, { month: string; income: number; expenses: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
      const name = `${months[m.getMonth()]} ${m.getFullYear().toString().slice(-2)}`;
      data[key] = { month: name, income: 0, expenses: 0 };
    }

    income.forEach(inc => {
      const key = inc.date.slice(0, 7);
      if (data[key]) data[key].income += inc.amount;
    });

    expenses.forEach(exp => {
      const key = exp.date.slice(0, 7);
      if (data[key]) data[key].expenses += exp.amount;
    });

    return Object.values(data);
  }, [income, expenses]);

  const trendChartData = useMemo(() => {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const dayMap: Record<string, number> = {};

    expenses
      .filter(e => e.date.startsWith(currentMonthStr))
      .forEach(e => {
        const day = e.date.slice(-2);
        dayMap[day] = (dayMap[day] || 0) + e.amount;
      });

    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, '0');
      data.push({
        day: `Day ${i}`,
        amount: dayMap[dayStr] || 0
      });
    }
    return data;
  }, [expenses]);

  // Global search filtering
  const filteredTransactions = useMemo(() => {
    const q = globalSearch.toLowerCase().trim();
    let res: (Expense | Income)[] = [...expenses, ...income];

    if (expenseFilterCategory !== 'All') {
      res = res.filter(x => x.category === expenseFilterCategory);
    }
    if (expenseFilterFamily !== 'All') {
      res = res.filter(x => 'familyMember' in x && x.familyMember === expenseFilterFamily);
    }
    if (expenseFilterPayment !== 'All') {
      res = res.filter(x => x.paymentMethod === expenseFilterPayment);
    }
    if (expenseFilterType !== 'All') {
      res = res.filter(x => {
        if ('isBusiness' in x) {
          return expenseFilterType === 'Business' ? x.isBusiness : !x.isBusiness;
        }
        return false;
      });
    }

    if (!q) return res.sort((a, b) => b.date.localeCompare(a.date));

    return res.filter(item => {
      const name = 'expenseName' in item ? item.expenseName : item.title;
      const notes = item.notes || '';
      const cat = item.category || '';
      const method = item.paymentMethod || '';
      const vendor = 'vendor' in item ? item.vendor : '';
      return name.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        method.toLowerCase().includes(q) ||
        vendor.toLowerCase().includes(q);
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [income, expenses, globalSearch, expenseFilterCategory, expenseFilterFamily, expenseFilterPayment, expenseFilterType]);

  // Operations
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: Income[];
    if (selectedIncome) {
      updatedList = income.map(x => x.id === selectedIncome.id ? { ...x, ...incomeForm } : x);
      triggerToast('Income updated successfully.');
    } else {
      const newItem: Income = { ...incomeForm, id: `inc-${Date.now()}` };
      updatedList = [...income, newItem];
      triggerToast('Income logged successfully.');
    }
    setIncome(updatedList);
    setIncomeModalOpen(false);
    setSelectedIncome(null);
    setIncomeForm({
      title: '', category: 'Salary', amount: 0, date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank Transfer', notes: '', recurring: 'none'
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: selectedIncome ? 'Update Income' : 'Add Income', timestamp: new Date().toISOString(), details: `Income "${incomeForm.title}" of amount ${incomeForm.amount}` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_income: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList: Expense[];
    let updatedNotifs = [...notifications];
    if (selectedExpense) {
      updatedList = expenses.map(x => x.id === selectedExpense.id ? { ...x, ...expenseForm } : x);
      triggerToast('Expense updated successfully.');
    } else {
      const newItem: Expense = { ...expenseForm, id: `exp-${Date.now()}` };
      updatedList = [...expenses, newItem];
      triggerToast('Expense logged successfully.');
      // Budget alert check
      const year = new Date(expenseForm.date).getFullYear();
      const month = new Date(expenseForm.date).getMonth() + 1;
      const budget = budgets.find(b => b.category === expenseForm.category && b.year === year && b.month === month);
      if (budget) {
        const currentSpent = updatedList.filter(e => e.category === expenseForm.category && new Date(e.date).getFullYear() === year && (new Date(e.date).getMonth() + 1) === month).reduce((sum, e) => sum + e.amount, 0);
        if (currentSpent > budget.amount) {
          updatedNotifs = [{ id: `not-${Date.now()}`, title: 'Budget Overrun Alert!', message: `Category "${expenseForm.category}" monthly budget of ${budget.amount} has been exceeded (Current spent: ${currentSpent}).`, date: new Date().toISOString(), type: 'budget', read: false }, ...updatedNotifs];
          setNotifications(updatedNotifs);
        } else if (currentSpent > budget.amount * 0.8) {
          updatedNotifs = [{ id: `not-${Date.now()}`, title: 'Budget limit nearing', message: `You have spent 80%+ of category "${expenseForm.category}" monthly budget (${currentSpent} of ${budget.amount}).`, date: new Date().toISOString(), type: 'budget', read: false }, ...updatedNotifs];
          setNotifications(updatedNotifs);
        }
      }
    }
    setExpenses(updatedList);
    setExpenseModalOpen(false);
    setSelectedExpense(null);
    setExpenseForm({
      expenseName: '', category: 'Food', amount: 0, date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'UPI', vendor: '', notes: '', tags: [], recurring: 'none', familyMember: 'Self', isBusiness: false
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: selectedExpense ? 'Update Expense' : 'Add Expense', timestamp: new Date().toISOString(), details: `Expense "${expenseForm.expenseName}" of amount ${expenseForm.amount}` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_expenses: updatedList, ch_notifications: updatedNotifs, ch_activity_logs: updatedLogs });
  };

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Budget = { ...budgetForm, id: `bud-${Date.now()}` };
    const updatedList = [...budgets, newItem];
    setBudgets(updatedList);
    triggerToast('Monthly Category Budget configured.');
    setBudgetModalOpen(false);
    setBudgetForm({ category: 'Food', amount: 0, period: 'monthly', year: 2026, month: 6 });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Budget', timestamp: new Date().toISOString(), details: `Budget for "${budgetForm.category}" of amount ${budgetForm.amount}` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_budgets: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Bill = { ...billForm, id: `bil-${Date.now()}` };
    const updatedList = [...bills, newItem];
    setBills(updatedList);
    triggerToast('Bill payment reminders active.');
    setBillModalOpen(false);
    setBillForm({
      title: '', category: 'Electricity', amount: 0, dueDate: new Date().toISOString().slice(0, 10),
      status: 'Unpaid', reminderDays: 5, autoRecurring: true
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Bill', timestamp: new Date().toISOString(), details: `Bill "${billForm.title}" of amount ${billForm.amount}` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_bills: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: SavingsGoal = { ...goalForm, id: `goal-${Date.now()}` };
    const updatedList = [...goals, newItem];
    setGoals(updatedList);
    triggerToast('Savings goal configured.');
    setGoalModalOpen(false);
    setGoalForm({
      goalName: '', targetAmount: 0, currentAmount: 0, category: 'Emergency Fund', targetDate: new Date().toISOString().slice(0, 10)
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Savings Goal', timestamp: new Date().toISOString(), details: `Goal "${goalForm.goalName}" target ${goalForm.targetAmount}` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_savings_goals: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Loan = { ...loanForm, id: `loan-${Date.now()}` };
    const updatedList = [...loans, newItem];
    setLoans(updatedList);
    triggerToast('Loan tracker initialized.');
    setLoanModalOpen(false);
    setLoanForm({
      loanName: '', loanType: 'Personal Loan', loanAmount: 0, interestRate: 8, emiAmount: 0,
      dueDate: new Date().toISOString().slice(0, 10), remainingBalance: 0, paymentHistory: []
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Loan', timestamp: new Date().toISOString(), details: `Loan "${loanForm.loanName}"` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_loans: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Investment = { ...investmentForm, id: `inv-${Date.now()}` };
    const updatedList = [...investments, newItem];
    setInvestments(updatedList);
    triggerToast('Investment logged to asset tracking.');
    setInvestmentModalOpen(false);
    setInvestmentForm({
      name: '', type: 'Mutual Funds', investedAmount: 0, currentValue: 0, purchaseDate: new Date().toISOString().slice(0, 10)
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Investment', timestamp: new Date().toISOString(), details: `Investment "${investmentForm.name}"` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_investments: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Asset = { ...assetForm, id: `ast-${Date.now()}` };
    const updatedList = [...assets, newItem];
    setAssets(updatedList);
    triggerToast('Valuable asset registered.');
    setAssetModalOpen(false);
    setAssetForm({ name: '', assetType: 'Bank Accounts', estimatedValue: 0 });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Asset', timestamp: new Date().toISOString(), details: `Asset "${assetForm.name}"` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_assets: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: Debt = { ...debtForm, id: `deb-${Date.now()}` };
    const updatedList = [...debts, newItem];
    setDebts(updatedList);
    triggerToast('Debt record updated.');
    setDebtModalOpen(false);
    setDebtForm({
      personName: '', type: 'borrowed', amount: 0, dueDate: new Date().toISOString().slice(0, 10),
      interestRate: 0, paidStatus: 'Unpaid'
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Debt', timestamp: new Date().toISOString(), details: `Debt with ${debtForm.personName}` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_debts: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: WishlistItem = { ...wishlistForm, id: `wish-${Date.now()}` };
    const updatedList = [...wishlist, newItem];
    setWishlist(updatedList);
    triggerToast('Wishlist item created.');
    setWishlistModalOpen(false);
    setWishlistForm({
      itemName: '', estimatedPrice: 0, priority: 'Medium', targetDate: new Date().toISOString().slice(0, 10), notes: ''
    });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Wishlist Item', timestamp: new Date().toISOString(), details: `"${wishlistForm.itemName}"` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_wishlist: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyMemberForm.name.trim()) return;
    const newItem: FamilyMember = { ...familyMemberForm, id: `fam-${Date.now()}` };
    const updatedList = [...familyMembers, newItem];
    setFamilyMembers(updatedList);
    triggerToast('Family member registered.');
    setFamilyMemberForm({ name: '', relationship: '', avatarColor: '#3f51b5' });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Family Member', timestamp: new Date().toISOString(), details: `Added family member "${familyMemberForm.name}"` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_family_members: updatedList, ch_activity_logs: updatedLogs });
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethodForm.name.trim()) return;
    const newItem: PaymentMethod = { ...paymentMethodForm, id: `pm-${Date.now()}` };
    const updatedList = [...paymentMethods, newItem];
    setPaymentMethods(updatedList);
    triggerToast('Payment channel mapped.');
    setPaymentMethodForm({ name: '', type: 'UPI' });
    const newLog: ActivityLog = { id: `log-${Date.now()}`, action: 'Add Payment Method', timestamp: new Date().toISOString(), details: `Payment method "${paymentMethodForm.name}"` };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    saveToServer({ ch_payment_methods: updatedList, ch_activity_logs: updatedLogs });
  };



  // Report generating
  const generatedReportData = useMemo(() => {
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const currentYearStr = new Date().getFullYear().toString();

    const inRange = (dateStr: string) => {
      if (reportRange === 'month') return dateStr.startsWith(currentMonthStr);
      if (reportRange === 'year') return dateStr.startsWith(currentYearStr);
      return true;
    };

    if (reportType === 'income') {
      return income.filter(x => inRange(x.date)).map(x => ({
        Date: x.date, Category: x.category, Title: x.title, Amount: x.amount, 'Payment Method': x.paymentMethod
      }));
    } else if (reportType === 'expense') {
      return expenses.filter(x => inRange(x.date)).map(x => ({
        Date: x.date, Category: x.category, Name: x.expenseName, Vendor: x.vendor || '—', Amount: x.amount, 'Payment Method': x.paymentMethod, Member: x.familyMember, Type: x.isBusiness ? 'Business' : 'Personal'
      }));
    } else if (reportType === 'savings') {
      return goals.map(x => ({
        Goal: x.goalName, Category: x.category, 'Target Amount': x.targetAmount, 'Current Saved': x.currentAmount, Remaining: x.targetAmount - x.currentAmount, 'Progress %': Math.round((x.currentAmount / x.targetAmount) * 100)
      }));
    } else if (reportType === 'budget') {
      return budgets.map(x => {
        const spent = expenses
          .filter(e => e.category === x.category && inRange(e.date))
          .reduce((sum, e) => sum + e.amount, 0);
        return {
          Category: x.category, Budget: x.amount, Actual: spent, Difference: x.amount - spent, Status: spent > x.amount ? 'Over Limit' : 'Within Budget'
        };
      });
    } else { // family
      const members = ['Self', 'Wife', 'Daughter', 'Father', ...familyMembers.map(m => m.name)];
      return members.map(name => {
        const spent = expenses.filter(e => e.familyMember === name && inRange(e.date)).reduce((sum, e) => sum + e.amount, 0);
        return {
          'Family Member': name,
          'Total Spent': spent,
          'Expense Share %': expenses.reduce((s, x) => s + x.amount, 0) > 0 ? Math.round((spent / expenses.reduce((s, x) => s + x.amount, 0)) * 100) : 0
        };
      });
    }
  }, [income, expenses, budgets, goals, familyMembers, reportType, reportRange]);

  // Export functions
  const exportToCSV = () => {
    if (generatedReportData.length === 0) return;
    const headers = Object.keys(generatedReportData[0]).join(',');
    const rows = generatedReportData.map(row =>
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clarity_home_${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Report exported as CSV.');
  };

  const exportToExcel = () => {
    if (generatedReportData.length === 0) return;
    let tableHtml = '<table border="1"><thead><tr>';
    Object.keys(generatedReportData[0]).forEach(key => {
      tableHtml += `<th>${key}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    generatedReportData.forEach(row => {
      tableHtml += '<tr>';
      Object.values(row).forEach(val => {
        tableHtml += `<td>${val}</td>`;
      });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    const excelContent = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(tableHtml);
    const link = document.createElement('a');
    link.setAttribute('href', excelContent);
    link.setAttribute('download', `clarity_home_${reportType}_report.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Report exported as XLS.');
  };

  const exportToPDF = () => {
    window.print();
  };

  // Backup file logic
  const handleBackupDownload = () => {
    const backupStr = JSON.stringify(dbRef.current, null, 2);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(backupStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `clarity_home_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    triggerToast('Database backup file saved.');
  };

  const handleBackupUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (files && files.length > 0) {
      fileReader.readAsText(files[0], 'UTF-8');
      fileReader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const parsed = JSON.parse(content);
            applyPayload(parsed);
            saveToServer(parsed);
            triggerToast('Database backup successfully imported!');
          } catch {
            triggerToast('Invalid backup file structure.', 'error');
          }
        }
      };
    }
  };

  if (dbLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <LinearProgress sx={{ width: 160, height: 6, borderRadius: 3 }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>Loading Personal Finance data from database...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 0.5 }}>
      {toastMessage && (
        <Alert severity={toastMessage.severity} variant="filled" sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
          {toastMessage.text}
        </Alert>
      )}
      {/* Global Page Header: Date & Notification Icon */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
          <IconButton onClick={handleOpenNotifications} color="primary">
            <Badge badgeContent={unreadNotificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Popover
            open={Boolean(notificationsAnchorEl)}
            anchorEl={notificationsAnchorEl}
            onClose={handleCloseNotifications}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            slotProps={{
              paper: {
                sx: { p: 2.5, width: 320, maxHeight: 400, display: 'flex', flexDirection: 'column', gap: 1.5, borderRadius: 3 }
              }
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationsIcon color="primary" /> Recent Alerts
            </Typography>
            <Stack spacing={1.5} sx={{ overflowY: 'auto' }}>
              {notifications.slice(0, 5).map(n => (
                <Alert
                  key={n.id}
                  severity={n.type === 'budget' || n.type === 'emi' ? 'warning' : 'info'}
                  sx={{ py: 0.5, px: 1.5, fontSize: '0.825rem' }}
                  action={
                    !n.read && (
                      <IconButton size="small" onClick={() => {
                        const updated = notifications.map(x => x.id === n.id ? { ...x, read: true } : x);
                        setNotifications(updated);
                        saveToServer({ ch_notifications: updated });
                      }}>
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <strong>{n.title}</strong> — {n.message}
                </Alert>
              ))}
              {notifications.length === 0 && (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>No incoming system messages.</Typography>
              )}
            </Stack>
          </Popover>
        </Box>
      </Box>

      {/* Main Tab Content */}
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* TAB 0: DASHBOARD */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Core interactive buttons grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => { setSelectedExpense(null); setExpenseModalOpen(true); }}
                sx={{
                  py: 2.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#ef4444',
                  borderColor: alpha('#ef4444', 0.3),
                  bgcolor: alpha('#ef4444', 0.02),
                  '&:hover': {
                    borderColor: '#ef4444',
                    bgcolor: alpha('#ef4444', 0.08),
                  }
                }}
              >
                Log Expense
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => { setSelectedIncome(null); setIncomeModalOpen(true); }}
                sx={{
                  py: 2.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#10b981',
                  borderColor: alpha('#10b981', 0.3),
                  bgcolor: alpha('#10b981', 0.02),
                  '&:hover': {
                    borderColor: '#10b981',
                    bgcolor: alpha('#10b981', 0.08),
                  }
                }}
              >
                Log Income
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<AccountBalanceWalletIcon />}
                onClick={() => setBalanceModalOpen(true)}
                sx={{
                  py: 2.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: '#4f46e5',
                  borderColor: alpha('#4f46e5', 0.3),
                  bgcolor: alpha('#4f46e5', 0.02),
                  '&:hover': {
                    borderColor: '#4f46e5',
                    bgcolor: alpha('#4f46e5', 0.08),
                  }
                }}
              >
                Current Balance
              </Button>
            </Box>

            {/* Charts Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' }, gap: 3 }}>
              <Box sx={{ minWidth: 0 }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Monthly Income vs Expense</Typography>
                    <Box sx={{ width: '100%', height: 260, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {mounted && (
                        <PieChart width={320} height={260}>
                          <Pie
                            data={incomeVsExpensePieData}
                            cx="50%"
                            cy="45%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {incomeVsExpensePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Expense Category Share</Typography>
                    <Box sx={{ width: '100%', height: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {categoryChartData.length === 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                          <Typography variant="body2" color="text.secondary">No expense transactions recorded.</Typography>
                        </Box>
                      ) : (
                        mounted && (
                          <PieChart width={220} height={180}>
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {categoryChartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`} />
                          </PieChart>
                        )
                      )}
                    </Box>
                    {/* Custom Category Legend */}
                    <Box sx={{ mt: 1.5, maxHeight: 80, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {categoryChartData.slice(0, 5).map((x, index) => (
                        <Box key={x.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                          <Typography variant="caption" sx={{ fontSize: '0.675rem', fontWeight: 600 }}>{x.name} ({Math.round((x.value / dashboardStats.totalExpenses) * 100)}%)</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        )}

        {/* TAB 1: INCOME & EXPENSES */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Header Action Row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Household Ledgers</Typography>
              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" startIcon={<AddIcon />} color="success" onClick={() => { setSelectedIncome(null); setIncomeModalOpen(true); }}>
                  Log Income
                </Button>
                <Button startIcon={<AddIcon />} onClick={() => { setSelectedExpense(null); setExpenseModalOpen(true); }}>
                  Log Expense
                </Button>
              </Stack>
            </Box>

            {/* Filtering row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '3fr repeat(4, 2.25fr)' }, gap: 2, mb: 1 }}>
              <Box>
                <TextField
                  fullWidth
                  placeholder="Search logs..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                />
              </Box>
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={expenseFilterCategory} label="Category" onChange={(e) => setExpenseFilterCategory(e.target.value)}>
                    <MenuItem value="All">All Categories</MenuItem>
                    <MenuItem value="Salary">Salary</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Freelancing">Freelancing</MenuItem>
                    <MenuItem value="Rent">Rent</MenuItem>
                    <MenuItem value="Groceries">Groceries</MenuItem>
                    <MenuItem value="Electricity">Electricity</MenuItem>
                    <MenuItem value="Shopping">Shopping</MenuItem>
                    <MenuItem value="Entertainment">Entertainment</MenuItem>
                    <MenuItem value="Miscellaneous">Miscellaneous</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Family Member</InputLabel>
                  <Select value={expenseFilterFamily} label="Family Member" onChange={(e) => setExpenseFilterFamily(e.target.value)}>
                    <MenuItem value="All">All Members</MenuItem>
                    <MenuItem value="Self">Self</MenuItem>
                    <MenuItem value="Wife">Wife</MenuItem>
                    <MenuItem value="Daughter">Daughter</MenuItem>
                    <MenuItem value="Father">Father</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Channel</InputLabel>
                  <Select value={expenseFilterPayment} label="Payment Channel" onChange={(e) => setExpenseFilterPayment(e.target.value)}>
                    <MenuItem value="All">All Channels</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Credit Card">Credit Card</MenuItem>
                    <MenuItem value="Debit Card">Debit Card</MenuItem>
                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Expense Type</InputLabel>
                  <Select value={expenseFilterType} label="Expense Type" onChange={(e) => setExpenseFilterType(e.target.value)}>
                    <MenuItem value="All">All Expenses</MenuItem>
                    <MenuItem value="Personal">Personal</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Transactions Table */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0 }}>
              <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Description/Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Channel</TableCell>
                      <TableCell>Tags / Details</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions.map((item) => {
                      const isInc = 'title' in item;
                      const name = isInc ? item.title : item.expenseName;
                      const amountColor = isInc ? 'success.main' : 'error.main';
                      const prefix = isInc ? '+' : '-';

                      return (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{item.date}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {name}
                            {!isInc && item.vendor && (
                              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                Vendor: {item.vendor}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.category}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: isInc ? '#10b981' : '#ec4899',
                                color: isInc ? '#10b981' : '#ec4899',
                                fontWeight: 600
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, color: amountColor }}>
                            {prefix}₹{item.amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{item.paymentMethod}</TableCell>
                          <TableCell>
                            {!isInc && item.isBusiness && (
                              <Chip label="Business" color="warning" size="small" sx={{ mr: 0.5, height: 18, fontSize: '0.65rem' }} />
                            )}
                            {!isInc && item.familyMember && (
                              <Chip label={item.familyMember} color="primary" variant="outlined" size="small" sx={{ mr: 0.5, height: 18, fontSize: '0.65rem' }} />
                            )}
                            {!isInc && item.tags?.map(t => (
                              <Chip key={t} label={`#${t}`} size="small" sx={{ mr: 0.5, height: 18, fontSize: '0.65rem', bgcolor: 'action.hover' }} />
                            ))}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                              {!isInc && (
                                <Tooltip title="Duplicate">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      const src = expenses.find(x => x.id === item.id);
                                      if (src) {
                                        const copy = { ...src, id: `exp-${Date.now()}`, expenseName: `${src.expenseName} (Copy)`, date: new Date().toISOString().slice(0, 10) };
                                        const updated = [...expenses, copy];
                                        setExpenses(updated);
                                        triggerToast('Expense entry duplicated.');
                                        saveToServer({ ch_expenses: updated });
                                      }
                                    }}
                                  >
                                    <ContentCopyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <IconButton
                                size="small"
                                onClick={() => {
                                  if (isInc) {
                                    setSelectedIncome(item);
                                    setIncomeForm(item);
                                    setIncomeModalOpen(true);
                                  } else {
                                    setSelectedExpense(item);
                                    setExpenseForm(item);
                                    setExpenseModalOpen(true);
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  if (isInc) {
                                    const updated = income.filter(x => x.id !== item.id);
                                    setIncome(updated);
                                    triggerToast('Income log removed.');
                                    saveToServer({ ch_income: updated });
                                  } else {
                                    const updated = expenses.filter(x => x.id !== item.id);
                                    setExpenses(updated);
                                    triggerToast('Expense log removed.');
                                    saveToServer({ ch_expenses: updated });
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          No transactions found matching active parameters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          </Box>
        )}

        {/* TAB 2: BUDGETS & BILLS */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Budgets Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Category Monthly Budgets</Typography>
                <Button startIcon={<AddIcon />} onClick={() => setBudgetModalOpen(true)}>Configure Budget</Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {budgets.map(b => {
                  const spent = expenses
                    .filter(e => e.category === b.category && new Date(e.date).getMonth() + 1 === b.month)
                    .reduce((sum, e) => sum + e.amount, 0);
                  const percent = Math.min(100, Math.round((spent / b.amount) * 100));
                  const isExceeded = spent > b.amount;

                  return (
                    <Box key={b.id}>
                      <Card sx={{ borderLeft: '4px solid', borderLeftColor: isExceeded ? 'error.main' : 'primary.main' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ fontWeight: 700 }}>{b.category}</Typography>
                            <Chip
                              label={isExceeded ? 'Exceeded' : 'Active'}
                              color={isExceeded ? 'error' : 'success'}
                              size="small"
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="body2" color="text.secondary">Spent: ₹{spent.toLocaleString()}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Limit: ₹{b.amount.toLocaleString()}</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'action.hover',
                              '& .MuiLinearProgress-bar': { bgcolor: isExceeded ? 'error.main' : 'primary.main' }
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">{b.month}/{b.year}</Typography>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const updated = budgets.filter(x => x.id !== b.id);
                                setBudgets(updated);
                                triggerToast('Budget limit cleared.');
                                saveToServer({ ch_budgets: updated });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
                {budgets.length === 0 && (
                  <Box sx={{ gridColumn: 'span 12' }}>
                    <Alert severity="info">Configure spending limits above to prevent budget leaks and receive dashboard over-run alerts.</Alert>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Bills Checklist */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Recurring House Utility Bills</Typography>
                <Button startIcon={<AddIcon />} onClick={() => setBillModalOpen(true)}>Create Bill Tracker</Button>
              </Box>

              <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0 }}>
                <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Bill Service</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Autopay</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bills.map(b => (
                        <TableRow key={b.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{b.title}</TableCell>
                          <TableCell>{b.category}</TableCell>
                          <TableCell>{b.dueDate}</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>₹{b.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip
                              label={b.autoRecurring ? 'Autopay ON' : 'Manual'}
                              size="small"
                              color={b.autoRecurring ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={b.status}
                              color={b.status === 'Paid' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                              {b.status === 'Unpaid' && (
                                <Button
                                  size="small"
                                  onClick={() => {
                                    const updated = bills.map(x => x.id === b.id ? { ...x, status: 'Paid' as const } : x);
                                    setBills(updated);
                                    triggerToast(`${b.title} Bill payment recorded.`);
                                    saveToServer({ ch_bills: updated });
                                  }}
                                >
                                  Mark Paid
                                </Button>
                              )}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  const updated = bills.filter(x => x.id !== b.id);
                                  setBills(updated);
                                  triggerToast('Utility tracker deleted.');
                                  saveToServer({ ch_bills: updated });
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {bills.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            No household bills configured. Add water, power, or internet bills.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Card>
            </Box>
          </Box>
        )}

        {/* TAB 3: LOANS & EMIS */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>EMI & Loan Management</Typography>
              <Button startIcon={<AddIcon />} onClick={() => setLoanModalOpen(true)}>Add Loan Tracker</Button>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {loans.map(loan => (
                <Box key={loan.id}>
                  <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{loan.loanName}</Typography>
                        <Chip label={loan.loanType} size="small" color="primary" variant="outlined" />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Total Loan</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>₹{loan.loanAmount.toLocaleString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Remaining Principal</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>₹{loan.remainingBalance.toLocaleString()}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Interest Rate</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{loan.interestRate}% P.A.</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Monthly EMI</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main' }}>₹{loan.emiAmount.toLocaleString()}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Amortization Progress</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.round(((loan.loanAmount - loan.remainingBalance) / loan.loanAmount) * 100)}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Next Due: {loan.dueDate}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              // Pay EMI: reduce balance and add to payment history
                              const today = new Date().toISOString().slice(0, 10);
                              const updatedLoan = { ...loan, remainingBalance: Math.max(0, loan.remainingBalance - loan.emiAmount), paymentHistory: [...loan.paymentHistory, { date: today, amount: loan.emiAmount }] };
                              const updatedLoans = loans.map(x => x.id === loan.id ? updatedLoan : x);
                              setLoans(updatedLoans);
                              // Also add EMI as an expense
                              const emiExpense: Expense = { id: `exp-${Date.now()}`, expenseName: `${loan.loanName} EMI Payment`, category: 'EMI', amount: loan.emiAmount, date: today, paymentMethod: 'Bank Transfer', vendor: loan.loanName, notes: 'Auto loan EMI tracking', tags: ['loan', 'emi'], recurring: 'none', familyMember: 'Self', isBusiness: false };
                              const updatedExpenses = [...expenses, emiExpense];
                              setExpenses(updatedExpenses);
                              // Add notification
                              const notif: Notification = { id: `not-${Date.now()}`, title: 'EMI Payment Recorded', message: `Monthly EMI of ${loan.emiAmount} paid towards "${loan.loanName}". Outstanding balance: ${updatedLoan.remainingBalance}.`, date: new Date().toISOString(), type: 'emi', read: false };
                              const updatedNotifs = [notif, ...notifications];
                              setNotifications(updatedNotifs);
                              triggerToast('EMI payment logged in history ledger.');
                              saveToServer({ ch_loans: updatedLoans, ch_expenses: updatedExpenses, ch_notifications: updatedNotifs });
                            }}
                          >
                            Pay EMI
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const updated = loans.filter(x => x.id !== loan.id);
                              setLoans(updated);
                              triggerToast('Loan ledger deleted.');
                              saveToServer({ ch_loans: updated });
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
              {loans.length === 0 && (
                <Box sx={{ gridColumn: 'span 12' }}>
                  <Alert severity="info">Register car loans, house loans, or personal EMIs to keep net-worth calculations balanced.</Alert>
                </Box>
              )}
            </Box>
          </Box>
        )}

        {/* TAB 4: INVESTMENTS */}
        {activeTab === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Wealth Portfolio Tracker</Typography>
              <Button startIcon={<AddIcon />} onClick={() => setInvestmentModalOpen(true)}>Add Asset Investment</Button>
            </Box>

            {/* Total portfolio widget */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Total Invested Principal</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      ₹{investments.reduce((s, x) => s + x.investedAmount, 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Current Valuation</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      ₹{investments.reduce((s, x) => s + x.currentValue, 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box>
                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">Unrealized Profit/Loss</Typography>
                    {(() => {
                      const inv = investments.reduce((s, x) => s + x.investedAmount, 0);
                      const cur = investments.reduce((s, x) => s + x.currentValue, 0);
                      const gain = cur - inv;
                      const percent = inv > 0 ? ((cur - inv) / inv) * 100 : 0;
                      const color = gain >= 0 ? 'success.main' : 'error.main';

                      return (
                        <Typography variant="h6" sx={{ fontWeight: 800, color: color }}>
                          {gain >= 0 ? '+' : ''}₹{gain.toLocaleString()} ({percent.toFixed(1)}%)
                        </Typography>
                      );
                    })()}
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Investments Table */}
            <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0 }}>
              <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset/SIP Name</TableCell>
                      <TableCell>Category Type</TableCell>
                      <TableCell>Invested Amount</TableCell>
                      <TableCell>Current Value</TableCell>
                      <TableCell>Net Returns</TableCell>
                      <TableCell>Hold Period Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {investments.map(i => {
                      const returns = i.currentValue - i.investedAmount;
                      const returnsColor = returns >= 0 ? 'success.main' : 'error.main';
                      return (
                        <TableRow key={i.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{i.name}</TableCell>
                          <TableCell>
                            <Chip label={i.type} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>₹{i.investedAmount.toLocaleString()}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>₹{i.currentValue.toLocaleString()}</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: returnsColor }}>
                            {returns >= 0 ? '+' : ''}₹{returns.toLocaleString()}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem' }}>{i.purchaseDate}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const newVal = prompt('Enter updated current valuation: ', String(i.currentValue));
                                  if (newVal) {
                                    const updated = investments.map(x => x.id === i.id ? { ...x, currentValue: Number(newVal) } : x);
                                    setInvestments(updated);
                                    triggerToast('Investment value updated.');
                                    saveToServer({ ch_investments: updated });
                                  }
                                }}
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  const updated = investments.filter(x => x.id !== i.id);
                                  setInvestments(updated);
                                  triggerToast('Investment entry cleared.');
                                  saveToServer({ ch_investments: updated });
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          </Box>
        )}

        {/* TAB 5: ASSETS & DEBTS */}
        {activeTab === 5 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Assets Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Physical & Capital Assets</Typography>
                <Button startIcon={<AddIcon />} onClick={() => setAssetModalOpen(true)}>Register Asset</Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                {assets.map(ast => (
                  <Box key={ast.id}>
                    <Card sx={{ bgcolor: 'action.hover' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{ast.assetType}</Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 0.5, mb: 1.5 }}>{ast.name}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>₹{ast.estimatedValue.toLocaleString()}</Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const updated = assets.filter(x => x.id !== ast.id);
                              setAssets(updated);
                              triggerToast('Asset removed.');
                              saveToServer({ ch_assets: updated });
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Debts section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Debts Ledger (Borrowed & Lent)</Typography>
                <Button startIcon={<AddIcon />} onClick={() => setDebtModalOpen(true)}>Add Debt entry</Button>
              </Box>

              <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0 }}>
                <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Person Name</TableCell>
                        <TableCell>Relation Type</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Interest Rate</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {debts.map(d => (
                        <TableRow key={d.id}>
                          <TableCell sx={{ fontWeight: 700 }}>{d.personName}</TableCell>
                          <TableCell>
                            <Chip
                              label={d.type === 'borrowed' ? 'Borrowed' : 'Lent Money'}
                              color={d.type === 'borrowed' ? 'error' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{d.dueDate}</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>₹{d.amount.toLocaleString()}</TableCell>
                          <TableCell>{d.interestRate > 0 ? `${d.interestRate}%` : 'Interest Free'}</TableCell>
                          <TableCell>
                            <Chip label={d.paidStatus} color={d.paidStatus === 'Paid' ? 'success' : 'default'} size="small" />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" sx={{ justifyContent: 'flex-end', gap: 0.5 }}>
                              {d.paidStatus === 'Unpaid' && (
                                <Button
                                  size="small"
                                  onClick={() => {
                                    const updated = debts.map(x => x.id === d.id ? { ...x, paidStatus: 'Paid' as const } : x);
                                    setDebts(updated);
                                    triggerToast('Marked debt settled.');
                                    saveToServer({ ch_debts: updated });
                                  }}
                                >
                                  Mark Settled
                                </Button>
                              )}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  const updated = debts.filter(x => x.id !== d.id);
                                  setDebts(updated);
                                  triggerToast('Debt record deleted.');
                                  saveToServer({ ch_debts: updated });
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {debts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            Zero friendly loans recorded.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Card>
            </Box>
          </Box>
        )}

        {/* TAB 6: FAMILY & PAYMENTS */}
        {activeTab === 6 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Family members tracking */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Household Family Members</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, gap: 3 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Add New Member</Typography>
                      <form onSubmit={handleAddFamilyMember}>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Member Name"
                            value={familyMemberForm.name}
                            onChange={(e) => setFamilyMemberForm({ ...familyMemberForm, name: e.target.value })}
                          />
                          <TextField
                            fullWidth
                            label="Relationship"
                            value={familyMemberForm.relationship}
                            onChange={(e) => setFamilyMemberForm({ ...familyMemberForm, relationship: e.target.value })}
                          />
                          <TextField
                            fullWidth
                            select
                            label="Avatar Color Theme"
                            value={familyMemberForm.avatarColor}
                            onChange={(e) => setFamilyMemberForm({ ...familyMemberForm, avatarColor: e.target.value })}
                          >
                            <MenuItem value="#3f51b5">Indigo Blue</MenuItem>
                            <MenuItem value="#e91e63">Rose Pink</MenuItem>
                            <MenuItem value="#ff9800">Alert Orange</MenuItem>
                            <MenuItem value="#4caf50">Nature Green</MenuItem>
                            <MenuItem value="#9c27b0">Royal Purple</MenuItem>
                          </TextField>
                          <Button type="submit" fullWidth>Add Member</Button>
                        </Stack>
                      </form>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Current Members & Shared Spend</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        {familyMembers.map((m, index) => {
                          const name = m.name;
                          const totalSpent = expenses.filter(e => e.familyMember === name).reduce((sum, e) => sum + e.amount, 0);
                          return (
                            <Box key={m.id}>
                              <Card 
                                variant="outlined" 
                                onClick={() => {
                                  if (name !== 'Self') {
                                    setSelectedMemberCreds(m);
                                  }
                                }}
                                sx={{ 
                                  p: 2, 
                                  textAlign: 'center', 
                                  height: '100%', 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  justifyContent: 'space-between',
                                  cursor: name !== 'Self' ? 'pointer' : 'default',
                                  transition: 'all 0.2s',
                                  '&:hover': name !== 'Self' ? {
                                    transform: 'translateY(-4px)',
                                    boxShadow: theme.shadows[2],
                                    borderColor: 'primary.main'
                                  } : {}
                                }}
                              >
                                <Box>
                                  <Avatar sx={{ mx: 'auto', mb: 1, bgcolor: m.avatarColor || CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}>
                                    {name[0]}
                                  </Avatar>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{name}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{m.relationship}</Typography>
                                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main', display: 'block', mt: 0.5 }}>Spent: ₹{totalSpent.toLocaleString()}</Typography>
                                  
                                  {m.username && (
                                    <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1.5, fontWeight: 700, fontSize: '0.75rem' }}>
                                      Click to View Credentials
                                    </Typography>
                                  )}
                                </Box>
                                
                                {name !== 'Self' && (
                                  <IconButton
                                    size="small"
                                    color="error"
                                    sx={{ mt: 1.5, alignSelf: 'center' }}
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent opening credentials modal
                                      const updated = familyMembers.filter(x => x.id !== m.id);
                                      setFamilyMembers(updated);
                                      triggerToast('Family member removed.');
                                      saveToServer({ ch_family_members: updated });
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Card>
                            </Box>
                          );
                        })}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>

            {/* Payment Methods */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Payment Methods & Wallet Configuration</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '4fr 8fr' }, gap: 3 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Configure Payment Channel</Typography>
                      <form onSubmit={handleAddPaymentMethod}>
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Method Name (e.g. ICICI Credit)"
                            value={paymentMethodForm.name}
                            onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, name: e.target.value })}
                          />
                          <FormControl fullWidth>
                            <InputLabel>Channel Type</InputLabel>
                            <Select
                              value={paymentMethodForm.type}
                              label="Channel Type"
                              onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, type: e.target.value as any })}
                            >
                              <MenuItem value="Cash">Cash</MenuItem>
                              <MenuItem value="UPI">UPI</MenuItem>
                              <MenuItem value="Credit Card">Credit Card</MenuItem>
                              <MenuItem value="Debit Card">Debit Card</MenuItem>
                              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                              <MenuItem value="Wallet">Wallet</MenuItem>
                            </Select>
                          </FormControl>
                          <Button type="submit" fullWidth>Link Method</Button>
                        </Stack>
                      </form>
                    </CardContent>
                  </Card>
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Card sx={{ height: '100%', overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0 }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Linked Methods</Typography>
                      <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paymentMethods.map(pm => (
                              <TableRow key={pm.id}>
                                <TableCell sx={{ fontWeight: 700 }}>{pm.name}</TableCell>
                                <TableCell>
                                  <Chip label={pm.type} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      const updated = paymentMethods.filter(x => x.id !== pm.id);
                                      setPaymentMethods(updated);
                                      triggerToast('Payment method unlinked.');
                                      saveToServer({ ch_payment_methods: updated });
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </Box>
        )}



        {/* TAB 7: REPORTS & EXPORTER */}
        {activeTab === 7 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Financial Reports Center</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={exportToCSV}>
                  Export CSV
                </Button>
                <Button variant="outlined" color="primary" startIcon={<FileDownloadIcon />} onClick={exportToExcel}>
                  Export Excel
                </Button>
                <Button color="secondary" startIcon={<AssessmentIcon />} onClick={exportToPDF}>
                  Print PDF
                </Button>
              </Stack>
            </Box>

            {/* Selection row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Report Profile</InputLabel>
                  <Select value={reportType} label="Report Profile" onChange={(e) => setReportType(e.target.value as any)}>
                    <MenuItem value="income">Income Report</MenuItem>
                    <MenuItem value="expense">Expense Report</MenuItem>
                    <MenuItem value="savings">Savings Goals Summary</MenuItem>
                    <MenuItem value="budget">Budget Performance Report</MenuItem>
                    <MenuItem value="family">Family Member Spending Report</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Date Range Filter</InputLabel>
                  <Select value={reportRange} label="Date Range Filter" onChange={(e) => setReportRange(e.target.value as any)}>
                    <MenuItem value="month">Current Month Only</MenuItem>
                    <MenuItem value="year">Current Calendar Year</MenuItem>
                    <MenuItem value="all">Lifetime History logs</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Data Preview */}
            <Card sx={{ borderRadius: 3, width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="caption" sx={{ display: 'block', p: 2, borderBottom: '1px solid', borderColor: 'divider', fontWeight: 700, textTransform: 'uppercase' }}>
                  Document Table Preview ({generatedReportData.length} records generated)
                </Typography>
                <Box sx={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {generatedReportData.length > 0 &&
                          Object.keys(generatedReportData[0]).map(key => (
                            <TableCell key={key}>{key}</TableCell>
                          ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {generatedReportData.map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.values(row).map((val, cellIdx) => (
                            <TableCell key={cellIdx}>{String(val)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {generatedReportData.length === 0 && (
                        <TableRow>
                          <TableCell align="center" sx={{ py: 4 }}>No data matched report arguments.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* TAB 8: SETTINGS & LOGS */}
        {activeTab === 8 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Profile Config */}
            {user?.role !== 'FAMILY_MEMBER' && (
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon color="primary" /> Profile & System Configuration
                  </Typography>
                  {settings && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <FormControl fullWidth>
                          <InputLabel>Base Accounting Currency</InputLabel>
                          <Select
                            value={settings.currency}
                            label="Base Accounting Currency"
                            onChange={(e) => {
                              const newSet = { ...settings, currency: e.target.value };
                              setSettings(newSet);
                              triggerToast('Base currency updated.');
                              saveToServer({ ch_settings: newSet });
                            }}
                          >
                            <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                            <MenuItem value="USD">US Dollar ($)</MenuItem>
                            <MenuItem value="EUR">Euro (€)</MenuItem>
                            <MenuItem value="GBP">British Pound (£)</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notificationsEnabled}
                              onChange={(e) => {
                                const newSet = { ...settings, notificationsEnabled: e.target.checked };
                                setSettings(newSet);
                                triggerToast('Notification settings toggled.');
                                saveToServer({ ch_settings: newSet });
                              }}
                            />
                          }
                          label="Enable Budget Exceeded Alerts"
                        />
                      </Box>
                      <Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.twoFactorEnabled}
                              onChange={(e) => {
                                const newSet = { ...settings, twoFactorEnabled: e.target.checked };
                                setSettings(newSet);
                                triggerToast('Security setting updated.');
                                saveToServer({ ch_settings: newSet });
                              }}
                            />
                          }
                          label="Require 2FA Authentication (Mock)"
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Login Credentials & Security */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SecurityIcon color="primary" /> Login Credentials & Security
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="New Username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Button
                      variant="contained"
                      onClick={handleResetCredentials}
                      disabled={!newUsername.trim() || !newPassword.trim()}
                      sx={{ mt: 1, textTransform: 'none', alignSelf: 'flex-start' }}
                    >
                      Reset Credentials
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Update your enterprise portal login credentials directly. Please note that changing your credentials will update your account credentials across all tuition portal modules, and you will need to log in again using your new username and password.
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Data backups */}
            {user?.role !== 'FAMILY_MEMBER' && (
              <Card>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Database Backup, Restore & Reset</Typography>
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 2 }}>
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleBackupDownload}>
                      Download Database JSON
                    </Button>
                    <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
                      Restore JSON Backup
                      <input type="file" accept=".json" hidden onChange={handleBackupUpload} />
                    </Button>
                  </Stack>
                  <Alert severity="warning" action={
                    <Button color="error" size="small" variant="contained" onClick={() => {
                      if (confirm('Reset all financial records to default starting seeds?')) {
                        // Re-fetch from server to get the server-side default seed
                        api.getClarityHomeData().then(data => {
                          applyPayload(data && Object.keys(data).length > 0 ? data : {});
                        });
                        triggerToast('Database re-seeded successfully.', 'warning');
                      }
                    }}>
                      Reset Database
                    </Button>
                  }>
                    Clearing or resetting data wipes all custom ledger entries, goals, loans, and settings. Save a JSON backup first.
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Audit Logs */}
            {user?.role !== 'FAMILY_MEMBER' && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon color="primary" /> System Activity & Security Logs
                </Typography>
                <Card sx={{ borderRadius: 3, overflow: 'hidden', width: '100%', maxWidth: '100%', minWidth: 0 }}>
                  <Box sx={{ overflowX: 'auto', width: '100%', maxHeight: 300, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Timestamp</TableCell>
                          <TableCell>Action performed</TableCell>
                          <TableCell>Log details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.timestamp}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{log.action}</TableCell>
                            <TableCell sx={{ fontSize: '0.85rem' }}>{log.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Card>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ALL MODAL DIALOGS BELOW */}

      {/* INCOME LOG MODAL */}
      <Dialog open={incomeModalOpen} onClose={() => setIncomeModalOpen(false)}>
        <DialogTitle>{selectedIncome ? 'Edit Income record' : 'Log Income transaction'}</DialogTitle>
        <form onSubmit={handleAddIncome}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Income Description"
              value={incomeForm.title}
              onChange={(e) => setIncomeForm({ ...incomeForm, title: e.target.value })}
            />
            <TextField
              select
              label="Category"
              value={incomeForm.category}
              onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value as any })}
            >
              <MenuItem value="Salary">Salary</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
              <MenuItem value="Freelancing">Freelancing</MenuItem>
              <MenuItem value="Rental Income">Rental Income</MenuItem>
              <MenuItem value="Investments">Investments</MenuItem>
              <MenuItem value="Pension">Pension</MenuItem>
              <MenuItem value="Bonus">Bonus</MenuItem>
              <MenuItem value="Gifts">Gifts</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </TextField>
            <TextField
              required
              type="number"
              label="Amount (₹)"
              value={incomeForm.amount || ''}
              onChange={(e) => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
            />
            <TextField
              type="date"
              label="Date Received"
              value={incomeForm.date}
              onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
            />
            <TextField
              select
              label="Payment Channel"
              value={incomeForm.paymentMethod}
              onChange={(e) => setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })}
            >
              <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Debit Card">Debit Card</MenuItem>
            </TextField>
            <TextField
              select
              label="Recurring Option"
              value={incomeForm.recurring}
              onChange={(e) => setIncomeForm({ ...incomeForm, recurring: e.target.value as any })}
            >
              <MenuItem value="none">One time only</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
            <TextField
              multiline
              rows={2}
              label="Additional Notes"
              value={incomeForm.notes}
              onChange={(e) => setIncomeForm({ ...incomeForm, notes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIncomeModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">{selectedIncome ? 'Save Changes' : 'Log Transaction'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* EXPENSE LOG MODAL */}
      <Dialog open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)}>
        <DialogTitle>{selectedExpense ? 'Edit Expense record' : 'Log Expense transaction'}</DialogTitle>
        <form onSubmit={handleAddExpense}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Expense Name"
              value={expenseForm.expenseName}
              onChange={(e) => setExpenseForm({ ...expenseForm, expenseName: e.target.value })}
            />
            <TextField
              select
              label="Category"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
            >
              {['Food', 'Groceries', 'Rent', 'Electricity', 'Water', 'Gas', 'Internet', 'Mobile Recharge', 'Fuel', 'Transportation', 'Medical', 'Pharmacy', 'Education', 'Shopping', 'Entertainment', 'Travel', 'House Maintenance', 'Insurance', 'EMI', 'Pets', 'Donations', 'Investments', 'Miscellaneous'].map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField
              required
              type="number"
              label="Amount (₹)"
              value={expenseForm.amount || ''}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
            />
            <TextField
              type="date"
              label="Transaction Date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
            />
            <TextField
              select
              label="Payment Method"
              value={expenseForm.paymentMethod}
              onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
            >
              <MenuItem value="UPI">GPay / PhonePe UPI</MenuItem>
              <MenuItem value="Credit Card">SBI Credit Card</MenuItem>
              <MenuItem value="Debit Card">HDFC Debit Card</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Transfer">NetBanking / NEFT</MenuItem>
            </TextField>
            <TextField
              label="Vendor / Store Name"
              value={expenseForm.vendor}
              onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
            />
            <TextField
              select
              label="Assign to Family Member"
              value={expenseForm.familyMember}
              onChange={(e) => setExpenseForm({ ...expenseForm, familyMember: e.target.value })}
            >
              <MenuItem value="Self">Self</MenuItem>
              <MenuItem value="Wife">Wife</MenuItem>
              <MenuItem value="Daughter">Daughter</MenuItem>
              <MenuItem value="Father">Father</MenuItem>
              {familyMembers.map(m => (
                <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={expenseForm.isBusiness}
                  onChange={(e) => setExpenseForm({ ...expenseForm, isBusiness: e.target.checked })}
                />
              }
              label="Business related expense (Tax deductible)"
            />
            <TextField
              select
              label="Recurring Pattern"
              value={expenseForm.recurring}
              onChange={(e) => setExpenseForm({ ...expenseForm, recurring: e.target.value as any })}
            >
              <MenuItem value="none">One time only</MenuItem>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
            <TextField
              label="Add Tag (press enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (tagInput.trim() && !expenseForm.tags.includes(tagInput.trim())) {
                    setExpenseForm({ ...expenseForm, tags: [...expenseForm.tags, tagInput.trim()] });
                    setTagInput('');
                  }
                }
              }}
            />
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              {expenseForm.tags.map(t => (
                <Chip
                  key={t}
                  label={t}
                  onDelete={() => setExpenseForm({ ...expenseForm, tags: expenseForm.tags.filter(x => x !== t) })}
                />
              ))}
            </Stack>
            <TextField
              multiline
              rows={2}
              label="Memo / Notes"
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExpenseModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">{selectedExpense ? 'Save Changes' : 'Log Expense'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CONFIGURE BUDGET MODAL */}
      <Dialog open={budgetModalOpen} onClose={() => setBudgetModalOpen(false)}>
        <DialogTitle>Set Category Monthly Budget</DialogTitle>
        <form onSubmit={handleAddBudget}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              select
              label="Category"
              value={budgetForm.category}
              onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
            >
              {['Food', 'Groceries', 'Rent', 'Electricity', 'Water', 'Gas', 'Internet', 'Mobile Recharge', 'Fuel', 'Transportation', 'Medical', 'Pharmacy', 'Education', 'Shopping', 'Entertainment', 'Travel', 'House Maintenance', 'Insurance', 'EMI', 'Pets', 'Donations', 'Investments', 'Miscellaneous'].map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField
              required
              type="number"
              label="Limit Amount (₹)"
              value={budgetForm.amount || ''}
              onChange={(e) => setBudgetForm({ ...budgetForm, amount: Number(e.target.value) })}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <TextField
                  type="number"
                  label="Month (1-12)"
                  value={budgetForm.month || ''}
                  onChange={(e) => setBudgetForm({ ...budgetForm, month: Number(e.target.value) })}
                />
              </Box>
              <Box>
                <TextField
                  type="number"
                  label="Year"
                  value={budgetForm.year}
                  onChange={(e) => setBudgetForm({ ...budgetForm, year: Number(e.target.value) })}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBudgetModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">Establish Budget</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CREATE BILL TRACKER MODAL */}
      <Dialog open={billModalOpen} onClose={() => setBillModalOpen(false)}>
        <DialogTitle>Track New Utility Bill</DialogTitle>
        <form onSubmit={handleAddBill}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Bill Provider (e.g. Jio Fibernet)"
              value={billForm.title}
              onChange={(e) => setBillForm({ ...billForm, title: e.target.value })}
            />
            <TextField
              select
              label="Utility Type"
              value={billForm.category}
              onChange={(e) => setBillForm({ ...billForm, category: e.target.value as any })}
            >
              {['Electricity', 'Water', 'Internet', 'Mobile', 'Rent', 'Credit Card', 'Gas', 'Insurance', 'EMI', 'Others'].map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField
              required
              type="number"
              label="Expected Amount (₹)"
              value={billForm.amount || ''}
              onChange={(e) => setBillForm({ ...billForm, amount: Number(e.target.value) })}
            />
            <TextField
              type="date"
              label="Next Due Date"
              value={billForm.dueDate}
              onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
            />
            <TextField
              type="number"
              label="Notify Days Before Due"
              value={billForm.reminderDays}
              onChange={(e) => setBillForm({ ...billForm, reminderDays: Number(e.target.value) })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={billForm.autoRecurring}
                  onChange={(e) => setBillForm({ ...billForm, autoRecurring: e.target.checked })}
                />
              }
              label="Autopay ON (Auto pays from Bank on due date)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBillModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">Configure Tracker</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* SAVINGS GOAL MODAL */}
      <Dialog open={goalModalOpen} onClose={() => setGoalModalOpen(false)}>
        <DialogTitle>Configure New Savings Goal</DialogTitle>
        <form onSubmit={handleAddGoal}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Goal Target Name (e.g. New Car)"
              value={goalForm.goalName}
              onChange={(e) => setGoalForm({ ...goalForm, goalName: e.target.value })}
            />
            <TextField
              select
              label="Target Category"
              value={goalForm.category}
              onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value as any })}
            >
              {['Emergency Fund', 'Vacation', 'New Car', 'House', 'Bike', 'Wedding', 'Education', 'Others'].map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField
              required
              type="number"
              label="Target Amount (₹)"
              value={goalForm.targetAmount || ''}
              onChange={(e) => setGoalForm({ ...goalForm, targetAmount: Number(e.target.value) })}
            />
            <TextField
              type="number"
              label="Initial Amount Saved (₹)"
              value={goalForm.currentAmount || ''}
              onChange={(e) => setGoalForm({ ...goalForm, currentAmount: Number(e.target.value) })}
            />
            <TextField
              type="date"
              label="Estimated Completion Date"
              value={goalForm.targetDate}
              onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGoalModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">Establish Goal</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* LOAN REGISTER MODAL */}
      <Dialog open={loanModalOpen} onClose={() => setLoanModalOpen(false)}>
        <DialogTitle>Configure New Loan Tracker</DialogTitle>
        <form onSubmit={handleAddLoan}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Bank / Loan Account Name"
              value={loanForm.loanName}
              onChange={(e) => setLoanForm({ ...loanForm, loanName: e.target.value })}
            />
            <TextField
              select
              label="Loan Type"
              value={loanForm.loanType}
              onChange={(e) => setLoanForm({ ...loanForm, loanType: e.target.value as any })}
            >
              <MenuItem value="Home Loan">Home Loan</MenuItem>
              <MenuItem value="Personal Loan">Personal Loan</MenuItem>
              <MenuItem value="Car Loan">Car Loan</MenuItem>
              <MenuItem value="Education Loan">Education Loan</MenuItem>
            </TextField>
            <TextField
              required
              type="number"
              label="Total Principal Borrowed (₹)"
              value={loanForm.loanAmount || ''}
              onChange={(e) => setLoanForm({ ...loanForm, loanAmount: Number(e.target.value), remainingBalance: Number(e.target.value) })}
            />
            <TextField
              required
              type="number"
              label="Interest Rate P.A. (%)"
              value={loanForm.interestRate || ''}
              onChange={(e) => setLoanForm({ ...loanForm, interestRate: Number(e.target.value) })}
            />
            <TextField
              required
              type="number"
              label="Monthly EMI Amount (₹)"
              value={loanForm.emiAmount || ''}
              onChange={(e) => setLoanForm({ ...loanForm, emiAmount: Number(e.target.value) })}
            />
            <TextField
              type="date"
              label="EMI Due Date"
              value={loanForm.dueDate}
              onChange={(e) => setLoanForm({ ...loanForm, dueDate: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLoanModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">Link Account</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* INVESTMENT LOG MODAL */}
      <Dialog open={investmentModalOpen} onClose={() => setInvestmentModalOpen(false)}>
        <DialogTitle>Log Portfolio Asset Purchase</DialogTitle>
        <form onSubmit={handleAddInvestment}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Asset Name (e.g. Nifty Index)"
              value={investmentForm.name}
              onChange={(e) => setInvestmentForm({ ...investmentForm, name: e.target.value })}
            />
            <TextField
              select
              label="Investment Type"
              value={investmentForm.type}
              onChange={(e) => setInvestmentForm({ ...investmentForm, type: e.target.value as any })}
            >
              <MenuItem value="Mutual Funds">Mutual Funds</MenuItem>
              <MenuItem value="Stocks">Stocks</MenuItem>
              <MenuItem value="SIP">SIP</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
              <MenuItem value="Fixed Deposits">Fixed Deposits</MenuItem>
              <MenuItem value="Crypto">Crypto</MenuItem>
            </TextField>
            <TextField
              required
              type="number"
              label="Invested Principal Amount (₹)"
              value={investmentForm.investedAmount || ''}
              onChange={(e) => setInvestmentForm({ ...investmentForm, investedAmount: Number(e.target.value), currentValue: Number(e.target.value) })}
            />
            <TextField
              type="date"
              label="Purchase Date"
              value={investmentForm.purchaseDate}
              onChange={(e) => setInvestmentForm({ ...investmentForm, purchaseDate: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInvestmentModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">Link Asset</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ASSET REGISTER MODAL */}
      <Dialog open={assetModalOpen} onClose={() => setAssetModalOpen(false)}>
        <DialogTitle>Register Property Asset Valuation</DialogTitle>
        <form onSubmit={handleAddAsset}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Asset Name (e.g. Creta SUV)"
              value={assetForm.name}
              onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
            />
            <TextField
              select
              label="Asset Class"
              value={assetForm.assetType}
              onChange={(e) => setAssetForm({ ...assetForm, assetType: e.target.value as any })}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Bank Accounts">Bank Accounts</MenuItem>
              <MenuItem value="Gold">Gold</MenuItem>
              <MenuItem value="Vehicles">Vehicles</MenuItem>
              <MenuItem value="Property">Property</MenuItem>
              <MenuItem value="Investments">Investments</MenuItem>
            </TextField>
            <TextField
              required
              type="number"
              label="Estimated Market Value (₹)"
              value={assetForm.estimatedValue || ''}
              onChange={(e) => setAssetForm({ ...assetForm, estimatedValue: Number(e.target.value) })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssetModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">Log Asset</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DEBT MODAL */}
      <Dialog open={debtModalOpen} onClose={() => setDebtModalOpen(false)}>
        <DialogTitle>Log Borrowed / Lent Funds</DialogTitle>
        <form onSubmit={handleAddDebt}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
            <TextField
              required
              label="Counterparty Name"
              value={debtForm.personName}
              onChange={(e) => setDebtForm({ ...debtForm, personName: e.target.value })}
            />
            <TextField
              select
              label="Transaction Type"
              value={debtForm.type}
              onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value as any })}
            >
              <MenuItem value="borrowed">Borrowed from them (Liability)</MenuItem>
              <MenuItem value="lent">Lent to them (Receivable)</MenuItem>
            </TextField>
            <TextField
              required
              type="number"
              label="Debt Principal (₹)"
              value={debtForm.amount || ''}
              onChange={(e) => setDebtForm({ ...debtForm, amount: Number(e.target.value) })}
            />
            <TextField
              type="number"
              label="Interest Rate (%)"
              value={debtForm.interestRate || ''}
              onChange={(e) => setDebtForm({ ...debtForm, interestRate: Number(e.target.value) })}
            />
            <TextField
              type="date"
              label="Repayment Due Date"
              value={debtForm.dueDate}
              onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDebtModalOpen(false)} variant="outlined">Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CURRENT BALANCE BREAKDOWN DIALOG */}
      <Dialog open={balanceModalOpen} onClose={() => setBalanceModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Remaining Balance Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary">Total Income</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#10b981' }}>
                ₹{dashboardStats.totalIncome.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary">Total Expenses</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#ef4444' }}>
                - ₹{dashboardStats.totalExpenses.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Remaining Balance</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#4f46e5' }}>
                ₹{dashboardStats.currentBalance.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', display: 'block' }}>
              Remaining balance calculated in real-time as total registered income minus total registered expenses.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalanceModalOpen(false)} variant="contained" fullWidth sx={{ textTransform: 'none', borderRadius: 2 }}>
            Close Details
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAMILY MEMBER CREDENTIALS DIALOG */}
      <Dialog open={Boolean(selectedMemberCreds)} onClose={() => setSelectedMemberCreds(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Family Member Credentials</DialogTitle>
        <DialogContent>
          {selectedMemberCreds && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, pt: 2 }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: selectedMemberCreds.avatarColor, fontSize: '1.5rem', fontWeight: 700 }}>
                {selectedMemberCreds.name[0]}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedMemberCreds.name}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedMemberCreds.relationship}</Typography>
              </Box>
              
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, bgcolor: 'action.hover', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Portal Username</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
                      {selectedMemberCreds.username || 'Creating Account...'}
                    </Typography>
                    {selectedMemberCreds.username && (
                      <Button size="small" variant="text" sx={{ textTransform: 'none', py: 0 }} onClick={() => { navigator.clipboard.writeText(selectedMemberCreds.username); triggerToast('Username copied!'); }}>
                        Copy
                      </Button>
                    )}
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Portal Password</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      {selectedMemberCreds.password || 'Creating Account...'}
                    </Typography>
                    {selectedMemberCreds.password && (
                      <Button size="small" variant="text" sx={{ textTransform: 'none', py: 0 }} onClick={() => { navigator.clipboard.writeText(selectedMemberCreds.password); triggerToast('Password copied!'); }}>
                        Copy
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="caption" color="text.secondary" align="center">
                This family member can log in to the portal using these credentials to view and manage their household expenses.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMemberCreds(null)} variant="contained" fullWidth sx={{ textTransform: 'none', borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
