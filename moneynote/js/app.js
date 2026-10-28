/**
 * ==============================================================================
 * MONEYNOTE – SỔ CHI TIÊU CÁ NHÂN
 * Mã nguồn JavaScript thuần (ES6+) hoàn chỉnh
 * Đáp ứng đầy đủ 12 chức năng: F01 đến F12
 * ==============================================================================
 */

// --- 1. HẰNG SỐ & CẤU HÌNH DANH MỤC (CATEGORIES) ---
const EXPENSE_CATEGORIES = [
    { name: 'Ăn uống', icon: 'fa-utensils', color: '#EF4444' },
    { name: 'Đi lại', icon: 'fa-bus', color: '#F59E0B' },
    { name: 'Mua sắm', icon: 'fa-bag-shopping', color: '#EC4899' },
    { name: 'Học tập', icon: 'fa-graduation-cap', color: '#3B82F6' },
    { name: 'Giải trí', icon: 'fa-gamepad', color: '#8B5CF6' },
    { name: 'Hóa đơn', icon: 'fa-receipt', color: '#10B981' },
    { name: 'Khác', icon: 'fa-ellipsis', color: '#6B7280' }
];

const INCOME_CATEGORIES = [
    { name: 'Lương', icon: 'fa-money-bill-wave', color: '#10B981' },
    { name: 'Học bổng', icon: 'fa-award', color: '#3B82F6' },
    { name: 'Được cho', icon: 'fa-hand-holding-dollar', color: '#F59E0B' },
    { name: 'Khác', icon: 'fa-coins', color: '#8B5CF6' }
];

const PAYMENT_METHODS = ['Tiền mặt', 'Chuyển khoản', 'Ví điện tử', 'Thẻ tín dụng'];

// Khóa lưu trữ LocalStorage
const STORAGE_KEYS = {
    TRANSACTIONS: 'moneynote_transactions',
    BUDGETS: 'moneynote_budgets',
    THEME: 'moneynote_theme',
    INITIALIZED: 'moneynote_initialized'
};

// --- 2. TRẠNG THÁI ỨNG DỤNG (STATE) ---
let state = {
    transactions: [],
    budgets: {}, // Lưu theo dạng: { "2026-10": 5000000 }
    currentMonth: getCurrentMonthString(), // YYYY-MM
    selectedCategory: '',
    currentType: 'expense', // 'expense' | 'income'
    editingTxId: null,
    deletingTxId: null,
    filters: {
        search: '',
        type: 'all',
        category: 'all',
        payment: 'all'
    }
};

// --- 3. CÁC HÀM TIỆN ÍCH (HELPERS) ---

/** Lấy chuỗi tháng hiện tại dạng YYYY-MM */
function getCurrentMonthString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/** Lấy chuỗi ngày hôm nay dạng YYYY-MM-DD */
function getTodayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/** Định dạng số tiền sang chuẩn tiền Việt Nam (VND) */
function formatVND(amount) {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/** Chuẩn hóa tiếng Việt bỏ dấu để tìm kiếm không dấu/có dấu đều ra kết quả */
function normalizeText(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd');
}

/** Định dạng chuỗi ngày YYYY-MM-DD thành hiển thị tiếng Việt */
function formatDateVN(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/** Hiển thị Toast thông báo nhanh */
function showToast(type, message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// --- 4. DỮ LIỆU MẪU BAN ĐẦU (SEED DATA - F06) ---
function initSampleData() {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
        const ym = state.currentMonth;
        const sampleTransactions = [
            { id: 'txn_1', type: 'income', amount: 4000000, category: 'Lương', date: `${ym}-05`, paymentMethod: 'Chuyển khoản', note: 'Lương làm thêm part-time', createdAt: 1 },
            { id: 'txn_2', type: 'income', amount: 3000000, category: 'Được cho', date: `${ym}-01`, paymentMethod: 'Chuyển khoản', note: 'Bố mẹ gửi tiền sinh hoạt', createdAt: 2 },
            { id: 'txn_3', type: 'income', amount: 1500000, category: 'Học bổng', date: `${ym}-10`, paymentMethod: 'Chuyển khoản', note: 'Học bổng khuyến khích học tập kỳ 1', createdAt: 3 },
            { id: 'txn_4', type: 'expense', amount: 2200000, category: 'Hóa đơn', date: `${ym}-05`, paymentMethod: 'Chuyển khoản', note: 'Tiền trọ, điện nước tháng này', createdAt: 4 },
            { id: 'txn_5', type: 'expense', amount: 280000, category: 'Học tập', date: `${ym}-08`, paymentMethod: 'Tiền mặt', note: 'Mua sách giáo trình và tài liệu ôn tập', createdAt: 5 },
            { id: 'txn_6', type: 'expense', amount: 650000, category: 'Ăn uống', date: `${ym}-12`, paymentMethod: 'Ví điện tử', note: 'Đi siêu thị mua đồ nấu ăn cả tuần', createdAt: 6 },
            { id: 'txn_7', type: 'expense', amount: 90000, category: 'Đi lại', date: `${ym}-14`, paymentMethod: 'Tiền mặt', note: 'Đổ đầy bình xăng xe Wave', createdAt: 7 },
            { id: 'txn_8', type: 'expense', amount: 160000, category: 'Giải trí', date: `${ym}-18`, paymentMethod: 'Ví điện tử', note: 'Xem phim cuối tuần cùng bạn bè', createdAt: 8 },
            { id: 'txn_9', type: 'expense', amount: 250000, category: 'Mua sắm', date: `${ym}-20`, paymentMethod: 'Thẻ tín dụng', note: 'Mua áo thun mới', createdAt: 9 },
            { id: 'txn_10', type: 'expense', amount: 70000, category: 'Hóa đơn', date: `${ym}-22`, paymentMethod: 'Ví điện tử', note: 'Nạp cước 4G Viettel', createdAt: 10 },
            { id: 'txn_11', type: 'expense', amount: 35000, category: 'Ăn uống', date: `${ym}-24`, paymentMethod: 'Tiền mặt', note: 'Cơm trưa căng tin trường', createdAt: 11 },
            { id: 'txn_12', type: 'expense', amount: 450000, category: 'Học tập', date: `${ym}-26`, paymentMethod: 'Chuyển khoản', note: 'Lệ phí thi chứng chỉ tin học', createdAt: 12 }
        ];

        state.transactions = sampleTransactions;
        state.budgets[ym] = 4800000; // Ngân sách mẫu 4.8 triệu

        saveTransactions();
        saveBudgets();
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    } else {
        loadTransactions();
        loadBudgets();
    }
}

function saveTransactions() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
}

function loadTransactions() {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    state.transactions = data ? JSON.parse(data) : [];
}

function saveBudgets() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgets));
}

function loadBudgets() {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    state.budgets = data ? JSON.parse(data) : {};
}

// --- 5. CHỨC NĂNG F01: TỔNG QUAN TÀI CHÍNH (DASHBOARD) ---
function updateDashboard() {
    // Lọc giao dịch thuộc tháng hiện tại
    const currentMonthTxs = state.transactions.filter(t => t.date.startsWith(state.currentMonth));

    const totalIncome = currentMonthTxs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = currentMonthTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBalance = totalIncome - totalExpense;

    const incomeCount = currentMonthTxs.filter(t => t.type === 'income').length;
    const expenseCount = currentMonthTxs.filter(t => t.type === 'expense').length;

    // Hiển thị số liệu
    document.getElementById('totalIncomeVal').textContent = formatVND(totalIncome);
    document.getElementById('totalExpenseVal').textContent = formatVND(totalExpense);
    document.getElementById('netBalanceVal').textContent = (netBalance >= 0 ? '+ ' : '- ') + formatVND(Math.abs(netBalance));

    document.getElementById('incomeCountMeta').textContent = `${incomeCount} khoản thu trong tháng`;
    document.getElementById('expenseCountMeta').textContent = `${expenseCount} khoản chi trong tháng`;

    // Cập nhật trạng thái số dư
    const balanceBadge = document.getElementById('balanceStatusBadge');
    const balanceRatio = document.getElementById('balanceRatioMeta');

    let ratio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
    balanceRatio.textContent = `Tỷ lệ chi/thu: ${ratio}%`;

    if (netBalance >= 0) {
        if (ratio <= 75) {
            balanceBadge.className = 'badge-balance-status safe';
            balanceBadge.textContent = 'Tiết kiệm tốt';
        } else {
            balanceBadge.className = 'badge-balance-status warning';
            balanceBadge.textContent = 'Mức cân đối';
        }
    } else {
        balanceBadge.className = 'badge-balance-status danger';
        balanceBadge.textContent = 'Thâm hụt chi';
    }
}

// --- 6. CHỨC NĂNG F08: NGÂN SÁCH THÁNG (MONTHLY BUDGET) ---
function updateBudgetSection() {
    const currentMonthTxs = state.transactions.filter(t => t.date.startsWith(state.currentMonth));
    const totalExpense = currentMonthTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthlyBudget = state.budgets[state.currentMonth] || 0;

    const spentElem = document.getElementById('budgetSpentVal');
    const limitElem = document.getElementById('budgetLimitVal');
    const percentElem = document.getElementById('budgetPercentVal');
    const progressBar = document.getElementById('budgetProgressBar');
    const alertBanner = document.getElementById('budgetAlertBanner');
    const alertMessage = document.getElementById('budgetAlertMessage');

    spentElem.textContent = formatVND(totalExpense);
    limitElem.textContent = monthlyBudget > 0 ? formatVND(monthlyBudget) : 'Chưa đặt hạn mức';

    if (monthlyBudget <= 0) {
        percentElem.textContent = '0%';
        progressBar.style.width = '0%';
        progressBar.className = 'budget-progress-bar safe';
        alertBanner.style.display = 'none';
        return;
    }

    const percent = Math.round((totalExpense / monthlyBudget) * 100);
    percentElem.textContent = `${percent}%`;

    const barWidth = Math.min(percent, 100);
    progressBar.style.width = `${barWidth}%`;

    if (percent < 80) {
        progressBar.className = 'budget-progress-bar safe';
        alertBanner.className = 'budget-alert-banner';
        alertBanner.style.display = 'none';
    } else if (percent <= 100) {
        progressBar.className = 'budget-progress-bar warning';
        alertBanner.className = 'budget-alert-banner warning';
        alertBanner.style.display = 'flex';
        const remaining = monthlyBudget - totalExpense;
        alertMessage.textContent = `Chú ý: Bạn đã tiêu hết ${percent}% ngân sách tháng! Còn lại ${formatVND(remaining)}.`;
    } else {
        progressBar.className = 'budget-progress-bar danger';
        alertBanner.className = 'budget-alert-banner danger';
        alertBanner.style.display = 'flex';
        const exceeded = totalExpense - monthlyBudget;
        alertMessage.textContent = `CẢNH BÁO: Bạn đã vượt hạn mức ngân sách ${formatVND(exceeded)}!`;
    }
}

// --- 7. CHỨC NĂNG F03 & F07: DANH SÁCH GIAO DỊCH, BỘ LỌC VÀ TÌM KIẾM ---
function renderTransactionList() {
    const listContainer = document.getElementById('transactionList');
    const countBadge = document.getElementById('txCountBadge');

    // 1. Lọc theo tháng
    let filtered = state.transactions.filter(t => t.date.startsWith(state.currentMonth));

    // 2. Lọc theo loại Thu / Chi
    if (state.filters.type !== 'all') {
        filtered = filtered.filter(t => t.type === state.filters.type);
    }

    // 3. Lọc theo danh mục
    if (state.filters.category !== 'all') {
        filtered = filtered.filter(t => t.category === state.filters.category);
    }

    // 4. Lọc theo phương thức thanh toán
    if (state.filters.payment !== 'all') {
        filtered = filtered.filter(t => t.paymentMethod === state.filters.payment);
    }

    // 5. Tìm kiếm theo ghi chú hoặc danh mục
    if (state.filters.search.trim() !== '') {
        const query = normalizeText(state.filters.search.trim());
        filtered = filtered.filter(t => {
            const noteNorm = normalizeText(t.note || '');
            const catNorm = normalizeText(t.category || '');
            return noteNorm.includes(query) || catNorm.includes(query);
        });
    }

    // Sắp xếp: Mới nhất lên đầu (theo ngày giảm dần, rồi theo timestamp tạo)
    filtered.sort((a, b) => {
        if (a.date !== b.date) {
            return b.date.localeCompare(a.date);
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
    });

    countBadge.textContent = `${filtered.length} giao dịch`;

    // Hiển thị Empty State nếu không có giao dịch nào
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fa-solid fa-receipt"></i>
                </div>
                <p>Không tìm thấy giao dịch nào phù hợp với bộ lọc trong tháng ${formatMonthDisplay(state.currentMonth)}.</p>
            </div>
        `;
        return;
    }

    // Nhóm theo ngày để hiển thị chuyên nghiệp
    let html = '';
    let lastDate = '';

    filtered.forEach(tx => {
        if (tx.date !== lastDate) {
            html += `<div class="tx-group-date"><i class="fa-regular fa-calendar"></i> ${formatDateVN(tx.date)}</div>`;
            lastDate = tx.date;
        }

        const isIncome = tx.type === 'income';
        const catInfo = getCategoryInfo(tx.type, tx.category);
        const displayTitle = tx.note && tx.note.trim() !== '' ? tx.note : tx.category;

        html += `
            <div class="tx-item" data-id="${tx.id}">
                <div class="tx-left" onclick="openEditTxModal('${tx.id}')">
                    <div class="tx-icon ${isIncome ? 'income' : 'expense'}" style="color: ${catInfo.color};">
                        <i class="fa-solid ${catInfo.icon}"></i>
                    </div>
                    <div class="tx-details">
                        <div class="tx-title">${escapeHTML(displayTitle)}</div>
                        <div class="tx-sub">
                            <span class="tx-badge">${escapeHTML(tx.category)}</span>
                            <span>•</span>
                            <span>${escapeHTML(tx.paymentMethod || 'Tiền mặt')}</span>
                        </div>
                    </div>
                </div>
                <div class="tx-right">
                    <div class="tx-amount ${isIncome ? 'income' : 'expense'}">
                        ${isIncome ? '+' : '-'} ${formatVND(tx.amount)}
                    </div>
                    <div class="tx-actions">
                        <button type="button" class="btn-tx-action edit" onclick="openEditTxModal('${tx.id}')" title="Chỉnh sửa">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="btn-tx-action delete" onclick="openConfirmDeleteModal('${tx.id}', event)" title="Xóa">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

function getCategoryInfo(type, catName) {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const found = list.find(c => c.name === catName);
    return found || { name: catName, icon: 'fa-tags', color: '#6B7280' };
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// --- 8. CHỨC NĂNG F09: THỐNG KÊ CHI THEO DANH MỤC (SVG DONUT CHART) ---
function updateCategoryBreakdownChart() {
    const currentMonthTxs = state.transactions.filter(t => t.date.startsWith(state.currentMonth) && t.type === 'expense');
    const totalExpense = currentMonthTxs.reduce((sum, t) => sum + Number(t.amount), 0);

    const chartCenterVal = document.getElementById('chartCenterVal');
    const donutSvg = document.getElementById('donutSvg');
    const breakdownList = document.getElementById('categoryBreakdownList');

    chartCenterVal.textContent = formatVND(totalExpense);

    if (totalExpense === 0) {
        donutSvg.innerHTML = `<circle cx="50" cy="50" r="35" fill="none" stroke="var(--color-card-border)" stroke-width="25"></circle>`;
        breakdownList.innerHTML = `<p style="font-size: 13px; color: var(--color-text-sub); text-align: center; padding: 16px;">Chưa có khoản chi nào trong tháng này.</p>`;
        return;
    }

    // Tính tổng chi cho từng danh mục
    const catMap = {};
    currentMonthTxs.forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
    });

    // Chuyển sang mảng và sắp xếp giảm dần theo số tiền
    const sortedCats = Object.entries(catMap)
        .map(([name, amount]) => ({
            name,
            amount,
            percent: (amount / totalExpense) * 100,
            info: getCategoryInfo('expense', name)
        }))
        .sort((a, b) => b.amount - a.amount);

    // Vẽ biểu đồ SVG Donut Chart thuần
    // Chu vi hình tròn r=35 là: 2 * Math.PI * 35 ≈ 219.911
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercent = 0;
    let svgHtml = '';

    sortedCats.forEach(item => {
        const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((accumulatedPercent / 100) * circumference);

        svgHtml += `
            <circle class="donut-segment"
                cx="50" cy="50" r="${radius}"
                stroke="${item.info.color}"
                stroke-dasharray="${strokeDasharray}"
                stroke-dashoffset="${strokeDashoffset}">
                <title>${item.name}: ${formatVND(item.amount)} (${item.percent.toFixed(1)}%)</title>
            </circle>
        `;
        accumulatedPercent += item.percent;
    });

    donutSvg.innerHTML = svgHtml;

    // Render danh sách chi tiết (Legend)
    let legendHtml = '';
    sortedCats.forEach(item => {
        legendHtml += `
            <div class="breakdown-item">
                <div class="breakdown-left">
                    <span class="color-dot" style="background-color: ${item.info.color};"></span>
                    <span class="breakdown-name">${item.name}</span>
                </div>
                <div class="breakdown-right">
                    <span class="breakdown-amount">${formatVND(item.amount)}</span>
                    <span class="breakdown-percent">${item.percent.toFixed(1)}%</span>
                </div>
            </div>
        `;
    });

    breakdownList.innerHTML = legendHtml;
}

// --- 9. CHỨC NĂNG F02 & F04: MODAL THÊM / SỬA GIAO DỊCH ---
function openAddTxModal() {
    state.editingTxId = null;
    state.selectedCategory = ''; // Reset danh mục đã chọn: Bắt buộc người dùng phải chủ động bấm chọn
    document.getElementById('txModalTitle').textContent = 'Thêm giao dịch mới';
    document.getElementById('saveTxBtn').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>Lưu giao dịch</span>';

    // Đặt lại form về mặc định (Khoản chi)
    setModalType('expense');
    document.getElementById('txAmount').value = '';
    document.getElementById('txDate').value = getTodayString();
    document.getElementById('txPaymentMethod').value = 'Tiền mặt';
    document.getElementById('txNote').value = '';

    clearFormErrors();
    openModal('txModalOverlay');
    document.getElementById('txAmount').focus();
}

function openEditTxModal(txId) {
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    state.editingTxId = txId;
    state.selectedCategory = tx.category; // Gán danh mục hiện tại của giao dịch
    document.getElementById('txModalTitle').textContent = 'Chỉnh sửa giao dịch';
    document.getElementById('saveTxBtn').innerHTML = '<i class="fa-solid fa-check"></i> <span>Cập nhật</span>';

    setModalType(tx.type, true); // true: Giữ nguyên danh mục khi chuyển loại
    document.getElementById('txAmount').value = tx.amount;
    document.getElementById('txDate').value = tx.date;
    document.getElementById('txPaymentMethod').value = tx.paymentMethod || 'Tiền mặt';
    document.getElementById('txNote').value = tx.note || '';

    clearFormErrors();
    openModal('txModalOverlay');
}

function setModalType(type, preserveCategory = false) {
    state.currentType = type;
    const btnExpense = document.getElementById('btnTypeExpense');
    const btnIncome = document.getElementById('btnTypeIncome');

    if (type === 'expense') {
        btnExpense.className = 'type-toggle-btn active expense';
        btnIncome.className = 'type-toggle-btn income';
    } else {
        btnExpense.className = 'type-toggle-btn expense';
        btnIncome.className = 'type-toggle-btn active income';
    }

    // Nếu người dùng chủ động chuyển tab Thu/Chi -> reset lựa chọn danh mục để tránh nhầm lẫn
    if (!preserveCategory) {
        state.selectedCategory = '';
    }

    // Ẩn thông báo lỗi danh mục cũ nếu có
    document.getElementById('categoryError').style.display = 'none';

    renderCategoryGrid(type);
}

function renderCategoryGrid(type) {
    const grid = document.getElementById('categoryGrid');
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    let html = '';
    categories.forEach(cat => {
        // Chỉ đánh dấu selected nếu người dùng đã bấm chọn danh mục này
        const isSelected = state.selectedCategory === cat.name;

        html += `
            <button type="button" class="category-option-btn ${isSelected ? 'selected' : ''}" onclick="selectCategory('${cat.name}')">
                <i class="fa-solid ${cat.icon}"></i>
                <span>${cat.name}</span>
            </button>
        `;
    });

    grid.innerHTML = html;
}

function selectCategory(catName) {
    state.selectedCategory = catName;
    const buttons = document.querySelectorAll('.category-option-btn');
    buttons.forEach(btn => {
        const text = btn.querySelector('span').textContent;
        if (text === catName) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });

    document.getElementById('categoryError').style.display = 'none';
}

function clearFormErrors() {
    document.getElementById('amountError').style.display = 'none';
    document.getElementById('categoryError').style.display = 'none';
    document.getElementById('dateError').style.display = 'none';
}

function handleSaveTransaction(e) {
    e.preventDefault();
    clearFormErrors();

    const amountInput = document.getElementById('txAmount');
    const dateInput = document.getElementById('txDate');
    const paymentInput = document.getElementById('txPaymentMethod');
    const noteInput = document.getElementById('txNote');

    const amount = Number(amountInput.value);
    const date = dateInput.value;
    const paymentMethod = paymentInput.value;
    const note = noteInput.value.trim();

    let hasError = false;

    // 1. Validate số tiền: Không để trống, > 0, là số nguyên, không quá 10 tỷ
    if (!amount || amount <= 0 || isNaN(amount)) {
        document.getElementById('amountError').textContent = 'Vui lòng nhập số tiền hợp lệ lớn hơn 0!';
        document.getElementById('amountError').style.display = 'block';
        amountInput.focus();
        hasError = true;
    } else if (!Number.isInteger(amount)) {
        document.getElementById('amountError').textContent = 'Số tiền VND phải là số nguyên (không có số lẻ thập phân)!';
        document.getElementById('amountError').style.display = 'block';
        amountInput.focus();
        hasError = true;
    } else if (amount > 10000000000) {
        document.getElementById('amountError').textContent = 'Số tiền giao dịch không được vượt quá 10 tỷ đồng!';
        document.getElementById('amountError').style.display = 'block';
        amountInput.focus();
        hasError = true;
    }

    // 2. Validate danh mục: Bắt buộc người dùng phải chọn VÀ danh mục phải thuộc loại Thu/Chi tương ứng
    const validCategories = state.currentType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const isValidCategory = state.selectedCategory && validCategories.some(c => c.name === state.selectedCategory);

    if (!isValidCategory) {
        document.getElementById('categoryError').textContent = 'Vui lòng bấm chọn một danh mục trong danh sách!';
        document.getElementById('categoryError').style.display = 'block';
        hasError = true;
    }

    // 3. Validate ngày: Bắt buộc chọn ngày hợp lệ
    if (!date) {
        document.getElementById('dateError').textContent = 'Vui lòng chọn ngày giao dịch hợp lệ!';
        document.getElementById('dateError').style.display = 'block';
        if (!hasError) dateInput.focus();
        hasError = true;
    }

    if (hasError) return;

    if (state.editingTxId) {
        // Cập nhật giao dịch đã có
        const tx = state.transactions.find(t => t.id === state.editingTxId);
        if (tx) {
            tx.type = state.currentType;
            tx.amount = amount;
            tx.category = state.selectedCategory;
            tx.date = date;
            tx.paymentMethod = paymentMethod;
            tx.note = note;
            showToast('success', 'Đã cập nhật giao dịch thành công!');
        }
    } else {
        // Thêm giao dịch mới
        const newTx = {
            id: 'txn_' + Date.now(),
            type: state.currentType,
            amount: amount,
            category: state.selectedCategory,
            date: date,
            paymentMethod: paymentMethod,
            note: note,
            createdAt: Date.now()
        };
        state.transactions.push(newTx);
        showToast('success', 'Đã thêm giao dịch mới thành công!');
    }

    saveTransactions();
    closeModal('txModalOverlay');

    // Nếu ngày của giao dịch mới thuộc tháng khác, tự động chuyển sang tháng đó để xem
    const txMonth = date.substring(0, 7);
    if (txMonth !== state.currentMonth) {
        setMonth(txMonth);
    } else {
        updateAllViews();
    }
}

// --- 10. CHỨC NĂNG F05: XÓA GIAO DỊCH (CONFIRM MODAL) ---
function openConfirmDeleteModal(txId, event) {
    if (event) event.stopPropagation();
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    state.deletingTxId = txId;
    const desc = tx.note ? `"${tx.note}" (${formatVND(tx.amount)})` : `${tx.category} (${formatVND(tx.amount)})`;
    document.getElementById('confirmDeleteMessage').textContent = `Bạn có chắc chắn muốn xóa giao dịch ${desc}? Thao tác này không thể hoàn tác.`;

    openModal('confirmDeleteModalOverlay');
}

function handleConfirmDelete() {
    if (!state.deletingTxId) return;

    state.transactions = state.transactions.filter(t => t.id !== state.deletingTxId);
    saveTransactions();

    closeModal('confirmDeleteModalOverlay');
    state.deletingTxId = null;

    showToast('success', 'Đã xóa giao dịch thành công!');
    updateAllViews();
}

// --- 11. CHỨC NĂNG F08: MODAL CÀI ĐẶT NGÂN SÁCH ---
function openBudgetModal() {
    const currentBudget = state.budgets[state.currentMonth] || 0;
    document.getElementById('budgetLimitInput').value = currentBudget > 0 ? currentBudget : '';
    document.getElementById('budgetError').style.display = 'none';
    openModal('budgetModalOverlay');
    document.getElementById('budgetLimitInput').focus();
}

function handleSaveBudget(e) {
    e.preventDefault();
    const input = document.getElementById('budgetLimitInput');
    const limit = Number(input.value);

    if (isNaN(limit) || limit < 0) {
        document.getElementById('budgetError').style.display = 'block';
        input.focus();
        return;
    }

    state.budgets[state.currentMonth] = limit;
    saveBudgets();
    closeModal('budgetModalOverlay');

    showToast('success', `Đã cập nhật ngân sách tháng ${formatMonthDisplay(state.currentMonth)}!`);
    updateBudgetSection();
}

// --- 12. CHỨC NĂNG F11: CHẾ ĐỘ SÁNG / TỐI (DARK MODE) ---
function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    applyTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    showToast('info', `Đã chuyển sang ${newTheme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}`);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleText = document.getElementById('themeToggleText');
    if (toggleText) {
        if (theme === 'dark') {
            toggleText.innerHTML = '<i class="fa-solid fa-sun"></i> Chế độ sáng';
        } else {
            toggleText.innerHTML = '<i class="fa-solid fa-moon"></i> Chế độ tối';
        }
    }
}

// --- 13. CHỨC NĂNG F12: XUẤT FILE EXCEL / CSV ---
function exportToCSV() {
    const currentMonthTxs = state.transactions.filter(t => t.date.startsWith(state.currentMonth));

    if (currentMonthTxs.length === 0) {
        showToast('error', 'Không có giao dịch nào trong tháng để xuất file!');
        return;
    }

    // Tiêu đề các cột
    const headers = ['Mã giao dịch', 'Ngày', 'Loại', 'Danh mục', 'Số tiền (VND)', 'Hình thức thanh toán', 'Ghi chú'];

    // Dòng dữ liệu
    const rows = currentMonthTxs.map(t => [
        t.id,
        t.date,
        t.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
        `"${(t.category || '').replace(/"/g, '""')}"`,
        t.amount,
        `"${(t.paymentMethod || 'Tiền mặt').replace(/"/g, '""')}"`,
        `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    // Thêm ký tự BOM (\uFEFF) ở đầu để Excel trên Windows hiển thị đúng font tiếng Việt UTF-8
    const csvContent = '\uFEFF' + [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoneyNote_GiaoDich_${state.currentMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('success', `Đã xuất ${currentMonthTxs.length} giao dịch ra file CSV!`);
}

// --- 14. CHUYỂN ĐỔI THÁNG & BỘ LỌC DANH MỤC ---
function formatMonthDisplay(ymStr) {
    if (!ymStr) return '';
    const [y, m] = ymStr.split('-');
    return `Tháng ${m}/${y}`;
}

function setMonth(ymStr) {
    state.currentMonth = ymStr;
    document.getElementById('monthDisplay').textContent = formatMonthDisplay(ymStr);
    document.getElementById('hiddenMonthInput').value = ymStr;
    updateAllViews();
}

function handlePrevMonth() {
    const [yearStr, monthStr] = state.currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) - 1;

    if (month < 1) {
        month = 12;
        year -= 1;
    }

    setMonth(`${year}-${String(month).padStart(2, '0')}`);
}

function handleNextMonth() {
    const [yearStr, monthStr] = state.currentMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;

    if (month > 12) {
        month = 1;
        year += 1;
    }

    setMonth(`${year}-${String(month).padStart(2, '0')}`);
}

function populateCategoryFilterDropdown() {
    const select = document.getElementById('categoryFilterSelect');
    let html = '<option value="all">Tất cả danh mục</option>';

    const allCats = [...EXPENSE_CATEGORIES.map(c => c.name), ...INCOME_CATEGORIES.map(c => c.name)];
    const uniqueCats = Array.from(new Set(allCats));

    uniqueCats.forEach(name => {
        html += `<option value="${name}">${name}</option>`;
    });

    select.innerHTML = html;
}

// --- 15. QUẢN LÝ MODAL POPUP ---
function openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// --- 16. CẬP NHẬT TẤT CẢ GIAO DIỆN ---
function updateAllViews() {
    updateDashboard();
    updateBudgetSection();
    renderTransactionList();
    updateCategoryBreakdownChart();
}

// --- 17. KHỞI TẠO VÀ GẮN CÁC SỰ KIỆN (EVENT LISTENERS) ---
function initApp() {
    // 1. Tải chủ đề sáng/tối
    initTheme();

    // 2. Tải hoặc khởi tạo dữ liệu mẫu
    initSampleData();

    // 3. Đổ dữ liệu vào dropdown danh mục
    populateCategoryFilterDropdown();

    // 4. Thiết lập tháng hiển thị ban đầu
    setMonth(state.currentMonth);

    // 5. GẮN CÁC SỰ KIỆN GIAO DIỆN
    // Nút chuyển tháng
    document.getElementById('prevMonthBtn').addEventListener('click', handlePrevMonth);
    document.getElementById('nextMonthBtn').addEventListener('click', handleNextMonth);

    const monthDisplay = document.getElementById('monthDisplay');
    const hiddenMonthInput = document.getElementById('hiddenMonthInput');
    monthDisplay.addEventListener('click', () => hiddenMonthInput.showPicker ? hiddenMonthInput.showPicker() : hiddenMonthInput.click());
    hiddenMonthInput.addEventListener('change', (e) => {
        if (e.target.value) setMonth(e.target.value);
    });

    // Chuyển đổi giao diện Sáng / Tối
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    // Xuất file CSV
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);

    // Mở modal thêm giao dịch
    document.getElementById('openAddModalBtn').addEventListener('click', openAddTxModal);
    document.getElementById('mobileFabBtn').addEventListener('click', openAddTxModal);
    document.getElementById('closeTxModalBtn').addEventListener('click', () => closeModal('txModalOverlay'));
    document.getElementById('cancelTxBtn').addEventListener('click', () => closeModal('txModalOverlay'));
    document.getElementById('txForm').addEventListener('submit', handleSaveTransaction);

    // Xóa thông báo lỗi form theo thời gian thực (Real-time error clear)
    document.getElementById('txAmount').addEventListener('input', () => {
        document.getElementById('amountError').style.display = 'none';
    });
    document.getElementById('txDate').addEventListener('input', () => {
        document.getElementById('dateError').style.display = 'none';
    });

    // Nút chuyển loại Thu / Chi trong Modal
    document.getElementById('btnTypeExpense').addEventListener('click', () => setModalType('expense'));
    document.getElementById('btnTypeIncome').addEventListener('click', () => setModalType('income'));

    // Modal Ngân sách
    document.getElementById('openBudgetModalBtn').addEventListener('click', openBudgetModal);
    document.getElementById('closeBudgetModalBtn').addEventListener('click', () => closeModal('budgetModalOverlay'));
    document.getElementById('cancelBudgetBtn').addEventListener('click', () => closeModal('budgetModalOverlay'));
    document.getElementById('budgetForm').addEventListener('submit', handleSaveBudget);

    // Modal Xóa
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('confirmDeleteModalOverlay'));
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleConfirmDelete);

    // Đóng modal khi bấm ra ngoài vùng nội dung
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay.id);
            }
        });
    });

    // Đóng modal khi nhấn phím Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open').forEach(modal => closeModal(modal.id));
        }
    });

    // Tìm kiếm real-time
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value;
        renderTransactionList();
    });

    // Lọc theo loại (Tất cả / Chi / Thu)
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            typeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filters.type = btn.dataset.filterType;
            renderTransactionList();
        });
    });

    // Lọc theo danh mục
    document.getElementById('categoryFilterSelect').addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        renderTransactionList();
    });

    // Lọc theo phương thức thanh toán
    document.getElementById('paymentFilterSelect').addEventListener('change', (e) => {
        state.filters.payment = e.target.value;
        renderTransactionList();
    });

    // Điều hướng cuộn mượt mà trên Mobile bottom bar & Sidebar
    const scrollButtons = document.querySelectorAll('[data-scroll]');
    scrollButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            scrollButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetId = btn.dataset.scroll;
            if (targetId === 'dashboard') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElem = document.getElementById(targetId);
                if (targetElem) {
                    targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Sidebar navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const view = item.dataset.view;
            if (view === 'dashboard') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (view === 'transactions') {
                document.getElementById('transactionsSection')?.scrollIntoView({ behavior: 'smooth' });
            } else if (view === 'budget') {
                document.getElementById('budgetSection')?.scrollIntoView({ behavior: 'smooth' });
            } else if (view === 'reports') {
                document.getElementById('reportsSection')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', initApp);

