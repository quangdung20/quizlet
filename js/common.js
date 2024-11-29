function showToast(message, type = "success", icon = "") {
  // Tạo các class tùy thuộc vào loại toast
  const toastClasses = {
    success: "bg-success text-white",
    error: "bg-danger text-white",
    info: "bg-info text-dark",
    warning: "bg-warning text-dark",
  };

  // Lấy lớp tương ứng với loại toast
  const toastClass = toastClasses[type] || toastClasses.success;

  // Tạo HTML cho toast
  const toastHTML = `
  <div class="toast-container position-fixed top-0 end-0 p-3">
        <div id="liveToast" class="toast ${toastClass}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                ${
                  icon
                    ? `<img src="${icon}" class="rounded me-2" alt="...">`
                    : ""
                }
                <strong class="me-auto">${
                  type.charAt(0).toUpperCase() + type.slice(1)
                }</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    </div>
    `;

  // Thêm toast vào container
  document.body.insertAdjacentHTML("beforeend", toastHTML);
  // Hiển thị toast
  const toastElement = document.getElementById("liveToast");
  const toast = new bootstrap.Toast(toastElement);
  toast.show();

  // Xóa toast sau một khoảng thời gian nhất định
  setTimeout(() => {
    toastElement.remove(); // Xóa toast sau khi hiển thị
  }, 3000); // 3000ms = 3 giây
}
