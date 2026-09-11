const configs=[
  {name:'批发单自动申购条件',code:'wholesale_order_definition',system:'订单系统',fieldCount:5,desc:'按平台、店铺、订单数量及缺货比例配置批发单自动申购条件',refs:'缺货订单定时任务',count:1,status:'启用',updatedAt:'2026-09-11 16:20:00',updatedBy:'林晓'},
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
  {name:'申购条件-缺货百分比',code:'shortage_rate',type:'数字',required:true,default:'0',desc:'缺货比例达到该百分比时自动申购'}
];
const wholesaleValues=[{seq:1,platform:'Amazon',store:'全部店铺',sku_qty:50,order_total_qty:100,shortage_rate:'20%',status:'启用',logs:[
  {operator:'林晓',action:'编辑',time:'2026-09-11 15:08:42',detail:'缺货百分比由 15% 调整为 20%'},
  {operator:'陈晨',action:'启用',time:'2026-09-10 10:26:18',detail:'状态由停用变更为启用'},
  {operator:'陈晨',action:'停用',time:'2026-09-09 17:42:03',detail:'业务规则核对期间临时停用'},
  {operator:'林晓',action:'Excel 导入更新',time:'2026-09-08 14:12:36',detail:'通过序号 1 更新店铺及数量门槛'},
  {operator:'王敏',action:'编辑',time:'2026-09-06 11:05:29',detail:'订单总数量由 80 调整为 100'},
  {operator:'林晓',action:'编辑',time:'2026-09-04 09:48:17',detail:'完善批发单缺货比例条件'},
  {operator:'林晓',action:'新增',time:'2026-09-02 14:35:20',detail:'创建批发单自动申购条件案例数据'}
]}];
const orderCloseFields=[
  {name:'原因编码',code:'reason_code',type:'文本',required:true,default:'—',desc:'业务唯一编码'},
  {name:'原因名称',code:'reason_name',type:'文本',required:true,default:'—',desc:'面向操作人显示'},
  {name:'允许重新下单',code:'allow_reorder',type:'布尔',required:true,default:'否',desc:'关闭后是否可复制订单'}
];
const orderCloseValues=[
  {seq:1,reason_code:'BUYER_CANCEL',reason_name:'买家主动取消',allow_reorder:'是',status:'启用',logs:[]},
  {seq:2,reason_code:'PRICE_CHANGED',reason_name:'价格发生变化',allow_reorder:'是',status:'启用',logs:[]},
  {seq:3,reason_code:'OUT_OF_STOCK',reason_name:'商品库存不足',allow_reorder:'是',status:'启用',logs:[]},
  {seq:4,reason_code:'CREDIT_REJECTED',reason_name:'信用审核未通过',allow_reorder:'否',status:'启用',logs:[]},
  {seq:5,reason_code:'DUPLICATE_ORDER',reason_name:'重复下单',allow_reorder:'否',status:'启用',logs:[]},
  {seq:6,reason_code:'OTHER',reason_name:'其他原因',allow_reorder:'否',status:'停用',logs:[]}
];
const configData={wholesale_order_definition:{fields:wholesaleFields,values:wholesaleValues},order_close_reason:{fields:orderCloseFields,values:orderCloseValues}};
let fields=wholesaleFields,values=wholesaleValues,current=0,valueFilter='all',systemFilter='全部',fieldType='文本';
let editingField=-1,editingValue=-1,pendingToggleConfig=-1,pendingImportRows=[],currentRowLog=null,rowLogPage=1;
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
  $('#valueHead').innerHTML=`<tr><th>序号</th>${fields.map(f=>`<th>${f.name}<br><code>${f.code}</code></th>`).join('')}<th>操作</th></tr>`;
  $('#valueRows').innerHTML=rows.map(({v,i})=>`<tr><td><b>${v.seq}</b></td>${fields.map(f=>`<td>${v[f.code]??'—'}</td>`).join('')}<td><div class="c-actions"><button class="c-action-link" data-edit-value="${i}">编辑</button><button class="c-action-link" data-toggle-value="${i}">${v.status==='启用'?'停用':'启用'}</button><button class="c-action-link" data-row-log="${i}">日志</button><button class="c-action-link c-action-link--danger" data-delete-value="${i}">删除</button></div></td></tr>`).join('')||`<tr><td colspan="${fields.length+2}">暂无匹配数据</td></tr>`;
  $$('[data-edit-value]').forEach(button=>button.onclick=()=>openValueEditor(+button.dataset.editValue));
  $$('[data-toggle-value]').forEach(button=>button.onclick=()=>toggleValue(+button.dataset.toggleValue));
  $$('[data-row-log]').forEach(button=>button.onclick=()=>openRowLogs(+button.dataset.rowLog));
  $$('[data-delete-value]').forEach(button=>button.onclick=()=>deleteValue(+button.dataset.deleteValue));
}
function addLog(text){$('#logList').insertAdjacentHTML('afterbegin',`<p><b>林晓</b> ${text}<small>${nowText()}</small></p>`)}
function addRowLog(item,action,detail){item.logs=item.logs||[];item.logs.unshift({operator:'林晓',action,time:nowText(),detail})}
function toggleValue(index){const v=values[index];v.status=v.status==='启用'?'停用':'启用';addRowLog(v,`${v.status}数据`,`状态变更为${v.status}`);markUpdated(`${v.status}配置值“${v.reason_name||v[fields[0].code]}”`);renderValues();toast(`配置值已${v.status}`)}
function deleteValue(index){const v=values[index];values.splice(index,1);markUpdated(`删除配置值“${v.reason_name||v[fields[0].code]}”`);renderValues();toast('配置值已删除，操作已记录日志')}
function renderRowLogs(){const logs=currentRowLog?.logs||[],pageSize=5,totalPages=Math.max(1,Math.ceil(logs.length/pageSize)),page=Math.min(rowLogPage,totalPages),pageRows=logs.slice((page-1)*pageSize,page*pageSize);rowLogPage=page;$('#rowLogList').innerHTML=pageRows.length?pageRows.map(log=>`<tr><td>${log.action}</td><td>${log.detail}</td><td>${log.operator}</td><td>${log.time}</td></tr>`).join(''):'<tr><td colspan="4"><div class="c-empty">当前行暂无变更日志</div></td></tr>';$('#rowLogPagination').innerHTML=`<span>共 ${logs.length} 条，每页 ${pageSize} 条</span><button data-log-page="prev" ${page<=1?'disabled':''}>‹</button>${Array.from({length:totalPages},(_,index)=>`<button class="${index+1===page?'is-current':''}" data-log-page="${index+1}">${index+1}</button>`).join('')}<button data-log-page="next" ${page>=totalPages?'disabled':''}>›</button>`;$$('[data-log-page]').forEach(button=>button.onclick=()=>{const target=button.dataset.logPage;rowLogPage=target==='prev'?rowLogPage-1:target==='next'?rowLogPage+1:Number(target);renderRowLogs()})}
function openRowLogs(index){currentRowLog=values[index];rowLogPage=1;$('#rowLogSubtitle').textContent=`序号 ${currentRowLog.seq} · ${currentRowLog[fields[0].code]??'—'}`;renderRowLogs();openDrawer('#rowLogDrawer')}

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
function buildValueForm(item={}){$('#valueForm').innerHTML=(editingValue>=0?`<label>序号<input class="input" value="${item.seq}" disabled><small>序号由系统生成，不可修改</small></label>`:'')+fields.map(f=>`<label>${f.name} ${f.required?'<em>*</em>':''}<input class="input" data-value-code="${f.code}" value="${item[f.code]??''}" placeholder="请输入${f.name}"><small>字段编码：${f.code}</small></label>`).join('')}
function openValueEditor(index=-1){editingValue=index;buildValueForm(index>=0?values[index]:{});$('#valueDrawer h2').textContent=index>=0?'编辑配置数据':'新增配置数据';openDrawer('#valueDrawer')}
function nextSeq(){return values.reduce((max,item)=>Math.max(max,Number(item.seq)||0),0)+1}
function resetImport(){pendingImportRows=[];$('#excelFile').value='';$('#fileCard').innerHTML='';$('#importResult').innerHTML='<b>校验结果</b><div class="c-import-empty">上传文件后显示数据校验与导入预览</div>';$('#saveImportBtn').disabled=true}
function downloadTemplate(){const headers=['序号',...fields.map(field=>field.code)];const example=['',...fields.map((field,index)=>index===0?'示例值':field.type==='数字'?'1':field.type==='布尔'?'是':'示例值')];const cells=row=>row.map(value=>`<td>${value}</td>`).join('');const workbook=`<html><head><meta charset="UTF-8"></head><body><table><tr>${headers.map(value=>`<th>${value}</th>`).join('')}</tr><tr>${cells(example)}</tr></table></body></html>`;const url=URL.createObjectURL(new Blob([workbook],{type:'application/vnd.ms-excel'})),link=document.createElement('a');link.href=url;link.download=`${configs[current].code}_导入模板.xls`;link.click();URL.revokeObjectURL(url);toast('Excel 导入模板已下载')}
function validateExcelFile(file){if(!file)return;const extension=file.name.split('.').pop().toLowerCase();if(!['xlsx','xls'].includes(extension)){toast('请选择 .xlsx 或 .xls 文件');$('#excelFile').value='';return}if(file.size>10*1024*1024){toast('文件不能超过 10 MB');$('#excelFile').value='';return}const first=values[0]||{},update={序号:first.seq||1},add={序号:''};fields.forEach((field,index)=>{update[field.code]=first[field.code]??field.default??'';add[field.code]=index===0?'新增示例':field.type==='数字'?'1':field.type==='布尔'?'是':'示例值'});pendingImportRows=[update,add];$('#fileCard').innerHTML=`<div><b>▣ ${file.name}</b><small>${(file.size/1024).toFixed(1)} KB · Excel 文件</small></div><button class="c-action-link" id="removeImportFile">移除</button>`;$('#importResult').innerHTML=`<div class="c-import-result__head"><b>校验结果</b><span class="tag tag--success">全部通过</span></div><div class="c-import-summary"><span><b>2</b> 数据行</span><span><b>1</b> 新增</span><span><b>1</b> 更新</span><span><b>0</b> 错误</span></div><table><thead><tr><th>Excel 行</th><th>序号</th><th>处理方式</th><th>校验结果</th></tr></thead><tbody><tr><td>第 2 行</td><td>${first.seq||1}</td><td>更新</td><td><span class="tag tag--success">通过</span></td></tr><tr><td>第 3 行</td><td>空</td><td>新增</td><td><span class="tag tag--success">通过</span></td></tr></tbody></table>`;$('#saveImportBtn').disabled=false;$('#removeImportFile').onclick=resetImport}
function importValues(){if(!pendingImportRows.length){toast('请先上传并校验 Excel 文件');return}let added=0,updated=0;pendingImportRows.forEach(row=>{const importedSeq=Number(row.序号),existingIndex=importedSeq?values.findIndex(item=>Number(item.seq)===importedSeq):-1;const payload=Object.fromEntries(fields.map(field=>[field.code,row[field.code]]));if(existingIndex>=0){const item=values[existingIndex];Object.assign(item,payload);addRowLog(item,'Excel 导入更新',`通过序号 ${item.seq} 更新数据`);updated++}else{const seq=nextSeq(),item={seq,...payload,status:'启用',logs:[]};addRowLog(item,'Excel 导入新增',row.序号?`导入序号 ${row.序号} 不存在，系统生成新序号 ${seq}`:`未提供序号，系统生成新序号 ${seq}`);values.push(item);added++}});markUpdated(`Excel 批量导入：新增 ${added} 条，更新 ${updated} 条`);closeDrawers();renderValues();toast(`导入完成：新增 ${added} 条，更新 ${updated} 条`)}

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
$('#addFieldBtn').onclick=()=>openFieldEditor();$('#addValueBtn').onclick=()=>openValueEditor();$('#importValueBtn').onclick=()=>{resetImport();openDrawer('#importDrawer')};
$$('[data-close]').forEach(button=>button.onclick=closeDrawers);$('#mask').onclick=closeDrawers;

$('#saveBasicBtn').onclick=()=>{const c=configs[current],name=$('#editConfigName').value.trim();if(!name){toast('请填写配置名称');return}c.name=name;c.desc=$('#editConfigDesc').value.trim()||'暂无说明';c.refs=$('#editConfigRefs').value.trim()||'尚未调用';markUpdated('编辑配置基本信息');closeDrawers();toast('基本信息已保存')};
$('#saveConfigBtn').onclick=()=>{const name=$('#newConfigName').value.trim(),code=$('#newConfigCode').value.trim();if(!name||!/^[a-z][a-z0-9_]*$/.test(code)){toast('请填写名称和正确的配置编码');return}configData[code]={fields:[],values:[]};configs.push({name,code,system:'订单系统',fieldCount:0,desc:$('#newConfigDesc').value||'暂无说明',refs:'尚未调用',count:0,status:'启用',updatedAt:nowText(),updatedBy:'林晓'});current=configs.length-1;closeDrawers();renderConfigs();selectConfig(current);toast('配置项已创建，请继续定义字段')};
$$('[data-type]').forEach(button=>button.onclick=()=>{if(editingField<0)setFieldType(button.dataset.type)});
$('#requiredSwitch').onclick=()=>$('#requiredSwitch').classList.toggle('is-on');
$('#saveFieldBtn').onclick=()=>{const name=$('#newFieldName').value.trim(),code=$('#newFieldCode').value.trim();if(!name||!/^[a-z][a-z0-9_]*$/.test(code)){toast('请填写字段名称和正确的字段编码');return}if(editingField<0&&fields.some(f=>f.code===code)){toast('字段编码已存在');return}const next={name,code:editingField>=0?fields[editingField].code:code,type:editingField>=0?fields[editingField].type:fieldType,required:$('#requiredSwitch').classList.contains('is-on'),default:$('#newFieldDefault').value.trim()||'—',desc:$('#newFieldDesc').value.trim()||'—'};if(editingField>=0){fields[editingField]=next;markUpdated(`编辑字段“${name}”`)}else{fields.push(next);values.forEach(v=>v[code]='—');markUpdated(`新增字段“${name}”`)}closeDrawers();renderFields();renderValues();toast(editingField>=0?'字段修改已保存':'字段已新增，字段列表已更新')};
$('#saveValueBtn').onclick=()=>{const item=editingValue>=0?{...values[editingValue]}:{seq:nextSeq(),status:'启用',logs:[]};let ok=true;$$('[data-value-code]').forEach(input=>{if(!input.value.trim())ok=false;item[input.dataset.valueCode]=input.value.trim()});if(!ok){toast('请填写所有必填字段');return}addRowLog(item,editingValue>=0?'编辑数据':'新增数据',editingValue>=0?`更新序号 ${item.seq} 的配置数据`:`系统生成序号 ${item.seq}`);if(editingValue>=0)values[editingValue]=item;else values.push(item);markUpdated(editingValue>=0?'编辑配置数据':'新增配置数据');closeDrawers();renderValues();toast(editingValue>=0?'配置数据已更新':'配置数据已保存')};
$('#saveImportBtn').onclick=importValues;
$('#downloadTemplateBtn').onclick=downloadTemplate;$('#excelFile').onchange=event=>validateExcelFile(event.target.files[0]);$('.c-upload').ondragover=event=>{event.preventDefault();$('.c-upload').classList.add('is-dragover')};$('.c-upload').ondragleave=()=>$('.c-upload').classList.remove('is-dragover');$('.c-upload').ondrop=event=>{event.preventDefault();$('.c-upload').classList.remove('is-dragover');validateExcelFile(event.dataTransfer.files[0])};

$('#impactCheck').onchange=()=>$('#confirmDisable').disabled=!$('#impactCheck').checked;
$('#confirmDisable').onclick=()=>{if(pendingToggleConfig<0)return;current=pendingToggleConfig;configs[current].status='停用';markUpdated('禁用配置项');closeModal();toast('配置项已禁用')};
$$('[data-close-modal]').forEach(button=>button.onclick=closeModal);$('#modalMask').onclick=closeModal;

const anns=[
  {id:1,type:'页面',title:'公共配置入口',text:'面向企业管理员集中维护跨业务系统的通用配置；入口为系统设置 / 公共配置。'},
  {id:2,type:'交互',title:'配置项列表',text:'支持名称、编码和所属系统筛选。操作栏提供进入配置及启用/禁用；禁用需确认影响。最后更新精确到秒并展示更新人。'},
  {id:3,type:'交互',title:'配置基本信息',text:'点击“编辑基本信息”打开抽屉；名称、说明及调用模块可编辑，编码和所属系统只读；保存后回显并记录更新时间与更新人。'},
  {id:4,type:'字段',title:'配置摘要',text:'展示配置说明、调用模块及“年月日时分秒 · 更新人”的最后更新时间。'},
  {id:5,type:'字段',title:'配置数据序号',text:'列表首列为系统自增序号，不再提供排序字段。新增数据由系统生成下一个序号，编辑时序号只读。'},
  {id:6,type:'交互',title:'字段定义编辑',text:'点击字段“编辑”打开抽屉并回填数据；已发布字段的编码和数据类型锁定，名称、默认值、说明和必填状态可修改。'},
  {id:7,type:'交互',title:'原型标注模式',text:'关闭后编号点与抽屉同时隐藏，页面状态和业务交互保持不变。'},
  {id:8,type:'规则',title:'启停生效规则',text:'启用后配置可被业务读取；禁用前必须确认调用影响，禁用后数据保留但不再对下游生效。',target:'detailUpdated'},
  {id:9,type:'交互',title:'Excel 批量导入',text:'先下载 Excel 模板，再上传 .xlsx/.xls 文件。校验后预览新增、更新和错误数量；序号为空或不存在时新增，序号存在时更新。',target:'importValueBtn'},
  {id:10,type:'交互',title:'行级日志',text:'每行操作栏提供“日志”；日志按类型、内容、修改人、修改时间展示，每页 5 条，可通过页码、上一页和下一页翻页。',target:'rowLogDrawer'}
];
const colors={页面:'#1677ff',字段:'#722ed1',交互:'#13a8a8',规则:'#fa8c16',待确认:'#eb2f96'};let annFilter='全部';
function target(annotation){return annotation.target?$('#'+annotation.target):$(`[data-annotation="${annotation.id}"]`)}
function renderAnnotations(){const types=['全部','页面','字段','交互','规则','待确认'];$('#annotationTotal').textContent=anns.length;$('#annotationFilters').innerHTML=types.map(type=>`<button class="c-annotation-filter ${annFilter===type?'is-selected':''}" data-ann-filter="${type}">${type} ${type==='全部'?anns.length:anns.filter(a=>a.type===type).length}</button>`).join('');$('#annotationList').innerHTML=anns.filter(a=>annFilter==='全部'||a.type===annFilter).map(a=>`<article class="c-annotation-item" data-ann="${a.id}" style="--ann-color:${colors[a.type]}"><div class="c-annotation-item__head"><span class="c-annotation-num">${a.id}</span><b>${a.title}</b><span class="c-annotation-type">${a.type}</span></div><p>${a.text}</p></article>`).join('');$$('[data-ann-filter]').forEach(button=>button.onclick=()=>{annFilter=button.dataset.annFilter;renderAnnotations()});$$('[data-ann]').forEach(item=>item.onclick=()=>focusAnn(+item.dataset.ann));positionAnnotations()}
function positionAnnotations(){$$('.c-annotation-dot').forEach(dot=>dot.remove());if(document.body.classList.contains('annotations-off'))return;anns.forEach(annotation=>{const element=target(annotation);if(!element||!element.offsetParent)return;const rect=element.getBoundingClientRect(),dot=document.createElement('button');dot.className='c-annotation-dot';dot.textContent=annotation.id;dot.style.cssText=`--ann-color:${colors[annotation.type]};left:${rect.left+6}px;top:${rect.top+6}px`;dot.onclick=()=>focusAnn(annotation.id);document.body.appendChild(dot)})}
function focusAnn(id){const annotation=anns.find(item=>item.id===id),element=target(annotation);element?.scrollIntoView({behavior:'smooth',block:'center'});element?.classList.add('is-highlighted');setTimeout(()=>element?.classList.remove('is-highlighted'),1500);$(`[data-ann="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'})}
function toggleAnnotations(){const off=document.body.classList.toggle('annotations-off');$('#annotationToggle').textContent=off?'开启标注':'关闭标注';positionAnnotations()}
$('#closeAnnotations').onclick=toggleAnnotations;$('#annotationToggle').onclick=toggleAnnotations;window.addEventListener('resize',positionAnnotations);renderAnnotations();setTimeout(positionAnnotations,50);
