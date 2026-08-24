const shell = document.querySelector(".c-shell");
const drawer = document.querySelector(".c-drawer");
const drawerMask = document.querySelector(".c-drawer-mask");
const modal = document.querySelector(".c-modal");
const modalMask = document.querySelector(".c-modal-mask");
const modalBody = document.querySelector("#modal-body");
const modalTitle = document.querySelector("#modal-title");
const confirmButton = document.querySelector("[data-action='confirm-modal']");
const toast = document.querySelector(".toast");
const processedDetailModal = document.querySelector("[data-component='ProcessedDetailModal']");
const processedDetailMask = document.querySelector(".processed-detail-mask");
const processedDetailBody = document.querySelector("#processed-detail-body");
const drawerOriginalBody = drawer.querySelector(".c-drawer__body").innerHTML;
const drawerOriginalMeta = drawer.querySelector(".c-drawer__meta").innerHTML;

let modalMode = "default";
let currentPlan = null;
let currentBulkPlans = [];

const supplierProfilesBySku = {
  "SKU-BAT-8842": [
    { name: "深圳启明电子", receiver: "张晶", phone: "18975537514", address: "中国广东省深圳市龙岗区金鸿德电商产业园 C 栋 5 楼（前台收）" },
    { name: "东莞锐鑫电子", receiver: "陈晓", phone: "13800138026", address: "中国广东省东莞市谢岗镇银湖工业区 A 区 2 号仓（供应商收货处）" },
    { name: "宁波辰禾能源", receiver: "王芳", phone: "0574-87961208", address: "中国浙江省宁波市鄞州区启运路 88 号辰禾产业园 3 幢" },
  ],
  "SKU-PAD-7710": [
    { name: "杭州品越家居", receiver: "赵敏", phone: "13958124680", address: "中国浙江省杭州市余杭区良渚街道物流园 6 号楼" },
    { name: "深圳启明电子", receiver: "张晶", phone: "18975537514", address: "中国广东省深圳市龙岗区金鸿德电商产业园 C 栋 5 楼（前台收）" },
  ],
  "SKU-TOOL-5571": [
    { name: "宁波远拓工具", receiver: "周立", phone: "0574-86882216", address: "中国浙江省宁波市北仑区港城大道 168 号远拓工具园区" },
    { name: "苏州松岭科技", receiver: "刘洋", phone: "0512-66581230", address: "中国江苏省苏州市吴中区木渎镇金桥路 18 号" },
  ],
};

const defectiveImageSetsBySku = {
  "SKU-BAT-8842": [
    { returnNo: "RT-IN-20260520-0089", uploadedAt: "2026-05-20 15:16", caption: "机身正面划痕", tone: "#d6e4ff" },
    { returnNo: "RT-IN-20260521-0034", uploadedAt: "2026-05-21 11:34", caption: "包装破损", tone: "#fff1b8" },
    { returnNo: "RT-IN-20260522-0017", uploadedAt: "2026-05-22 09:18", caption: "接口松动", tone: "#d9f7be" },
  ],
  "SKU-PAD-7710": [
    { returnNo: "RT-IN-20260518-0062", uploadedAt: "2026-05-18 09:45", caption: "边角磕碰", tone: "#ffd6e7" },
    { returnNo: "RT-IN-20260518-0062", uploadedAt: "2026-05-18 09:46", caption: "屏幕细纹", tone: "#d6e4ff" },
  ],
  "SKU-TOOL-5571": [
    { returnNo: "RT-IN-20260517-0048", uploadedAt: "2026-05-17 11:31", caption: "外壳氧化", tone: "#e6e6e6" },
    { returnNo: "RT-IN-20260517-0048", uploadedAt: "2026-05-17 11:32", caption: "工具头磨损", tone: "#ffe7ba" },
  ],
};

const processedDetailRecords = {
  DP260528001: {
    recordNo: "DP260528001", initiatedAt: "2026-05-28 16:40", supplier: "深圳启明电子", warehouse: "华东一仓", storageType: "已上架次品区", storageTag: "processing", totalQty: 30, status: "已完成", statusTag: "success", associatedDoc: "RX260528001",
    returns: [
      { returnNo: "RT-IN-20260520-0089", receivedAt: "2026-05-20 15:16", platformOrder: "AMZ-250520-0089", sku: "SKU-BAT-8842", qty: 18 },
      { returnNo: "RT-IN-20260521-0034", receivedAt: "2026-05-21 11:34", platformOrder: "AMZ-250521-0034", sku: "SKU-BAT-8842", qty: 12 },
    ],
    plan: { primary: "返修", scheme: "返修入库", title: "返修入库", qty: 30, fee: "¥480.00", freight: "公司承担", receiver: "张晶", phone: "18975537514", address: "中国广东省深圳市龙岗区金鸿德电商产业园 C 栋 5 楼（前台收）", result: "已生成返修出库单，等待供应商返修后入库" },
  },
  DP260526009: {
    recordNo: "DP260526009", initiatedAt: "2026-05-26 10:18", supplier: "深圳启明电子", warehouse: "华东一仓", storageType: "次品框归集", storageTag: "warning", totalQty: 14, status: "返修中", statusTag: "processing", associatedDoc: "RX260526009",
    returns: [{ returnNo: "RT-IN-20260522-0017", receivedAt: "2026-05-22 09:18", platformOrder: "AMZ-250522-0017", sku: "SKU-BAT-8842", qty: 14 }],
    plan: { primary: "返修", scheme: "返修换货", title: "返修换货", qty: 14, exchangeSku: "SKU-BAT-8842-NEW", exchangeQty: 14, fee: "¥0.00", freight: "供应商承担", receiver: "张晶", phone: "18975537514", address: "中国广东省深圳市龙岗区金鸿德电商产业园 C 栋 5 楼（前台收）", result: "返修出库已完成，等待供应商寄回换货品" },
  },
  DP260518016: {
    recordNo: "DP260518016", initiatedAt: "2026-05-18 09:40", supplier: "杭州品越家居", warehouse: "华东一仓", storageType: "已上架次品区", storageTag: "processing", totalQty: 28, status: "已完成", statusTag: "success", associatedDoc: "BS260518016",
    returns: [{ returnNo: "RT-IN-20260518-0062", receivedAt: "2026-05-18 09:45", platformOrder: "TM-250518-0062", sku: "SKU-PAD-7710", qty: 28 }],
    plan: { primary: "报损", scheme: "报损", title: "报损（无挽损）", qty: 28, scrapAmount: "¥2,520.00", result: "报损出库已完成，次品库存已扣减" },
  },
  DP260517003: {
    recordNo: "DP260517003", initiatedAt: "2026-05-17 11:26", supplier: "宁波远拓工具", warehouse: "华北仓", storageType: "已上架次品区", storageTag: "processing", totalQty: 26, status: "已取消", statusTag: "default", associatedDoc: "RX260517003",
    returns: [{ returnNo: "RT-IN-20260517-0048", receivedAt: "2026-05-17 11:31", platformOrder: "EB-250517-0048", sku: "SKU-TOOL-5571", qty: 26 }],
    plan: { primary: "返修", scheme: "返修换货", title: "返修换货", qty: 26, exchangeSku: "SKU-TOOL-5571-NEW", exchangeQty: 26, fee: "¥0.00", freight: "供应商承担", receiver: "周立", phone: "0574-86882216", address: "中国浙江省宁波市北仑区港城大道 168 号远拓工具园区", result: "处置记录已取消，未继续生成后续库存单据" },
  },
  DP260514002: {
    recordNo: "DP260514002", initiatedAt: "2026-05-14 15:06", supplier: "广州蓝森户外", warehouse: "华南二仓", storageType: "次品框归集", storageTag: "warning", totalQty: 18, status: "审核中", statusTag: "processing", associatedDoc: "BS260514002",
    returns: [{ returnNo: "RT-IN-20260514-0021", receivedAt: "2026-05-14 15:12", platformOrder: "SHEIN-250514-0021", sku: "SKU-CAMP-1208", qty: 18 }],
    plan: { primary: "报损", scheme: "抵扣账单", title: "抵扣账单", qty: 18, deductAmount: "¥1,080.00", result: "已生成供应商对账明细，等待审核确认" },
  },
};

function escapeSvgText(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char]));
}

function defectiveImageSrc(image) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><rect width="960" height="640" fill="#f5f7fa"/><rect x="36" y="36" width="888" height="568" rx="24" fill="${image.tone}"/><rect x="124" y="122" width="712" height="332" rx="18" fill="#ffffff" opacity=".9"/><path d="M180 388l146-146 102 96 84-76 268 220H180z" fill="#1677ff" opacity=".2"/><circle cx="708" cy="218" r="44" fill="#1677ff" opacity=".18"/><text x="480" y="520" text-anchor="middle" fill="#1f2937" font-size="30" font-family="Arial,Microsoft YaHei,sans-serif">${escapeSvgText(image.caption)}</text><text x="480" y="558" text-anchor="middle" fill="#667085" font-size="18" font-family="Arial,Microsoft YaHei,sans-serif">仓库上传次品图片 · ${escapeSvgText(image.returnNo)}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getDefectiveImages(sku) {
  const images = defectiveImageSetsBySku[sku] || [{ returnNo: "RT-IN-20260522-0017", uploadedAt: "2026-05-22 09:18", caption: "次品外观", tone: "#d6e4ff" }];
  return images.map((image) => ({ ...image, src: defectiveImageSrc(image) }));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function processedPlanDetailTemplate(record) {
  const plan = record.plan;
  const baseFields = `
    <div class="processed-detail-grid">
      <div><span>处理方式</span><strong>${escapeHtml(plan.primary)}</strong></div>
      <div><span>处理方案</span><strong>${escapeHtml(plan.title)}</strong></div>
      <div><span>处置数量</span><strong>${escapeHtml(plan.qty)} 件</strong></div>
      <div><span>关联单据</span><strong>${escapeHtml(record.associatedDoc)}</strong></div>
    </div>`;
  if (plan.scheme === "返修入库" || plan.scheme === "返修换货") {
    return `${baseFields}
      <div class="processed-detail-subsection">
        <div class="processed-detail-subsection__head"><strong>供应商收件信息</strong><span class="text-secondary">发起处置时默认加载，可编辑</span></div>
        <div class="processed-detail-contact"><div><span>供应商</span><strong>${escapeHtml(record.supplier)}</strong></div><div><span>收件人</span><strong>${escapeHtml(plan.receiver)}</strong></div><div><span>收件电话</span><strong>${escapeHtml(plan.phone)}</strong></div><div class="processed-detail-contact__wide"><span>收件人地址</span><strong>${escapeHtml(plan.address)}</strong></div></div>
      </div>
      <div class="processed-detail-subsection">
        <div class="processed-detail-subsection__head"><strong>返修方案信息</strong></div>
        <div class="processed-detail-info-lines"><div>返修费用：<strong>${escapeHtml(plan.fee)}</strong></div><div>运费承担：<strong>${escapeHtml(plan.freight)}</strong></div>${plan.exchangeSku ? `<div>换货 SKU：<strong>${escapeHtml(plan.exchangeSku)}</strong>，换货数量：<strong>${escapeHtml(plan.exchangeQty)} 件</strong></div>` : ""}<div>处理结果：${escapeHtml(plan.result)}</div></div>
      </div>`;
  }
  return `${baseFields}
    <div class="processed-detail-subsection">
      <div class="processed-detail-subsection__head"><strong>报损方案信息</strong></div>
      <div class="processed-detail-info-lines"><div>报损方案：<strong>${escapeHtml(plan.title)}</strong></div>${plan.scrapAmount ? `<div>报损金额：<strong>${escapeHtml(plan.scrapAmount)}</strong></div>` : ""}${plan.deductAmount ? `<div>抵扣金额：<strong>${escapeHtml(plan.deductAmount)}</strong></div><div>结算方向：生成供应商对账明细</div>` : ""}<div>处理结果：${escapeHtml(plan.result)}</div></div>
    </div>`;
}

function openProcessedDetail(recordId) {
  const record = processedDetailRecords[recordId];
  if (!record) return;
  processedDetailBody.innerHTML = `
    <div class="processed-detail-hero">
      <div><span>处置记录号</span><strong>${escapeHtml(record.recordNo)}</strong></div>
      <div><span>供应商</span><strong>${escapeHtml(record.supplier)}</strong></div>
      <div><span>当前状态</span><span class="tag tag--${record.statusTag}">${escapeHtml(record.status)}</span></div>
    </div>
    <section class="processed-detail-section">
      <div class="processed-detail-section__head"><h3>记录摘要</h3><span class="text-secondary">发起时间：${escapeHtml(record.initiatedAt)}</span></div>
      <div class="detail-summary-card"><div><span>仓库</span><strong>${escapeHtml(record.warehouse)}</strong></div><div><span>次品存放类型</span><strong>${escapeHtml(record.storageType)}</strong></div><div><span>处置总数量</span><strong>${escapeHtml(record.totalQty)} 件</strong></div></div>
    </section>
    <section class="processed-detail-section">
      <div class="processed-detail-section__head"><h3>关联退件单</h3><span class="tag tag--processing">${record.returns.length} 单</span></div>
      <table class="c-table processed-detail-table"><thead><tr><th>退件单号</th><th>平台单号</th><th>SKU</th><th class="c-table__cell--num">次品数量</th><th>收货时间</th></tr></thead><tbody>${record.returns.map((item) => `<tr><td><a class="link" data-action="open-defect-images" data-sku="${escapeHtml(item.sku)}">${escapeHtml(item.returnNo)}</a></td><td>${escapeHtml(item.platformOrder)}</td><td>${escapeHtml(item.sku)}</td><td class="c-table__cell--num">${escapeHtml(item.qty)}</td><td>${escapeHtml(item.receivedAt)}</td></tr>`).join("")}</tbody></table>
    </section>
    <section class="processed-detail-section">
      <div class="processed-detail-section__head"><h3>处理方案详情</h3><span class="text-secondary">按处置记录号 + 供应商归集</span></div>
      ${processedPlanDetailTemplate(record)}
    </section>`;
  processedDetailModal.dataset.open = "true";
  processedDetailMask.dataset.open = "true";
}

function closeProcessedDetail() {
  processedDetailModal.dataset.open = "false";
  processedDetailMask.dataset.open = "false";
}

function getSupplierProfiles(plan) {
  const profiles = supplierProfilesBySku[plan.sku] || [];
  if (profiles.some((profile) => profile.name === plan.supplier)) return profiles;
  return [{ name: plan.supplier, receiver: "张晶", phone: "18975537514", address: "中国广东省深圳市龙岗区金鸿德电商产业园 C 栋 5 楼（前台收）" }, ...profiles];
}

function getSupplierProfile(plan, supplierName = plan.supplier) {
  return getSupplierProfiles(plan).find((profile) => profile.name === supplierName) || getSupplierProfiles(plan)[0];
}

function updatePlanSupplier(supplierName) {
  if (!currentPlan) return;
  currentPlan.supplier = supplierName;
  const profile = getSupplierProfile(currentPlan, supplierName);
  const receiverInput = modalBody.querySelector("[data-field='repair-receiver']");
  const phoneInput = modalBody.querySelector("[data-field='repair-phone']");
  const addressInput = modalBody.querySelector("[data-field='repair-address']");
  const deductSupplierInput = modalBody.querySelector("[data-field='deduct-supplier']");
  if (receiverInput) receiverInput.value = profile.receiver;
  if (phoneInput) phoneInput.value = profile.phone;
  if (addressInput) addressInput.value = profile.address;
  if (deductSupplierInput) deductSupplierInput.value = supplierName;
  updatePlanPreview();
}

function money(value) {
  return `¥${Number(value).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function showToast(message, type = "default") {
  toast.textContent = message;
  toast.classList.toggle("toast--error", type === "error");
  toast.dataset.type = type;
  toast.dataset.visible = "true";
  window.setTimeout(() => {
    toast.dataset.visible = "false";
    toast.classList.remove("toast--error");
    toast.dataset.type = "default";
  }, 1800);
}

function openModal(title, bodyHtml, confirmText, mode = "default") {
  modal.classList.remove("c-modal--warning");
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  confirmButton.textContent = confirmText;
  confirmButton.hidden = false;
  modalMode = mode;
  modal.dataset.open = "true";
  modalMask.dataset.open = "true";
}

function closeModal() {
  modal.dataset.open = "false";
  modalMask.dataset.open = "false";
}

function openDrawer() {
  drawer.dataset.open = "true";
  drawerMask.dataset.open = "true";
}

function closeDrawer() {
  drawer.dataset.open = "false";
  drawerMask.dataset.open = "false";
}

const imageViewerMask = document.querySelector(".c-image-viewer-mask");
const imageViewerImage = document.querySelector("[data-role='image-viewer-image']");
const imageViewerMeta = document.querySelector("[data-role='image-viewer-meta']");
const imageViewerCaption = document.querySelector("[data-role='image-viewer-caption']");
const imageViewerCounter = document.querySelector("[data-role='image-viewer-counter']");
let imageViewerState = { sku: "", images: [], index: 0 };

function renderImageViewer() {
  const image = imageViewerState.images[imageViewerState.index];
  if (!image) return;
  imageViewerImage.src = image.src;
  imageViewerImage.alt = `${imageViewerState.sku} ${image.caption}`;
  imageViewerMeta.textContent = `${imageViewerState.sku} · ${image.returnNo}`;
  imageViewerCaption.textContent = `${image.caption} · ${image.uploadedAt}`;
  imageViewerCounter.textContent = `${imageViewerState.index + 1} / ${imageViewerState.images.length}`;
}

function openImageViewer(sku, index = 0) {
  imageViewerState = { sku, images: getDefectiveImages(sku), index: Math.max(0, Math.min(Number(index) || 0, getDefectiveImages(sku).length - 1)) };
  renderImageViewer();
  imageViewerMask.dataset.open = "true";
}

function closeImageViewer() {
  imageViewerMask.dataset.open = "false";
}

function moveImageViewer(step) {
  if (!imageViewerState.images.length) return;
  imageViewerState.index = (imageViewerState.index + step + imageViewerState.images.length) % imageViewerState.images.length;
  renderImageViewer();
}

function openPendingDetailDrawer(event) {
  const row = event?.currentTarget?.closest("[data-row]");
  const sku = row?.dataset.sku || "SKU-BAT-8842";
  const images = getDefectiveImages(sku);
  document.querySelector("#drawer-title").textContent = `${sku} 次品待处理详情`;
  drawer.querySelector(".c-drawer__meta").innerHTML = `<span class="tag tag--warning">${row?.dataset.source === "temporary" ? "次品框归集" : "已上架次品区"}</span><span>${row?.dataset.warehouse || "华东一仓"}</span><span>${row?.dataset.supplier || "深圳启明电子"}</span>`;
  drawer.querySelector(".c-drawer__tabs").hidden = false;
  drawer.querySelector(".c-drawer__body").innerHTML = `
    <div data-tab-pane="stock">
      <section class="detail-summary-card">
        <div><span>SKU</span><strong>${sku}</strong></div>
        <div><span>待处理数量</span><strong>${row?.dataset.defectiveQty || "-"}</strong></div>
        <div><span>采购成本</span><strong>${money(row?.dataset.totalCost || 0)}</strong></div>
      </section>
      <h3 class="c-section-title">退件单与库存来源</h3>
      <table class="c-table">
        <thead><tr><th>退件单号</th><th>收货时间</th><th class="c-table__cell--num">数量</th><th>图片</th></tr></thead>
        <tbody>
          ${images.map((image, index) => `<tr><td><a class="link" data-action="open-defect-images" data-sku="${sku}" data-image-index="${index}">${image.returnNo}</a></td><td>${image.uploadedAt}</td><td class="c-table__cell--num">${Math.max(1, Math.round(Number(row?.dataset.defectiveQty || 1) / images.length))}</td><td><button class="detail-source-image" data-action="open-defect-images" data-sku="${sku}" data-image-index="${index}" type="button" title="查看 ${image.returnNo} 上传的次品图片"><img src="${image.src}" alt="${image.caption}" /><span>查看图片</span></button></td></tr>`).join("")}
        </tbody>
      </table>
      <section class="detail-image-section">
        <div class="detail-image-section__head"><div><h3>仓库上传的次品图片</h3><p>点击图片可放大查看，并左右切换同一 SKU 的退件图片。</p></div><span class="tag tag--processing">${images.length} 张</span></div>
        <div class="detail-image-strip">
          ${images.map((image, index) => `<button class="detail-image-tile" data-action="open-defect-images" data-sku="${sku}" data-image-index="${index}" type="button"><img src="${image.src}" alt="${image.caption}" /><span>${image.caption}</span></button>`).join("")}
        </div>
      </section>
    </div>
    <div data-tab-pane="log" hidden>
      <ul class="c-timeline">
        <li class="c-timeline__item"><div class="c-timeline__time">2026-05-22 09:14:22</div><div class="c-timeline__title">次品区库存新增</div><div class="c-timeline__detail">仓库质检为次品后按配置上架到次品区，库存属性为不可用。</div></li>
        <li class="c-timeline__item"><div class="c-timeline__time">2026-05-22 09:18:12</div><div class="c-timeline__title">仓库上传次品图片</div><div class="c-timeline__detail">已关联退件单 ${images[0].returnNo}，共上传 ${images.length} 张图片。</div></li>
      </ul>
    </div>
  `;
  openDrawer();
}

function getSelectValue(name) {
  return document.querySelector(`[data-select='${name}']`)?.dataset.value || "";
}

function setSelectValue(select, value, label) {
  select.dataset.value = value;
  select.querySelector(".c-select__trigger").textContent = label;
  select.querySelectorAll(".c-select__option").forEach((option) => {
    option.classList.toggle("c-select__option--active", option.dataset.value === value);
  });
}

function sortPendingRows() {
  const body = document.querySelector("[data-role='pending-body']");
  if (!body) return;
  const rows = [...body.querySelectorAll("tr[data-row='pending']")];
  rows.sort((a, b) => {
    const supplierCompare = a.dataset.supplier.localeCompare(b.dataset.supplier, "zh-CN");
    if (supplierCompare !== 0) return supplierCompare;
    const skuCompare = a.dataset.sku.localeCompare(b.dataset.sku, "zh-CN");
    if (skuCompare !== 0) return skuCompare;
    return Number(b.dataset.defectiveQty) - Number(a.dataset.defectiveQty);
  });
  const emptyRow = body.querySelector("[data-role='empty-row']");
  rows.forEach((row) => body.insertBefore(row, emptyRow));
}

function ensurePendingSelectionCells() {
  document.querySelectorAll("tr[data-row='pending']").forEach((row) => {
    if (row.querySelector("[data-action='toggle-pending-row']")) return;
    const cell = document.createElement("td");
    cell.className = "c-table__cell--check";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "table-check";
    checkbox.dataset.action = "toggle-pending-row";
    checkbox.setAttribute("aria-label", `选择${row.dataset.supplier} ${row.dataset.sku}`);
    cell.appendChild(checkbox);
    row.prepend(cell);
    checkbox.addEventListener("change", updatePendingSelectionState);
  });
  const emptyCell = document.querySelector("[data-role='empty-row'] td");
  if (emptyCell) emptyCell.colSpan = 11;
}

function getSelectedPendingRows() {
  return [...document.querySelectorAll("tr[data-row='pending']")].filter((row) => row.querySelector("[data-action='toggle-pending-row']")?.checked);
}

function updatePendingSelectionState() {
  const rows = [...document.querySelectorAll("tr[data-row='pending']")];
  const visibleRows = rows.filter((row) => !row.hidden);
  const selectedRows = getSelectedPendingRows();
  const visibleSelected = visibleRows.filter((row) => row.querySelector("[data-action='toggle-pending-row']")?.checked);
  const selectAll = document.querySelector("[data-action='toggle-all-pending']");
  const bulkButton = document.querySelector("[data-action='bulk-plan']");
  const clearButton = document.querySelector("[data-action='clear-pending-selection']");
  const summary = document.querySelector("[data-role='selection-summary']");
  if (selectAll) {
    selectAll.checked = visibleRows.length > 0 && visibleSelected.length === visibleRows.length;
    selectAll.indeterminate = visibleSelected.length > 0 && visibleSelected.length < visibleRows.length;
  }
  if (bulkButton) bulkButton.disabled = selectedRows.length === 0;
  if (clearButton) clearButton.disabled = selectedRows.length === 0;
  if (summary) summary.textContent = `已选 ${selectedRows.length} 条`;
}

function toggleAllPendingRows(checked) {
  document.querySelectorAll("tr[data-row='pending']").forEach((row) => {
    if (!row.hidden) {
      const checkbox = row.querySelector("[data-action='toggle-pending-row']");
      if (checkbox) checkbox.checked = checked;
    }
  });
  updatePendingSelectionState();
}

function clearPendingSelection() {
  document.querySelectorAll("[data-action='toggle-pending-row']").forEach((checkbox) => { checkbox.checked = false; });
  const selectAll = document.querySelector("[data-action='toggle-all-pending']");
  if (selectAll) selectAll.checked = false;
  updatePendingSelectionState();
}

function applyFilters() {
  const supplier = getSelectValue("supplier");
  const warehouse = getSelectValue("warehouse");
  const source = getSelectValue("source");
  const sku = document.querySelector("[data-field='sku-filter']").value.trim().toUpperCase();
  const rows = [...document.querySelectorAll("[data-row='pending']")];
  let visibleCount = 0;
  let visibleCost = 0;
  let pendingQty = 0;

  rows.forEach((row) => {
    const matched = (!supplier || row.dataset.supplier === supplier)
      && (!warehouse || row.dataset.warehouse === warehouse)
      && (!source || row.dataset.source === source)
      && (!sku || row.dataset.sku.toUpperCase().includes(sku));
    row.hidden = !matched;
    if (!matched) {
      const checkbox = row.querySelector("[data-action='toggle-pending-row']");
      if (checkbox) checkbox.checked = false;
    }
    if (matched) {
      visibleCount += 1;
      visibleCost += Number(row.dataset.totalCost);
      pendingQty += Number(row.dataset.defectiveQty);
    }
  });

  document.querySelector("[data-role='empty-row']").hidden = visibleCount > 0;
  document.querySelector("[data-role='table-summary']").innerHTML = `待处理数量 <strong>${pendingQty}</strong> 件，采购成本合计 <strong>${money(visibleCost)}</strong>`;
  updatePendingSelectionState();
}

function resetFilters() {
  document.querySelector("[data-field='sku-filter']").value = "";
  document.querySelectorAll(".c-select[data-select='supplier'], .c-select[data-select='warehouse'], .c-select[data-select='source']").forEach((select) => {
    const option = select.querySelector(".c-select__option[data-value='']");
    setSelectValue(select, "", option.textContent);
  });
  applyFilters();
}

function configListTemplate() {
  return `
    <div class="modal-toolbar">
      <div>
        <strong>次品处理配置</strong>
        <div class="text-secondary">列表展示配置条件摘要，编辑时维护具体条件组和处理方案。</div>
      </div>
      <button class="btn btn--primary" data-action="config-create" type="button">新增配置</button>
    </div>
    <table class="c-table">
      <thead>
        <tr>
          <th>配置名称</th>
          <th>配置条件</th>
          <th>处理方案</th>
          <th>状态</th>
          <th class="c-table__cell--actions">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>高单价次品处理</td>
          <td><div class="condition-summary"><span class="tag tag--processing">条件组 1</span><span>SKU 固定清单，且单价满足配置区间</span></div></td>
          <td><span class="tag tag--processing">上架次品区</span></td>
          <td><span class="tag tag--success">启用</span></td>
          <td class="c-table__cell--actions"><a class="link" data-action="config-edit">编辑</a><a class="link" data-action="config-disable">禁用</a><a class="link" data-action="config-log">日志</a></td>
        </tr>
        <tr>
          <td>低单价次品框归集</td>
          <td><div class="condition-summary"><span class="tag tag--processing">条件组 1</span><span>单价满足低单价配置条件</span></div></td>
          <td><span class="tag tag--warning">次品框归集</span></td>
          <td><span class="tag tag--success">启用</span></td>
          <td class="c-table__cell--actions"><a class="link" data-action="config-edit">编辑</a><a class="link" data-action="config-disable">禁用</a><a class="link" data-action="config-log">日志</a></td>
        </tr>
        <tr>
          <td>工具类次品上架</td>
          <td><div class="condition-summary"><span class="tag tag--default">条件组 1</span><span>SKU 导入清单，且采购金额满足配置条件</span></div></td>
          <td><span class="tag tag--processing">上架次品区</span></td>
          <td><span class="tag tag--default">禁用</span></td>
          <td class="c-table__cell--actions"><a class="link" data-action="config-edit">编辑</a><span class="text-disabled">禁用</span><a class="link" data-action="config-log">日志</a></td>
        </tr>
      </tbody>
    </table>
  `;
}

function conditionTypeSelect(activeValue) {
  const options = ["SKU", "平台", "过去X天销量", "单价区间"];
  return `
    <div class="c-select" data-select="condition-type" data-value="${activeValue}">
      <button class="c-select__trigger" type="button" data-action="toggle-select">${activeValue}</button>
      <div class="c-select__menu">
        ${options.map((option) => `<button class="c-select__option${option === activeValue ? " c-select__option--active" : ""}" type="button" data-value="${option}">${option}</button>`).join("")}
      </div>
    </div>
  `;
}

function conditionValueTemplate(type) {
  if (type === "SKU") {
    return `
      <div class="sku-condition-control" data-condition-value>
        <input class="input" data-field="sku-list" value="SKU-BAT-8842, SKU-PAD-7710" placeholder="输入SKU，回车添加" />
        <button class="btn" data-action="choose-file" type="button">批量导入</button>
        <span class="text-secondary" data-role="file-name" hidden>支持导入固定 SKU 清单</span>
      </div>
    `;
  }
  if (type === "平台") {
    return `
      <div class="c-select condition-value-select" data-select="condition-platform" data-value="amazon">
        <button class="c-select__trigger" type="button" data-action="toggle-select">Amazon</button>
        <div class="c-select__menu">
          <button class="c-select__option c-select__option--active" type="button" data-value="amazon">Amazon</button>
          <button class="c-select__option" type="button" data-value="ebay">eBay</button>
          <button class="c-select__option" type="button" data-value="walmart">Walmart</button>
          <button class="c-select__option" type="button" data-value="temu">Temu</button>
          <button class="c-select__option" type="button" data-value="tiktok">TikTok Shop</button>
        </div>
      </div>
    `;
  }
  if (type === "过去X天销量") {
    return `
      <div class="sales-condition-control" data-condition-value>
        <span class="text-secondary">过去</span>
        <input class="input" data-field="sales-days" type="number" min="1" value="30" aria-label="统计天数" />
        <span class="text-secondary">天中，销量大于</span>
        <input class="input" data-field="sales-threshold" type="number" min="0" value="10" aria-label="销量阈值" />
        <span class="text-secondary">件</span>
      </div>
    `;
  }
  return `
    <div class="range-inputs" data-condition-value>
      <input class="input" placeholder="下限" />
      <span>至</span>
      <input class="input" placeholder="上限" />
    </div>
  `;
}

function conditionRowTemplate(type = "SKU") {
  return `
    <div class="condition-row">
      ${conditionTypeSelect(type)}
      ${conditionValueTemplate(type)}
      <button class="condition-delete" data-action="delete-condition" title="删除条件" type="button">×</button>
    </div>
  `;
}

function conditionGroupTemplate(index) {
  return `
    <div class="condition-group">
      <div class="condition-group__head">
        <span class="tag tag--processing">条件组 ${index}</span>
        <span class="text-secondary">组内条件需全部满足 (AND)</span>
        <button class="btn btn--text condition-group__delete" data-action="delete-condition-group" type="button">删除组</button>
      </div>
      ${conditionRowTemplate("SKU")}
      <button class="btn" data-action="add-condition" type="button">+ 添加条件 (AND)</button>
    </div>
  `;
}

function configFormTemplate(titleText) {
  return `
    <div class="config-form-layout">
      <div>
        <div class="config-base-form">
          <label class="form-field">
            <span>配置名称</span>
            <input class="input" data-field="config-name" value="${titleText === "编辑配置" ? "高单价次品处理" : ""}" placeholder="请输入配置名称" />
          </label>
          <label class="form-field">
            <span>处理方案</span>
            <div class="segmented" data-role="config-action">
              <button class="c-segmented__item c-segmented__item--active" data-action-value="上架次品区" type="button">上架次品区</button>
              <button class="c-segmented__item" data-action-value="次品框归集" type="button">次品框归集</button>
            </div>
          </label>
          <label class="form-field">
            <span>应用仓库</span>
            <div class="c-select" data-select="config-warehouse" data-value="all">
              <button class="c-select__trigger" type="button" data-action="toggle-select">全部仓库</button>
              <div class="c-select__menu">
                <button class="c-select__option c-select__option--active" type="button" data-value="all">全部仓库</button>
                <button class="c-select__option" type="button" data-value="华东一仓">华东一仓</button>
                <button class="c-select__option" type="button" data-value="华北仓">华北仓</button>
                <button class="c-select__option" type="button" data-value="华南仓">华南仓</button>
              </div>
            </div>
          </label>
        </div>
        <section class="rule-builder">
          <div class="rule-builder__head">
            <h3>触发规则</h3>
            <button class="btn btn--text" data-action="add-condition-group" type="button">+ 添加条件组 (OR)</button>
          </div>
          <div data-role="condition-groups">
            <div class="condition-group">
              <div class="condition-group__head">
                <span class="tag tag--processing">条件组 1</span>
                <span class="text-secondary">组内条件需全部满足 (AND)</span>
                <button class="btn btn--text condition-group__delete" data-action="delete-condition-group" type="button">删除组</button>
              </div>
              ${conditionRowTemplate("SKU")}
              ${conditionRowTemplate("平台")}
              ${conditionRowTemplate("过去X天销量")}
              ${conditionRowTemplate("单价区间")}
              <button class="btn" data-action="add-condition" type="button">+ 添加条件 (AND)</button>
            </div>
          </div>
        </section>
      </div>
      <aside class="config-preview">
        <h3>命中说明</h3>
        <div class="preview-lines" data-role="config-preview"></div>
      </aside>
    </div>
  `;
}

function configLogTemplate() {
  return `
    <ul class="c-timeline">
      <li class="c-timeline__item"><div class="c-timeline__time">2026-05-22 14:11:08</div><div class="c-timeline__title">编辑配置</div><div class="c-timeline__detail">采购用户调整配置条件摘要和处理方案。</div></li>
      <li class="c-timeline__item"><div class="c-timeline__time">2026-05-21 18:03:42</div><div class="c-timeline__title">新增配置</div><div class="c-timeline__detail">新增高单价次品上架配置。</div></li>
      <li class="c-timeline__item"><div class="c-timeline__time">2026-05-20 09:27:16</div><div class="c-timeline__title">禁用配置</div><div class="c-timeline__detail">工具类次品上架配置被禁用。</div></li>
    </ul>
  `;
}

function updateConditionGroupLabels() {
  modalBody.querySelectorAll(".condition-group").forEach((group, index) => {
    group.querySelector(".tag").textContent = `条件组 ${index + 1}`;
  });
}

function describeConditionRow(row) {
  const type = row.querySelector("[data-select='condition-type']").dataset.value;
  if (type === "SKU") {
    const skuInput = row.querySelector("[data-field='sku-list']");
    const fileName = row.querySelector("[data-role='file-name']")?.textContent || "";
    return skuInput && !skuInput.hidden ? `SKU 属于 ${skuInput.value || "未填写"}` : fileName;
  }
  if (type === "平台") {
    return `平台 = ${row.querySelector("[data-select='condition-platform'] .c-select__trigger")?.textContent || "未选择"}`;
  }
  if (type === "过去X天销量") {
    const days = row.querySelector("[data-field='sales-days']")?.value || "未填写";
    const threshold = row.querySelector("[data-field='sales-threshold']")?.value || "未填写";
    return `过去 ${days} 天中，销量大于 ${threshold} 件`;
  }
  const inputs = row.querySelectorAll(".range-inputs input");
  return `${type} ${inputs[0]?.value || "不限"} 至 ${inputs[1]?.value || "不限"}`;
}

function updateConfigPreview() {
  const preview = modalBody.querySelector("[data-role='config-preview']");
  if (!preview) return;
  const groups = [...modalBody.querySelectorAll(".condition-group")];
  const action = modalBody.querySelector("[data-role='config-action'] .c-segmented__item--active")?.dataset.actionValue || "上架次品区";
  const warehouse = modalBody.querySelector("[data-select='config-warehouse'] .c-select__trigger")?.textContent || "全部仓库";
  preview.innerHTML = `<div><strong>应用仓库</strong>：${warehouse}</div>` + groups.map((group, index) => {
    const conditions = [...group.querySelectorAll(".condition-row")].map(describeConditionRow).join("，且 ");
    return `<div><strong>条件组 ${index + 1}</strong>：${conditions || "暂无条件"}。命中后 ${action}。</div>`;
  }).join("");
}

function bindModalInteractions() {
  bindSelects(modalBody);
  bindSegmented(modalBody);
  updateConfigPreview();
}

function planChoiceButtonsTemplate(plan) {
  if (plan.source === "temporary") {
    return `
      <button class="c-segmented__item c-segmented__item--active" data-plan-choice="scrap" type="button">报损</button>
      <button class="c-segmented__item" data-plan-choice="deduct" type="button">抵扣账单</button>
      <button class="c-segmented__item" data-plan-choice="compensation" type="button">赔款</button>
    `;
  }
  return `
    <button class="c-segmented__item c-segmented__item--active" data-plan-choice="repair" type="button">返修</button>
    <button class="c-segmented__item" data-plan-choice="scrap" type="button">报损</button>
  `;
}

function planTemplate(plan) {
  const isTemporary = plan.source === "temporary";
  const supplierProfiles = getSupplierProfiles(plan);
  const supplierProfile = getSupplierProfile(plan);
  return `
    <dl class="info-grid">
      <dt>供应商</dt>
      <dd>
        <div class="c-select" data-select="plan-supplier" data-value="${plan.supplier}">
          <button class="c-select__trigger" type="button" data-action="toggle-select">${plan.supplier}</button>
          <div class="c-select__menu">
            ${supplierProfiles.map((profile) => `<button class="c-select__option${profile.name === plan.supplier ? " c-select__option--active" : ""}" type="button" data-value="${profile.name}">${profile.name}</button>`).join("")}
          </div>
        </div>
      </dd>
      <dt>SKU</dt><dd>${plan.sku}</dd>
      <dt>次品数量</dt><dd>${plan.qty}</dd>
      <dt>总成本</dt><dd>${money(plan.totalCost)}</dd>
      <dt>次品存放类型</dt><dd>${plan.source === "temporary" ? '<span class="tag tag--warning">次品框归集</span>' : '<span class="tag tag--processing">已上架次品区</span>'}</dd>
      <dt>历史处理次数</dt><dd>${plan.historyCount} 次</dd>
    </dl>
    <div class="plan-form">
      <div class="form-field">
        <span>处理方式</span>
        <div class="segmented" data-role="repair-choice">
          ${planChoiceButtonsTemplate(plan)}
        </div>
        ${!isTemporary ? `
          <div class="secondary-plan-options" data-secondary-plan-options hidden>
            <span class="text-secondary">报损方案</span>
            <div class="segmented" data-role="secondary-plan-choice">
              <button class="c-segmented__item" data-secondary-plan-choice="scrap" type="button">报损</button>
              <button class="c-segmented__item" data-secondary-plan-choice="deduct" type="button">抵扣账单</button>
              <button class="c-segmented__item" data-secondary-plan-choice="compensation" type="button">赔款</button>
            </div>
          </div>
        ` : ""}
      </div>
      <div class="repair-plan-panel" data-repair-plan-fields ${isTemporary ? "hidden" : ""}>
        <div class="form-field">
          <span>返修方案</span>
          <div class="segmented" data-role="repair-scheme">
            <button class="c-segmented__item c-segmented__item--active" data-repair-scheme="inbound" type="button">返修入库</button>
            <button class="c-segmented__item" data-repair-scheme="exchange" type="button">返修换货</button>
          </div>
        </div>
        <div class="exchange-sku-list" data-exchange-sku-list hidden>
          <div class="text-secondary">返修换货需维护新换货 SKU，系统展示换货 SKU 单价和金额。</div>
          <table class="c-table c-table--compact">
            <thead>
              <tr><th>换货 SKU</th><th class="c-table__cell--num">换货数量</th><th class="c-table__cell--num">换货 SKU 单价</th><th class="c-table__cell--num">换货 SKU 金额</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><input class="input" data-field="exchange-sku" value="SKU-BAT-8842-R" /></td>
                <td class="c-table__cell--num"><input class="input" data-field="exchange-qty" type="number" min="1" value="${plan.qty}" /></td>
                <td class="c-table__cell--num">¥72.00</td>
                <td class="c-table__cell--num" data-role="exchange-amount">¥${(plan.qty * 72).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="repair-fields" data-repair-fields ${isTemporary ? "hidden" : ""}>
        <label class="form-field">
          <span>返修数量</span>
          <input class="input" data-field="repair-qty" type="number" min="1" max="${plan.qty}" value="${plan.qty}" />
        </label>
        <label class="form-field">
          <span>预估运费</span>
          <input class="input" data-field="estimated-freight" type="number" min="0" value="0" />
        </label>
        <div class="form-field">
          <span>运费承担方</span>
          <div class="segmented">
            <button class="c-segmented__item c-segmented__item--active" data-freight-bearer="company" type="button">公司承担</button>
            <button class="c-segmented__item" data-freight-bearer="supplier" type="button">供应商承担</button>
          </div>
        </div>
        <label class="form-field">
          <span>返修费</span>
          <input class="input" data-field="repair-fee" type="number" min="0" value="0" />
        </label>
        <div class="repair-contact-fields">
          <div class="repair-contact-fields__title">供应商收件信息</div>
          <label class="form-field">
            <span>收件人</span>
            <input class="input" data-field="repair-receiver" value="${supplierProfile.receiver}" />
          </label>
          <label class="form-field">
            <span>收件电话</span>
            <input class="input" data-field="repair-phone" value="${supplierProfile.phone}" />
          </label>
          <label class="form-field repair-contact-fields__address">
            <span>收件人地址</span>
            <input class="input" data-field="repair-address" value="${supplierProfile.address}" />
          </label>
        </div>
        <div class="threshold-note">返修成本比较 = 返修费 + 公司承担的预估运费。总成本大于 1000 时，占比达到 80% 不建议返修；总成本小于等于 1000 时，占比达到 60% 不建议返修。</div>
      </div>
      <div data-scrap-fields ${isTemporary ? "" : "hidden"}>
        <div class="scrap-note">无挽损处理：确认后直接生成报损出库单，并进入报损审核流。</div>
      </div>
      <div class="settlement-fields" data-deduct-fields hidden>
        <label class="form-field">
          <span>抵扣金额</span>
          <input class="input" data-field="deduct-amount" type="number" min="0" value="${plan.totalCost}" />
        </label>
        <label class="form-field">
          <span>抵扣供应商</span>
          <input class="input" data-field="deduct-supplier" value="${plan.supplier}" disabled />
        </label>
        <div class="threshold-note">抵扣供应商由当前次品记录自动带出，不支持手工编辑。</div>
      </div>
      <div class="compensation-fields" data-compensation-fields hidden>
        <section class="compensation-panel">
          <h3>赔款信息</h3>
          <div class="compensation-row compensation-row--top">
            <label class="form-field">
              <span><em>*</em>赔款金额</span>
              <input class="input" data-field="compensation-amount" type="number" min="0" value="${plan.totalCost}" />
            </label>
            <label class="form-field">
              <span>流水</span>
              <input class="input" data-field="compensation-flow" placeholder="输入赔款流水号" value="ZFB202604170003" />
            </label>
            <button class="icon-delete" title="删除赔款" type="button">⌫</button>
          </div>
          <button class="link-add" type="button">⊕ 添加赔款</button>
          <div class="compensation-row compensation-row--bottom">
            <label class="form-field">
              <span><em>*</em>赔款方式</span>
              <div class="c-select" data-select="compensation-method" data-value="alipay">
                <button class="c-select__trigger" type="button" data-action="toggle-select">支付宝转账</button>
                <div class="c-select__menu">
                  <button class="c-select__option c-select__option--active" type="button" data-value="alipay">支付宝转账</button>
                  <button class="c-select__option" type="button" data-value="bank">银行卡转账</button>
                </div>
              </div>
            </label>
            <label class="form-field">
              <span><em>*</em>赔款状态</span>
              <div class="c-select" data-select="compensation-status" data-value="full">
                <button class="c-select__trigger" type="button" data-action="toggle-select">全部</button>
                <div class="c-select__menu">
                  <button class="c-select__option" type="button" data-value="partial">部分</button>
                  <button class="c-select__option c-select__option--active" type="button" data-value="full">全部</button>
                </div>
              </div>
            </label>
            <label class="form-field">
              <span>实际退款金额</span>
              <input class="input" data-field="actual-refund-amount" value="${money(plan.totalCost)}" disabled />
            </label>
          </div>
          <div class="voucher-field">
            <span>凭证</span>
            <div class="voucher-upload">
              <span class="upload-hint">jpg,jpeg,png</span>
              <button class="voucher-box" data-action="choose-voucher" type="button">
                <span>☁</span>
                <strong>点击上传图片</strong>
              </button>
              <span class="text-secondary" data-role="voucher-name">未上传</span>
            </div>
          </div>
        </section>
        </div>
      </div>
      <section class="plan-preview" data-role="plan-preview"></section>
    </div>
  `;
}

function updatePlanPreview() {
  const preview = modalBody.querySelector("[data-role='plan-preview']");
  if (!preview || !currentPlan) return;
  const selected = getSelectedPlanChoice();
  preview.hidden = false;
  if (selected === "scrap") {
    preview.innerHTML = `<h3>方案预览</h3><div class="preview-lines"><div>无挽损处理：确认后直接生成报损出库单并推送报损审核流。</div><div>不维护返修、抵扣或赔款信息。</div></div>`;
    return;
  }
  if (selected === "deduct") {
    const deductAmount = Number(modalBody.querySelector("[data-field='deduct-amount']")?.value || 0);
    preview.innerHTML = `
      <h3>抵扣信息</h3>
      <div class="plan-preview__grid">
        <div class="metric"><span>抵扣金额</span><strong>${money(deductAmount)}</strong></div>
        <div class="metric"><span>抵扣供应商</span><strong>${currentPlan.supplier}</strong></div>
        <div class="metric"><span>处理结果</span><strong>生成待抵扣记录</strong></div>
      </div>
    `;
    return;
  }
  if (selected === "compensation") {
    const compensationAmount = Number(modalBody.querySelector("[data-field='compensation-amount']")?.value || 0);
    const actualRefundInput = modalBody.querySelector("[data-field='actual-refund-amount']");
    if (actualRefundInput) actualRefundInput.value = money(compensationAmount);
    const method = modalBody.querySelector("[data-select='compensation-method'] .c-select__trigger")?.textContent || "支付宝转账";
    const status = modalBody.querySelector("[data-select='compensation-status'] .c-select__trigger")?.textContent || "部分";
    preview.innerHTML = `
      <h3>赔款信息</h3>
      <div class="plan-preview__grid">
        <div class="metric"><span>赔款金额合计</span><strong>${money(compensationAmount)}</strong></div>
        <div class="metric"><span>实际退款金额</span><strong>${money(compensationAmount)}</strong></div>
        <div class="metric"><span>赔款方式</span><strong>${method}</strong></div>
        <div class="metric"><span>赔款状态</span><strong>${status}</strong></div>
      </div>
    `;
    return;
  }
  preview.hidden = true;
  preview.innerHTML = "";
  return;
}

function warningTemplate(percent, threshold) {
  return `
    <div class="warning-content">
      <div class="warning-content__title">返修成本占总成本 ${percent}%，大于 ${threshold}%，不建议返修，请确认最终处理方案。</div>
      <div class="warning-content__actions">
        <button class="btn" data-action="warning-cancel" type="button">取消</button>
        <button class="btn btn--primary" data-action="warning-repair" type="button">确认返修</button>
        <button class="btn btn--danger" data-action="warning-scrap" type="button">报损</button>
      </div>
    </div>
  `;
}

function bulkPlanTemplate(items) {
  const source = items[0].source;
  const isTemporary = source === "temporary";
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalCost = items.reduce((sum, item) => sum + item.totalCost, 0);
  const suppliers = [...new Set(items.map((item) => item.supplier))];
  const deductionGroups = [...items.reduce((map, item) => {
    const existing = map.get(item.supplier) || { supplier: item.supplier, totalCost: 0, skus: [] };
    existing.totalCost += item.totalCost;
    existing.skus.push(`${item.sku}（${item.qty} 件）`);
    map.set(item.supplier, existing);
    return map;
  }, new Map()).values()];
  const primaryOptions = isTemporary
    ? `
      <button class="c-segmented__item c-segmented__item--active" data-bulk-plan-choice="scrap" type="button">报损</button>
      <button class="c-segmented__item" data-bulk-plan-choice="deduct" type="button">抵扣账单</button>
      <button class="c-segmented__item" data-bulk-plan-choice="compensation" type="button">赔款</button>
    `
    : `
      <button class="c-segmented__item c-segmented__item--active" data-bulk-plan-choice="repair" type="button">返修</button>
      <button class="c-segmented__item" data-bulk-plan-choice="scrap" type="button">报损</button>
    `;
  const secondaryOptions = isTemporary ? "" : `
    <div class="form-field bulk-secondary-field" data-role="bulk-secondary-options" hidden>
      <span class="form-field__label">报损方案</span>
      <div class="segmented">
        <button class="c-segmented__item c-segmented__item--active" data-bulk-secondary-choice="scrap" type="button">报损</button>
        <button class="c-segmented__item" data-bulk-secondary-choice="deduct" type="button">抵扣账单</button>
        <button class="c-segmented__item" data-bulk-secondary-choice="compensation" type="button">赔款</button>
      </div>
    </div>
  `;
  const repairRows = items.map((item) => {
    const profile = getSupplierProfile({ sku: item.sku, supplier: item.supplier });
    return `<tr>
      <td>${item.supplier}</td><td>${item.sku}</td>
      <td><input class="input" data-field="bulk-repair-qty" type="number" min="1" max="${item.qty}" value="${item.qty}" /></td>
      <td><input class="input" data-field="bulk-estimated-freight" type="number" min="0" value="0" /></td>
      <td><div class="segmented segmented--small"><button class="c-segmented__item c-segmented__item--active" data-bulk-freight-bearer="company" type="button">公司</button><button class="c-segmented__item" data-bulk-freight-bearer="supplier" type="button">供应商</button></div></td>
      <td><input class="input" data-field="bulk-repair-fee" type="number" min="0" value="0" /></td>
    </tr>`;
  }).join("");
  const repairAddressRows = items.map((item) => {
    const profile = getSupplierProfile({ sku: item.sku, supplier: item.supplier });
    return `<tr>
      <td>${item.supplier}<br><span class="text-secondary">${item.sku}</span></td>
      <td><input class="input" data-field="bulk-repair-receiver" value="${profile.receiver}" /></td>
      <td><input class="input" data-field="bulk-repair-phone" value="${profile.phone}" /></td>
      <td><input class="input" data-field="bulk-repair-address" value="${profile.address}" /></td>
    </tr>`;
  }).join("");
  const exchangeRows = items.map((item) => `<tr>
    <td>${item.supplier}</td><td>${item.sku}</td>
    <td><input class="input" data-field="bulk-exchange-sku" value="${item.sku}-R" /></td>
    <td><input class="input" data-field="bulk-exchange-qty" type="number" min="1" value="${item.qty}" /></td>
    <td class="c-table__cell--num">¥72.00</td><td class="c-table__cell--num">¥${(item.qty * 72).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}</td>
  </tr>`).join("");
  const compensationCards = deductionGroups.map((group, index) => `
    <article class="bulk-compensation-card">
      <div class="bulk-compensation-card__head">
        <div><strong>${group.supplier}</strong><span>${group.skus.join("、")}</span></div>
        <span class="tag">采购成本 ${money(group.totalCost)}</span>
      </div>
      <div class="bulk-compensation-card__grid">
        <label class="form-field"><span><em>*</em>赔款金额</span><input class="input" data-field="bulk-compensation-amount" data-compensation-supplier="${group.supplier}" type="number" min="0" value="${group.totalCost}" /></label>
        <label class="form-field"><span><em>*</em>赔款流水</span><input class="input" data-field="bulk-compensation-flow" data-compensation-supplier="${group.supplier}" placeholder="输入该供应商赔款流水号" value="" /></label>
        <label class="form-field"><span>赔款方式</span><div class="c-select" data-select="bulk-compensation-method-${index}" data-value="alipay" data-compensation-supplier="${group.supplier}"><button class="c-select__trigger" type="button" data-action="toggle-select">支付宝转账</button><div class="c-select__menu"><button class="c-select__option c-select__option--active" type="button" data-value="alipay">支付宝转账</button><button class="c-select__option" type="button" data-value="bank">银行卡转账</button></div></div></label>
        <label class="form-field"><span>赔款状态</span><div class="c-select" data-select="bulk-compensation-status-${index}" data-value="full" data-compensation-supplier="${group.supplier}"><button class="c-select__trigger" type="button" data-action="toggle-select">全部</button><div class="c-select__menu"><button class="c-select__option c-select__option--active" type="button" data-value="full">全部</button><button class="c-select__option" type="button" data-value="partial">部分</button></div></div></label>
      </div>
      <div class="bulk-compensation-card__voucher"><div><strong>赔款凭证</strong><span class="text-secondary" data-role="bulk-voucher-name">未上传</span></div><button class="btn btn--sm" data-action="bulk-choose-voucher" data-bulk-voucher-uploaded="false" data-compensation-supplier="${group.supplier}" type="button">上传凭证</button></div>
    </article>
  `).join("");
  const repairFields = `
    <section class="bulk-detail-section" data-role="bulk-repair-fields" ${isTemporary ? "hidden" : ""}>
      <div class="bulk-detail-section__head"><strong>返修方案及返修信息</strong><span class="text-secondary">按选中记录分别带出默认供应商地址，可编辑</span></div>
      <div class="form-field">
        <span class="form-field__label">返修方案</span>
        <div class="segmented"><button class="c-segmented__item c-segmented__item--active" data-bulk-repair-scheme="inbound" type="button">返修入库</button><button class="c-segmented__item" data-bulk-repair-scheme="exchange" type="button">返修换货</button></div>
      </div>
      <div data-role="bulk-repair-standard-fields">
        <div class="bulk-detail-section__subhead">返修数量与费用</div>
        <div class="c-table-scroll"><table class="c-table c-table--compact bulk-detail-table"><thead><tr><th>供应商</th><th>SKU</th><th>返修数量</th><th>预估运费</th><th>运费承担方</th><th>返修费</th></tr></thead><tbody>${repairRows}</tbody></table></div>
        <div class="bulk-detail-section__subhead">供应商收件信息</div>
        <div class="c-table-scroll"><table class="c-table c-table--compact bulk-detail-table"><thead><tr><th>供应商 / SKU</th><th>收件人</th><th>收件电话</th><th>收件人地址</th></tr></thead><tbody>${repairAddressRows}</tbody></table></div>
      </div>
      <div data-role="bulk-exchange-fields" hidden>
        <div class="text-secondary">返修换货需维护新换货 SKU 和数量，系统展示换货 SKU 单价、换货 SKU 金额。</div>
        <div class="c-table-scroll"><table class="c-table c-table--compact bulk-detail-table"><thead><tr><th>原供应商</th><th>原 SKU</th><th>换货 SKU</th><th>换货数量</th><th>换货 SKU 单价</th><th>换货 SKU 金额</th></tr></thead><tbody>${exchangeRows}</tbody></table></div>
      </div>
      <div class="threshold-note">返修成本比较 = 返修费 + 公司承担的预估运费；确认后按记录生成返修出库及后续返修入库链路。</div>
    </section>
  `;
  const scrapFields = `
    <section class="bulk-detail-section" data-role="bulk-scrap-fields" ${isTemporary ? "" : "hidden"}>
      <div class="bulk-detail-section__head"><strong>报损方案及对应信息</strong><span class="text-secondary">根据报损二级方案生成对应业务记录</span></div>
      <div class="scrap-note" data-role="bulk-direct-scrap-fields">无挽损处理：确认后直接生成报损出库单并进入审核流。</div>
      <div class="settlement-fields" data-role="bulk-deduct-fields" hidden>
        <div class="bulk-deduction-total"><span>抵扣金额合计</span><strong data-role="bulk-deduct-total">${money(totalCost)}</strong></div>
        <div class="bulk-detail-section__subhead">按供应商维护抵扣金额</div>
        <div class="c-table-scroll"><table class="c-table c-table--compact bulk-detail-table bulk-deduction-table"><thead><tr><th>供应商</th><th>关联次品记录</th><th class="c-table__cell--num">采购成本</th><th class="c-table__cell--num">抵扣金额</th></tr></thead><tbody>${deductionGroups.map((group) => `<tr><td><strong>${group.supplier}</strong></td><td>${group.skus.join("、")}</td><td class="c-table__cell--num">${money(group.totalCost)}</td><td class="c-table__cell--num"><input class="input" data-field="bulk-deduct-amount" data-deduct-supplier="${group.supplier}" type="number" min="0" value="${group.totalCost}" /></td></tr>`).join("")}</tbody></table></div>
        <div class="threshold-note">抵扣金额按供应商分别生成供应商对账单明细；已上架次品区抵扣账单不生成报损出库单。</div>
      </div>
      <div class="compensation-fields" data-role="bulk-compensation-fields" hidden>
        <div class="compensation-panel">
          <div class="bulk-deduction-total"><span>实际退款金额合计</span><strong data-role="bulk-compensation-total">${money(totalCost)}</strong></div>
          <div class="bulk-detail-section__subhead">按供应商维护赔款信息</div>
          <div class="bulk-compensation-cards">${compensationCards}</div>
        </div>
        <div class="threshold-note">赔款方案仅记录赔款金额、流水、方式、状态、实际退款金额和凭证，不生成报损出库单。</div>
      </div>
    </section>
  `;
  return `
    <div class="bulk-plan-intro">
      <div><strong>批量设置处理方案</strong><div class="text-secondary">已选择 ${items.length} 条记录，共 ${totalQty} 件；批量操作仅统一方案，原记录的供应商、SKU 与数量保持不变。</div></div>
      <span class="tag tag--processing">${suppliers.length} 个供应商</span>
    </div>
    <div class="bulk-plan-summary">
      <div><span>次品存放类型</span><strong>${isTemporary ? "次品暂存区" : "已上架次品区"}</strong></div>
      <div><span>采购成本合计</span><strong>${money(totalCost)}</strong></div>
      <div><span>方案影响</span><strong>${isTemporary ? "不生成报损出库单" : "按方案生成后续单据"}</strong></div>
    </div>
    <div class="form-field">
      <span class="form-field__label">处理方式</span>
      <div class="segmented">${primaryOptions}</div>
    </div>
    ${secondaryOptions}
    ${repairFields}
    ${scrapFields}
  `;
}

function openBulkPlanModal(rows) {
  const items = rows.map((row) => ({
    qty: Number(row.dataset.defectiveQty),
    totalCost: Number(row.dataset.totalCost),
    supplier: row.dataset.supplier,
    sku: row.dataset.sku,
    source: row.dataset.source,
  }));
  if (!items.length) {
    showToast("请先勾选需要设置方案的次品记录");
    return;
  }
  const sourceSet = new Set(items.map((item) => item.source));
  if (sourceSet.size > 1) {
    showToast("批量设置方案需选择相同次品存放类型的数据", "error");
    return;
  }
  currentBulkPlans = items;
  openModal("批量设置处理方案", bulkPlanTemplate(items), "确认批量方案", "bulk-plan");
  bindSelects(modalBody);
  bindSegmented(modalBody);
  updateBulkPlanFields();
  modalBody.querySelectorAll("[data-field='bulk-deduct-amount']").forEach((input) => {
    input.addEventListener("input", updateBulkDeductionTotal);
  });
  updateBulkDeductionTotal();
  modalBody.querySelectorAll("[data-field='bulk-compensation-amount']").forEach((input) => {
    input.addEventListener("input", updateBulkCompensationTotal);
  });
  updateBulkCompensationTotal();
}

function updateBulkDeductionTotal() {
  const total = [...modalBody.querySelectorAll("[data-field='bulk-deduct-amount']")].reduce((sum, input) => sum + (Number(input.value) || 0), 0);
  const totalNode = modalBody.querySelector("[data-role='bulk-deduct-total']");
  if (totalNode) totalNode.textContent = money(total);
}

function updateBulkCompensationTotal() {
  const total = [...modalBody.querySelectorAll("[data-field='bulk-compensation-amount']")].reduce((sum, input) => sum + (Number(input.value) || 0), 0);
  const totalNode = modalBody.querySelector("[data-role='bulk-compensation-total']");
  const refundInput = modalBody.querySelector("[data-field='bulk-actual-refund-amount']");
  if (totalNode) totalNode.textContent = money(total);
  if (refundInput) refundInput.value = money(total);
}

function submitBulkPlan() {
  const choice = modalBody.querySelector("[data-bulk-plan-choice].c-segmented__item--active")?.dataset.bulkPlanChoice;
  const secondary = modalBody.querySelector("[data-bulk-secondary-choice].c-segmented__item--active")?.dataset.bulkSecondaryChoice;
  if (!choice) {
    showToast("请选择处理方式");
    return;
  }
  if (choice === "scrap" && currentBulkPlans[0]?.source !== "temporary" && !secondary) {
    showToast("请选择报损、抵扣账单或赔款方案");
    return;
  }
  const resolved = choice === "scrap" && currentBulkPlans[0]?.source !== "temporary" ? secondary : choice;
  if (resolved === "repair") {
    const invalidQty = [...modalBody.querySelectorAll("[data-field='bulk-repair-qty']")].some((input, index) => {
      const qty = Number(input.value);
      const max = currentBulkPlans[index]?.qty || 0;
      const invalid = Number.isNaN(qty) || qty <= 0 || qty > max;
      input.setAttribute("aria-invalid", String(invalid));
      return invalid;
    });
    const invalidContact = [...modalBody.querySelectorAll("[data-field='bulk-repair-receiver'], [data-field='bulk-repair-phone'], [data-field='bulk-repair-address']")].some((input) => {
      const invalid = !input.value.trim();
      input.setAttribute("aria-invalid", String(invalid));
      return invalid;
    });
    if (invalidQty) {
      showToast("返修数量需大于 0 且不能超过原次品数量");
      return;
    }
    if (invalidContact) {
      showToast("请完善返修供应商的收件人、电话和地址");
      return;
    }
  }
  if (resolved === "deduct") {
    const amountInputs = [...modalBody.querySelectorAll("[data-field='bulk-deduct-amount']")];
    const invalidAmount = amountInputs.some((input) => {
      const amount = Number(input.value);
      const invalid = Number.isNaN(amount) || amount <= 0;
      input.setAttribute("aria-invalid", String(invalid));
      return invalid;
    });
    if (invalidAmount) {
      showToast("请分别填写每个供应商的抵扣金额，且金额需大于 0");
      return;
    }
    updateBulkDeductionTotal();
  }
  if (resolved === "compensation") {
    const amountInputs = [...modalBody.querySelectorAll("[data-field='bulk-compensation-amount']")];
    const flowInputs = [...modalBody.querySelectorAll("[data-field='bulk-compensation-flow']")];
    const voucherButtons = [...modalBody.querySelectorAll("[data-action='bulk-choose-voucher']")];
    const invalidAmount = amountInputs.some((input) => {
      const amount = Number(input.value);
      const invalid = Number.isNaN(amount) || amount <= 0;
      input.setAttribute("aria-invalid", String(invalid));
      return invalid;
    });
    const invalidFlow = flowInputs.some((input) => {
      const invalid = !input.value.trim();
      input.setAttribute("aria-invalid", String(invalid));
      return invalid;
    });
    if (invalidAmount) {
      showToast("请分别填写每个供应商的赔款金额，且金额需大于 0");
      return;
    }
    if (invalidFlow) {
      showToast("请分别填写每个供应商的赔款流水");
      return;
    }
    if (voucherButtons.some((button) => button.dataset.bulkVoucherUploaded !== "true")) {
      showToast("请分别上传每个供应商的赔款凭证");
      return;
    }
    updateBulkCompensationTotal();
  }
  const labels = { repair: "返修", scrap: "报损", deduct: "抵扣账单", compensation: "赔款" };
  const label = labels[resolved];
  const count = currentBulkPlans.length;
  closeModal();
  clearPendingSelection();
  showToast(`已为 ${count} 条记录批量设置${label}方案`);
}

function openPlanModal(row) {
  currentPlan = {
    qty: Number(row.dataset.defectiveQty),
    totalCost: Number(row.dataset.totalCost),
    supplier: row.dataset.supplier,
    sku: row.dataset.sku,
    source: row.dataset.source,
    historyCount: Number(row.dataset.historyCount || 0),
  };
  openModal("设置处理方案", planTemplate(currentPlan), "确认方案", "plan");
  bindSelects(modalBody);
  bindSegmented(modalBody);
  updatePlanPreview();
}

function submitPlan() {
  const selected = getSelectedPlanChoice();
  const primaryChoice = modalBody.querySelector("[data-plan-choice].c-segmented__item--active")?.dataset.planChoice;
  const secondaryChoice = modalBody.querySelector("[data-secondary-plan-choice].c-segmented__item--active")?.dataset.secondaryPlanChoice;
  if (selected === "scrap") {
    if (currentPlan?.source !== "temporary" && primaryChoice === "scrap" && !secondaryChoice) {
      showToast("请选择报损、抵扣账单或赔款方案");
      return;
    }
    closeModal();
    showToast("报损方案已确认，报损出库单已生成并进入审核流");
    return;
  }
  if (selected === "deduct") {
    const deductInput = modalBody.querySelector("[data-field='deduct-amount']");
    const deductAmount = Number(deductInput.value);
    deductInput.setAttribute("aria-invalid", String(Number.isNaN(deductAmount) || deductAmount <= 0));
    if (Number.isNaN(deductAmount) || deductAmount <= 0) {
      showToast("抵扣金额需大于 0");
      return;
    }
    closeModal();
    showToast("抵扣账单方案已确认，待抵扣记录已生成");
    return;
  }
  if (selected === "compensation") {
    const amountInput = modalBody.querySelector("[data-field='compensation-amount']");
    const flowInput = modalBody.querySelector("[data-field='compensation-flow']");
    const amount = Number(amountInput.value);
    const flow = flowInput.value.trim();
    amountInput.setAttribute("aria-invalid", String(Number.isNaN(amount) || amount <= 0));
    flowInput.setAttribute("aria-invalid", String(!flow));
    if (Number.isNaN(amount) || amount <= 0) {
      showToast("赔款金额需大于 0");
      return;
    }
    if (!flow) {
      showToast("请填写赔款流水");
      return;
    }
    closeModal();
    showToast("赔款方案已确认，赔款信息已记录");
    return;
  }

  const repairScheme = modalBody.querySelector("[data-repair-scheme].c-segmented__item--active")?.dataset.repairScheme || "inbound";
  if (repairScheme === "exchange") {
    const exchangeSkuInput = modalBody.querySelector("[data-field='exchange-sku']");
    const exchangeQtyInput = modalBody.querySelector("[data-field='exchange-qty']");
    const exchangeSku = exchangeSkuInput.value.trim();
    const exchangeQty = Number(exchangeQtyInput.value);
    exchangeSkuInput.setAttribute("aria-invalid", String(!exchangeSku));
    exchangeQtyInput.setAttribute("aria-invalid", String(Number.isNaN(exchangeQty) || exchangeQty <= 0));
    if (!exchangeSku || Number.isNaN(exchangeQty) || exchangeQty <= 0) {
      showToast("请填写换货 SKU 和大于 0 的换货数量");
      return;
    }
  }

  const qtyInput = modalBody.querySelector("[data-field='repair-qty']");
  const repairFeeInput = modalBody.querySelector("[data-field='repair-fee']");
  const freightInput = modalBody.querySelector("[data-field='estimated-freight']");
  const qty = Number(qtyInput.value);
  const repairFee = Number(repairFeeInput.value);
  const estimatedFreight = Number(freightInput.value);
  const freightBearer = modalBody.querySelector("[data-freight-bearer].c-segmented__item--active")?.dataset.freightBearer || "company";
  const repairCost = repairFee + (freightBearer === "company" ? estimatedFreight : 0);
  qtyInput.setAttribute("aria-invalid", String(Number.isNaN(qty) || qty <= 0 || qty > currentPlan.qty));
  repairFeeInput.setAttribute("aria-invalid", String(Number.isNaN(repairFee) || repairFee < 0));
  freightInput.setAttribute("aria-invalid", String(Number.isNaN(estimatedFreight) || estimatedFreight < 0));
  if (Number.isNaN(qty) || qty <= 0 || qty > currentPlan.qty) {
    showToast("返修数量需大于 0，且不能超过当前次品数量");
    return;
  }
  if (Number.isNaN(repairFee) || repairFee < 0 || Number.isNaN(estimatedFreight) || estimatedFreight < 0) {
    showToast("返修费和预估运费必须大于等于 0");
    return;
  }

  const percent = Number(((repairCost / currentPlan.totalCost) * 100).toFixed(2));
  const threshold = currentPlan.totalCost > 1000 ? 80 : 60;
  if (percent >= threshold) {
    modal.classList.add("c-modal--warning");
    modalTitle.textContent = "返修成本预警";
    modalBody.innerHTML = warningTemplate(percent, threshold);
    confirmButton.hidden = true;
    modalMode = "warning";
    return;
  }

  closeModal();
  showToast("处理方案已确认：返修申请已生成");
}

function openHistoryDrawer(row) {
  const count = Number(row.dataset.historyCount || 0);
  document.querySelector("#drawer-title").textContent = `${row.dataset.sku} 历史处理记录`;
  drawer.querySelector(".c-drawer__meta").innerHTML = `<span class="tag tag--processing">${row.dataset.supplier}</span><span>历史发起 <strong>${count}</strong> 次</span><span>当前存放类型：${row.dataset.source === "temporary" ? "次品框归集" : "已上架次品区"}</span>`;
  drawer.querySelector(".c-drawer__tabs").hidden = true;
  drawer.querySelector(".c-drawer__body").innerHTML = `
    <section class="history-summary">
      <div class="metric"><span>累计处理数量</span><strong>${count ? 72 : 0}</strong></div>
      <div class="metric"><span>返修 / 报损</span><strong>${count ? "1 / 1" : "0 / 0"}</strong></div>
      <div class="metric"><span>返修入库 / 返修换货</span><strong>${count ? "1 / 1" : "0 / 0"}</strong></div>
    </section>
    <h3 class="c-section-title">历次处理明细</h3>
    ${count ? `<table class="c-table"><thead><tr><th>发起时间</th><th>数量</th><th>处理方案</th><th>金额</th><th>关联单据</th><th>结果</th></tr></thead><tbody>
      <tr><td>2026-05-28</td><td>30</td><td>返修入库</td><td>¥680.00</td><td><a class="link">RX260528001</a></td><td><span class="tag tag--success">已完成</span></td></tr>
      <tr><td>2026-05-26</td><td>14</td><td>返修换货</td><td>¥888.00</td><td><a class="link">RX260526009</a></td><td><span class="tag tag--processing">返修中</span></td></tr>
      <tr><td>2026-05-18</td><td>28</td><td>报损</td><td>¥1,904.00</td><td><a class="link">BS260518016</a></td><td><span class="tag tag--success">已完成</span></td></tr>
    </tbody></table>` : `<div class="empty-state">该 SKU 暂无历史处理记录</div>`}
  `;
  openDrawer();
}

function bindSelects(scope = document) {
  scope.querySelectorAll(".c-select").forEach((select) => {
    if (select.dataset.bound === "true") return;
    select.dataset.bound = "true";
    select.querySelector(".c-select__trigger").addEventListener("click", (event) => {
      event.stopPropagation();
      document.querySelectorAll(".c-select[data-open='true']").forEach((openSelect) => {
        if (openSelect !== select) openSelect.dataset.open = "false";
      });
      select.dataset.open = select.dataset.open === "true" ? "false" : "true";
    });
  });
}

function setPlanChoiceVisibility(choice) {
  const primaryChoice = modalBody.querySelector("[data-plan-choice].c-segmented__item--active")?.dataset.planChoice;
  const secondaryOptions = modalBody.querySelector("[data-secondary-plan-options]");
  const repairPlanFields = modalBody.querySelector("[data-repair-plan-fields]");
  const repairFields = modalBody.querySelector("[data-repair-fields]");
  const scrapFields = modalBody.querySelector("[data-scrap-fields]");
  const deductFields = modalBody.querySelector("[data-deduct-fields]");
  const compensationFields = modalBody.querySelector("[data-compensation-fields]");
  const showSecondaryOptions = currentPlan?.source !== "temporary" && primaryChoice === "scrap";
  const secondaryScrapSelected = showSecondaryOptions && choice === "scrap";
  if (secondaryOptions) secondaryOptions.hidden = !showSecondaryOptions;
  if (!showSecondaryOptions) {
    secondaryOptions?.querySelectorAll(".c-segmented__item--active").forEach((item) => item.classList.remove("c-segmented__item--active"));
  }
  if (repairPlanFields) repairPlanFields.hidden = choice !== "repair";
  if (repairFields) repairFields.hidden = choice !== "repair";
  if (scrapFields) scrapFields.hidden = choice !== "scrap" || (showSecondaryOptions && !secondaryScrapSelected);
  if (deductFields) deductFields.hidden = choice !== "deduct";
  if (compensationFields) compensationFields.hidden = choice !== "compensation";
}

function getSelectedPlanChoice() {
  const primaryChoice = modalBody.querySelector("[data-plan-choice].c-segmented__item--active")?.dataset.planChoice;
  const secondaryChoice = modalBody.querySelector("[data-secondary-plan-choice].c-segmented__item--active")?.dataset.secondaryPlanChoice;
  return currentPlan?.source !== "temporary" && primaryChoice === "scrap" && secondaryChoice
    ? secondaryChoice
    : primaryChoice;
}

function updateBulkPlanFields() {
  const primary = modalBody.querySelector("[data-bulk-plan-choice].c-segmented__item--active")?.dataset.bulkPlanChoice;
  const secondary = modalBody.querySelector("[data-bulk-secondary-choice].c-segmented__item--active")?.dataset.bulkSecondaryChoice;
  const resolved = primary === "scrap" && currentBulkPlans[0]?.source !== "temporary" ? (secondary || "scrap") : primary;
  const repairFields = modalBody.querySelector("[data-role='bulk-repair-fields']");
  const scrapFields = modalBody.querySelector("[data-role='bulk-scrap-fields']");
  const directScrapFields = modalBody.querySelector("[data-role='bulk-direct-scrap-fields']");
  const deductFields = modalBody.querySelector("[data-role='bulk-deduct-fields']");
  const compensationFields = modalBody.querySelector("[data-role='bulk-compensation-fields']");
  if (repairFields) repairFields.hidden = resolved !== "repair";
  if (scrapFields) scrapFields.hidden = !["scrap", "deduct", "compensation"].includes(resolved);
  if (directScrapFields) directScrapFields.hidden = resolved !== "scrap";
  if (deductFields) deductFields.hidden = resolved !== "deduct";
  if (compensationFields) compensationFields.hidden = resolved !== "compensation";
}

function updateBulkRepairScheme(scheme) {
  const standardFields = modalBody.querySelector("[data-role='bulk-repair-standard-fields']");
  const exchangeFields = modalBody.querySelector("[data-role='bulk-exchange-fields']");
  if (standardFields) standardFields.hidden = scheme === "exchange";
  if (exchangeFields) exchangeFields.hidden = scheme !== "exchange";
}

function bindSegmented(scope = document) {
  scope.querySelectorAll(".c-segmented__item").forEach((item) => {
    if (item.dataset.bound === "true") return;
    item.dataset.bound = "true";
    item.addEventListener("click", () => {
      const segmented = item.closest(".segmented");
      segmented.querySelectorAll(".c-segmented__item").forEach((other) => other.classList.remove("c-segmented__item--active"));
      item.classList.add("c-segmented__item--active");
      const row = item.closest(".condition-row");
      if (row && item.dataset.action === "sku-import") {
        row.querySelector(".import-panel").hidden = false;
        row.querySelector("[data-field='sku-list']").hidden = true;
      }
      if (row && item.dataset.action === "sku-manual") {
        row.querySelector(".import-panel").hidden = true;
        row.querySelector("[data-field='sku-list']").hidden = false;
      }
      if (item.dataset.planChoice) {
        setPlanChoiceVisibility(item.dataset.planChoice);
        updatePlanPreview();
      }
      if (item.dataset.secondaryPlanChoice) {
        setPlanChoiceVisibility(item.dataset.secondaryPlanChoice);
        updatePlanPreview();
      }
      if (item.dataset.bulkPlanChoice) {
        const secondary = modalBody.querySelector("[data-role='bulk-secondary-options']");
        if (secondary) secondary.hidden = item.dataset.bulkPlanChoice !== "scrap";
        updateBulkPlanFields();
      }
      if (item.dataset.bulkSecondaryChoice) {
        updateBulkPlanFields();
      }
      if (item.dataset.bulkRepairScheme) {
        updateBulkRepairScheme(item.dataset.bulkRepairScheme);
      }
      if (item.dataset.repairScheme) {
        const scheme = item.dataset.repairScheme;
        modalBody.querySelector("[data-exchange-sku-list]").hidden = scheme !== "exchange";
        updatePlanPreview();
      }
      if (item.dataset.feeBearer) {
        const preview = modalBody.querySelector(".plan-preview .preview-lines");
        if (preview) preview.innerHTML = item.dataset.feeBearer === "supplier" ? "<div>返修费应付：¥500.00</div><div>运费由供应商承担，将生成 ¥100.00 供应商扣款。</div><div>确认后费用锁定。</div>" : "<div>返修费应付：¥500.00</div><div>当前运费由公司承担，不生成运费扣款。</div><div>确认后费用锁定。</div>";
      }
      if (item.dataset.freightBearer) {
        updatePlanPreview();
      }
      if (item.dataset.compensationMethod || item.dataset.compensationStatus) {
        updatePlanPreview();
      }
      updateConfigPreview();
    });
  });
}

document.addEventListener("click", (event) => {
  const option = event.target.closest(".c-select__option");
  if (option) {
    event.stopPropagation();
    const select = option.closest(".c-select");
    setSelectValue(select, option.dataset.value, option.textContent);
    select.dataset.open = "false";
    const row = select.closest(".condition-row");
    if (row && select.dataset.select === "condition-type") {
      row.querySelector("[data-condition-value]").outerHTML = conditionValueTemplate(option.dataset.value);
      bindSegmented(row);
      updateConfigPreview();
    }
    if (select.dataset.select === "compensation-method" || select.dataset.select === "compensation-status") {
      updatePlanPreview();
    }
    if (select.dataset.select === "config-warehouse") {
      updateConfigPreview();
    }
    if (select.dataset.select === "plan-supplier") {
      updatePlanSupplier(option.dataset.value);
    }
    return;
  }

  document.querySelectorAll(".c-select[data-open='true']").forEach((select) => {
    select.dataset.open = "false";
  });
});

modalBody.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  if (action === "config-create" || action === "config-edit") {
    openModal(action === "config-create" ? "新增次品处理配置" : "编辑次品处理配置", configFormTemplate(action === "config-create" ? "新增配置" : "编辑配置"), "保存配置", "config-save");
    bindModalInteractions();
  }
  if (action === "config-disable") {
    openModal("禁用次品处理配置", `<div class="warning-content__title">禁用后，该配置不再参与次品处理方案命中。</div>`, "确认禁用", "config-disable");
  }
  if (action === "config-log") {
    openModal("配置操作日志", configLogTemplate(), "关闭", "log");
  }
  if (action === "add-condition") {
    const button = event.target.closest("[data-action='add-condition']");
    button.insertAdjacentHTML("beforebegin", conditionRowTemplate("SKU"));
    bindModalInteractions();
  }
  if (action === "add-condition-group") {
    const groups = modalBody.querySelector("[data-role='condition-groups']");
    groups.insertAdjacentHTML("beforeend", conditionGroupTemplate(groups.querySelectorAll(".condition-group").length + 1));
    bindModalInteractions();
  }
  if (action === "delete-condition") {
    const group = event.target.closest(".condition-group");
    if (group.querySelectorAll(".condition-row").length === 1) {
      showToast("每个条件组至少保留一个条件");
      return;
    }
    event.target.closest(".condition-row").remove();
    updateConfigPreview();
  }
  if (action === "delete-condition-group") {
    const groups = modalBody.querySelectorAll(".condition-group");
    if (groups.length === 1) {
      showToast("至少保留一个条件组");
      return;
    }
    event.target.closest(".condition-group").remove();
    updateConditionGroupLabels();
    updateConfigPreview();
  }
  if (action === "choose-file") {
    const skuControl = event.target.closest(".sku-condition-control");
    if (skuControl) {
      const fileName = skuControl.querySelector("[data-role='file-name']");
      fileName.hidden = false;
      fileName.textContent = "已选择：defective-sku-list.xlsx";
    }
    updateConfigPreview();
  }
  if (action === "choose-voucher") {
    const voucherName = event.target.closest(".upload-control")?.querySelector("[data-role='voucher-name']");
    if (voucherName) voucherName.textContent = "已上传：compensation-voucher.jpg";
  }
  if (action === "bulk-choose-voucher") {
    const button = event.target.closest("[data-action='bulk-choose-voucher']");
    const supplier = button?.dataset.compensationSupplier || "供应商";
    const voucherName = button?.closest(".bulk-voucher-cell")?.querySelector("[data-role='bulk-voucher-name']");
    if (button) {
      button.dataset.bulkVoucherUploaded = "true";
      button.textContent = "重新上传";
    }
    if (voucherName) voucherName.textContent = `已上传：${supplier}-赔款凭证.jpg`;
  }
  if (action === "warning-cancel") closeModal();
  if (action === "warning-repair") {
    closeModal();
    showToast("已确认返修，返修申请已生成");
  }
  if (action === "warning-scrap") {
    closeModal();
    showToast("已改为报损方案，将生成报损出库处理");
  }
});

modalBody.addEventListener("input", (event) => {
  if (event.target.matches("[data-field='repair-fee'], [data-field='estimated-freight'], [data-field='repair-qty'], [data-field='deduct-amount'], [data-field='compensation-amount']")) updatePlanPreview();
  if (event.target.matches("[data-field='exchange-qty']")) {
    const qty = Number(event.target.value || 0);
    const amount = modalBody.querySelector("[data-role='exchange-amount']");
    if (amount) amount.textContent = money(qty * 72);
    updatePlanPreview();
  }
  if (event.target.closest(".condition-row") || event.target.matches("[data-field='config-name']")) updateConfigPreview();
});

document.querySelector("[data-action='collapse']").addEventListener("click", () => {
  shell.dataset.collapsed = shell.dataset.collapsed === "true" ? "false" : "true";
});

document.querySelector("[data-action='open-config']").addEventListener("click", () => {
  openModal("次品处理配置", configListTemplate(), "关闭", "log");
});

document.querySelectorAll("[data-pool-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.poolTab;
    document.querySelectorAll("[data-pool-tab]").forEach((item) => {
      const active = item === tab;
      item.classList.toggle("c-tabs__item--active", active);
      item.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll("[data-pool-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.poolPanel !== target;
    });
    document.querySelector("[data-role='table-summary']").innerHTML = target === "records"
      ? `已处理记录 <strong>5</strong> 条，处置数量 <strong>116</strong> 件`
      : `待处理数量 <strong>105</strong> 件，采购成本合计 <strong>¥13,564.00</strong>`;
  });
});

document.querySelector("[data-action='query-filter']").addEventListener("click", applyFilters);
document.querySelector("[data-action='reset-filter']").addEventListener("click", resetFilters);
document.querySelector("[data-field='sku-filter']").addEventListener("keydown", (event) => {
  if (event.key === "Enter") applyFilters();
});

sortPendingRows();
ensurePendingSelectionCells();
document.querySelector("[data-action='toggle-all-pending']")?.addEventListener("change", (event) => toggleAllPendingRows(event.target.checked));
document.querySelector("[data-action='bulk-plan']")?.addEventListener("click", () => openBulkPlanModal(getSelectedPendingRows()));
document.querySelector("[data-action='clear-pending-selection']")?.addEventListener("click", clearPendingSelection);
updatePendingSelectionState();

function bindPendingPagination() {
  const pagination = document.querySelector("[data-role='pending-pagination']");
  if (!pagination) return;
  const pageButtons = [...pagination.querySelectorAll("[data-page]")];
  const previousButton = pagination.querySelector("[data-page-action='previous']");
  const nextButton = pagination.querySelector("[data-page-action='next']");
  const totalPages = 6;
  let currentPage = 1;

  const updatePagination = (page) => {
    currentPage = Math.max(1, Math.min(totalPages, page));
    pageButtons.forEach((button) => {
      button.classList.toggle("table-pagination__btn--active", Number(button.dataset.page) === currentPage);
    });
    if (previousButton) previousButton.disabled = currentPage === 1;
    if (nextButton) nextButton.disabled = currentPage === totalPages;
  };

  pageButtons.forEach((button) => {
    button.addEventListener("click", () => updatePagination(Number(button.dataset.page)));
  });
  previousButton?.addEventListener("click", () => updatePagination(currentPage - 1));
  nextButton?.addEventListener("click", () => updatePagination(currentPage + 1));
  updatePagination(currentPage);
}

bindPendingPagination();

document.querySelectorAll("[data-action='open-pending-detail']").forEach((item) => {
  item.addEventListener("click", openPendingDetailDrawer);
});

document.querySelectorAll("[data-action='open-plan']").forEach((item) => {
  item.addEventListener("click", () => openPlanModal(item.closest("tr")));
});

document.querySelectorAll("[data-action='open-history']").forEach((item) => {
  item.addEventListener("click", () => openHistoryDrawer(item.closest("tr")));
});

document.querySelectorAll("[data-action='close-drawer']").forEach((item) => {
  item.addEventListener("click", closeDrawer);
});

document.querySelectorAll("[data-action='close-modal']").forEach((item) => {
  item.addEventListener("click", closeModal);
});

confirmButton.addEventListener("click", () => {
  if (modalMode === "log") {
    closeModal();
    return;
  }
  if (modalMode === "plan") {
    submitPlan();
    return;
  }
  if (modalMode === "bulk-plan") {
    submitBulkPlan();
    return;
  }
  if (modalMode === "config-save") {
    const nameInput = modalBody.querySelector("[data-field='config-name']");
    if (nameInput && !nameInput.value.trim()) {
      nameInput.setAttribute("aria-invalid", "true");
      showToast("请输入配置名称");
      return;
    }
  }
  const messages = {
    "config-save": "配置已保存",
    "config-disable": "配置已禁用",
    default: "操作已提交",
  };
  closeModal();
  showToast(messages[modalMode] || messages.default);
});

document.querySelectorAll("[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach((item) => item.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");
    document.querySelectorAll("[data-tab-pane]").forEach((pane) => {
      pane.hidden = pane.dataset.tabPane !== tab.dataset.tab;
    });
  });
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  const action = target?.dataset.action;
  if (action === "open-processed-detail") {
    event.preventDefault();
    openProcessedDetail(target.dataset.recordId);
  }
  if (action === "close-processed-detail") {
    closeProcessedDetail();
  }
  if (action === "open-defect-images") {
    openImageViewer(target.dataset.sku, target.dataset.imageIndex || 0);
  }
  if (action === "close-image-viewer") {
    closeImageViewer();
  }
  if (action === "previous-image") {
    event.stopPropagation();
    moveImageViewer(-1);
  }
  if (action === "next-image") {
    event.stopPropagation();
    moveImageViewer(1);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawer();
    closeModal();
    closeProcessedDetail();
    closeImageViewer();
  }
  if (imageViewerMask.dataset.open === "true" && event.key === "ArrowLeft") {
    moveImageViewer(-1);
  }
  if (imageViewerMask.dataset.open === "true" && event.key === "ArrowRight") {
    moveImageViewer(1);
  }
});

bindSelects(document);
