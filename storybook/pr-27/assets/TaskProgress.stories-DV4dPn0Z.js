import{T as E}from"./TaskProgress-u33SvBg8.js";import"./iframe-BpjD9CLN.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./ProgressBar-1PYxzFJ4.js";const U={title:"Data/TaskProgress",component:E,parameters:{docs:{description:{component:"Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source."}}}};function a(S,e){const A=e.filter(s=>["success","PASS"].includes(s.status??"")).length,I=e.filter(s=>["failed","FAIL","ERR"].includes(s.status??"")).length,f=e.filter(s=>s.status==="running").length;return[{id:"fix-run",name:"Apply selected fixes",type:"group",status:S,groupId:"g1",kind:"sql-fix",total:e.length,completed:A,failed:I,running:f},...e.map((s,o)=>({id:`t${o}`,name:s.name??`task ${o}`,type:"task",groupId:"g1",status:s.status??"pending",...s}))]}const n={args:{snapshots:a("running",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"REORGANIZE idx_client",status:"running"},{name:"UPDATE STATISTICS dbo.AsPolicy",status:"pending"}])}},t={args:{snapshots:a("failed",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"failed",error:"Lock request timeout",logs:[{level:"error",message:"Lock request time out period exceeded."}]}])}},r={args:{snapshots:a("success",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"success",duration:"0.4s"}]),title:"Defrag fixes"}};var i,u,c;n.parameters={...n.parameters,docs:{...(i=n.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(c=(u=n.parameters)==null?void 0:u.docs)==null?void 0:c.source}}};var d,p,l;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(l=(p=t.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var m,g,T;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(T=(g=r.parameters)==null?void 0:g.docs)==null?void 0:T.source}}};const k=["Running","WithFailure","Complete"];export{r as Complete,n as Running,t as WithFailure,k as __namedExportsOrder,U as default};
