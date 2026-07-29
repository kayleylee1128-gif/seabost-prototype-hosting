const recipients = {
  "张敏": { phone: "138 0013 8000", address: "广东省东莞市凤岗镇雁田村怡安工业城 88 号 美客多01优选仓" },
  "李伟": { phone: "186 7550 2288", address: "广东省东莞市塘厦镇林村新阳路 26 号 东莞中转仓" },
  "王芳": { phone: "135 1098 6677", address: "广东省深圳市龙岗区坂田街道雪岗北路 2018 号 深圳售后仓" }
};
const recipient = document.querySelector("#recipient");
const phone = document.querySelector("#phone");
const address = document.querySelector("#address");
const tip = document.querySelector("#recipient-tip");
const toast = document.querySelector("#toast");

function showToast(message, error = false) {
  toast.textContent = message;
  toast.style.background = error ? "#fef0f0" : "#f0f9eb";
  toast.style.color = error ? "#f56c6c" : "#67c23a";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
recipient.addEventListener("change", () => {
  const data = recipients[recipient.value.trim()];
  if (!data) return;
  phone.value = data.phone;
  address.value = data.address;
  tip.textContent = `已带入${recipient.value.trim()}的常用收件信息，可直接修改。`;
  tip.className = "recipient-tip success";
});
document.querySelector("#submit-button").addEventListener("click", () => {
  showToast("调拨单已提交审核");
});
document.querySelectorAll(".danger").forEach(button => button.addEventListener("click", () => button.closest("tr").remove()));
