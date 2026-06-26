// Clarity Home Personal Finance Database Schema and Management Utility
// Backed by localStorage with full CRUD, auto-seeding, recurring transactions scheduler, and backup/restore.

export interface Income {
  id: string;
  title: string;
  category: 'Salary' | 'Business' | 'Freelancing' | 'Rental Income' | 'Investments' | 'Pension' | 'Bonus' | 'Gifts' | 'Others';
  amount: number;
  date: string;
  paymentMethod: string;
  notes: string;
  attachment?: string; // base64 string
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Expense {
  id: string;
  expenseName: string;
  category: 'Food' | 'Groceries' | 'Rent' | 'Electricity' | 'Water' | 'Gas' | 'Internet' | 'Mobile Recharge' | 'Fuel' | 'Transportation' | 'Medical' | 'Pharmacy' | 'Education' | 'Shopping' | 'Entertainment' | 'Travel' | 'House Maintenance' | 'Insurance' | 'EMI' | 'Pets' | 'Donations' | 'Investments' | 'Miscellaneous';
  amount: number;
  date: string;
  paymentMethod: string;
  vendor: string;
  notes: string;
  receiptUrl?: string; // base64 or placeholder
  tags: string[];
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  familyMember: string;
  isBusiness: boolean;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  year: number;
  month?: number; // 1-12
}

export interface Bill {
  id: string;
  title: string;
  category: 'Electricity' | 'Water' | 'Internet' | 'Mobile' | 'Rent' | 'Credit Card' | 'Gas' | 'Insurance' | 'EMI' | 'Others';
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid';
  reminderDays: number;
  autoRecurring: boolean;
}

export interface SavingsGoal {
  id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  category: 'Emergency Fund' | 'Vacation' | 'New Car' | 'House' | 'Bike' | 'Wedding' | 'Education' | 'Others';
  targetDate: string;
}

export interface Loan {
  id: string;
  loanName: string;
  loanType: 'Home Loan' | 'Personal Loan' | 'Car Loan' | 'Education Loan';
  loanAmount: number;
  interestRate: number;
  emiAmount: number;
  dueDate: string;
  remainingBalance: number;
  paymentHistory: { date: string; amount: number }[];
}

export interface Investment {
  id: string;
  name: string;
  type: 'Mutual Funds' | 'Stocks' | 'SIP' | 'Gold' | 'Fixed Deposits' | 'Crypto';
  investedAmount: number;
  currentValue: number;
  purchaseDate: string;
}

export interface Asset {
  id: string;
  name: string;
  assetType: 'Cash' | 'Bank Accounts' | 'Gold' | 'Vehicles' | 'Property' | 'Investments';
  estimatedValue: number;
}

export interface Debt {
  id: string;
  personName: string;
  type: 'borrowed' | 'lent';
  amount: number;
  dueDate: string;
  interestRate: number;
  paidStatus: 'Paid' | 'Unpaid';
}

export interface WishlistItem {
  id: string;
  itemName: string;
  estimatedPrice: number;
  priority: 'High' | 'Medium' | 'Low';
  targetDate: string;
  notes: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'budget' | 'bill' | 'emi' | 'goal' | 'investment' | 'summary' | 'recurring';
  read: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  avatarColor: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Cash' | 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Wallet';
}

// Initial Configuration Settings
export interface ClarityHomeSettings {
  currency: string;
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  themeMode: 'light' | 'dark';
}

const STORAGE_KEYS = {
  INCOME: 'ch_income',
  EXPENSES: 'ch_expenses',
  BUDGETS: 'ch_budgets',
  BILLS: 'ch_bills',
  SAVINGS_GOALS: 'ch_savings_goals',
  LOANS: 'ch_loans',
  INVESTMENTS: 'ch_investments',
  ASSETS: 'ch_assets',
  DEBTS: 'ch_debts',
  WISHLIST: 'ch_wishlist',
  NOTIFICATIONS: 'ch_notifications',
  FAMILY_MEMBERS: 'ch_family_members',
  PAYMENT_METHODS: 'ch_payment_methods',
  SETTINGS: 'ch_settings',
  ACTIVITY_LOGS: 'ch_activity_logs',
  LAST_SCHEDULER_RUN: 'ch_last_scheduler_run'
};

// Seed initial data
const SEED_DATA = {
  income: [
    { id: 'inc-1', title: 'Monthly Salary Payment', category: 'Salary', amount: 85000, date: '2026-06-01', paymentMethod: 'Bank Transfer', notes: 'Primary job monthly payout', recurring: 'monthly' },
    { id: 'inc-2', title: 'Freelance UI Project', category: 'Freelancing', amount: 15000, date: '2026-06-12', paymentMethod: 'UPI', notes: 'Landing page design work', recurring: 'none' },
    { id: 'inc-3', title: 'Quarterly Dividends', category: 'Investments', amount: 4200, date: '2026-06-20', paymentMethod: 'Bank Transfer', notes: 'Index fund payouts', recurring: 'none' }
  ] as Income[],

  expenses: [
    { id: 'exp-1', expenseName: 'Monthly Apartment Rent', category: 'Rent', amount: 22000, date: '2026-06-02', paymentMethod: 'Bank Transfer', vendor: 'Landlord Sharma', notes: 'Includes parking maintenance', tags: ['household', 'rent'], recurring: 'monthly', familyMember: 'Self', isBusiness: false },
    { id: 'exp-2', expenseName: 'Supermarket Groceries', category: 'Groceries', amount: 4850, date: '2026-06-10', paymentMethod: 'Debit Card', vendor: 'Reliance Smart', notes: 'Weekly pantry restocking', tags: ['food', 'groceries'], recurring: 'none', familyMember: 'Wife', isBusiness: false },
    { id: 'exp-3', expenseName: 'Electric Bill', category: 'Electricity', amount: 3200, date: '2026-06-05', paymentMethod: 'UPI', vendor: 'State Electricity board', notes: 'Summer AC usage bill', tags: ['utilities'], recurring: 'monthly', familyMember: 'Self', isBusiness: false },
    { id: 'exp-4', expenseName: 'Fuel refill', category: 'Fuel', amount: 2500, date: '2026-06-18', paymentMethod: 'Credit Card', vendor: 'HP Petrol Pump', notes: 'Full tank car fuel', tags: ['travel', 'car'], recurring: 'none', familyMember: 'Self', isBusiness: false },
    { id: 'exp-5', expenseName: 'Dinner & Movies', category: 'Entertainment', amount: 3600, date: '2026-06-22', paymentMethod: 'Credit Card', vendor: 'PVR & Restaurant', notes: 'Family weekend outing', tags: ['fun', 'family'], recurring: 'none', familyMember: 'Daughter', isBusiness: false },
    { id: 'exp-6', expenseName: 'Office Chair', category: 'Shopping', amount: 8500, date: '2026-06-15', paymentMethod: 'Credit Card', vendor: 'Amazon India', notes: 'Ergonomic chair for home office', tags: ['office', 'furniture'], recurring: 'none', familyMember: 'Self', isBusiness: true }
  ] as Expense[],

  budgets: [
    { id: 'bud-1', category: 'Groceries', amount: 12000, period: 'monthly', year: 2026, month: 6 },
    { id: 'bud-2', category: 'Rent', amount: 22000, period: 'monthly', year: 2026, month: 6 },
    { id: 'bud-3', category: 'Electricity', amount: 4000, period: 'monthly', year: 2026, month: 6 },
    { id: 'bud-4', category: 'Entertainment', amount: 8000, period: 'monthly', year: 2026, month: 6 },
    { id: 'bud-5', category: 'Shopping', amount: 15000, period: 'monthly', year: 2026, month: 6 }
  ] as Budget[],

  bills: [
    { id: 'bil-1', title: 'Water Authority Bill', category: 'Water', amount: 650, dueDate: '2026-07-02', status: 'Unpaid', reminderDays: 5, autoRecurring: true },
    { id: 'bil-2', title: 'High-speed Fibernet', category: 'Internet', amount: 999, dueDate: '2026-06-28', status: 'Paid', reminderDays: 3, autoRecurring: true },
    { id: 'bil-3', title: 'Mobile Postpaid Combo', category: 'Mobile', amount: 799, dueDate: '2026-07-05', status: 'Unpaid', reminderDays: 2, autoRecurring: true }
  ] as Bill[],

  savingsGoals: [
    { id: 'goal-1', goalName: '6-Month Emergency Fund', targetAmount: 250000, currentAmount: 180000, category: 'Emergency Fund', targetDate: '2026-12-31' },
    { id: 'goal-2', goalName: 'Europe Vacation 2027', targetAmount: 400000, currentAmount: 85000, category: 'Vacation', targetDate: '2027-05-15' },
    { id: 'goal-3', goalName: 'Downpayment for SUV', targetAmount: 300000, currentAmount: 210000, category: 'New Car', targetDate: '2026-10-01' }
  ] as SavingsGoal[],

  loans: [
    { id: 'loan-1', loanName: 'HDFC Home Loan', loanType: 'Home Loan', loanAmount: 4500000, interestRate: 8.5, emiAmount: 38500, dueDate: '2026-07-05', remainingBalance: 3950000, paymentHistory: [{ date: '2026-06-05', amount: 38500 }, { date: '2026-05-05', amount: 38500 }] },
    { id: 'loan-2', loanName: 'Car Finance Loan', loanType: 'Car Loan', loanAmount: 800000, interestRate: 9.2, emiAmount: 14200, dueDate: '2026-07-10', remainingBalance: 420000, paymentHistory: [{ date: '2026-06-10', amount: 14200 }] }
  ] as Loan[],

  investments: [
    { id: 'inv-1', name: 'Nifty 50 Index Fund SIP', type: 'Mutual Funds', investedAmount: 120000, currentValue: 142500, purchaseDate: '2025-01-10' },
    { id: 'inv-2', name: 'HDFC Bank Equity Shares', type: 'Stocks', investedAmount: 65000, currentValue: 62400, purchaseDate: '2025-06-15' },
    { id: 'inv-3', name: 'Physical Gold Coins', type: 'Gold', investedAmount: 95000, currentValue: 112000, purchaseDate: '2024-03-20' },
    { id: 'inv-4', name: 'Ethereum Wallet HODL', type: 'Crypto', investedAmount: 40000, currentValue: 47200, purchaseDate: '2025-11-05' }
  ] as Investment[],

  assets: [
    { id: 'ast-1', name: 'Primary Bank Savings Account', assetType: 'Bank Accounts', estimatedValue: 145000 },
    { id: 'ast-2', name: 'Cash on Hand (Safe)', assetType: 'Cash', estimatedValue: 12000 },
    { id: 'ast-3', name: 'Investment Equity Portfolio', assetType: 'Investments', estimatedValue: 364100 },
    { id: 'ast-4', name: 'Hyundai Creta SUV', assetType: 'Vehicles', estimatedValue: 950000 }
  ] as Asset[],

  debts: [
    { id: 'deb-1', personName: 'Vikram Singh (Brother)', type: 'lent', amount: 25000, dueDate: '2026-08-15', interestRate: 0, paidStatus: 'Unpaid' },
    { id: 'deb-2', personName: 'Anil Kumar (Colleague)', type: 'borrowed', amount: 8000, dueDate: '2026-06-30', interestRate: 0, paidStatus: 'Unpaid' }
  ] as Debt[],

  wishlist: [
    { id: 'wish-1', itemName: 'Sony WH-1000XM5 Headphones', estimatedPrice: 27990, priority: 'High', targetDate: '2026-09-10', notes: 'ANC is essential for online tutoring sessions' },
    { id: 'wish-2', itemName: 'Dual Monitor Stand', estimatedPrice: 3500, priority: 'Medium', targetDate: '2026-07-20', notes: 'To clear desk space and improve posture' },
    { id: 'wish-3', itemName: 'MacBook Air M3', estimatedPrice: 114900, priority: 'Low', targetDate: '2026-12-25', notes: 'Performance upgrade' }
  ] as WishlistItem[],

  familyMembers: [
    { id: 'fam-1', name: 'Self', relationship: 'Account Owner', avatarColor: '#3f51b5' },
    { id: 'fam-2', name: 'Wife', relationship: 'Spouse', avatarColor: '#e91e63' },
    { id: 'fam-3', name: 'Daughter', relationship: 'Child', avatarColor: '#ff9800' },
    { id: 'fam-4', name: 'Father', relationship: 'Parent', avatarColor: '#4caf50' }
  ] as FamilyMember[],

  paymentMethods: [
    { id: 'pm-1', name: 'Cash', type: 'Cash' },
    { id: 'pm-2', name: 'GPay / PhonePe UPI', type: 'UPI' },
    { id: 'pm-3', name: 'SBI Credit Card', type: 'Credit Card' },
    { id: 'pm-4', name: 'HDFC Debit Card', type: 'Debit Card' },
    { id: 'pm-5', name: 'NetBanking Account', type: 'Bank Transfer' },
    { id: 'pm-6', name: 'Paytm Wallet', type: 'Wallet' }
  ] as PaymentMethod[],

  settings: {
    currency: 'INR',
    notificationsEnabled: true,
    twoFactorEnabled: false,
    themeMode: 'light'
  } as ClarityHomeSettings,

  notifications: [
    { id: 'not-1', title: 'Welcome to Clarity Home!', message: 'Your Home Expense Management dashboard is ready. Seeded with initial tracking entries.', date: '2026-06-25T09:00:00Z', type: 'summary', read: false },
    { id: 'not-2', title: 'Budget Limit Warning', message: 'You have used 70.8% of your Groceries category monthly budget.', date: '2026-06-24T18:30:00Z', type: 'budget', read: false },
    { id: 'not-3', title: 'Bill Payment Due soon', message: 'Your bill High-speed Fibernet due on 2026-06-28 is marked paid.', date: '2026-06-25T10:15:00Z', type: 'bill', read: true }
  ] as Notification[],

  activityLogs: [
    { id: 'log-1', action: 'Initialize Database', timestamp: new Date().toISOString(), details: 'Successfully configured Clarity Home local schema.' }
  ] as ActivityLog[]
};

export const clarityHomeDb = {
  // Initialize Database
  init: () => {
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      if (!localStorage.getItem(storageKey)) {
        const seedValue = SEED_DATA[key.toLowerCase() as keyof typeof SEED_DATA];
        if (seedValue) {
          localStorage.setItem(storageKey, JSON.stringify(seedValue));
        }
      }
    });

    if (!localStorage.getItem(STORAGE_KEYS.LAST_SCHEDULER_RUN)) {
      localStorage.setItem(STORAGE_KEYS.LAST_SCHEDULER_RUN, new Date().toISOString().slice(0, 10));
    }

    // Run Recurring Transactions Scheduler on Load
    clarityHomeDb.runRecurringScheduler();
  },

  getData: <T>(key: string): T => {
    const data = localStorage.getItem(key);
    return (data ? JSON.parse(data) : []) as T;
  },

  saveData: <T>(key: string, data: T): void => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Logs Action
  logActivity: (action: string, details: string) => {
    const logs = clarityHomeDb.getData<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS);
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    clarityHomeDb.saveData(STORAGE_KEYS.ACTIVITY_LOGS, [newLog, ...logs].slice(0, 100)); // cap at 100
  },

  // Notifications Creator
  addNotification: (title: string, message: string, type: Notification['type']) => {
    const notifs = clarityHomeDb.getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS);
    const newNotif: Notification = {
      id: `not-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      type,
      read: false
    };
    clarityHomeDb.saveData(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...notifs]);
  },

  // Income Methods
  getIncome: () => clarityHomeDb.getData<Income[]>(STORAGE_KEYS.INCOME),
  saveIncome: (list: Income[]) => clarityHomeDb.saveData(STORAGE_KEYS.INCOME, list),
  addIncome: (inc: Omit<Income, 'id'>) => {
    const list = clarityHomeDb.getIncome();
    const newItem = { ...inc, id: `inc-${Date.now()}` };
    clarityHomeDb.saveIncome([...list, newItem]);
    clarityHomeDb.logActivity('Add Income', `Added income "${inc.title}" of amount ${inc.amount}`);
    return newItem;
  },
  updateIncome: (id: string, updated: Partial<Income>) => {
    const list = clarityHomeDb.getIncome();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveIncome(updatedList);
    clarityHomeDb.logActivity('Update Income', `Updated income ID ${id}`);
  },
  deleteIncome: (id: string) => {
    const list = clarityHomeDb.getIncome();
    const item = list.find(x => x.id === id);
    clarityHomeDb.saveIncome(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Income', `Deleted income "${item?.title || id}"`);
  },

  // Expenses Methods
  getExpenses: () => clarityHomeDb.getData<Expense[]>(STORAGE_KEYS.EXPENSES),
  saveExpenses: (list: Expense[]) => clarityHomeDb.saveData(STORAGE_KEYS.EXPENSES, list),
  addExpense: (exp: Omit<Expense, 'id'>) => {
    const list = clarityHomeDb.getExpenses();
    const newItem = { ...exp, id: `exp-${Date.now()}` };
    clarityHomeDb.saveExpenses([...list, newItem]);
    clarityHomeDb.logActivity('Add Expense', `Added expense "${exp.expenseName}" of amount ${exp.amount}`);

    // Check Budget Limit Exceeded for Category
    clarityHomeDb.checkBudgetAlerts(exp.category, exp.date);

    return newItem;
  },
  updateExpense: (id: string, updated: Partial<Expense>) => {
    const list = clarityHomeDb.getExpenses();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveExpenses(updatedList);
    clarityHomeDb.logActivity('Update Expense', `Updated expense ID ${id}`);
  },
  deleteExpense: (id: string) => {
    const list = clarityHomeDb.getExpenses();
    const item = list.find(x => x.id === id);
    clarityHomeDb.saveExpenses(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Expense', `Deleted expense "${item?.expenseName || id}"`);
  },
  duplicateExpense: (id: string) => {
    const list = clarityHomeDb.getExpenses();
    const source = list.find(x => x.id === id);
    if (source) {
      const newItem = {
        ...source,
        id: `exp-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        expenseName: `${source.expenseName} (Copy)`
      };
      clarityHomeDb.saveExpenses([...list, newItem]);
      clarityHomeDb.logActivity('Duplicate Expense', `Duplicated expense "${source.expenseName}"`);
      return newItem;
    }
  },

  // Budget Methods
  getBudgets: () => clarityHomeDb.getData<Budget[]>(STORAGE_KEYS.BUDGETS),
  saveBudgets: (list: Budget[]) => clarityHomeDb.saveData(STORAGE_KEYS.BUDGETS, list),
  addBudget: (b: Omit<Budget, 'id'>) => {
    const list = clarityHomeDb.getBudgets();
    const newItem = { ...b, id: `bud-${Date.now()}` };
    clarityHomeDb.saveBudgets([...list, newItem]);
    clarityHomeDb.logActivity('Add Budget', `Created budget for "${b.category}" with amount ${b.amount}`);
    return newItem;
  },
  updateBudget: (id: string, updated: Partial<Budget>) => {
    const list = clarityHomeDb.getBudgets();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveBudgets(updatedList);
    clarityHomeDb.logActivity('Update Budget', `Updated budget ID ${id}`);
  },
  deleteBudget: (id: string) => {
    const list = clarityHomeDb.getBudgets();
    clarityHomeDb.saveBudgets(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Budget', `Deleted budget ID ${id}`);
  },

  checkBudgetAlerts: (category: string, dateStr: string) => {
    const year = new Date(dateStr).getFullYear();
    const month = new Date(dateStr).getMonth() + 1;

    const budgets = clarityHomeDb.getBudgets();
    const budget = budgets.find(b => b.category === category && b.year === year && b.month === month);

    if (budget) {
      const expenses = clarityHomeDb.getExpenses();
      const currentSpent = expenses
        .filter(e => e.category === category && new Date(e.date).getFullYear() === year && (new Date(e.date).getMonth() + 1) === month)
        .reduce((sum, e) => sum + e.amount, 0);

      if (currentSpent > budget.amount) {
        clarityHomeDb.addNotification(
          'Budget Overrun Alert!',
          `Category "${category}" monthly budget of ${budget.amount} has been exceeded (Current spent: ${currentSpent}).`,
          'budget'
        );
      } else if (currentSpent > budget.amount * 0.8) {
        clarityHomeDb.addNotification(
          'Budget limit nearing',
          `You have spent 80%+ of category "${category}" monthly budget (${currentSpent} of ${budget.amount}).`,
          'budget'
        );
      }
    }
  },

  // Bills Methods
  getBills: () => clarityHomeDb.getData<Bill[]>(STORAGE_KEYS.BILLS),
  saveBills: (list: Bill[]) => clarityHomeDb.saveData(STORAGE_KEYS.BILLS, list),
  addBill: (b: Omit<Bill, 'id'>) => {
    const list = clarityHomeDb.getBills();
    const newItem = { ...b, id: `bil-${Date.now()}` };
    clarityHomeDb.saveBills([...list, newItem]);
    clarityHomeDb.logActivity('Add Bill', `Created bill tracker for "${b.title}"`);
    return newItem;
  },
  updateBill: (id: string, updated: Partial<Bill>) => {
    const list = clarityHomeDb.getBills();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveBills(updatedList);
    clarityHomeDb.logActivity('Update Bill', `Updated bill ID ${id}`);
  },
  deleteBill: (id: string) => {
    const list = clarityHomeDb.getBills();
    clarityHomeDb.saveBills(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Bill', `Deleted bill tracker ID ${id}`);
  },

  // Savings Goals Methods
  getSavingsGoals: () => clarityHomeDb.getData<SavingsGoal[]>(STORAGE_KEYS.SAVINGS_GOALS),
  saveSavingsGoals: (list: SavingsGoal[]) => clarityHomeDb.saveData(STORAGE_KEYS.SAVINGS_GOALS, list),
  addSavingsGoal: (g: Omit<SavingsGoal, 'id'>) => {
    const list = clarityHomeDb.getSavingsGoals();
    const newItem = { ...g, id: `goal-${Date.now()}` };
    clarityHomeDb.saveSavingsGoals([...list, newItem]);
    clarityHomeDb.logActivity('Add Savings Goal', `Created goal "${g.goalName}" with target ${g.targetAmount}`);
    return newItem;
  },
  updateSavingsGoal: (id: string, updated: Partial<SavingsGoal>) => {
    const list = clarityHomeDb.getSavingsGoals();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveSavingsGoals(updatedList);
    clarityHomeDb.logActivity('Update Savings Goal', `Updated savings goal ID ${id}`);
  },
  deleteSavingsGoal: (id: string) => {
    const list = clarityHomeDb.getSavingsGoals();
    clarityHomeDb.saveSavingsGoals(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Savings Goal', `Deleted goal ID ${id}`);
  },

  // Loans Methods
  getLoans: () => clarityHomeDb.getData<Loan[]>(STORAGE_KEYS.LOANS),
  saveLoans: (list: Loan[]) => clarityHomeDb.saveData(STORAGE_KEYS.LOANS, list),
  addLoan: (l: Omit<Loan, 'id'>) => {
    const list = clarityHomeDb.getLoans();
    const newItem = { ...l, id: `loan-${Date.now()}` };
    clarityHomeDb.saveLoans([...list, newItem]);
    clarityHomeDb.logActivity('Add Loan', `Added loan track "${l.loanName}"`);
    return newItem;
  },
  updateLoan: (id: string, updated: Partial<Loan>) => {
    const list = clarityHomeDb.getLoans();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveLoans(updatedList);
    clarityHomeDb.logActivity('Update Loan', `Updated loan details ID ${id}`);
  },
  payLoanEMI: (id: string) => {
    const list = clarityHomeDb.getLoans();
    const loan = list.find(x => x.id === id);
    if (loan) {
      const today = new Date().toISOString().slice(0, 10);
      const updatedLoan = {
        ...loan,
        remainingBalance: Math.max(0, loan.remainingBalance - loan.emiAmount),
        paymentHistory: [...loan.paymentHistory, { date: today, amount: loan.emiAmount }]
      };
      clarityHomeDb.updateLoan(id, updatedLoan);

      // Create a matching expense for reporting
      clarityHomeDb.addExpense({
        expenseName: `${loan.loanName} EMI Payment`,
        category: 'EMI',
        amount: loan.emiAmount,
        date: today,
        paymentMethod: 'Bank Transfer',
        vendor: loan.loanName,
        notes: `Auto loan EMI tracking`,
        tags: ['loan', 'emi'],
        recurring: 'none',
        familyMember: 'Self',
        isBusiness: false
      });

      clarityHomeDb.addNotification(
        'EMI Payment Recorded',
        `Monthly EMI of ${loan.emiAmount} paid towards "${loan.loanName}". Outstanding balance: ${updatedLoan.remainingBalance}.`,
        'emi'
      );
    }
  },
  deleteLoan: (id: string) => {
    const list = clarityHomeDb.getLoans();
    clarityHomeDb.saveLoans(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Loan', `Deleted loan track ID ${id}`);
  },

  // Investments Methods
  getInvestments: () => clarityHomeDb.getData<Investment[]>(STORAGE_KEYS.INVESTMENTS),
  saveInvestments: (list: Investment[]) => clarityHomeDb.saveData(STORAGE_KEYS.INVESTMENTS, list),
  addInvestment: (i: Omit<Investment, 'id'>) => {
    const list = clarityHomeDb.getInvestments();
    const newItem = { ...i, id: `inv-${Date.now()}` };
    clarityHomeDb.saveInvestments([...list, newItem]);
    clarityHomeDb.logActivity('Add Investment', `Added investment entry "${i.name}"`);
    return newItem;
  },
  updateInvestment: (id: string, updated: Partial<Investment>) => {
    const list = clarityHomeDb.getInvestments();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveInvestments(updatedList);
    clarityHomeDb.logActivity('Update Investment', `Updated investment ID ${id}`);
  },
  deleteInvestment: (id: string) => {
    const list = clarityHomeDb.getInvestments();
    clarityHomeDb.saveInvestments(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Investment', `Deleted investment ID ${id}`);
  },

  // Assets Methods
  getAssets: () => clarityHomeDb.getData<Asset[]>(STORAGE_KEYS.ASSETS),
  saveAssets: (list: Asset[]) => clarityHomeDb.saveData(STORAGE_KEYS.ASSETS, list),
  addAsset: (a: Omit<Asset, 'id'>) => {
    const list = clarityHomeDb.getAssets();
    const newItem = { ...a, id: `ast-${Date.now()}` };
    clarityHomeDb.saveAssets([...list, newItem]);
    clarityHomeDb.logActivity('Add Asset', `Logged household asset "${a.name}"`);
    return newItem;
  },
  updateAsset: (id: string, updated: Partial<Asset>) => {
    const list = clarityHomeDb.getAssets();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveAssets(updatedList);
    clarityHomeDb.logActivity('Update Asset', `Updated asset value ID ${id}`);
  },
  deleteAsset: (id: string) => {
    const list = clarityHomeDb.getAssets();
    clarityHomeDb.saveAssets(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Asset', `Deleted asset tracking ID ${id}`);
  },

  // Debts Methods
  getDebts: () => clarityHomeDb.getData<Debt[]>(STORAGE_KEYS.DEBTS),
  saveDebts: (list: Debt[]) => clarityHomeDb.saveData(STORAGE_KEYS.DEBTS, list),
  addDebt: (d: Omit<Debt, 'id'>) => {
    const list = clarityHomeDb.getDebts();
    const newItem = { ...d, id: `deb-${Date.now()}` };
    clarityHomeDb.saveDebts([...list, newItem]);
    clarityHomeDb.logActivity('Add Debt', `Recorded ${d.type} debt: ${d.amount} to/from ${d.personName}`);
    return newItem;
  },
  updateDebt: (id: string, updated: Partial<Debt>) => {
    const list = clarityHomeDb.getDebts();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveDebts(updatedList);
    clarityHomeDb.logActivity('Update Debt', `Updated debt status ID ${id}`);
  },
  deleteDebt: (id: string) => {
    const list = clarityHomeDb.getDebts();
    clarityHomeDb.saveDebts(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Debt', `Deleted debt track ID ${id}`);
  },

  // Wishlist Methods
  getWishlist: () => clarityHomeDb.getData<WishlistItem[]>(STORAGE_KEYS.WISHLIST),
  saveWishlist: (list: WishlistItem[]) => clarityHomeDb.saveData(STORAGE_KEYS.WISHLIST, list),
  addWishlistItem: (w: Omit<WishlistItem, 'id'>) => {
    const list = clarityHomeDb.getWishlist();
    const newItem = { ...w, id: `wish-${Date.now()}` };
    clarityHomeDb.saveWishlist([...list, newItem]);
    clarityHomeDb.logActivity('Add Wishlist Item', `Added "${w.itemName}" to wishlist`);
    return newItem;
  },
  updateWishlistItem: (id: string, updated: Partial<WishlistItem>) => {
    const list = clarityHomeDb.getWishlist();
    const updatedList = list.map(x => x.id === id ? { ...x, ...updated } : x);
    clarityHomeDb.saveWishlist(updatedList);
    clarityHomeDb.logActivity('Update Wishlist', `Updated wishlist item ID ${id}`);
  },
  deleteWishlistItem: (id: string) => {
    const list = clarityHomeDb.getWishlist();
    clarityHomeDb.saveWishlist(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Wishlist Item', `Deleted wishlist item ID ${id}`);
  },

  // Family Member Methods
  getFamilyMembers: () => clarityHomeDb.getData<FamilyMember[]>(STORAGE_KEYS.FAMILY_MEMBERS),
  saveFamilyMembers: (list: FamilyMember[]) => clarityHomeDb.saveData(STORAGE_KEYS.FAMILY_MEMBERS, list),
  addFamilyMember: (f: Omit<FamilyMember, 'id'>) => {
    const list = clarityHomeDb.getFamilyMembers();
    const newItem = { ...f, id: `fam-${Date.now()}` };
    clarityHomeDb.saveFamilyMembers([...list, newItem]);
    clarityHomeDb.logActivity('Add Family Member', `Added family member "${f.name}"`);
    return newItem;
  },
  deleteFamilyMember: (id: string) => {
    const list = clarityHomeDb.getFamilyMembers();
    clarityHomeDb.saveFamilyMembers(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Family Member', `Deleted family member ID ${id}`);
  },

  // Payment Methods
  getPaymentMethods: () => clarityHomeDb.getData<PaymentMethod[]>(STORAGE_KEYS.PAYMENT_METHODS),
  savePaymentMethods: (list: PaymentMethod[]) => clarityHomeDb.saveData(STORAGE_KEYS.PAYMENT_METHODS, list),
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => {
    const list = clarityHomeDb.getPaymentMethods();
    const newItem = { ...pm, id: `pm-${Date.now()}` };
    clarityHomeDb.savePaymentMethods([...list, newItem]);
    clarityHomeDb.logActivity('Add Payment Method', `Configured payment method "${pm.name}"`);
    return newItem;
  },
  deletePaymentMethod: (id: string) => {
    const list = clarityHomeDb.getPaymentMethods();
    clarityHomeDb.savePaymentMethods(list.filter(x => x.id !== id));
    clarityHomeDb.logActivity('Delete Payment Method', `Removed payment method ID ${id}`);
  },

  // Settings
  getSettings: () => clarityHomeDb.getData<ClarityHomeSettings>(STORAGE_KEYS.SETTINGS),
  saveSettings: (settings: ClarityHomeSettings) => {
    clarityHomeDb.saveData(STORAGE_KEYS.SETTINGS, settings);
    clarityHomeDb.logActivity('Change Settings', 'Updated application parameters.');
  },

  // Notifications
  getNotifications: () => clarityHomeDb.getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS),
  saveNotifications: (list: Notification[]) => clarityHomeDb.saveData(STORAGE_KEYS.NOTIFICATIONS, list),
  markNotificationRead: (id: string) => {
    const list = clarityHomeDb.getNotifications();
    clarityHomeDb.saveNotifications(list.map(n => n.id === id ? { ...n, read: true } : n));
  },
  clearNotifications: () => {
    clarityHomeDb.saveNotifications([]);
    clarityHomeDb.logActivity('Clear Notifications', 'Flushed incoming message tray.');
  },

  // Activity Logs
  getActivityLogs: () => clarityHomeDb.getData<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS),

  // Backup & Restore
  exportBackup: (): string => {
    const dump: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([key, val]) => {
      const stringData = localStorage.getItem(val);
      dump[key] = stringData ? JSON.parse(stringData) : null;
    });
    return JSON.stringify(dump);
  },

  importBackup: (backupStr: string): boolean => {
    try {
      const dump = JSON.parse(backupStr);
      Object.entries(STORAGE_KEYS).forEach(([key, val]) => {
        if (dump[key] !== undefined) {
          localStorage.setItem(val, JSON.stringify(dump[key]));
        }
      });
      clarityHomeDb.logActivity('Restore Backup', 'Successfully loaded financial dump database.');
      clarityHomeDb.addNotification('System Restored', 'Your Clarity Home backup has been successfully loaded.', 'summary');
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  },

  resetAllData: () => {
    Object.values(STORAGE_KEYS).forEach(val => {
      localStorage.removeItem(val);
    });
    clarityHomeDb.init();
    clarityHomeDb.logActivity('Database Reset', 'Purged all local schemas and re-seeded starting elements.');
  },

  // Recurring Transactions Scheduler logic
  runRecurringScheduler: () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastRun = localStorage.getItem(STORAGE_KEYS.LAST_SCHEDULER_RUN) || todayStr;

    if (lastRun === todayStr) {
      // Already run today, skip to avoid duplicates
      return;
    }

    localStorage.setItem(STORAGE_KEYS.LAST_SCHEDULER_RUN, todayStr);

    const activeIncome = clarityHomeDb.getIncome();
    const activeExpenses = clarityHomeDb.getExpenses();
    const activeBills = clarityHomeDb.getBills();

    let postedCount = 0;

    // Check monthly income recurring
    activeIncome.forEach(inc => {
      if (inc.recurring === 'monthly') {
        const incDay = new Date(inc.date).getDate();
        const currentDay = new Date().getDate();
        if (currentDay === incDay) {
          clarityHomeDb.addIncome({
            ...inc,
            date: todayStr,
            notes: `Auto-generated recurring receipt from date ${inc.date}. ${inc.notes}`
          });
          postedCount++;
        }
      }
    });

    // Check monthly expenses recurring
    activeExpenses.forEach(exp => {
      if (exp.recurring === 'monthly') {
        const expDay = new Date(exp.date).getDate();
        const currentDay = new Date().getDate();
        if (currentDay === expDay) {
          clarityHomeDb.addExpense({
            ...exp,
            date: todayStr,
            notes: `Auto-generated recurring expense from date ${exp.date}. ${exp.notes}`
          });
          postedCount++;
        }
      }
    });

    // Process auto-recurring bills
    activeBills.forEach(bill => {
      if (bill.autoRecurring && bill.status === 'Unpaid') {
        const due = new Date(bill.dueDate);
        const today = new Date(todayStr);
        if (today >= due) {
          // Auto pay it and add as expense
          clarityHomeDb.updateBill(bill.id, { status: 'Paid' });
          clarityHomeDb.addExpense({
            expenseName: `Autopay: ${bill.title}`,
            category: bill.category === 'Others' ? 'Miscellaneous' : (bill.category as any),
            amount: bill.amount,
            date: todayStr,
            paymentMethod: 'Bank Transfer',
            vendor: bill.title,
            notes: 'Autopaid utility bill tracker',
            tags: ['utilities', 'bill-autopay'],
            recurring: 'none',
            familyMember: 'Self',
            isBusiness: false
          });

          clarityHomeDb.addNotification(
            'Utility Bill Autopaid',
            `Bill "${bill.title}" was automatically paid. Amount: ${bill.amount} debited via Bank Transfer.`,
            'bill'
          );
          postedCount++;
        }
      }
    });

    if (postedCount > 0) {
      clarityHomeDb.logActivity('Scheduler Run', `Processed recurring transactions engine. Posted ${postedCount} entries.`);
      clarityHomeDb.addNotification(
        'Recurring payments updated',
        `${postedCount} recurring utilities or transaction entries were logged automatically today.`,
        'recurring'
      );
    }
  },

  // Mock Receipt OCR Extraction API parser
  runMockOcr: (fileName: string): Promise<{
    expenseName: string;
    category: string;
    amount: number;
    vendor: string;
    date: string;
    notes: string;
    tags: string[];
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Parse fileName or create a realistic response
        const nameLower = fileName.toLowerCase();
        let amount = Math.floor(Math.random() * 2500) + 150;
        let vendor = 'General Merchant Store';
        let category = 'Groceries';
        let expenseName = 'Shopping Receipt';
        let tags = ['ocr-scan'];

        if (nameLower.includes('uber') || nameLower.includes('cab')) {
          category = 'Transportation';
          vendor = 'Uber India Private Ltd';
          expenseName = 'Cab Ride Receipt';
          amount = 450;
          tags = ['travel', 'ocr-scan'];
        } else if (nameLower.includes('starbucks') || nameLower.includes('coffee') || nameLower.includes('food')) {
          category = 'Food';
          vendor = 'Starbucks Coffee';
          expenseName = 'Coffee & Snacks';
          amount = 680;
          tags = ['food', 'ocr-scan'];
        } else if (nameLower.includes('electricity') || nameLower.includes('power')) {
          category = 'Electricity';
          vendor = 'Power Distribution Corp';
          expenseName = 'Electric utility bill';
          amount = 2850;
          tags = ['utilities', 'ocr-scan'];
        } else if (nameLower.includes('med') || nameLower.includes('pharmacy')) {
          category = 'Pharmacy';
          vendor = 'Apollo Pharmacy';
          expenseName = 'Prescription Medicines';
          amount = 1240;
          tags = ['medical', 'ocr-scan'];
        } else if (nameLower.includes('amazon') || nameLower.includes('flipkart')) {
          category = 'Shopping';
          vendor = 'Amazon Seller Services';
          expenseName = 'Electronic accessories';
          amount = 3200;
          tags = ['shopping', 'ocr-scan'];
        }

        resolve({
          expenseName,
          category,
          amount,
          vendor,
          date: new Date().toISOString().slice(0, 10),
          notes: `OCR successfully parsed from file: ${fileName}`,
          tags
        });
      }, 2500); // 2.5s delay to show scanning loader
    });
  }
};
