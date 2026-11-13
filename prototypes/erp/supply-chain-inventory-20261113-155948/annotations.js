
(() => {
const types={'页面':'#64748b','字段':'#0891b2','交互':'#059669','规则':'#7c3aed','待确认':'#d97706'};
const notes=[
  [
    "页面",
    ".page-title",
    "全链路库存报表",
    "目的：按最终收货仓库与产品组/SKU查看申购、采购、中转、海外在途和海外仓在库。适用角色为计划、采购、仓储、运营，具体权限待确认。入口为库存菜单，出口为数量明细和CSV。仓库不是当前中转仓。"
  ],
  [
    "字段",
    ".sync-banner",
    "统计时间",
    "只读。来源为报表批次时间，示例2026-05-19 14:00。预计到货公式中的当前时间在同一批次统一取计算时点，不能各行分别取浏览器时间。时区、调度频率与跨源批次一致性待确认。"
  ],
  [
    "字段",
    ".field:nth-child(1)",
    "商品关键词",
    "非必填，默认空；数据来自SKU、SPU和名称。忽略大小写，多个词以空格或中英文逗号分隔，任一词包含匹配；查询后生效，与仓库、类目、状态取交集。"
  ],
  [
    "字段",
    ".field:nth-child(2)",
    "仓库",
    "非必填，默认全部仓库，来自权限内仓库字典。精确匹配最终收货仓库；采购回溯申购单收货仓库，中转追溯采购/申购链，调拨取目的仓库，在库取同步仓库。当前示例选项来自本地数据；"
  ],
  [
    "字段",
    ".field:nth-child(3)",
    "一级类目",
    "非必填，默认全部。来源为商品快照的一级类目，精确匹配。历史与当前类目取值规则待确认。"
  ],
  [
    "字段",
    ".field:nth-child(4)",
    "销售状态",
    "非必填，默认全部。当前示例在售、预售、清仓，完整字典待确认。与其他已提交条件取交集。"
  ],
  [
    "交互",
    ".filter-footer .actions",
    "查询与重置",
    "点击查询或回车提交条件。结果数量、明细对象及导出范围保持一致；无结果保留条件并提示调整。重置清空条件并恢复全部示例。接口失败需保留输入、显示原因并可重试；本地原型无真实接口。"
  ],
  [
    "交互",
    "#exportReport",
    "导出报表",
    "导出已查询结果与当前可见字段组，附SKU、SPU、名称及仓库。CSV文本作公式注入转义；下载发起不等于磁盘保存成功。大数据异步导出、导出权限待确认。"
  ],
  [
    "交互",
    "#columnToggle",
    "列设置",
    "独立显示供应链库存和销量，立即更新表头与数据；全隐藏保留商品基础列。再次打开回显设置。只在当前页面会话生效。点击被隐藏字段的标注时先恢复该字段组，再定位。"
  ],
  [
    "规则",
    "[data-column-key=\"request\"]",
    "申购待确认及预计到货",
    "取申购单待审核数量；海外仓发货计划待申购量归计划收货仓库。关联重合时不能重复计数，正式去重键待确认。预计到货=当前时间+申购处理时间+采购处理时效+采购交期+仓库作业时间+在途时效。点击数量查看单据、状态、数量、仓库和预计到货。"
  ],
  [
    "规则",
    "[data-column-key=\"purchaseTransit\"]",
    "采购在途及预计到货",
    "取未完结采购单，数量=采购数量−已上架数量；已收货但未上架仍在采购在途。采购行回溯申购行及其收货仓库。预计到货=采购预计交期+仓库处理时效+在途时效。采购预计交期为时点，采购交期为时长，两者不得混用。"
  ],
  [
    "规则",
    "[data-column-key=\"transferStock\"]",
    "中转仓在库及预计到货",
    "取待发货列表，并纳入已发起发货计划但未出库的发货单，关联采购和申购，按最终收货仓库归集。同一实物不能在两来源重复计数。预计到货=当前时间+[仓库作业时间−(当前时间−最后上架时间)]+在途时效。示例保留负剩余作业时长；是否按0截断待确认。"
  ],
  [
    "规则",
    "[data-column-key=\"overseasTransit\"]",
    "海外在途及预计到仓",
    "来源为调拨在途模块的在途单据，归属目的仓库。预计到仓直接使用调拨在途单据的预计到仓时间，由调拨模块计算在途时效，本报表不重复叠加。取消、短收、超收、丢损处理待确认。"
  ],
  [
    "规则",
    "[data-column-key=\"overseasStock\"]",
    "海外仓在库",
    "同步海外仓库存数据，取同步记录的仓库和在库数量；已到仓，不再计算预计到货。不能把在库未经确认等同于可售。同步单位、预占及不可售映射待确认。"
  ],
  [
    "待确认",
    "#resultCount",
    "数量换算与统计边界",
    "产品组与单SKU单位不同。采购/中转示例按子件配比取最小齐套数；BOM版本、共用子件分配、按最终仓库汇总范围待确认。销量权重、缺货公式、零销量与可售库存分母待确认。不能跨商品直接合计组数与件数。"
  ],
  [
    "交互",
    ".table-toolbar",
    "数量明细与预计到货",
    "五项库存数量（含0）可下钻；抽屉保留仓库和商品上下文，切换来源单据/统计口径，逐行展示预计到货依据。0数量给空态；支持复制单号、导出、Esc关闭、焦点返回。缺少必要日期或时效时预计到货显示—，不得按0伪造日期。"
  ]
];
const panel=document.createElement('aside'); panel.className='ann-panel';panel.setAttribute('aria-label','原型标注');
panel.innerHTML='<div class="ann-head"><div class="ann-title"><span>原型标注 <small>'+notes.length+' 条</small></span><button class="btn c-icon" id="annClose" aria-label="关闭标注">×</button></div><p>点击条目定位页面中的对应区域</p></div><div class="ann-filters"></div><div class="ann-list"></div>';
document.body.append(panel);
const toggle=document.createElement('button');toggle.className='btn primary ann-toggle';document.body.append(toggle);
let enabled=true,selected=0;
function bind(){notes.forEach((n,i)=>{const el=document.querySelector(n[1]);if(!el)return;el.classList.add('ann-anchor');if(!el.querySelector(':scope > .ann-dot')){const dot=document.createElement('button');dot.type='button';dot.className='ann-dot';dot.style.setProperty('--kind',types[n[0]]);dot.textContent=i+1;dot.setAttribute('aria-label','标注 '+(i+1)+' '+n[2]);dot.hidden=!enabled;dot.onclick=e=>{e.stopPropagation();select(i,false);};el.append(dot);}});}
function filter(type){panel.querySelectorAll('.ann-item').forEach((e,i)=>e.hidden=type!=='全部'&&notes[i][0]!==type);panel.querySelectorAll('.ann-filters button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.type===type)));}
function select(i,locate){selected=i;filter('全部');panel.querySelectorAll('.ann-item').forEach((el,j)=>el.classList.toggle('selected',i===j));const item=panel.querySelectorAll('.ann-item')[i];if(!locate)item.scrollIntoView({behavior:'smooth',block:'nearest'});else{let el=document.querySelector(notes[i][1]);if(!el && notes[i][1].includes('data-column-key')){visibility.supply=true;document.querySelector('[data-column-group="supply"]').checked=true;renderReport();el=document.querySelector(notes[i][1]);}if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});el.classList.add('ann-highlight');setTimeout(()=>el.classList.remove('ann-highlight'),1800);}}
['全部',...Object.keys(types)].forEach(type=>{const b=document.createElement('button');b.dataset.type=type;b.textContent=type+' '+(type==='全部'?notes.length:notes.filter(n=>n[0]===type).length);b.style.color=types[type]||'';b.onclick=()=>filter(type);panel.querySelector('.ann-filters').append(b);});
notes.forEach((n,i)=>{const b=document.createElement('button');b.className='ann-item';b.style.setProperty('--kind',types[n[0]]);b.innerHTML='<strong><span class="ann-num">'+(i+1)+'</span>'+n[2]+'</strong><span class="ann-kind">'+n[0]+'</span><p>'+n[3]+'</p>';b.onclick=()=>select(i,true);panel.querySelector('.ann-list').append(b);});
function setEnabled(value){enabled=value;document.body.classList.toggle('ann-on',value);panel.hidden=!value;toggle.textContent=value?'关闭标注':'开启标注';toggle.setAttribute('aria-pressed',String(value));document.querySelectorAll('.ann-dot').forEach(d=>d.hidden=!value);}
toggle.onclick=()=>setEnabled(!enabled);panel.querySelector('#annClose').onclick=()=>setEnabled(false);
document.addEventListener('report-rendered',bind);bind();filter('全部');setEnabled(new URLSearchParams(location.search).get('annotations')!=='off');
})();
