// Static curriculum map for every subject in the app. Adding a subject means
// adding one entry here (plus its content JSON files) - nothing else in the
// engine needs to change.

const SUBJECTS = {
  ktpl12: {
    id: "ktpl12",
    name: "KTPL 12",
    fullName: "Giáo dục Kinh tế và Pháp luật 12",
    tagline: "Kết nối tri thức với cuộc sống",
    color: "#58cc02",
    unitLabel: "Chủ đề",
    lessonLabel: "Bài",
    chuDe: [
      { id: "cd1", order: 1, title: "Tăng trưởng và phát triển kinh tế", color: "#58cc02" },
      { id: "cd2", order: 2, title: "Hội nhập kinh tế quốc tế", color: "#1cb0f6" },
      { id: "cd3", order: 3, title: "Bảo hiểm và an sinh xã hội", color: "#ff9600" },
      { id: "cd4", order: 4, title: "Lập kế hoạch kinh doanh", color: "#ce82ff" },
      { id: "cd5", order: 5, title: "Trách nhiệm xã hội của doanh nghiệp", color: "#ff4b4b" },
      { id: "cd6", order: 6, title: "Quản lí thu, chi trong gia đình", color: "#2b70c9" },
      { id: "cd7", order: 7, title: "Một số quyền và nghĩa vụ của công dân về kinh tế", color: "#58cc02" },
      { id: "cd8", order: 8, title: "Quyền và nghĩa vụ của công dân về văn hoá, xã hội", color: "#ff9600" },
      { id: "cd9", order: 9, title: "Một số vấn đề cơ bản của luật quốc tế", color: "#1cb0f6" },
    ],
    bai: [
      { id: "bai01", chuDeId: "cd1", baiNumber: 1, title: "Tăng trưởng và phát triển kinh tế" },
      { id: "bai02", chuDeId: "cd2", baiNumber: 2, title: "Hội nhập kinh tế quốc tế" },
      { id: "bai03", chuDeId: "cd3", baiNumber: 3, title: "Bảo hiểm" },
      { id: "bai04", chuDeId: "cd3", baiNumber: 4, title: "An sinh xã hội" },
      { id: "bai05", chuDeId: "cd4", baiNumber: 5, title: "Lập kế hoạch kinh doanh" },
      { id: "bai06", chuDeId: "cd5", baiNumber: 6, title: "Trách nhiệm xã hội của doanh nghiệp" },
      { id: "bai07", chuDeId: "cd6", baiNumber: 7, title: "Quản lí thu, chi trong gia đình" },
      { id: "bai08", chuDeId: "cd7", baiNumber: 8, title: "Quyền và nghĩa vụ về kinh doanh, nộp thuế" },
      { id: "bai09", chuDeId: "cd7", baiNumber: 9, title: "Quyền và nghĩa vụ về sở hữu tài sản" },
      { id: "bai10", chuDeId: "cd8", baiNumber: 10, title: "Quyền và nghĩa vụ trong hôn nhân và gia đình" },
      { id: "bai11", chuDeId: "cd8", baiNumber: 11, title: "Quyền và nghĩa vụ trong học tập" },
      { id: "bai12", chuDeId: "cd8", baiNumber: 12, title: "Quyền và nghĩa vụ trong bảo vệ, chăm sóc sức khoẻ" },
      { id: "bai13", chuDeId: "cd8", baiNumber: 13, title: "Quyền và nghĩa vụ bảo vệ di sản, môi trường" },
      { id: "bai14", chuDeId: "cd9", baiNumber: 14, title: "Một số vấn đề chung về pháp luật quốc tế" },
      { id: "bai15", chuDeId: "cd9", baiNumber: 15, title: "Công pháp quốc tế về dân cư, lãnh thổ, chủ quyền" },
      { id: "bai16", chuDeId: "cd9", baiNumber: 16, title: "Nguyên tắc WTO và hợp đồng thương mại quốc tế" },
    ],
  },

  vatli12: {
    id: "vatli12",
    name: "Vật Lí 12",
    fullName: "Vật Lí 12",
    tagline: "Kết nối tri thức với cuộc sống",
    color: "#1cb0f6",
    unitLabel: "Chương",
    lessonLabel: "Bài",
    chuDe: [
      { id: "vlc1", order: 1, title: "Vật lí nhiệt", color: "#ff9600" },
      { id: "vlc2", order: 2, title: "Khí lí tưởng", color: "#58cc02" },
      { id: "vlc3", order: 3, title: "Từ trường", color: "#1cb0f6" },
      { id: "vlc4", order: 4, title: "Vật lí hạt nhân", color: "#ce82ff" },
    ],
    bai: [
      { id: "bai01", chuDeId: "vlc1", baiNumber: 1, title: "Cấu trúc của chất. Sự chuyển thể" },
      { id: "bai02", chuDeId: "vlc1", baiNumber: 2, title: "Nội năng. Định luật I của nhiệt động lực học" },
      { id: "bai03", chuDeId: "vlc1", baiNumber: 3, title: "Nhiệt độ. Thang nhiệt độ - nhiệt kế" },
      { id: "bai04", chuDeId: "vlc1", baiNumber: 4, title: "Nhiệt dung riêng" },
      { id: "bai05", chuDeId: "vlc1", baiNumber: 5, title: "Nhiệt nóng chảy riêng" },
      { id: "bai06", chuDeId: "vlc1", baiNumber: 6, title: "Nhiệt hoá hơi riêng" },
      { id: "bai08", chuDeId: "vlc2", baiNumber: 8, title: "Mô hình động học phân tử chất khí" },
      { id: "bai09", chuDeId: "vlc2", baiNumber: 9, title: "Định luật Boyle" },
      { id: "bai10", chuDeId: "vlc2", baiNumber: 10, title: "Định luật Charles" },
      { id: "bai11", chuDeId: "vlc2", baiNumber: 11, title: "Phương trình trạng thái của khí lí tưởng" },
      { id: "bai12", chuDeId: "vlc2", baiNumber: 12, title: "Áp suất khí theo mô hình động học phân tử" },
      { id: "bai14", chuDeId: "vlc3", baiNumber: 14, title: "Từ trường" },
      { id: "bai15", chuDeId: "vlc3", baiNumber: 15, title: "Lực từ. Cảm ứng từ" },
      { id: "bai16", chuDeId: "vlc3", baiNumber: 16, title: "Từ thông. Hiện tượng cảm ứng điện từ" },
      { id: "bai17", chuDeId: "vlc3", baiNumber: 17, title: "Máy phát điện xoay chiều" },
      { id: "bai18", chuDeId: "vlc3", baiNumber: 18, title: "Ứng dụng hiện tượng cảm ứng điện từ" },
      { id: "bai19", chuDeId: "vlc3", baiNumber: 19, title: "Điện từ trường. Mô hình sóng điện từ" },
      { id: "bai21", chuDeId: "vlc4", baiNumber: 21, title: "Cấu trúc hạt nhân" },
      { id: "bai22", chuDeId: "vlc4", baiNumber: 22, title: "Phản ứng hạt nhân và năng lượng liên kết" },
      { id: "bai23", chuDeId: "vlc4", baiNumber: 23, title: "Hiện tượng phóng xạ" },
      { id: "bai24", chuDeId: "vlc4", baiNumber: 24, title: "Công nghiệp hạt nhân" },
    ],
  },

  toan12: {
    id: "toan12",
    name: "Toán 12",
    fullName: "Toán 12",
    tagline: "Kết nối tri thức với cuộc sống",
    color: "#ce82ff",
    unitLabel: "Chương",
    lessonLabel: "Bài",
    chuDe: [
      { id: "c1", order: 1, title: "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số", color: "#ce82ff" },
      { id: "c2", order: 2, title: "Vectơ và hệ trục toạ độ trong không gian", color: "#1cb0f6" },
      { id: "c3", order: 3, title: "Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm", color: "#ff9600" },
      { id: "c4", order: 4, title: "Nguyên hàm và tích phân", color: "#58cc02" },
      { id: "c5", order: 5, title: "Phương pháp toạ độ trong không gian", color: "#ff4b4b" },
      { id: "c6", order: 6, title: "Xác suất có điều kiện", color: "#2b70c9" },
    ],
    bai: [
      { id: "bai01", chuDeId: "c1", baiNumber: 1, title: "Tính đơn điệu và cực trị của hàm số" },
      { id: "bai02", chuDeId: "c1", baiNumber: 2, title: "Giá trị lớn nhất và giá trị nhỏ nhất của hàm số" },
      { id: "bai03", chuDeId: "c1", baiNumber: 3, title: "Đường tiệm cận của đồ thị hàm số" },
      { id: "bai04", chuDeId: "c1", baiNumber: 4, title: "Khảo sát sự biến thiên và vẽ đồ thị của hàm số" },
      { id: "bai05", chuDeId: "c1", baiNumber: 5, title: "Ứng dụng đạo hàm để giải quyết một số vấn đề liên quan đến thực tiễn" },
      { id: "bai06", chuDeId: "c2", baiNumber: 6, title: "Vectơ trong không gian" },
      { id: "bai07", chuDeId: "c2", baiNumber: 7, title: "Hệ trục toạ độ trong không gian" },
      { id: "bai08", chuDeId: "c2", baiNumber: 8, title: "Biểu thức toạ độ của các phép toán vectơ" },
      { id: "bai09", chuDeId: "c3", baiNumber: 9, title: "Khoảng biến thiên và khoảng tứ phân vị" },
      { id: "bai10", chuDeId: "c3", baiNumber: 10, title: "Phương sai và độ lệch chuẩn" },
      { id: "bai11", chuDeId: "c4", baiNumber: 11, title: "Nguyên hàm" },
      { id: "bai12", chuDeId: "c4", baiNumber: 12, title: "Tích phân" },
      { id: "bai13", chuDeId: "c4", baiNumber: 13, title: "Ứng dụng hình học của tích phân" },
      { id: "bai14", chuDeId: "c5", baiNumber: 14, title: "Phương trình mặt phẳng" },
      { id: "bai15", chuDeId: "c5", baiNumber: 15, title: "Phương trình đường thẳng trong không gian" },
      { id: "bai16", chuDeId: "c5", baiNumber: 16, title: "Công thức tính góc trong không gian" },
      { id: "bai17", chuDeId: "c5", baiNumber: 17, title: "Phương trình mặt cầu" },
      { id: "bai18", chuDeId: "c6", baiNumber: 18, title: "Xác suất có điều kiện" },
      { id: "bai19", chuDeId: "c6", baiNumber: 19, title: "Công thức xác suất toàn phần và công thức Bayes" },
    ],
  },
};

const SUBJECT_ORDER = ["ktpl12", "vatli12", "toan12"];

function chuDeById(subjectId, id) {
  return SUBJECTS[subjectId].chuDe.find((c) => c.id === id);
}

function baiByChuDe(subjectId, chuDeId) {
  return SUBJECTS[subjectId].bai.filter((b) => b.chuDeId === chuDeId);
}
