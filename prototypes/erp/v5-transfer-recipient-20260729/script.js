const recipients = {
  zhang: { phone: "138 0013 8000", address: "广东省东莞市凤岗镇雁田村怡安工业城 88 号 美客多01优选仓" },
  li: { phone: "186 7550 2288", address: "广东省东莞市塘厦镇林村新阳路 26 号 东莞中转仓" },
  wang: { phone: "135 1098 6677", address: "广东省深圳市龙岗区坂田街道雪岗北路 2018 号 深圳售后仓" }
};
const select = document.querySelector("#recipient-select");
const phone = document.querySelector("#phone");
const address = document.querySelector("#address");
const editButton = document.querySelector("#edit-button");
const tip = document.querySelector("#recipient-tip");
const toast = document.querySelector("#toast");
let editing = false;

function setEditing(next) {
  editing = next;
  phone.readOnly = !next;
  address.readOnly = !next;
  editButton.textContent = next ? "保存收件信息" : "编辑收件信息";
  if (next) phone.focus();
}
function showToast(message, error = false) {
  toast.textContent = message;
  toast.style.background = error ? "#fef0f0" : "#f0f9eb";
  toast.style.color = error ? "#f56c6c" : "#67c23a";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
select.addEventListener("change", () => {
  if (select.value === "new") {
    phone.value = "";
    address.value = "";
    setEditing(true);
    tip.textContent = "请填写新的联系方式和收件地址，保存后可用于本次调拨。";
    tip.className = "recipient-tip";
    return;
  }
  const data = recipients[select.value];
  phone.value = data?.phone || "";
  address.value = data?.address || "";
  setEditing(false);
  tip.textContent = data ? "已自动带入该收件人的默认联系方式与地址，可点击右上角编辑。" : "请选择收件人，系统将自动填充联系方式和收件地址。";
  tip.className = data ? "recipient-tip success" : "recipient-tip";
});
editButton.addEventListener("click", () => {
  if (!select.value) return showToast("请先选择收件人", true);
  if (editing) {
    if (!phone.value.trim() || !address.value.trim()) return showToast("请完整填写联系方式和收件地址", true);
    setEditing(false);
    tip.textContent = "收件信息已更新，本次调拨将使用当前信息。";
    tip.className = "recipient-tip success";
    showToast("收件信息已保存");
  } else setEditing(true);
});
document.querySelector("#submit-button").addEventListener("click", () => {
  if (!select.value || !phone.value.trim() || !address.value.trim()) return showToast("请先完善收件信息", true);
  showToast("调拨单已提交审核");
});
document.querySelectorAll(".danger").forEach(button => button.addEventListener("click", () => button.closest("tr").remove()));
