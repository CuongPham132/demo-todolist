# NHẬT KÝ LÀM VIỆC VỚI TRỢ LÝ AI (NHAT_KY_AI.md)
**Dự án:** MoneyNote – Sổ Chi Tiêu Cá Nhân  
**Học phần:** Thiết kế và Lập trình Web với HTML, CSS, JavaScript thuần (Vanilla JS)  
**Tác giả:** Nhóm sinh viên thực hiện  

---

## 1. Mục tiêu và Nguyên tắc làm việc với AI
* Sử dụng AI như một trợ lý lập trình cặp (Pair Programmer): lên khung sườn, gợi ý giải pháp thuật toán và tối ưu hóa giao diện.
* **Nguyên tắc cốt lõi:** Không tin tưởng tuyệt đối vào code AI sinh ra; luôn kiểm tra đối chiếu với yêu cầu đề bài (tuân thủ nghiêm ngặt bảng màu, font chữ, không dùng thư viện cấm như React, Bootstrap, Tailwind, jQuery).
* Thực hiện kiểm thử thủ công và kiểm thử trường hợp biên (edge cases) cho toàn bộ 12 chức năng từ F01 đến F12.

---

## 2. Các Giai đoạn và Prompt Chính Đã Sử Dụng

### Giai đoạn 1: Khởi tạo kiến trúc và Mô hình dữ liệu (F01, F06)
* **Prompt chính:**  
  > *"Tôi cần xây dựng ứng dụng web MoneyNote ghi chép thu chi cá nhân bằng HTML5, CSS3 và JavaScript (ES6+) thuần, không dùng bất kỳ framework nào. Hãy thiết kế cấu trúc dữ liệu lưu trong LocalStorage cho giao dịch (Transaction) và ngân sách tháng (Budget), kèm 10 giao dịch mẫu của tháng hiện tại với các danh mục: Ăn uống, Đi lại, Mua sắm, Học tập, Giải trí, Hóa đơn, Lương, Học bổng."*
* **Kết quả:** AI đưa ra cấu trúc mảng `transactions` và đối tượng `budgets`. Dữ liệu mẫu ban đầu trực quan giúp kiểm tra giao diện ngay lần đầu mở web.

### Giai đoạn 2: Bố cục giao diện và Hệ thống màu (F10)
* **Prompt chính:**  
  > *"Viết mã HTML ngữ nghĩa và CSS thuần sử dụng Flexbox/Grid, font 'Be Vietnam Pro', bo góc thẻ 16px, nút 10-12px. Bảng màu bắt buộc: Màu chính #1D4ED8, Nền #F4F6FA, Thẻ #FFFFFF viền #E5E7EB, Thu #0E7A55, Chi #B42318, Cảnh báo #D97706 trên #FEF3C7, Thẻ số dư nền #14213D. Đảm bảo responsive hoàn hảo trên Mobile với bottom navigation bar."*
* **Kết quả:** AI tạo ra bộ khung sidebar và 3 thẻ thống kê, tuy nhiên phần responsive trên điện thoại ban đầu còn bị tràn bảng và thanh điều hướng chưa thân thiện với ngón tay.

### Giai đoạn 3: Xử lý CRUD và Validation (F02, F03, F04, F05)
* **Prompt chính:**  
  > *"Hiện thực các hàm JavaScript: thêm giao dịch, sửa giao dịch (mở modal điền sẵn thông tin), xóa giao dịch (có hộp thoại hỏi lại). Yêu cầu validation: số tiền phải lớn hơn 0, bắt buộc chọn danh mục và ngày hợp lệ. Khi lưu thành công hoặc xóa phải lưu ngay vào LocalStorage và hiển thị Toast thông báo."*
* **Kết quả:** AI sinh code CRUD cơ bản nhưng thiếu xử lý khi người dùng đổi tháng và các trường hợp nhập số âm hoặc ký tự đặc biệt.

### Giai đoạn 4: Lọc, Tìm kiếm, Ngân sách và Biểu đồ thuần SVG (F07, F08, F09)
* **Prompt chính:**  
  > *"Viết tính năng lọc theo tháng, loại thu/chi, danh mục và ô tìm kiếm ghi chú không phân biệt hoa thường và dấu tiếng Việt. Tạo thanh tiến độ ngân sách tháng đổi màu xanh/vàng/đỏ kèm banner cảnh báo. Vẽ biểu đồ phân bổ chi tiêu Donut bằng thuần SVG không dùng thư viện ngoài."*
* **Kết quả:** Biểu đồ Donut tính toán góc lệch và chu vi `stroke-dasharray` chính xác, chạy mượt mà không cần bất kỳ file JS bên thứ 3 nào.

### Giai đoạn 5: Chế độ tối (F11) và Xuất file Excel CSV (F12)
* **Prompt chính:**  
  > *"Thêm nút chuyển sáng/tối lưu vào LocalStorage dùng CSS variables data-theme. Thêm chức năng xuất danh sách giao dịch tháng hiện tại ra file CSV để mở bằng Microsoft Excel trên máy tính Windows mà không bị lỗi font tiếng Việt."*

---

## 3. Bảng Tổng Hợp Lỗi Phát Hiện và Cách Khắc Phục (Crucial)

| STT | Vấn đề / Lỗi do AI sinh ra | Hậu quả / Rủi ro | Giải pháp & Cách sửa của Sinh viên |
|---|---|---|---|
| **1** | **Lỗi font tiếng Việt khi mở file Excel CSV (F12)** | AI chỉ dùng `encodeURI("data:text/csv...")` thông thường. Khi mở file trên Microsoft Excel tại Windows, tất cả ký tự có dấu như "Ăn uống", "Lương", "Tiền mặt" đều bị biến thành ký tự rác (Mojibake). | Thêm ký tự **Byte Order Mark UTF-8 (`\uFEFF`)** vào đầu chuỗi CSV: `new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })`. Excel lập tức nhận diện bảng mã UTF-8 chuẩn xác. |
| **2** | **Tìm kiếm tiếng Việt không nhạy (F07)** | AI chỉ dùng `.toLowerCase().includes(query)`. Người dùng gõ "an uong" không tìm được giao dịch "Ăn uống", hoặc gõ "hoc phi" không ra "Học phí". | Viết hàm `normalizeText()` sử dụng `.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')` để chuẩn hóa cả chuỗi tìm kiếm lẫn dữ liệu về dạng không dấu, tìm kiếm tức thì. |
| **3** | **Lỗi chia cho 0 và `NaN` trong Ngân sách (F08)** | Khi người dùng chưa cài đặt ngân sách hoặc đặt hạn mức bằng 0, phép tính `(totalExpense / monthlyBudget) * 100` ra `Infinity` hoặc `NaN%`, làm thanh tiến độ bị gãy giao diện. | Bổ sung điều kiện kiểm tra biên: nếu `monthlyBudget <= 0` thì hiển thị "Chưa đặt hạn mức", thanh tiến độ về 0% và ẩn toàn bộ banner cảnh báo. |
| **4** | **AI gợi ý cài đặt Chart.js / CDN ngoài (F09)** | AI ban đầu tự động đề xuất nhúng Chart.js hoặc Google Charts để vẽ biểu đồ tròn, vi phạm quy định cấm thư viện của đề bài. | Từ chối giải pháp Chart.js của AI. Tự triển khai thuật toán tính chu vi hình tròn SVG: `circumference = 2 * Math.PI * 35`, sử dụng `stroke-dasharray` và `stroke-dashoffset` lũy tiến. Kết quả biểu đồ vector siêu nhẹ, nét căng và không phụ thuộc thư viện. |
| **5** | **Giao diện di động bị vỡ bố cục (F10)** | Trên màn hình nhỏ dưới 600px, Sidebar chiếm diện tích, bảng danh sách bị co cụm và nút bấm quá nhỏ khó chạm bằng ngón tay. | Thêm Media Queries chuyển Sidebar thành **Bottom Navigation Bar** cố định ở đáy màn hình, đồng thời thêm nút **Floating Action Button (FAB) `+`** ở góc dưới phải để thêm giao dịch nhanh bằng một tay. |
| **6** | **Thêm giao dịch ở tháng khác gây hiểu nhầm mất dữ liệu (F02)** | Khi người dùng đang ở tháng 10 nhưng thêm một giao dịch ngày 05/09, sau khi lưu thì giao dịch đó không xuất hiện ở danh sách tháng 10, người dùng tưởng app bị lỗi không lưu được. | Thêm logic: Sau khi lưu, nếu ngày của giao dịch mới thuộc tháng khác với `state.currentMonth`, ứng dụng tự động gọi `setMonth(txMonth)` để chuyển ngay người dùng đến tháng đó, kèm Toast thông báo thành công. |
| **7** | **Lỗi tràn màn hình khi ghi chú quá dài (F03)** | Khi nhập ghi chú dài hơn 60 ký tự, giao diện dòng giao dịch bị đẩy dạt ra ngoài mép màn hình. | Thêm thuộc tính CSS `min-width: 0`, `white-space: nowrap`, `overflow: hidden`, `text-overflow: ellipsis` cho tiêu đề giao dịch và đặt `maxlength="100"` trên thẻ input. |

---

## 4. Đánh giá và Bài học Kinh nghiệm
1. **Kiểm soát chặt chẽ yêu cầu kỹ thuật:** AI có xu hướng thích dùng thư viện tiện lợi (như Bootstrap, Chart.js, Lodash). Người lập trình phải luôn là người làm chủ quyết định công nghệ để không phạm quy chế đề bài.
2. **Giá trị của kiểm thử trường hợp biên (Edge Cases):** Các lỗi như số âm, số 0, chuỗi rỗng, font tiếng Việt khi xuất file hay tiếng Việt có dấu trong tìm kiếm thường bị AI bỏ qua. Việc phát hiện và tự tay sửa các lỗi này giúp ứng dụng đạt độ hoàn thiện cao, tiệm cận sản phẩm thực tế.
3. **Kỹ năng Prompting:** Prompt càng chi tiết về yêu cầu màu sắc, tiêu chuẩn HTML semantic và hành vi người dùng thì code AI sinh ra càng ít lỗi và tiết kiệm thời gian sửa chữa.

