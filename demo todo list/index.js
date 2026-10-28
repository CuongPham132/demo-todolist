/**
 * ==============================================================================
 * MINI PROJECT: QUẢN LÝ CÔNG VIỆC (TODO LIST)
 * - Đầy đủ 6 chức năng theo yêu cầu đề bài
 * - Tích hợp SweetAlert2 (thông báo & xác nhận đẹp) + Animate.css (hiệu ứng mượt)
 * - Lưu trữ LocalStorage để không mất dữ liệu khi F5
 * ==============================================================================
 */

// 1. MẢNG LƯU TRỮ DỮ LIỆU CÔNG VIỆC
// Mỗi phần tử là một Object: { id: number, text: string, completed: boolean }
let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [
    { id: 1, text: 'Học JavaScript DOM cơ bản', completed: true },
    { id: 2, text: 'Làm bài tập Todo List', completed: false }
];

// Biến sinh ID duy nhất
let nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

// 2. TRUY XUẤT CÁC PHẦN TỬ HTML (DOM ELEMENTS)
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const completedCount = document.getElementById('completedCount');
const totalCount = document.getElementById('totalCount');
const completionStatus = document.getElementById('completionStatus');

/**
 * Hàm lưu dữ liệu vào LocalStorage
 */
function saveToLocalStorage() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
}

/**
 * Hiển thị thông báo bằng SweetAlert2 (kèm fallback alert thông thường)
 */
function showNotification(type, message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: type,
            title: 'Thông báo',
            text: message,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        alert(message);
    }
}

/**
 * CHỨC NĂNG 1: THÊM CÔNG VIỆC MỚI
 */
function addTask() {
    const text = taskInput.value.trim();

    // Validate: Không cho phép thêm công việc rỗng
    if (text === '') {
        showNotification('warning', 'Vui lòng nhập tên công việc!');
        taskInput.focus();
        return;
    }

    // Tạo object công việc mới
    const newTask = {
        id: nextTaskId++,
        text: text,
        completed: false
    };

    // Thêm vào mảng dữ liệu
    tasks.push(newTask);
    saveToLocalStorage();

    // Xóa nội dung trong ô input & tự động focus
    taskInput.value = '';
    taskInput.focus();

    // Render lại danh sách và cập nhật footer
    renderTasks();
    updateFooter();

    showNotification('success', 'Đã thêm công việc mới thành công!');
}

/**
 * CHỨC NĂNG 2: HIỂN THỊ DANH SÁCH CÔNG VIỆC (RENDER DỘNG)
 */
function renderTasks() {
    taskList.innerHTML = '';

    // Nếu mảng rỗng -> Hiển thị empty-state
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state animate__animated animate__fadeIn">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">Chưa có công việc nào. Hãy thêm công việc mới!</div>
            </div>
        `;
        return;
    }

    // Duyệt qua mảng và render từng task
    tasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });
}

/**
 * Tạo phần tử DOM cho một công việc
 */
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item animate__animated animate__fadeIn ${task.completed ? 'completed' : ''}`;
    taskItem.dataset.id = task.id;

    // Checkbox đánh dấu hoàn thành
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Thẻ span hiển thị tên công việc
    const taskText = document.createElement('span');
    taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
    taskText.textContent = task.text;

    // Khung chứa các nút hành động (Sửa, Xóa)
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Nút Sửa
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = '✏️ Sửa';
    editBtn.addEventListener('click', () => editTask(task.id));

    // Nút Xóa
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '🗑️ Xóa';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(actions);

    return taskItem;
}

/**
 * CHỨC NĂNG 3: ĐÁNH DẤU HOÀN THÀNH
 */
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
        updateFooter();
    }
}

/**
 * CHỨC NĂNG 4: SỬA CÔNG VIỆC
 */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskItem = document.querySelector(`[data-id="${taskId}"]`);
    if (!taskItem) return;

    const actions = taskItem.querySelector('.task-actions');

    // Chuyển sang chế độ chỉnh sửa
    taskItem.classList.add('editing');

    // Tạo ô input chỉnh sửa
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;

    // Nút Lưu
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save';
    saveBtn.innerHTML = '💾 Lưu';
    saveBtn.addEventListener('click', () => saveTask(taskId, editInput.value));

    // Nút Hủy
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.innerHTML = '❌ Hủy';
    cancelBtn.addEventListener('click', () => renderTasks());

    // Thay thế các nút hành động bằng nút Lưu & Hủy
    actions.innerHTML = '';
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    // Chèn ô input trước khung actions
    taskItem.insertBefore(editInput, actions);

    // Focus & bôi đen text để người dùng gõ ngay
    editInput.focus();
    editInput.select();

    // Bắt sự kiện bàn phím: Enter để lưu, Escape để hủy
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveTask(taskId, editInput.value);
        } else if (e.key === 'Escape') {
            renderTasks();
        }
    });
}

/**
 * Lưu nội dung công việc sau khi sửa
 */
function saveTask(taskId, newText) {
    const trimmedText = newText.trim();

    // Validate: Không cho phép lưu nội dung rỗng
    if (trimmedText === '') {
        showNotification('warning', 'Tên công việc không được để trống!');
        return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.text = trimmedText;
        saveToLocalStorage();
        renderTasks();
        updateFooter();
        showNotification('success', 'Đã cập nhật công việc thành công!');
    }
}

/**
 * CHỨC NĂNG 5: XÓA CÔNG VIỆC (Kèm hộp thoại xác nhận)
 */
function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const handleConfirmDelete = () => {
        tasks = tasks.filter(t => t.id !== taskId);
        saveToLocalStorage();
        renderTasks();
        updateFooter();
        showNotification('success', 'Đã xóa công việc thành công!');
    };

    // Sử dụng SweetAlert2 cho hộp thoại xác nhận chuyên nghiệp
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Xác nhận xóa công việc?',
            text: `Bạn có chắc chắn muốn xóa "${task.text}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF5350',
            cancelButtonColor: '#BDBDBD',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete();
            }
        });
    } else {
        // Fallback chuẩn nếu không có thư viện
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa công việc "${task.text}"?`);
        if (confirmDelete) {
            handleConfirmDelete();
        }
    }
}

/**
 * CHỨC NĂNG 6: CẬP NHẬT FOOTER & HIỆU ỨNG HOÀN THÀNH TẤT CẢ
 */
function updateFooter() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    totalCount.textContent = total;
    completedCount.textContent = completed;

    // Khi tất cả công việc đã hoàn thành (và tổng số > 0)
    if (total > 0 && completed === total) {
        completionStatus.innerHTML = `
            <div class="completion-badge animate__animated animate__bounceIn">
                <span class="check-icon">✓</span>
                <span>Hoàn thành tất cả!</span>
            </div>
        `;
    } else {
        completionStatus.innerHTML = '';
    }
}

/**
 * KHỞI TẠO ỨNG DỤNG (INIT)
 */
function init() {
    // 1. Render dữ liệu ban đầu
    renderTasks();
    updateFooter();

    // 2. Gán sự kiện cho nút Thêm và phím Enter trong ô input
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Tự động focus vào ô input khi vừa mở trang
    taskInput.focus();
}

// Chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', init);


/**
 * Hiển thị thông báo bằng SweetAlert2 (kèm fallback alert thông thường)
 */
function showNotification(type, message) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: type,
            title: 'Thông báo',
            text: message,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        alert(message);
    }
}

/**
 * CHỨC NĂNG 1: THÊM CÔNG VIỆC MỚI
 */
function addTask() {
    const text = taskInput.value.trim();

    // Validate: Không cho phép thêm công việc rỗng
    if (text === '') {
        showNotification('warning', 'Vui lòng nhập tên công việc!');
        taskInput.focus();
        return;
    }

    // Tạo object công việc mới
    const newTask = {
        id: nextTaskId++,
        text: text,
        completed: false
    };

    // Thêm vào mảng dữ liệu
    tasks.push(newTask);
    saveToLocalStorage();

    // Xóa nội dung trong ô input & tự động focus
    taskInput.value = '';
    taskInput.focus();

    // Render lại danh sách và cập nhật footer
    renderTasks();
    updateFooter();

    showNotification('success', 'Đã thêm công việc mới thành công!');
}

/**
 * CHỨC NĂNG 2: HIỂN THỊ DANH SÁCH CÔNG VIỆC (RENDER DỘNG)
 */
function renderTasks() {
    taskList.innerHTML = '';

    // Nếu mảng rỗng -> Hiển thị empty-state
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state animate__animated animate__fadeIn">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">Chưa có công việc nào. Hãy thêm công việc mới!</div>
            </div>
        `;
        return;
    }

    // Duyệt qua mảng và render từng task
    tasks.forEach(task => {
        const taskItem = createTaskElement(task);
        taskList.appendChild(taskItem);
    });
}

/**
 * Tạo phần tử DOM cho một công việc
 */
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item animate__animated animate__fadeIn ${task.completed ? 'completed' : ''}`;
    taskItem.dataset.id = task.id;

    // Checkbox đánh dấu hoàn thành
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    // Thẻ span hiển thị tên công việc
    const taskText = document.createElement('span');
    taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
    taskText.textContent = task.text;

    // Khung chứa các nút hành động (Sửa, Xóa)
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    // Nút Sửa
    const editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.innerHTML = '✏️ Sửa';
    editBtn.addEventListener('click', () => editTask(task.id));

    // Nút Xóa
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.innerHTML = '🗑️ Xóa';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(actions);

    return taskItem;
}

/**
 * CHỨC NĂNG 3: ĐÁNH DẤU HOÀN THÀNH
 */
function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
        updateFooter();
    }
}

/**
 * CHỨC NĂNG 4: SỬA CÔNG VIỆC
 */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskItem = document.querySelector(`[data-id="${taskId}"]`);
    if (!taskItem) return;

    const actions = taskItem.querySelector('.task-actions');

    // Chuyển sang chế độ chỉnh sửa
    taskItem.classList.add('editing');

    // Tạo ô input chỉnh sửa
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'task-edit-input';
    editInput.value = task.text;

    // Nút Lưu
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-save';
    saveBtn.innerHTML = '💾 Lưu';
    saveBtn.addEventListener('click', () => saveTask(taskId, editInput.value));

    // Nút Hủy
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-cancel';
    cancelBtn.innerHTML = '❌ Hủy';
    cancelBtn.addEventListener('click', () => renderTasks());

    // Thay thế các nút hành động bằng nút Lưu & Hủy
    actions.innerHTML = '';
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    // Chèn ô input trước khung actions
    taskItem.insertBefore(editInput, actions);

    // Focus & bôi đen text để người dùng gõ ngay
    editInput.focus();
    editInput.select();

    // Bắt sự kiện bàn phím: Enter để lưu, Escape để hủy
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveTask(taskId, editInput.value);
        } else if (e.key === 'Escape') {
            renderTasks();
        }
    });
}

/**
 * Lưu nội dung công việc sau khi sửa
 */
function saveTask(taskId, newText) {
    const trimmedText = newText.trim();

    // Validate: Không cho phép lưu nội dung rỗng
    if (trimmedText === '') {
        showNotification('warning', 'Tên công việc không được để trống!');
        return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.text = trimmedText;
        saveToLocalStorage();
        renderTasks();
        updateFooter();
        showNotification('success', 'Đã cập nhật công việc thành công!');
    }
}

/**
 * CHỨC NĂNG 5: XÓA CÔNG VIỆC (Kèm hộp thoại xác nhận)
 */
function deleteTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const handleConfirmDelete = () => {
        tasks = tasks.filter(t => t.id !== taskId);
        saveToLocalStorage();
        renderTasks();
        updateFooter();
        showNotification('success', 'Đã xóa công việc thành công!');
    };

    // Sử dụng SweetAlert2 cho hộp thoại xác nhận chuyên nghiệp
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Xác nhận xóa công việc?',
            text: `Bạn có chắc chắn muốn xóa "${task.text}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF5350',
            cancelButtonColor: '#BDBDBD',
            confirmButtonText: 'Đồng ý xóa',
            cancelButtonText: 'Hủy bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                handleConfirmDelete();
            }
        });
    } else {
        // Fallback chuẩn nếu không có thư viện
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xóa công việc "${task.text}"?`);
        if (confirmDelete) {
            handleConfirmDelete();
        }
    }
}

/**
 * CHỨC NĂNG 6: CẬP NHẬT FOOTER & HIỆU ỨNG HOÀN THÀNH TẤT CẢ
 */
function updateFooter() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    totalCount.textContent = total;
    completedCount.textContent = completed;

    // Khi tất cả công việc đã hoàn thành (và tổng số > 0)
    if (total > 0 && completed === total) {
        completionStatus.innerHTML = `
            <div class="completion-badge animate__animated animate__bounceIn">
                <span class="check-icon">✓</span>
                <span>Hoàn thành tất cả!</span>
            </div>
        `;
    } else {
        completionStatus.innerHTML = '';
    }
}

/**
 * KHỞI TẠO ỨNG DỤNG (INIT)
 */
function init() {
    // 1. Render dữ liệu ban đầu
    renderTasks();
    updateFooter();

    // 2. Gán sự kiện cho nút Thêm và phím Enter trong ô input
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Tự động focus vào ô input khi vừa mở trang
    taskInput.focus();
}

// Chạy ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', init);