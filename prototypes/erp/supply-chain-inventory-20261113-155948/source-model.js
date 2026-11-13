
/* Local illustrative source records. These are not live ERP data or production SLA settings. */
const reportSnapshot = { at: '2026-05-19T14:00:00+08:00' };
const timingExamples = {
  'US-LA': {request:24,purchase:24,lead:168,warehouse:48,transit:240},
  'DE-HH': {request:24,purchase:24,lead:168,warehouse:48,transit:288},
  'US-NJ': {request:24,purchase:24,lead:120,warehouse:48,transit:240},
  'UK-BH': {request:24,purchase:24,lead:120,warehouse:48,transit:264}
};
function arrivalTime(at, hours) {
  if (!at || !Number.isFinite(hours)) return '—';
  const ms = Date.parse(at); if (!Number.isFinite(ms)) return '—';
  return new Date(ms + hours * 3600000 + 8 * 3600000).toISOString().slice(0,16).replace('T',' ');
}
const sourceExamples = [
 {request:[12,12],purchased:[180,360,180],shelved:[138,276,138],waiting:[26,48,24],unshipped:[12,24,12],shipped:78,received:20,stock:96,promised:'2026-05-28T14:00:00+08:00',last:'2026-05-18T14:00:00+08:00',arrival:'2026-06-02 14:00'},
 {request:[12,48],purchased:[260,248,500],shelved:[140,128,260],waiting:[12,18,26],unshipped:[6,6,12],shipped:62,received:20,stock:31,promised:'2026-05-29T14:00:00+08:00',last:'2026-05-16T14:00:00+08:00',arrival:'2026-06-03 14:00'},
 {request:[],purchased:[96],shelved:[84],waiting:[54],unshipped:[20],shipped:20,received:20,stock:44,promised:'2026-05-26T14:00:00+08:00',last:'2026-05-18T08:00:00+08:00',arrival:'2026-06-01 14:00'},
 {request:[],purchased:[80,80],shelved:[80,80],waiting:[0,0],unshipped:[0,0],shipped:34,received:20,stock:186,promised:'2026-05-27T14:00:00+08:00',last:'2026-05-17T14:00:00+08:00',arrival:'2026-06-04 14:00'}
];
const sourceRecords = {requests:[],purchases:[],waiting:[],dispatches:[],transfers:[],stocks:[]};
rows.forEach((row,i) => {
 delete row.site;
 const e=sourceExamples[i], n=String(i+1).padStart(3,'0');
 const req='RQ-20260518-'+n,po='PO-20260518-'+n;
 e.request.forEach((qty,j)=>sourceRecords.requests.push({id:req+'-'+(j+1),doc:req,line:j+1,product:row.sku,wh:row.wh,qty,status:'待审核',module:j===1?'海外仓发货计划':'申购单'}));
 row.kit.forEach((item,j)=>{
  const common={product:row.sku,child:item[0],ratio:item[1],wh:row.wh,request:req,purchase:po,line:j+1};
  sourceRecords.purchases.push({...common,id:po+'-'+(j+1),qty:e.purchased[j],shelved:e.shelved[j],status:e.purchased[j]===e.shelved[j]?'已完结':'未完结',promised:e.promised});
  if(e.waiting[j]>0)sourceRecords.waiting.push({...common,id:'WAIT-'+n+'-'+j,sourceLine:po+'-LOT-'+j,qty:e.waiting[j],warehouse:'CN-SZ-Transit',last:e.last});
  if(e.unshipped[j]>0)sourceRecords.dispatches.push({...common,id:'SO-20260519-'+n,sourceLine:po+'-PLAN-'+j,qty:e.unshipped[j],warehouse:'CN-SZ-Transit',last:e.last,status:'未出库',plan:'SP-20260519-'+n});
 });
 sourceRecords.transfers.push({id:'TR-20260514-'+n,dispatch:'SO-20260513-'+n,product:row.sku,wh:row.wh,shipped:e.shipped,received:e.received,status:e.shipped===e.received?'已收货':'在途',arrival:e.arrival});
 sourceRecords.stocks.push({id:'WS-20260519-'+n,product:row.sku,wh:row.wh,qty:e.stock,at:reportSnapshot.at});
});
function recordsFor(key,row){return sourceRecords[key].filter(x=>x.product===row.sku&&x.wh===row.wh);}
function kitQuantity(row,records,getQty){return Math.min(...row.kit.map(([child,ratio])=>Math.floor(records.filter(x=>x.child===child).reduce((sum,x)=>sum+getQty(x),0)/ratio)));}
function computeQuantities(row){
 row.request=recordsFor('requests',row).filter(x=>x.status==='待审核').reduce((sum,x)=>sum+x.qty,0);
 row.purchaseTransit=kitQuantity(row,recordsFor('purchases',row).filter(x=>x.status==='未完结'),x=>x.qty-x.shelved);
 row.transferStock=kitQuantity(row,[...recordsFor('waiting',row),...recordsFor('dispatches',row).filter(x=>x.status==='未出库')],x=>x.qty);
 row.overseasTransit=recordsFor('transfers',row).filter(x=>x.status==='在途').reduce((sum,x)=>sum+x.shipped-x.received,0);
 row.overseasStock=recordsFor('stocks',row).reduce((sum,x)=>sum+x.qty,0);
}
rows.forEach(computeQuantities);
const warehouseTrace='按最终收货仓库归属。采购单回溯申购单收货仓库；中转数据关联采购单及申购单，追溯最终收货仓库。不能用当前存放的中转仓替代最终收货仓库。';
const kitRule='申购按申请产品组数量或单 SKU 件数。采购与中转示例沿用按子件配比取最小齐套数；BOM版本、共用子件分配及跨批齐套范围待确认。单 SKU 配比为1。';
Object.assign(metricConfig.request,{
 rule:'取申购单待审核状态的申购数量；海外仓发货计划模块的待申购数量归属该计划收货仓库。两类来源的记录映射和去重键待确认。',
 warehouseRule:'普通申购单取收货仓库；海外仓发货计划取计划收货仓库。',
 etaRule:'当前时间 + 申购处理时间 + 采购处理时效 + 采购交期 + 仓库作业时间 + 在途时效。当前时间在同一统计批次内取统一计算时点。',unitRule:kitRule,
 headers:['申购单号','行号','来源模块','申购对象','收货仓库','待审核数量','单位','状态','预计到货时间'],
 makeDocs:row=>recordsFor('requests',row).filter(x=>x.status==='待审核').map(x=>{const t=timingExamples[row.wh];return [x.doc,x.line,x.module,x.product,x.wh,x.qty,row.kit.length>1?'组':'件',x.status,arrivalTime(reportSnapshot.at,t.request+t.purchase+t.lead+t.warehouse+t.transit)];})
});
Object.assign(metricConfig.purchaseTransit,{
 rule:'取未完结采购单，采购在途数量 = 采购数量 − 已上架数量。仅收货未上架不扣减采购在途。按采购行回溯关联申购单的收货仓库。',warehouseRule:warehouseTrace,
 etaRule:'采购预计交期 + 仓库处理时效 + 在途时效。采购预计交期为日期时间；不是从当前时间重新累加采购交期时长。',unitRule:kitRule,
 headers:['采购单号','行号','关联申购单','产品组 / 采购子 SKU','单组用量','收货仓库','采购数量（件）','已上架数量（件）','采购在途（件）','采购预计交期','预计到货时间'],
 makeDocs:row=>recordsFor('purchases',row).filter(x=>x.status==='未完结'&&x.qty-x.shelved>0).map(x=>{const t=timingExamples[row.wh];return [x.purchase,x.line,x.request,x.product+' / '+x.child,x.ratio,x.wh,x.qty,x.shelved,x.qty-x.shelved,arrivalTime(x.promised,0),arrivalTime(x.promised,t.warehouse+t.transit)];})
});
Object.assign(metricConfig.transferStock,{
 rule:'合并待发货列表与已发起发货计划但尚未出库的发货单剩余数量；关联采购单和申购单，归属最终收货仓库。同一实物数量不得在两类来源中重复统计。',warehouseRule:warehouseTrace,
 etaRule:'当前时间 + [仓库作业时间 − (当前时间 − 最后上架时间)] + 在途时效，等价于最后上架时间 + 仓库作业时间 + 在途时效。保留原公式；作业超期是否截断剩余时间为0待确认。',unitRule:kitRule,wideTable:true,
 headers:['来源类型','来源单号','来源行标识','关联采购单','关联申购单','产品组 / 子 SKU','单组用量','当前中转仓','最终收货仓库','未出库数量（件）','最后上架时间','剩余作业时长（小时）','预计到货时间'],
 makeDocs:row=>[...recordsFor('waiting',row).map(x=>({...x,type:'待发货列表',doc:x.id})),...recordsFor('dispatches',row).filter(x=>x.status==='未出库').map(x=>({...x,type:'发货计划未出库',doc:x.id}))].map(x=>{const t=timingExamples[row.wh],remaining=t.warehouse-(Date.parse(reportSnapshot.at)-Date.parse(x.last))/3600000;return [x.type,x.doc,x.sourceLine,x.purchase,x.request,x.product+' / '+x.child,x.ratio,x.warehouse,x.wh,x.qty,arrivalTime(x.last,0),remaining,arrivalTime(x.last,t.warehouse+t.transit)];})
});
Object.assign(metricConfig.overseasTransit,{
 rule:'取调拨在途模块的在途单据；示例以已出库调拨数量减已收货数量表示在途余量。取消、短收、超收和丢损的正式余量口径待确认。',warehouseRule:'取调拨在途单据的目的仓库。',
 etaRule:'直接取调拨在途模块的预计到仓时间。在途时效由调拨在途模块计算，本报表不重复叠加。',unitRule:'按调拨来源的产品组数量或单 SKU 数量展示；来源单位与产品组映射需一致。',
 headers:['调拨在途单号','来源发货单','产品组 / SKU','目的仓库','已出库数量','已收货数量','在途余量','状态','预计到仓时间'],
 makeDocs:row=>recordsFor('transfers',row).filter(x=>x.status==='在途').map(x=>[x.id,x.dispatch,x.product,x.wh,x.shipped,x.received,x.shipped-x.received,x.status,x.arrival])
});
Object.assign(metricConfig.overseasStock,{
 title:'海外仓在库',docsTitle:'海外仓在库明细',
 rule:'同步海外仓在库数据，按来源仓库与产品组/SKU归集。库存总量、可售、预占和不可售的字段映射待确认，不将“在库”直接等同于“可售”。',warehouseRule:'取海外仓库存同步记录对应的仓库。',
 etaRule:'已在库，不再计算预计到货时间。同步时间保留在来源记录中。',unitRule:'采用仓库同步单位；产品组与子 SKU 的映射和换算规则待确认。',
 headers:['库存同步记录','产品组 / SKU','仓库','同步在库数量','统计时间'],
 makeDocs:row=>recordsFor('stocks',row).map(x=>[x.id,x.product,x.wh,x.qty,arrivalTime(x.at,0)])
});
metricLabels.overseasStock='海外仓在库';

metricKeys.forEach(key=>{metricConfig[key].title=metricLabels[key];metricConfig[key].docsTitle=metricLabels[key]+"明细";});
