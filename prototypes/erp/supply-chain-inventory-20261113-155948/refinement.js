const filters = { wh: '', category: '', status: '' };
const visibility = { supply: true, sales: true };
let visibleRows = rows;
let toastTimer;
const columns = [
  { key: 'product', label: '商品 / SKU', width: 208 },
  { key: 'wh', label: '仓库', width: 128 },
  { key: 'category', label: '一级类目', width: 104 },
  { key: 'status', label: '销售状态', width: 88 },
  ...metricKeys.map(key => ({ key, label: metricLabels[key], width: 104, group: 'supply' })),
  { key: 'shortage', label: '缺货数量', width: 100, group: 'supply' },
  ...[['d3', '3天销量'], ['d7', '7天销量'], ['d15', '15天销量'], ['d30', '近30天销量'], ['avg', '日均加权销量'], ['days', '可售天数']].map(([key, label]) => ({ key, label, width: 110, group: 'sales' }))
];

function notify(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}

function closeMenus() {
  document.querySelectorAll('.select-menu, .column-menu').forEach(menu => menu.hidden = true);
  document.querySelectorAll('[aria-expanded]').forEach(button => button.setAttribute('aria-expanded', 'false'));
}

document.querySelectorAll('.select-host').forEach(host => {
  const key = host.dataset.filter;
  const label = host.previousElementSibling.textContent;
  host.innerHTML = `<button type="button" class="select-trigger c-select" aria-label="${label}" aria-expanded="false"><span>${host.dataset.label}</span><i data-lucide="chevron-down"></i></button><div class="select-menu" hidden></div>`;
  const trigger = host.querySelector('button');
  const menu = host.querySelector('.select-menu');
  ['', ...new Set(rows.map(row => row[key]))].forEach(value => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'c-option';
    option.textContent = value || host.dataset.label;
    option.setAttribute('aria-selected', String(!value));
    option.addEventListener('click', () => {
      filters[key] = value;
      trigger.querySelector('span').textContent = option.textContent;
      menu.querySelectorAll('button').forEach(item => item.setAttribute('aria-selected', String(item === option)));
      closeMenus();
      trigger.focus();
    });
    menu.append(option);
  });
  trigger.addEventListener('click', () => {
    const open = menu.hidden;
    closeMenus();
    menu.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) menu.querySelector('button').focus();
  });
  host.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') { closeMenus(); trigger.focus(); return; }
    const options = [...menu.querySelectorAll('button')];
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    const next = options.indexOf(document.activeElement) + (event.key === 'ArrowDown' ? 1 : -1);
    options[(next + options.length) % options.length].focus();
  });
});

function activeColumns() { return columns.filter(column => !column.group || visibility[column.group]); }

function renderReport() {
  const active = activeColumns();
  const base = active.filter(column => !column.group);
  document.querySelector('#reportTable thead').innerHTML = `<tr>${base.map((column, index) => `<th rowspan="2" class="${index === 0 ? 'identity' : ''}" style="min-width:${column.width}px;width:${column.width}px">${column.label}</th>`).join('')}${['supply', 'sales'].filter(group => visibility[group]).map(group => `<th colspan="6" class="group-heading ${group}-head">${group === 'supply' ? '供应链库存' : '销量分析'}</th>`).join('')}</tr><tr>${active.filter(column => column.group).map(column => `<th class="num" data-column-key="${column.key}" style="min-width:${column.width}px;width:${column.width}px" title="${metricConfig[column.key]?.rule || column.label}">${column.label}</th>`).join('')}</tr>`;
  document.getElementById('reportBody').innerHTML = visibleRows.length ? visibleRows.map(row => `<tr>${active.map(column => {
    const key = column.key;
    if (key === 'product') return `<td class="identity"><span class="sku-code">${row.sku}</span><span class="product-name" title="${row.name}">${row.name}</span><span class="product-spu">${row.spu}</span></td>`;
    if (key === 'wh') return `<td><span class="warehouse-code">${row.wh}</span></td>`;
    if (key === 'status') return `<td><span class="tag ${row.statusType}">${row.status}</span></td>`;
    if (key === 'category') return `<td>${row.category}</td>`;
    if (metricKeys.includes(key)) return `<td class="num"><a class="clickable-num ${row[key] === 0 ? 'zero' : ''}" href="#detail" data-row="${rows.indexOf(row)}" data-metric="${key}" aria-label="${row.sku} ${column.label} ${fmt(row[key])}，查看明细">${fmt(row[key])}</a></td>`;
    return `<td class="num"><span class="${key === 'shortage' && row[key] > 0 ? 'risk-number' : key === 'days' && (row.days < 7 || row.days > 90) ? 'days-risk' : row[key] === 0 ? 'zero' : ''}" title="${key === 'days' ? row.risk : column.label}">${fmt(row[key])}</span></td>`;
  }).join('')}</tr>`).join('') : `<tr><td colspan="${active.length}" style="height:160px;text-align:center;color:var(--text-tertiary)">暂无符合条件的数据，请调整筛选条件</td></tr>`;
  document.getElementById('resultCount').textContent = `共 ${visibleRows.length} 条`;
  document.dispatchEvent(new Event('report-rendered'));
  document.getElementById('pageRange').textContent = visibleRows.length ? `第 1–${visibleRows.length} 条，共 ${visibleRows.length} 条` : '共 0 条';
}

function applyFilters() {
  const query = document.getElementById('skuQuery').value.trim().toLowerCase();
  const terms = query.split(/[\s,，;；]+/).filter(Boolean);
  visibleRows = rows.filter(row => Object.entries(filters).every(([key, value]) => !value || row[key] === value) && (!terms.length || terms.some(term => [row.sku, row.spu, row.name].some(value => value.toLowerCase().includes(term)))));
  renderReport();
}
document.getElementById('filterForm').addEventListener('submit', event => { event.preventDefault(); closeMenus(); applyFilters(); });
document.getElementById('filterForm').addEventListener('reset', () => {
  document.getElementById('skuQuery').value = '';
  Object.keys(filters).forEach(key => filters[key] = '');
  document.querySelectorAll('.select-host').forEach(host => {
    host.querySelector('.select-trigger span').textContent = host.dataset.label;
    host.querySelectorAll('.select-menu button').forEach((option, index) => option.setAttribute('aria-selected', String(index === 0)));
  });
  closeMenus();
  visibleRows = rows;
  renderReport();
});

document.getElementById('columnToggle').addEventListener('click', () => {
  const menu = document.getElementById('columnMenu');
  const open = menu.hidden;
  closeMenus();
  menu.hidden = !open;
  document.getElementById('columnToggle').setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('[data-column-group]').forEach(input => input.addEventListener('change', () => { visibility[input.dataset.columnGroup] = input.checked; renderReport(); }));
document.addEventListener('click', event => { if (!event.target.closest('.select-host, .column-host')) closeMenus(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenus();
  const drawer = document.getElementById('drawer');
  if (event.key !== 'Tab' || !drawer.classList.contains('open')) return;
  const items = [...drawer.querySelectorAll('button, a[href], input')].filter(element => element.getClientRects().length && !element.disabled);
  const first = items[0], last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

function downloadCsv(name, data) {
  // Neutralize spreadsheet formulas when users export text fields.
  const csv = '\uFEFF' + data.map(line => line.map(cell => {
    const value = String(cell ?? '');
    return '"' + (/^[=+@\-]/.test(value) ? "'" + value : value).replace(/"/g, '""') + '"';
  }).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.getElementById('exportReport').addEventListener('click', () => {
  const active = activeColumns().filter(column => column.key !== 'product' && column.key !== 'wh');
  downloadCsv('全链路库存报表.csv', [['SKU', 'SPU', '产品名称', '仓库', ...active.map(column => column.label)], ...visibleRows.map(row => [row.sku, row.spu, row.name, row.wh, ...active.map(column => row[column.key])])]);
  notify(`已导出 ${visibleRows.length} 条数据`);
});
document.getElementById('exportDetail').addEventListener('click', () => {
  const data = [...document.querySelectorAll('#detailTable tr')].map(tr => [...tr.cells].map(cell => cell.textContent.trim()));
  downloadCsv(document.getElementById('drawerTitle').textContent + '.csv', data);
  notify('明细已导出');
});
document.getElementById('copyDoc').addEventListener('click', async () => {
  const cells = [...document.querySelectorAll('#detailBody td')];
  const numbers = [...new Set(cells.map(cell => cell.textContent.trim()).filter(value => /^(RQ|PO|SP|SO|TR|OW-IN)-/.test(value)))];
  if (!numbers.length) return notify('当前明细暂无可复制的单号');
  try { await navigator.clipboard.writeText(numbers.join('\n')); notify(`已复制 ${numbers.length} 个单号`); }
  catch { notify('复制失败，请检查浏览器剪贴板权限'); }
});
document.getElementById('collapseMenu').addEventListener('click', () => document.querySelector('.app').classList.toggle('is-collapsed'));
const menuIcons = ['clipboard-list', 'shopping-cart', 'truck', 'chart-no-axes-combined', 'files', 'arrow-left-right', 'chart-line'];
document.querySelectorAll('.menu-icon').forEach((icon, index) => icon.innerHTML = `<i data-lucide="${menuIcons[index]}"></i>`);
document.querySelectorAll('.menu-item:not(.active)').forEach(item => item.title = '当前原型仅包含全链路库存报表');
document.querySelector('.brand-mark').innerHTML = '<i data-lucide="boxes"></i>';
document.getElementById('reportBody').addEventListener('click', event => { if (event.target.closest('a')) event.preventDefault(); });
lucide.createIcons();
applyFilters();
