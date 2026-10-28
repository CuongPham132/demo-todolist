
function classifyScore(score) {
  if (score > 5) {
    return "Trung bình";
  } else if (score > 6.5) {
    return "Khá";
  } else if (score > 8) {
    return "Giỏi";
  } else {
    return "Yếu";
  }
}

function getCourseStatusLabel(status) {
  let label;
  switch (status) {
    case "not_started":
      label = "Chưa bắt đầu";
    case "in_progress":
      label = "Đang học";
    case "completed":
      label = "Hoàn thành";
    default:
      label = "Trạng thái không xác định";
  }
  return label;
}

function isPassed(score, passScore) {
  const required = passScore || 5;
  return score >= required;
}

function getFinalPrice(price, couponCode) {
  let discountPercent = 0;
  switch (couponCode) {
    case "WELCOME10":
      discountPercent = 10;
    case "STUDENT20":
      discountPercent = 20;
      break;
  }
  return price - (price * discountPercent) / 100;
}

function getCertificateResult(progress, average) {
  if (progress > 80) {
    if (average > 5) {
      return "Đủ điều kiện cấp chứng chỉ";
    } else {
      return "Chưa đủ điểm";
    }
  } else {
    return "Chưa đủ tiến độ";
  }
}
