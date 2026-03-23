const APP_STATE = {
  currentScreen: 'screen-login',
  selectedAccountId: null,
  selectedEmployeeId: null,
  payrollStep: 0,
  currentPlan: 'Pro',
  supabase: null,
  supabaseReady: false,
  licenseActivated: false,
  company: {
    businessName: 'LedgerFlow Accounting & Payroll',
    logoUrl: '',
    address: '1200 Market Street, Suite 400, San Francisco, CA',
    financialYear: '2026-01',
    currency: 'USD'
  },
  accounts: [
    { id: 1, name: 'Cash at Bank', type: 'Asset', balance: 82400, entries: [
      { date: '2026-03-01', description: 'Opening balance', debit: 82400, credit: 0 },
      { date: '2026-03-12', description: 'Office rent', debit: 0, credit: 4200 },
      { date: '2026-03-16', description: 'Client receipt', debit: 10200, credit: 0 }
    ]},
    { id: 2, name: 'Accounts Receivable', type: 'Asset', balance: 18600, entries: [
      { date: '2026-03-03', description: 'Invoice INV-1042', debit: 6800, credit: 0 },
      { date: '2026-03-10', description: 'Receipt from Acme Studio', debit: 0, credit: 3500 }
    ]},
    { id: 3, name: 'Accounts Payable', type: 'Liability', balance: 11200, entries: [
      { date: '2026-03-08', description: 'Vendor bill', debit: 0, credit: 11200 }
    ]},
    { id: 4, name: 'Share Capital', type: 'Equity', balance: 60000, entries: [
      { date: '2026-01-01', description: 'Owner contribution', debit: 0, credit: 60000 }
    ]},
    { id: 5, name: 'Service Revenue', type: 'Revenue', balance: 48200, entries: [
      { date: '2026-03-14', description: 'Consulting revenue', debit: 0, credit: 48200 }
    ]},
    { id: 6, name: 'Operating Expenses', type: 'Expense', balance: 19350, entries: [
      { date: '2026-03-05', description: 'Software and utilities', debit: 19350, credit: 0 }
    ]}
  ],
  invoices: [
    { id: 'INV-1042', client: 'Acme Studio', amount: 6800, dueDate: '2026-03-28', status: 'Pending' },
    { id: 'INV-1041', client: 'Northwind Logistics', amount: 12400, dueDate: '2026-03-22', status: 'Paid' },
    { id: 'INV-1040', client: 'Nova Retail', amount: 5200, dueDate: '2026-03-17', status: 'Overdue' }
  ],
  expenses: [
    { id: 'EXP-302', vendor: 'Google Workspace', category: 'Software', amount: 480, date: '2026-03-04' },
    { id: 'EXP-301', vendor: 'Metro Energy', category: 'Utilities', amount: 1240, date: '2026-03-06' },
    { id: 'EXP-300', vendor: 'Apex Supplies', category: 'Office', amount: 760, date: '2026-03-11' }
  ],
  activity: [
    { title: 'Payroll draft generated', subtitle: 'Payroll for March 2026 is ready for approval.' },
    { title: 'Invoice INV-1042 sent', subtitle: 'Acme Studio received a $6,800 invoice.' },
    { title: 'Expense posted', subtitle: 'Metro Energy utility bill posted to Operating Expenses.' }
  ],
  tasks: [
    { title: 'Approve payroll', detail: 'Payroll run scheduled for March 28.', status: 'Priority' },
    { title: 'Chase overdue invoice', detail: 'Nova Retail invoice INV-1040 is overdue.', status: 'Receivables' },
    { title: 'Review expense policy', detail: 'Three utility costs exceeded threshold.', status: 'Controls' }
  ],
  employees: [
    { id: 1, name: 'Ariana Wells', role: 'Finance Manager', salary: 8200, tax: 1320, bank: 'First National ••9088', status: 'Active', email: 'ariana@ledgerflow.app' },
    { id: 2, name: 'Mateo Brooks', role: 'Accountant', salary: 5400, tax: 860, bank: 'Mercury ••2301', status: 'Active', email: 'mateo@ledgerflow.app' },
    { id: 3, name: 'Leila Grant', role: 'Payroll Officer', salary: 4800, tax: 780, bank: 'Chase ••4450', status: 'Active', email: 'leila@ledgerflow.app' }
  ],
  users: [
    { id: 1, email: 'owner@ledgerflow.app', role: 'Admin', status: 'Active' },
    { id: 2, email: 'finance@ledgerflow.app', role: 'Accountant', status: 'Active' },
    { id: 3, email: 'auditor@ledgerflow.app', role: 'Viewer', status: 'Pending' }
  ],
  pricing: [
    { name: 'Free', price: '$0', description: 'Best for freelancers beginning with bookkeeping.', features: ['Core dashboard', 'Invoices and expenses', '1 admin user'] },
    { name: 'Pro', price: '$49/mo', description: 'Ideal for growing teams that need payroll and reports.', features: ['Everything in Free', 'Payroll module', 'Financial statements', '5 team members'] },
    { name: 'Enterprise', price: '$149/mo', description: 'Advanced controls, support, and multi-entity scaling.', features: ['Everything in Pro', 'Unlimited users', 'Priority onboarding', 'Advanced permissions'] }
  ]
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: APP_STATE.company.currency || 'USD',
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add('hidden'), 3200);
}

function MapsTo(screenId) {
  navigateTo(screenId);
}
window.MapsTo = MapsTo;

function navigateTo(screenId) {
  APP_STATE.currentScreen = screenId;
  document.querySelectorAll('.app-screen').forEach((screen) => {
    screen.classList.toggle('hidden', screen.id !== screenId);
  });
  document.querySelectorAll('[data-screen]').forEach((link) => {
    link.classList.toggle('active', link.dataset.screen === screenId);
  });
  if (screenId === 'screen-ledger') renderLedger();
  if (screenId === 'screen-employee-profile') renderEmployeeProfile();
  if (screenId === 'screen-run-payroll') renderPayrollWizard();
  if (screenId === 'screen-reports' || screenId === 'screen-income-statement' || screenId === 'screen-balance-sheet' || screenId === 'screen-cash-flow') {
    renderReports();
  }
}
window.navigateTo = navigateTo;

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}
window.openModal = openModal;

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
window.closeModal = closeModal;

function quickAction(type) {
  const targets = {
    invoice: ['screen-invoices', 'modal-invoice'],
    expense: ['screen-expenses', 'modal-expense'],
    journal: ['screen-journal']
  };
  const [screen, modal] = targets[type] || [];
  if (screen) navigateTo(screen);
  if (modal) openModal(modal);
}
window.quickAction = quickAction;

function seedDemoData() {
  renderAll();
  showToast('Demo finance data refreshed.', 'success');
}
window.seedDemoData = seedDemoData;

function getTotals() {
  const revenue = APP_STATE.accounts.filter((a) => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
  const expenses = APP_STATE.accounts.filter((a) => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);
  const assets = APP_STATE.accounts.filter((a) => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const liabilities = APP_STATE.accounts.filter((a) => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0);
  const equity = APP_STATE.accounts.filter((a) => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0) + (revenue - expenses);
  return { revenue, expenses, assets, liabilities, equity, netIncome: revenue - expenses };
}

function renderDashboard() {
  const totals = getTotals();
  document.getElementById('metric-cash').textContent = formatCurrency(APP_STATE.accounts.find((a) => a.name === 'Cash at Bank')?.balance || 0);
  document.getElementById('metric-revenue').textContent = formatCurrency(totals.revenue);
  document.getElementById('metric-expenses').textContent = formatCurrency(totals.expenses);
  document.getElementById('metric-payroll').textContent = formatCurrency(APP_STATE.employees.reduce((sum, emp) => sum + emp.salary, 0));

  document.getElementById('task-list').innerHTML = APP_STATE.tasks.map((task) => `
    <div class="list-card">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="font-semibold text-slate-900">${task.title}</p>
          <p class="mt-1 text-sm text-slate-500">${task.detail}</p>
        </div>
        <span class="pill">${task.status}</span>
      </div>
    </div>
  `).join('');

  document.getElementById('activity-feed').innerHTML = APP_STATE.activity.map((item) => `
    <div class="flex gap-3 rounded-2xl border border-slate-200 p-4">
      <div class="mt-1 h-3 w-3 rounded-full bg-brand-500"></div>
      <div>
        <p class="font-semibold text-slate-900">${item.title}</p>
        <p class="mt-1 text-sm text-slate-500">${item.subtitle}</p>
      </div>
    </div>
  `).join('');

  renderDashboardChart();
}

let dashboardChart;
function renderDashboardChart() {
  const canvas = document.getElementById('dashboardChart');
  if (!canvas || typeof Chart === 'undefined') return;
  const ctx = canvas.getContext('2d');
  if (dashboardChart) dashboardChart.destroy();
  dashboardChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
      datasets: [
        { label: 'Revenue', data: [32000, 35100, 36800, 40200, 43800, 48200], borderColor: '#0284c7', backgroundColor: 'rgba(2,132,199,0.12)', tension: 0.35, fill: true },
        { label: 'Expenses', data: [14600, 15100, 16300, 17120, 18240, 19350], borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', tension: 0.35, fill: true },
        { label: 'Net Income', data: [17400, 20000, 20500, 23080, 25560, 28850], borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.08)', tension: 0.35, fill: true }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: {
          ticks: { callback: (value) => `$${Number(value) / 1000}k` }
        }
      }
    }
  });
}

function renderAccounts() {
  document.getElementById('accounts-grid').innerHTML = APP_STATE.accounts.map((account) => `
    <button class="list-card text-left transition hover:-translate-y-1 hover:shadow-soft" onclick="viewLedger(${account.id})">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-slate-500">${account.type}</p>
          <h3 class="mt-2 text-xl font-semibold text-slate-900">${account.name}</h3>
        </div>
        <span class="pill">${account.entries.length} entries</span>
      </div>
      <p class="mt-5 text-2xl font-bold tracking-tight text-slate-900">${formatCurrency(account.balance)}</p>
    </button>
  `).join('');
}

function viewLedger(accountId) {
  APP_STATE.selectedAccountId = accountId;
  renderLedger();
  navigateTo('screen-ledger');
}
window.viewLedger = viewLedger;

function renderLedger() {
  const account = APP_STATE.accounts.find((item) => item.id === APP_STATE.selectedAccountId) || APP_STATE.accounts[0];
  if (!account) return;
  document.getElementById('ledger-title').textContent = account.name;
  document.getElementById('ledger-meta').textContent = `${account.type} account with ${account.entries.length} posted entries.`;
  let runningBalance = 0;
  document.getElementById('ledger-table').innerHTML = account.entries.map((entry) => {
    runningBalance += (entry.debit || 0) - (entry.credit || 0);
    return `
      <tr>
        <td class="px-4 py-3">${entry.date}</td>
        <td class="px-4 py-3">${entry.description}</td>
        <td class="px-4 py-3 text-right">${entry.debit ? formatCurrency(entry.debit) : '—'}</td>
        <td class="px-4 py-3 text-right">${entry.credit ? formatCurrency(entry.credit) : '—'}</td>
        <td class="px-4 py-3 text-right font-semibold">${formatCurrency(runningBalance)}</td>
      </tr>
    `;
  }).join('');
  document.getElementById('ledger-balance').textContent = formatCurrency(account.balance);
}

function createJournalLineRow(index = 0) {
  return `
    <tr>
      <td class="px-4 py-3"><select class="form-input" name="account-${index}">${APP_STATE.accounts.map((account) => `<option>${account.name}</option>`).join('')}</select></td>
      <td class="px-4 py-3"><input class="form-input" name="description-${index}" type="text" placeholder="Entry detail" /></td>
      <td class="px-4 py-3"><input class="form-input journal-debit" name="debit-${index}" type="number" min="0" step="0.01" value="0" oninput="updateJournalBalance()" /></td>
      <td class="px-4 py-3"><input class="form-input journal-credit" name="credit-${index}" type="number" min="0" step="0.01" value="0" oninput="updateJournalBalance()" /></td>
    </tr>
  `;
}

function addJournalLine() {
  const body = document.getElementById('journal-lines');
  body.insertAdjacentHTML('beforeend', createJournalLineRow(body.children.length));
  updateJournalBalance();
}
window.addJournalLine = addJournalLine;

function updateJournalBalance() {
  const debits = [...document.querySelectorAll('.journal-debit')].reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
  const credits = [...document.querySelectorAll('.journal-credit')].reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
  const ready = Math.abs(debits - credits) < 0.009 && debits > 0;
  const status = document.getElementById('journal-balance-status');
  status.textContent = ready ? `Balanced (${formatCurrency(debits)})` : `Out of balance by ${formatCurrency(Math.abs(debits - credits))}`;
  status.className = ready ? 'font-semibold text-emerald-600' : 'font-semibold text-rose-600';
}
window.updateJournalBalance = updateJournalBalance;

function renderInvoices() {
  document.getElementById('invoice-list').innerHTML = APP_STATE.invoices.map((invoice) => `
    <div class="list-card">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="flex items-center gap-3"><h3 class="text-lg font-semibold">${invoice.id}</h3><span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span></div>
          <p class="mt-1 text-sm text-slate-500">${invoice.client} • Due ${invoice.dueDate}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold">${formatCurrency(invoice.amount)}</p>
          <button class="mt-2 text-sm font-semibold text-brand-600" onclick="markInvoicePaid('${invoice.id}')">Mark Paid</button>
        </div>
      </div>
    </div>
  `).join('');
}

function markInvoicePaid(invoiceId) {
  const invoice = APP_STATE.invoices.find((item) => item.id === invoiceId);
  if (invoice) {
    invoice.status = 'Paid';
    renderInvoices();
    showToast(`${invoiceId} marked as paid.`, 'success');
  }
}
window.markInvoicePaid = markInvoicePaid;

function renderExpenses() {
  document.getElementById('expense-list').innerHTML = APP_STATE.expenses.map((expense) => `
    <div class="list-card">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-medium text-slate-500">${expense.category}</p>
          <h3 class="mt-1 text-lg font-semibold">${expense.vendor}</h3>
          <p class="mt-1 text-sm text-slate-500">Posted ${expense.date}</p>
        </div>
        <p class="text-2xl font-bold text-slate-900">${formatCurrency(expense.amount)}</p>
      </div>
    </div>
  `).join('');
}

function renderReports() {
  const trialBody = document.getElementById('trial-balance-table');
  if (trialBody) {
    trialBody.innerHTML = APP_STATE.accounts.map((account) => `
      <tr>
        <td class="px-4 py-3">${account.name}</td>
        <td class="px-4 py-3">${account.type}</td>
        <td class="px-4 py-3 text-right">${['Asset', 'Expense'].includes(account.type) ? formatCurrency(account.balance) : '—'}</td>
        <td class="px-4 py-3 text-right">${['Liability', 'Equity', 'Revenue'].includes(account.type) ? formatCurrency(account.balance) : '—'}</td>
      </tr>
    `).join('');
  }
  renderIncomeStatement();
  renderBalanceSheet();
  renderCashFlow();
}

function renderIncomeStatement() {
  const container = document.getElementById('income-statement-content');
  if (!container) return;
  const revenueAccounts = APP_STATE.accounts.filter((account) => account.type === 'Revenue');
  const expenseAccounts = APP_STATE.accounts.filter((account) => account.type === 'Expense');
  const totals = getTotals();
  container.innerHTML = `
    <div class="statement-card">
      <h3 class="text-xl font-semibold">Revenue</h3>
      ${revenueAccounts.map((account) => `<div class="statement-row"><span>${account.name}</span><strong>${formatCurrency(account.balance)}</strong></div>`).join('')}
      <div class="statement-total"><span>Total Revenue</span><span>${formatCurrency(totals.revenue)}</span></div>
    </div>
    <div class="statement-card">
      <h3 class="text-xl font-semibold">Expenses</h3>
      ${expenseAccounts.map((account) => `<div class="statement-row"><span>${account.name}</span><strong>${formatCurrency(account.balance)}</strong></div>`).join('')}
      <div class="statement-total"><span>Total Expenses</span><span>${formatCurrency(totals.expenses)}</span></div>
      <div class="statement-total mt-4 !bg-emerald-50"><span>Net Income</span><span>${formatCurrency(totals.netIncome)}</span></div>
    </div>
  `;
}

function renderBalanceSheet() {
  const container = document.getElementById('balance-sheet-content');
  if (!container) return;
  const assets = APP_STATE.accounts.filter((account) => account.type === 'Asset');
  const liabilities = APP_STATE.accounts.filter((account) => account.type === 'Liability');
  const equityAccounts = APP_STATE.accounts.filter((account) => account.type === 'Equity');
  const totals = getTotals();
  container.innerHTML = `
    <div class="statement-card">
      <h3 class="text-xl font-semibold">Assets</h3>
      ${assets.map((account) => `<div class="statement-row"><span>${account.name}</span><strong>${formatCurrency(account.balance)}</strong></div>`).join('')}
      <div class="statement-total"><span>Total Assets</span><span>${formatCurrency(totals.assets)}</span></div>
    </div>
    <div class="statement-card">
      <h3 class="text-xl font-semibold">Liabilities & Equity</h3>
      ${liabilities.map((account) => `<div class="statement-row"><span>${account.name}</span><strong>${formatCurrency(account.balance)}</strong></div>`).join('')}
      ${equityAccounts.map((account) => `<div class="statement-row"><span>${account.name}</span><strong>${formatCurrency(account.balance)}</strong></div>`).join('')}
      <div class="statement-row"><span>Current Year Earnings</span><strong>${formatCurrency(totals.netIncome)}</strong></div>
      <div class="statement-total"><span>Total Liabilities</span><span>${formatCurrency(totals.liabilities)}</span></div>
      <div class="statement-total"><span>Total Equity</span><span>${formatCurrency(totals.equity)}</span></div>
    </div>
  `;
}

function renderCashFlow() {
  const container = document.getElementById('cash-flow-content');
  if (!container) return;
  const operating = [
    { label: 'Cash receipts from customers', value: 42800 },
    { label: 'Cash paid to suppliers', value: -11200 },
    { label: 'Cash paid for operating expenses', value: -8350 }
  ];
  const investing = [
    { label: 'Equipment purchases', value: -5600 },
    { label: 'Asset disposals', value: 1200 }
  ];
  const financing = [
    { label: 'Owner capital introduced', value: 60000 },
    { label: 'Loan repayments', value: -3200 }
  ];
  const groups = [
    { title: 'Operating Activities', items: operating },
    { title: 'Investing Activities', items: investing },
    { title: 'Financing Activities', items: financing }
  ];
  container.innerHTML = groups.map((group) => {
    const total = group.items.reduce((sum, item) => sum + item.value, 0);
    return `
      <div class="statement-card">
        <h3 class="text-xl font-semibold">${group.title}</h3>
        ${group.items.map((item) => `<div class="statement-row"><span>${item.label}</span><strong>${formatCurrency(item.value)}</strong></div>`).join('')}
        <div class="statement-total"><span>Net ${group.title.split(' ')[0]}</span><span>${formatCurrency(total)}</span></div>
      </div>
    `;
  }).join('');
}

function renderPayroll() {
  document.getElementById('payroll-summary').innerHTML = [
    { label: 'Employees', value: APP_STATE.employees.length },
    { label: 'Gross Payroll', value: formatCurrency(APP_STATE.employees.reduce((sum, employee) => sum + employee.salary, 0)) },
    { label: 'Tax Withholding', value: formatCurrency(APP_STATE.employees.reduce((sum, employee) => sum + employee.tax, 0)) }
  ].map((item) => `<div class="metric-card"><p class="metric-label">${item.label}</p><p class="metric-value">${item.value}</p></div>`).join('');

  document.getElementById('employee-list').innerHTML = APP_STATE.employees.map((employee) => `
    <button class="list-card text-left" onclick="viewEmployee(${employee.id})">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="flex items-center gap-3"><h3 class="text-lg font-semibold">${employee.name}</h3><span class="status-badge status-active">${employee.status}</span></div>
          <p class="mt-1 text-sm text-slate-500">${employee.role} • ${employee.email}</p>
        </div>
        <div class="text-right">
          <p class="text-xl font-bold">${formatCurrency(employee.salary)}</p>
          <p class="text-sm text-slate-500">Tax: ${formatCurrency(employee.tax)}</p>
        </div>
      </div>
    </button>
  `).join('');
}

function viewEmployee(employeeId) {
  APP_STATE.selectedEmployeeId = employeeId;
  renderEmployeeProfile();
  navigateTo('screen-employee-profile');
}
window.viewEmployee = viewEmployee;

function renderEmployeeProfile() {
  const employee = APP_STATE.employees.find((item) => item.id === APP_STATE.selectedEmployeeId) || APP_STATE.employees[0];
  if (!employee) return;
  document.getElementById('employee-profile-content').innerHTML = `
    <div class="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div class="statement-card">
        <span class="pill">Employee Profile</span>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight">${employee.name}</h2>
        <p class="mt-2 text-slate-500">${employee.role}</p>
        <div class="mt-6 space-y-3 text-sm text-slate-600">
          <p><strong>Email:</strong> ${employee.email}</p>
          <p><strong>Bank:</strong> ${employee.bank}</p>
          <p><strong>Status:</strong> ${employee.status}</p>
        </div>
      </div>
      <div class="statement-card">
        <h3 class="text-xl font-semibold">Compensation</h3>
        <div class="statement-row"><span>Gross salary</span><strong>${formatCurrency(employee.salary)}</strong></div>
        <div class="statement-row"><span>Tax withheld</span><strong>${formatCurrency(employee.tax)}</strong></div>
        <div class="statement-row"><span>Net pay</span><strong>${formatCurrency(employee.salary - employee.tax)}</strong></div>
        <div class="statement-total"><span>Payroll cost</span><span>${formatCurrency(employee.salary)}</span></div>
      </div>
    </div>
  `;
}

function renderPayrollWizard() {
  const steps = [
    { title: 'Review payroll period', body: 'Confirm the pay period, payment date, and employee roster for this payroll batch.' },
    { title: 'Validate earnings & deductions', body: 'Inspect gross salary, tax deductions, and employer liabilities before approval.' },
    { title: 'Approve and post payroll', body: 'Finalize payroll journals, create payslips, and return to the payroll dashboard.' }
  ];
  APP_STATE.payrollStep = Math.max(0, Math.min(APP_STATE.payrollStep, steps.length - 1));
  document.getElementById('payroll-steps').innerHTML = steps.map((step, index) => `
    <div class="rounded-2xl border px-4 py-4 ${index === APP_STATE.payrollStep ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white'}">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Step ${index + 1}</p>
      <h3 class="mt-2 text-lg font-semibold">${step.title}</h3>
    </div>
  `).join('');
  document.getElementById('payroll-step-content').innerHTML = `
    <h3 class="text-2xl font-semibold">${steps[APP_STATE.payrollStep].title}</h3>
    <p class="mt-3 text-slate-600">${steps[APP_STATE.payrollStep].body}</p>
    <div class="mt-6 rounded-2xl bg-white p-4">
      <p class="text-sm text-slate-500">Batch summary</p>
      <p class="mt-2 text-xl font-bold">${formatCurrency(APP_STATE.employees.reduce((sum, employee) => sum + employee.salary, 0))}</p>
      <p class="mt-2 text-sm text-slate-500">${APP_STATE.employees.length} employees included in March 2026 payroll.</p>
    </div>
  `;
}

function changePayrollStep(direction) {
  APP_STATE.payrollStep += direction;
  if (APP_STATE.payrollStep < 0) {
    APP_STATE.payrollStep = 0;
    navigateTo('screen-payroll');
    return;
  }
  if (APP_STATE.payrollStep > 2) {
    APP_STATE.payrollStep = 2;
    showToast('Payroll approved and posted to the dashboard.', 'success');
    navigateTo('screen-payroll');
    return;
  }
  renderPayrollWizard();
}
window.changePayrollStep = changePayrollStep;

function renderSettings() {
  const form = document.getElementById('company-settings-form');
  if (form) {
    form.businessName.value = APP_STATE.company.businessName;
    form.logoUrl.value = APP_STATE.company.logoUrl;
    form.address.value = APP_STATE.company.address;
    form.financialYear.value = APP_STATE.company.financialYear;
    form.currency.value = APP_STATE.company.currency;
  }

  document.getElementById('user-roles-list').innerHTML = APP_STATE.users.map((user) => `
    <div class="list-card">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 class="font-semibold text-slate-900">${user.email}</h3>
          <p class="mt-1 text-sm text-slate-500">Access role for workspace collaboration</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="status-badge status-${user.role.toLowerCase()}">${user.role}</span>
          <span class="status-badge status-${user.status.toLowerCase()}">${user.status}</span>
        </div>
      </div>
    </div>
  `).join('');

  document.getElementById('current-plan-label').textContent = APP_STATE.currentPlan;
  document.getElementById('billing-plans').innerHTML = APP_STATE.pricing.map((plan) => `
    <div class="statement-card ${plan.name === APP_STATE.currentPlan ? 'ring-2 ring-brand-500' : ''}">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-2xl font-semibold">${plan.name}</h3>
          <p class="mt-1 text-slate-500">${plan.description}</p>
        </div>
        <span class="pill">${plan.price}</span>
      </div>
      <ul class="mt-6 space-y-3 text-sm text-slate-600">${plan.features.map((feature) => `<li>• ${feature}</li>`).join('')}</ul>
      <button class="primary-btn mt-8 w-full" onclick="changePlan('${plan.name}')">${plan.name === APP_STATE.currentPlan ? 'Current Plan' : `Switch to ${plan.name}`}</button>
    </div>
  `).join('');
}

function changePlan(planName) {
  APP_STATE.currentPlan = planName;
  renderSettings();
  showToast(`Subscription updated to ${planName}.`, 'success');
}
window.changePlan = changePlan;

function validateLicenseKey(input) {
  const normalized = String(input || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isValid = /^[A-Z0-9]{16}$/.test(normalized);
  return { normalized, isValid, formatted: normalized.replace(/(.{4})/g, '$1-').replace(/-$/, '') };
}
window.validateLicenseKey = validateLicenseKey;

function handleActivation(rawValue) {
  const result = validateLicenseKey(rawValue);
  const resultBox = document.getElementById('activation-result');
  if (result.isValid) {
    APP_STATE.licenseActivated = true;
    resultBox.textContent = `Valid key detected: ${result.formatted}. Pro features unlocked locally.`;
    resultBox.className = 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700';
    showToast('License key validated successfully.', 'success');
  } else {
    resultBox.textContent = 'Invalid key format. Use 16 alphanumeric characters, such as ABCD-EFGH-IJKL-MNOP.';
    resultBox.className = 'rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700';
    showToast('License key format is invalid.', 'error');
  }
  return result.isValid;
}

function exportPdf(title, lines) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    showToast('jsPDF is unavailable in this environment.', 'error');
    return;
  }
  const pdf = new window.jspdf.jsPDF();
  pdf.setFontSize(18);
  pdf.text(title, 14, 18);
  pdf.setFontSize(11);
  lines.forEach((line, index) => {
    pdf.text(String(line), 14, 32 + index * 8);
  });
  pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

function exportDashboardPdf() {
  const totals = getTotals();
  exportPdf('LedgerFlow Dashboard Snapshot', [
    `Revenue: ${formatCurrency(totals.revenue)}`,
    `Expenses: ${formatCurrency(totals.expenses)}`,
    `Net Income: ${formatCurrency(totals.netIncome)}`,
    `Cash Balance: ${formatCurrency(APP_STATE.accounts.find((account) => account.name === 'Cash at Bank')?.balance || 0)}`
  ]);
}
window.exportDashboardPdf = exportDashboardPdf;

function exportTrialBalancePdf() {
  exportPdf('Trial Balance', APP_STATE.accounts.map((account) => `${account.name} (${account.type}): ${formatCurrency(account.balance)}`));
}
window.exportTrialBalancePdf = exportTrialBalancePdf;

function exportStatementPdf(type) {
  const totals = getTotals();
  const payload = {
    income: ['Revenue', formatCurrency(totals.revenue), 'Expenses', formatCurrency(totals.expenses), 'Net Income', formatCurrency(totals.netIncome)],
    balance: ['Assets', formatCurrency(totals.assets), 'Liabilities', formatCurrency(totals.liabilities), 'Equity', formatCurrency(totals.equity)],
    cashflow: ['Operating', formatCurrency(23250), 'Investing', formatCurrency(-4400), 'Financing', formatCurrency(56800)]
  };
  exportPdf(`${type} statement`, payload[type] || []);
}
window.exportStatementPdf = exportStatementPdf;

async function initializeSupabaseSafeMode() {
  try {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase CDN unavailable');
    }
    const supabaseUrl = window.SUPABASE_URL || 'https://demo-project.supabase.co';
    const supabaseAnonKey = window.SUPABASE_ANON_KEY || 'demo-anon-key';
    APP_STATE.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    APP_STATE.supabaseReady = true;
    document.getElementById('supabase-status').textContent = 'Supabase ready';
    document.getElementById('supabase-status').className = 'mt-1 text-xs text-emerald-600';
  } catch (error) {
    APP_STATE.supabaseReady = false;
    APP_STATE.supabase = null;
    document.getElementById('supabase-status').textContent = 'Supabase offline-safe mode enabled';
    document.getElementById('supabase-status').className = 'mt-1 text-xs text-amber-600';
    console.warn('Supabase initialization failed:', error);
  }
}

async function handleSignup(event) {
  event.preventDefault();
  const form = event.target;
  const payload = Object.fromEntries(new FormData(form).entries());
  if (APP_STATE.supabaseReady && APP_STATE.supabase) {
    try {
      await APP_STATE.supabase.auth.signUp({ email: payload.email, password: payload.password });
      if (APP_STATE.supabase.from) {
        await APP_STATE.supabase.from('users').insert({
          email: payload.email,
          business_name: payload.businessName,
          full_name: payload.fullName,
          phone: payload.phone || ''
        });
      }
    } catch (error) {
      console.warn('Supabase sign-up fallback:', error);
    }
  }
  APP_STATE.users.unshift({ id: Date.now(), email: payload.email, role: 'Admin', status: 'Active' });
  APP_STATE.company.businessName = payload.businessName;
  document.querySelector('#onboarding-form [name="legalName"]').value = payload.businessName;
  navigateTo('screen-onboarding');
  showToast('Workspace created. Continue onboarding.', 'success');
}

async function handleLogin(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());
  if (APP_STATE.supabaseReady && APP_STATE.supabase) {
    try {
      await APP_STATE.supabase.auth.signInWithPassword({ email: payload.email, password: payload.password });
    } catch (error) {
      console.warn('Supabase login fallback:', error);
    }
  }
  navigateTo('screen-dashboard');
  showToast(`Welcome back, ${payload.email}.`, 'success');
}

function handleOnboarding(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.target).entries());
  APP_STATE.company.businessName = payload.legalName;
  APP_STATE.company.address = payload.address;
  APP_STATE.company.financialYear = payload.financialYear || APP_STATE.company.financialYear;
  APP_STATE.company.currency = payload.currency || APP_STATE.company.currency;
  renderAll();
  navigateTo('screen-dashboard');
  showToast('Onboarding complete. Dashboard is ready.', 'success');
}

function attachForms() {
  document.getElementById('signup-form').addEventListener('submit', handleSignup);
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('onboarding-form').addEventListener('submit', handleOnboarding);

  document.getElementById('invoice-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    APP_STATE.invoices.unshift({ id: `INV-${Math.floor(Math.random() * 9000 + 1000)}`, client: payload.client, amount: parseFloat(payload.amount), dueDate: payload.dueDate, status: 'Draft' });
    renderInvoices();
    closeModal('modal-invoice');
    event.target.reset();
    showToast('Invoice created successfully.', 'success');
  });

  document.getElementById('expense-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    APP_STATE.expenses.unshift({ id: `EXP-${Math.floor(Math.random() * 900 + 100)}`, vendor: payload.vendor, category: payload.category, amount: parseFloat(payload.amount), date: payload.date });
    renderExpenses();
    closeModal('modal-expense');
    event.target.reset();
    showToast('Expense recorded successfully.', 'success');
  });

  document.getElementById('account-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    APP_STATE.accounts.push({ id: Date.now(), name: payload.name, type: payload.type, balance: parseFloat(payload.balance), entries: [{ date: '2026-03-23', description: 'Opening imported balance', debit: ['Asset', 'Expense'].includes(payload.type) ? parseFloat(payload.balance) : 0, credit: ['Liability', 'Equity', 'Revenue'].includes(payload.type) ? parseFloat(payload.balance) : 0 }] });
    renderAccounts();
    renderReports();
    closeModal('modal-account');
    event.target.reset();
    showToast('Account created successfully.', 'success');
  });

  document.getElementById('journal-form').addEventListener('submit', (event) => {
    event.preventDefault();
    updateJournalBalance();
    const status = document.getElementById('journal-balance-status').textContent;
    if (status.startsWith('Out of balance')) {
      showToast('Journal entry must balance before posting.', 'error');
      return;
    }
    showToast('Journal posted to dashboard.', 'success');
    navigateTo('screen-dashboard');
  });

  document.getElementById('company-settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    APP_STATE.company = { ...APP_STATE.company, ...Object.fromEntries(new FormData(event.target).entries()) };
    renderAll();
    showToast('Company settings saved.', 'success');
  });

  document.getElementById('invite-user-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.target).entries());
    APP_STATE.users.unshift({ id: Date.now(), email: payload.email, role: payload.role, status: 'Pending' });
    renderSettings();
    event.target.reset();
    showToast(`Invitation prepared for ${payload.email}.`, 'success');
  });

  document.getElementById('activation-form').addEventListener('submit', (event) => {
    event.preventDefault();
    handleActivation(new FormData(event.target).get('licenseKey'));
  });

  document.getElementById('activation-modal-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const success = handleActivation(new FormData(event.target).get('licenseKey'));
    if (success) closeModal('modal-activation');
  });
}

function renderAll() {
  renderDashboard();
  renderAccounts();
  renderInvoices();
  renderExpenses();
  renderReports();
  renderPayroll();
  renderSettings();
  renderEmployeeProfile();
  renderPayrollWizard();
}

document.addEventListener('click', (event) => {
  if (event.target.classList.contains('modal')) {
    event.target.classList.add('hidden');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await initializeSupabaseSafeMode();
  attachForms();
  addJournalLine();
  addJournalLine();
  document.getElementById('activation-input').addEventListener('input', (event) => {
    const result = validateLicenseKey(event.target.value);
    event.target.value = result.formatted;
  });
  renderAll();
  navigateTo('screen-login');
});
