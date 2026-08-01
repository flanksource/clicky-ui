import{T as x}from"./TaskProgress-Ddqku6F8.js";import"./iframe-DbCl_ZTc.js";import"./preload-helper-DArPGhL4.js";import"./button-BvGBn064.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-BASxxKF3.js";import"./AnsiHtml-CifZS7-k.js";import"./Icon-BLEFF23r.js";import"./ProgressBar-DqXjiHbW.js";import"./TimeseriesGauge-BJSBCZSI.js";import"./useQueries-CJXktgRZ.js";import"./suspense-D8TNy2Tz.js";import"./format-2niohfpq.js";import"./Modal-3wB0or_4.js";import"./index-urVF_qKJ.js";import"./index-Bq5CuWor.js";import"./modalStack-B2V66lx-.js";import"./zIndex-CigQ76av.js";import"./TimeseriesPanel-B5C5lh_Q.js";import"./index-DwSwCakL.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-xxyLFeRW.js";import"./HoverCard-BpHpCleG.js";import"./gauge-stats-BzAlBUFF.js";import"./DiagnosticsTree-DYviZEI8.js";import"./Tree-BRCvi3ph.js";import"./TreeNode-BvmJGGz3.js";const Q={title:"Charts/TaskProgress",component:x,argTypes:{title:{control:"text"},compact:{control:"boolean"},snapshots:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source."}}}};function o(S,e){const A=e.filter(s=>["success","PASS"].includes(s.status??"")).length,I=e.filter(s=>["failed","FAIL","ERR"].includes(s.status??"")).length,f=e.filter(s=>s.status==="running").length;return[{id:"fix-run",name:"Apply selected fixes",type:"group",status:S,groupId:"g1",kind:"sql-fix",total:e.length,completed:A,failed:I,running:f},...e.map((s,a)=>({id:`t${a}`,name:s.name??`task ${a}`,type:"task",groupId:"g1",status:s.status??"pending",...s}))]}const t={args:{snapshots:o("running",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"REORGANIZE idx_client",status:"running"},{name:"UPDATE STATISTICS dbo.AsPolicy",status:"pending"}])}},n={args:{snapshots:o("failed",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"failed",error:"Lock request timeout",logs:[{level:"error",message:"Lock request time out period exceeded."}]}])}},r={args:{snapshots:o("success",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"success",duration:"0.4s"}]),title:"Defrag fixes"}};var i,u,p;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    snapshots: run("running", [{
      name: "REBUILD idx_policy",
      status: "success",
      duration: "2.1s"
    }, {
      name: "REORGANIZE idx_client",
      status: "running"
    }, {
      name: "UPDATE STATISTICS dbo.AsPolicy",
      status: "pending"
    }])
  }
}`,...(p=(u=t.parameters)==null?void 0:u.docs)==null?void 0:p.source}}};var c,m,d;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    snapshots: run("failed", [{
      name: "REBUILD idx_policy",
      status: "success",
      duration: "2.1s"
    }, {
      name: "UPDATE STATISTICS dbo.AsClient",
      status: "failed",
      error: "Lock request timeout",
      logs: [{
        level: "error",
        message: "Lock request time out period exceeded."
      }]
    }])
  }
}`,...(d=(m=n.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var l,g,T;r.parameters={...r.parameters,docs:{...(l=r.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    snapshots: run("success", [{
      name: "REBUILD idx_policy",
      status: "success",
      duration: "2.1s"
    }, {
      name: "UPDATE STATISTICS dbo.AsClient",
      status: "success",
      duration: "0.4s"
    }]),
    title: "Defrag fixes"
  }
}`,...(T=(g=r.parameters)==null?void 0:g.docs)==null?void 0:T.source}}};const V=["Running","WithFailure","Complete"];export{r as Complete,t as Running,n as WithFailure,V as __namedExportsOrder,Q as default};
