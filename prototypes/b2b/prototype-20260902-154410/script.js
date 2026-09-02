const configs=[
  {name:'批发单定义',code:'wholesale_order_definition',system:'订单系统',fieldCount:6,desc:'按平台、店铺及订单数量定义批发单，并配置是否自动申购',refs:'缺货订单定时任务',count:1,status:'启用',updatedAt:'2026-09-02 14:35:20',updatedBy:'林晓'},
  {name:'订单关闭原因',code:'order_close_reason',system:'订单系统',fieldCount:3,desc:'销售订单关闭时供操作人选择关闭原因',refs:'销售订单、订单审核',count:6,status:'启用',updatedAt:'2026-09-01 18:16:42',updatedBy:'陈晨'},
  {name:'客户等级',code:'customer_level',system:'客户系统',fieldCount:5,desc:'企业客户分层与价格策略引用',refs:'客户档案、价格策略',count:4,status:'启用',updatedAt:'2026-08-30 11:08:05',updatedBy:'王敏'},
  {name:'付款方式',code:'payment_method',system:'财务系统',fieldCount:4,desc:'订单与合同可选付款方式',refs:'销售订单、采购合同',count:5,status:'启用',updatedAt:'2026-08-29 16:42:31',updatedBy:'周航'},
  {name:'商品单位',code:'product_unit',system:'商品系统',fieldCount:4,desc:'商品和报价的标准计量单位',refs:'商品档案、报价单',count:12,status:'启用',updatedAt:'2026-08-27 09:25:18',updatedBy:'林晓'},
  {name:'发票类型',code:'invoice_type',system:'财务系统',fieldCount:6,desc:'客户开票申请可选类型',refs:'发票管理',count:3,status:'停用',updatedAt:'2026-08-25 15:03:56',updatedBy:'陈晨'}
];
const wholesaleFields=[
  {name:'平台',code:'platform',type:'文本',required:true,default:'—',desc:'订单来源平台'},
  {name:'店铺',code:'store',type:'文本',required:true,default:'—',desc:'规则适用店铺'},
  {name:'SKU 数量',code:'sku_qty',type:'数字',required:true,default:'1',desc:'单个 SKU 达到该数量时命中'},
  {name:'订单总数量',code:'order_total_qty',type:'数字',required:true,default:'1',desc:'订单商品总数达到该数量时命中'},
  {name:'是否自动申购',code:'auto_purchase',type:'布尔',required:true,default:'否',desc:'缺货后是否允许系统自动申购'},
  {name:'申购条件-缺货百分比',code:'shortage_rate',type:'数字',required:true,default:'0',desc:'缺货比例达到该百分比时自动申购'}
];
const wholesaleValues=[{platform:'Amazon',store:'全部店铺',sku_qty:50,order_total_qty:100,auto_purchase:'是',shortage_rate:'20%',status:'启用',sort:10}];
const orderCloseFields=[
  {name:'原因编码',code:'reason_code',type:'文本',required:true,default:'—',desc:'业务唯一编码'},
  {name:'原因名称',code:'reason_name',type:'文本',required:true,default:'—',desc:'面向操作人显示'},
  {name:'允许重新下单',code:'allow_reorder',type:'布尔',required:true,default:'否',desc:'关闭后是否可复制订单'}
];
const orderCloseValues=[
  {reason_code:'BUYER_CANCEL',reason_name:'买家主动取消',allow_reorder:'是',status:'启用',sort:10},
  {reason_code:'PRICE_CHANGED',reason_name:'价格发生变化',allow_reorder:'是',status:'启用',sort:20},
  {reason_code:'OUT_OF_STOCK',reason_name:'商品库存不足',allow_reorder:'是',status:'启用',sort:30},
  {reason_code:'CREDIT_REJECTED',reason_name:'信用审核未通过',allow_reorder:'否',status:'启用',sort:40},
  {reason_code:'DUPLICATE_ORDER',reason_name:'重复下单',allow_reorder:'否',status:'启用',sort:50},
  {reason_code:'OTHER',reason_name:'其他原因',allow_reorder:'否',status:'停用',sort:99}
];
const configData={wholesale_order_definition:{fields:wholesaleFields,values:wholesaleValues},order_close_reason:{fields:orderCloseFields,values:orderCloseValues}};
let fields=wholesaleFields,values=wholesaleValues,current=0,valueFilter='all',systemFilter='全部',fieldType='文本';
let editingField=-1,editingValue=-1,pendingToggleConfig=-1;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];

function toast(text){$('#toast').textContent=text;$('#toast').classList.add('is-show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('is-show'),1800)}
function nowText(){return new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).replaceAll('/','-')}
function markUpdated(message){const c=configs[current];c.updatedAt=nowText();c.updatedBy='林晓';if(message)addLog(message);renderDetailMeta();renderConfigs()}
function dataFor(c){return configData[c.code]||configData.order_close_reason}

function renderConfigs(){
  const q=$('#configSearch').value.trim().toLowerCase();
  const rows=configs.map((c,i)=>({c,i})).filter(({c})=>(systemFilter==='全部'||c.system===systemFilter)&&(!q||`${c.name}${c.code}`.toLowerCase().includes(q)));
  $('#configTotal').textContent=rows.length;
  $('#configRows').innerHTML=rows.map(({c,i})=>`<tr>
    <td><div class="c-config-name"><span class="c-config-name__icon">${c.name[0]}</span><button class="c-config-entry" data-config="${i}">${c.name}</button></div></td>
    <td><code>${c.code}</code></td><td>${c.system}</td><td><b>${c.fieldCount}</b> 个</td><td>${c.count} 条</td><td>${c.refs}</td>
    <td><span class="tag ${c.status==='启用'?'tag--success':'tag--default'}">已${c.status}</span></td><td>${c.updatedAt}</td><td>${c.updatedBy}</td>
    <td><div class="c-actions"><button class="c-action-link c-config-entry" data-config="${i}">进入配置</button><button class="c-action-link ${c.status==='启用'?'c-action-link--danger':''}" data-toggle-config="${i}">${c.status==='启用'?'禁用':'启用'}</button></div></td>
  </tr>`).join('')||'<tr><td colspan="10">暂无匹配配置</td></tr>';
  $$('[data-config]').forEach(button=>button.onclick=()=>selectConfig(+button.dataset.config));
  $$('[data-toggle-config]').forEach(button=>button.onclick=()=>requestToggleConfig(+button.dataset.toggleConfig));
}
function renderDetailMeta(){
  const c=configs[current];
  $('#detailName').textContent=c.name;$('#detailCode').textContent=c.code;$('#detailSystem').textContent=c.system;
  $('#detailDesc').textContent=c.desc;$('#detailRefs').textContent=c.refs;$('#detailUpdated').textContent=`${c.updatedAt} · ${c.updatedBy}`;
}
function selectConfig(index){
  current=index;const c=configs[index],data=dataFor(c);fields=data.fields;values=data.values;c.fieldCount=fields.length;c.count=values.length;
  renderDetailMeta();renderFields();renderValues();$('#homeView').classList.remove('is-active');$('#detailView').classList.add('is-active');positionAnnotations();
}
function requestToggleConfig(index){
  if(configs[index].status==='停用'){current=index;configs[index].status='启用';markUpdated('启用配置项');toast('配置项已启用');return}
  pendingToggleConfig=index;$('#impactCheck').checked=false;$('#confirmDisable').disabled=true;$('#modalMask').classList.add('is-open');$('#disableModal').classList.add('is-open');
}
function closeModal(){$('#modalMask').classList.remove('is-open');$('#disableModal').classList.remove('is-open');pendingToggleConfig=-1}

function renderValues(){
  const q=$('#valueSearch').value.trim().toLowerCase();
  const rows=values.map((v,i)=>({v,i})).filter(({v})=>(valueFilter==='all'||v.status===valueFilter)&&(!q||Object.values(v).join(' ').toLowerCase().includes(q)));
  configs[current].count=values.length;$('#valueCount').textContent=values.length;
  $('#valueHead').innerHTML=`<tr>${fields.map(f=>`<th>${f.name}<br><code>${f.code}</code></th>`).join('')}<th>排序</th><th>操作</th></tr>`;
  $('#valueRows').innerHTML=rows.map(({v,i})=>`<tr>${fields.map(f=>`<td>${v[f.code]??'—'}</td>`).join('')}<td>${v.sort}</td><td><div class="c-actions"><button class="c-action-link" data-edit-value="${i}">编辑</button><button class="c-action-link" data-toggle-value="${i}">${v.status==='启用'?'停用':'启用'}</button><button class="c-action-link c-action-link--danger" data-delete-value="${i}">删除</button></div></td></tr>`).join('')||`<tr><td colspan="${fields.length+2}">暂无匹配数据</td></tr>`;
  $$('[data-edit-value]').forEach(button=>button.onclick=()=>openValueEditor(+button.dataset.editValue));
  $$('[data-toggle-value]').forEach(button=>button.onclick=()=>toggleValue(+button.dataset.toggleValue));
  $$('[data-delete-value]').forEach(button=>button.onclick=()=>deleteValue(+button.dataset.deleteValue));
}
function addLog(text){$('#logList').insertAdjacentHTML('afterbegin',`<p><b>林晓</b> ${text}<small>${nowText()}</small></p>`)}
function toggleValue(index){const v=values[index];v.status=v.status==='启用'?'停用':'启用';markUpdated(`${v.status}配置值“${v.reason_name||v[fields[0].code]}”`);renderValues();toast(`配置值已${v.status}`)}
function deleteValue(index){const v=values[index];values.splice(index,1);markUpdated(`删除配置值“${v.reason_name||v[fields[0].code]}”`);renderValues();toast('配置值已删除，操作已记录日志')}

function renderFields(){
  configs[current].fieldCount=fields.length;$('#fieldCount').textContent=fields.length;
  $('#fieldRows').innerHTML=fields.map((f,i)=>`<tr><td>${f.name}</td><td><code>${f.code}</code></td><td>${f.type}</td><td>${f.required?'是':'否'}</td><td>${f.default}</td><td>${f.desc}</td><td><div class="c-actions"><button class="c-action-link" data-edit-field="${i}">编辑</button><button class="c-action-link c-action-link--danger" data-del-field="${i}">删除</button></div></td></tr>`).join('');
  $$('[data-edit-field]').forEach(button=>button.onclick=()=>openFieldEditor(+button.dataset.editField));
  $$('[data-del-field]').forEach(button=>button.onclick=()=>toast('字段已被配置数据引用，不能直接删除'));
}
function setFieldType(type,locked=false){fieldType=type;$$('[data-type]').forEach(button=>{button.classList.toggle('is-selected',button.dataset.type===type);button.disabled=locked})}
function openFieldEditor(index=-1){
  editingField=index;const editing=index>=0,f=editing?fields[index]:{name:'',code:'',type:'文本',required:true,default:'',desc:''};
  $('#fieldDrawerTitle').textContent=editing?'编辑字段':'新增字段';$('#fieldDrawerTip').textContent=editing?'字段编码和数据类型保存后不可修改。':'字段定义将成为返回对象的属性。';
  $('#newFieldName').value=f.name;$('#newFieldCode').value=f.code;$('#newFieldCode').disabled=editing;$('#newFieldDefault').value=f.default==='—'?'':f.default;$('#newFieldDesc').value=f.desc==='—'?'':f.desc;
  $('#requiredSwitch').classList.toggle('is-on',f.required);setFieldType(f.type,editing);openDrawer('#fieldDrawer');
}
function buildValueForm(item={}){$('#valueForm').innerHTML=fields.map(f=>`<label>${f.name} ${f.required?'<em>*</em>':''}<input class="input" data-value-code="${f.code}" value="${item[f.code]??''}" placeholder="请输入${f.name}"><small>字段编码：${f.code}</small></label>`).join('')+`<label>排序<input class="input" data-value-code="sort" value="${item.sort??(values.length+1)*10}"></label>`}
function openValueEditor(index=-1){editingValue=index;buildValueForm(index>=0?values[index]:{});$('#valueDrawer h2').textContent=index>=0?'编辑配置数据':'新增配置数据';openDrawer('#valueDrawer')}

function openDrawer(selector){$('#mask').classList.add('is-open');$(selector).classList.add('is-open')}
function closeDrawers(){$('#mask').classList.remove('is-open');$$('.c-drawer').forEach(drawer=>drawer.classList.remove('is-open'))}

renderConfigs();renderFields();renderValues();
$('#configSearch').oninput=renderConfigs;
$$('[data-system]').forEach(button=>button.onclick=()=>{systemFilter=button.dataset.system;$$('[data-system]').forEach(item=>item.classList.toggle('is-selected',item===button));renderConfigs()});
$('#backHomeBtn').onclick=()=>{$('#detailView').classList.remove('is-active');$('#homeView').classList.add('is-active');renderConfigs();positionAnnotations()};
$('#valueSearch').oninput=renderValues;
$$('[data-tab]').forEach(button=>button.onclick=()=>{$$('[data-tab]').forEach(item=>item.classList.toggle('is-selected',item===button));$$('[data-panel]').forEach(panel=>panel.classList.toggle('is-active',panel.dataset.panel===button.dataset.tab));positionAnnotations()});
$$('[data-filter]').forEach(button=>button.onclick=()=>{valueFilter=button.dataset.filter;$$('[data-filter]').forEach(item=>item.classList.toggle('is-selected',item===button));renderValues()});

$('#newConfigBtn').onclick=()=>openDrawer('#configDrawer');
$('#editBasicBtn').onclick=()=>{const c=configs[current];$('#editConfigName').value=c.name;$('#editConfigCode').value=c.code;$('#editConfigSystem').value=c.system;$('#editConfigDesc').value=c.desc;$('#editConfigRefs').value=c.refs;openDrawer('#basicDrawer')};
$('#addFieldBtn').onclick=()=>openFieldEditor();$('#addValueBtn').onclick=()=>openValueEditor();
$$('[data-close]').forEach(button=>button.onclick=closeDrawers);$('#mask').onclick=closeDrawers;

$('#saveBasicBtn').onclick=()=>{const c=configs[current],name=$('#editConfigName').value.trim();if(!name){toast('请填写配置名称');return}c.name=name;c.desc=$('#editConfigDesc').value.trim()||'暂无说明';c.refs=$('#editConfigRefs').value.trim()||'尚未调用';markUpdated('编辑配置基本信息');closeDrawers();toast('基本信息已保存')};
$('#saveConfigBtn').onclick=()=>{const name=$('#newConfigName').value.trim(),code=$('#newConfigCode').value.trim();if(!name||!/^[a-z][a-z0-9_]*$/.test(code)){toast('请填写名称和正确的配置编码');return}configData[code]={fields:[],values:[]};configs.push({name,code,system:'订单系统',fieldCount:0,desc:$('#newConfigDesc').value||'暂无说明',refs:'尚未调用',count:0,status:'启用',updatedAt:nowText(),updatedBy:'林晓'});current=configs.length-1;closeDrawers();renderConfigs();selectConfig(current);toast('配置项已创建，请继续定义字段')};
$$('[data-type]').forEach(button=>button.onclick=()=>{if(editingField<0)setFieldType(button.dataset.type)});
$('#requiredSwitch').onclick=()=>$('#requiredSwitch').classList.toggle('is-on');
$('#saveFieldBtn').onclick=()=>{const name=$('#newFieldName').value.trim(),code=$('#newFieldCode').value.trim();if(!name||!/^[a-z][a-z0-9_]*$/.test(code)){toast('请填写字段名称和正确的字段编码');return}if(editingField<0&&fields.some(f=>f.code===code)){toast('字段编码已存在');return}const next={name,code:editingField>=0?fields[editingField].code:code,type:editingField>=0?fields[editingField].type:fieldType,required:$('#requiredSwitch').classList.contains('is-on'),default:$('#newFieldDefault').value.trim()||'—',desc:$('#newFieldDesc').value.trim()||'—'};if(editingField>=0){fields[editingField]=next;markUpdated(`编辑字段“${name}”`)}else{fields.push(next);values.forEach(v=>v[code]='—');markUpdated(`新增字段“${name}”`)}closeDrawers();renderFields();renderValues();toast(editingField>=0?'字段修改已保存':'字段已新增，返回结构已同步更新')};
$('#saveValueBtn').onclick=()=>{const item=editingValue>=0?{...values[editingValue]}:{status:'启用'};let ok=true;$$('[data-value-code]').forEach(input=>{if(!input.value.trim()&&input.dataset.valueCode!=='sort')ok=false;item[input.dataset.valueCode]=input.dataset.valueCode==='sort'?Number(input.value):input.value.trim()});if(!ok){toast('请填写所有必填字段');return}if(editingValue>=0)values[editingValue]=item;else values.push(item);markUpdated(editingValue>=0?'编辑配置数据':'新增配置数据');closeDrawers();renderValues();toast(editingValue>=0?'配置数据已更新':'配置数据已保存')};

$('#impactCheck').onchange=()=>$('#confirmDisable').disabled=!$('#impactCheck').checked;
$('#confirmDisable').onclick=()=>{if(pendingToggleConfig<0)return;current=pendingToggleConfig;configs[current].status='停用';markUpdated('禁用配置项');closeModal();toast('配置项已禁用')};
$$('[data-close-modal]').forEach(button=>button.onclick=closeModal);$('#modalMask').onclick=closeModal;

const anns=[
  {id:1,type:'页面',title:'公共配置入口',text:'面向企业管理员集中维护跨业务系统的通用配置；入口为系统设置 / 公共配置。'},
  {id:2,type:'交互',title:'配置项列表',text:'支持名称、编码和所属系统筛选。操作栏提供进入配置及启用/禁用；禁用需确认影响。最后更新精确到秒并展示更新人。'},
  {id:3,type:'交互',title:'配置基本信息',text:'点击“编辑基本信息”打开抽屉；名称、说明及调用模块可编辑，编码和所属系统只读；保存后回显并记录更新时间与更新人。'},
  {id:4,type:'字段',title:'配置摘要',text:'展示配置说明、调用模块、返回结构及“年月日时分秒 · 更新人”的最后更新时间。'},
  {id:5,type:'字段',title:'配置数据',text:'每行是一条配置数据；支持编辑、启停和删除，操作后同步更新日志与最后更新时间。'},
  {id:6,type:'交互',title:'字段定义编辑',text:'点击字段“编辑”打开抽屉并回填数据；已发布字段的编码和数据类型锁定，名称、默认值、说明和必填状态可修改。'},
  {id:7,type:'交互',title:'原型标注模式',text:'关闭后编号点与抽屉同时隐藏，页面状态和业务交互保持不变。'},
  {id:8,type:'规则',title:'启停生效规则',text:'启用后配置可被业务读取；禁用前必须确认调用影响，禁用后数据保留但不再对下游生效。',target:'detailUpdated'}
];
const colors={页面:'#1677ff',字段:'#722ed1',交互:'#13a8a8',规则:'#fa8c16',待确认:'#eb2f96'};let annFilter='全部';
function target(annotation){return annotation.target?$('#'+annotation.target):$(`[data-annotation="${annotation.id}"]`)}
function renderAnnotations(){const types=['全部','页面','字段','交互','规则','待确认'];$('#annotationTotal').textContent=anns.length;$('#annotationFilters').innerHTML=types.map(type=>`<button class="c-annotation-filter ${annFilter===type?'is-selected':''}" data-ann-filter="${type}">${type} ${type==='全部'?anns.length:anns.filter(a=>a.type===type).length}</button>`).join('');$('#annotationList').innerHTML=anns.filter(a=>annFilter==='全部'||a.type===annFilter).map(a=>`<article class="c-annotation-item" data-ann="${a.id}" style="--ann-color:${colors[a.type]}"><div class="c-annotation-item__head"><span class="c-annotation-num">${a.id}</span><b>${a.title}</b><span class="c-annotation-type">${a.type}</span></div><p>${a.text}</p></article>`).join('');$$('[data-ann-filter]').forEach(button=>button.onclick=()=>{annFilter=button.dataset.annFilter;renderAnnotations()});$$('[data-ann]').forEach(item=>item.onclick=()=>focusAnn(+item.dataset.ann));positionAnnotations()}
function positionAnnotations(){$$('.c-annotation-dot').forEach(dot=>dot.remove());if(document.body.classList.contains('annotations-off'))return;anns.forEach(annotation=>{const element=target(annotation);if(!element||!element.offsetParent)return;const rect=element.getBoundingClientRect(),dot=document.createElement('button');dot.className='c-annotation-dot';dot.textContent=annotation.id;dot.style.cssText=`--ann-color:${colors[annotation.type]};left:${rect.left+6}px;top:${rect.top+6}px`;dot.onclick=()=>focusAnn(annotation.id);document.body.appendChild(dot)})}
function focusAnn(id){const annotation=anns.find(item=>item.id===id),element=target(annotation);element?.scrollIntoView({behavior:'smooth',block:'center'});element?.classList.add('is-highlighted');setTimeout(()=>element?.classList.remove('is-highlighted'),1500);$(`[data-ann="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'})}
function toggleAnnotations(){const off=document.body.classList.toggle('annotations-off');$('#annotationToggle').textContent=off?'开启标注':'关闭标注';positionAnnotations()}
$('#closeAnnotations').onclick=toggleAnnotations;$('#annotationToggle').onclick=toggleAnnotations;window.addEventListener('resize',positionAnnotations);renderAnnotations();setTimeout(positionAnnotations,50);
