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


function createLoadingModal() {
  // Kiểm tra xem modal đã tồn tại chưa
  if (!document.getElementById("loadingModal")) {
    // Tạo modal HTML
    const modalHTML = `
            <div class="modal fade" id="loadingModal" tabindex="-1" role="dialog" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-body text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                            <p class="mt-3">Processing, please wait...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    // Thêm modal vào body
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }
}

// Hiển thị modal loading
function showLoading() {
  createLoadingModal(); // Gọi hàm tạo modal nếu chưa có
  const loadingModal = new bootstrap.Modal(
    document.getElementById("loadingModal")
  );
  loadingModal.show();
}

// Ẩn modal loading
function hideLoading() {
  const loadingModal = bootstrap.Modal.getInstance(
    document.getElementById("loadingModal")
  );
  if (loadingModal) {
    loadingModal.hide();
  }
}
