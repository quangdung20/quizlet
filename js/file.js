const fileItem = JSON.parse(sessionStorage.getItem("fileItem"));
const fileId = fileItem.fileId;
const folderId = fileItem.folderId;
const fileNameLabel = (document.getElementById("fileName").innerHTML =
  fileItem.fileName);
const axiosservice = new AxiosService();
document.addEventListener("DOMContentLoaded", () => {
  displayFilesInCarousel(fileId);
});

async function displayFilesInCarousel(fileId) {
  try {
    const response = await axiosservice.get(`/api/folders/${folderId}/files`);

    const files = response;
    console.log(response);

    RenderFileSlide(files);
  } catch (error) {
    console.error("Error displaying files in carousel:", error);
    showToast("Không thể tải slide file. Vui lòng thử lại!", "error");
  }
}

function RenderFileSlide(files) {
  const carouselInner = document.querySelector(".carousel-inner");
  carouselInner.innerHTML = ""; // Xóa các slide cũ

  files.forEach((file, index) => {
    const carouselItem = document.createElement("div");
    carouselItem.classList.add("carousel-item");
    if (index === 0) carouselItem.classList.add("active"); // Slide đầu tiên phải active

    // Chia các file thành các nhóm 3 card mỗi slide
    const numberOfSlides = Math.ceil(files.length / 3); // Số lượng slide cần hiển thị
    for (let i = 0; i < numberOfSlides; i++) {
      const slide = document.createElement("div");
      slide.classList.add("carousel-item");
      if (i === 0) slide.classList.add("active"); // Slide đầu tiên phải active

      const slideContent = document.createElement("div");
      slideContent.classList.add("d-flex", "justify-content-center", "gap-3");

      // Thêm 3 card vào mỗi slide
      for (let j = i * 3; j < (i + 1) * 3 && j < files.length; j++) {
        const file = files[j];
        const card = document.createElement("div");
        card.classList.add("card");
        card.style.width = "18rem";
        card.innerHTML = `
                <div class="d-flex justify-content-center slide_item">
                    <div class="card cart_item_slide bg-secondary" style="width: 18rem;">
                        <div class="card-body position-relative">
                            <h5 class="card-title">${file.name}</h5>
                            <p class="card-text m-0">ID: ${file.id}</p>
                            <button class="btn btn-primary btnViewFile d-flex p-2 align-items-center" onclick="CardFileDetail(${file.id}, '${file.name}')">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            `;
        slideContent.appendChild(card);
      }

      slide.appendChild(slideContent);
      carouselInner.appendChild(slide);
    }
  });
}

function CardFileDetail(fileId, fileName) {
  const fileItem = {
    fileId: fileId,
    fileName: fileName,
    folderId: folderId,
  };
  sessionStorage.setItem("fileItem", JSON.stringify(fileItem));
  window.location.href = "./file.html";
}
