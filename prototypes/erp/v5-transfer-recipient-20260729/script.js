const toast = document.querySelector("#toast");

function showToast(message, error = false) {
  toast.textContent = message;
  toast.style.background = error ? "#fef0f0" : "#f0f9eb";
  toast.style.color = error ? "#f56c6c" : "#67c23a";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}
document.querySelector("#submit-button").addEventListener("click", () => {
  showToast("调拨单已提交审核");
});
document.querySelectorAll(".danger").forEach(button => button.addEventListener("click", () => button.closest("tr").remove()));
