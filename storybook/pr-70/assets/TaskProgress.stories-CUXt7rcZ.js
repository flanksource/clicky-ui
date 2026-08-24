import{T as b}from"./TaskProgress-VYyH3abr.js";import"./iframe-1nhP4pBA.js";import"./preload-helper-C9Uksf5K.js";import"./button--4D2VPD7.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Ch-5BGAb.js";import"./AnsiHtml-USo677TG.js";import"./Icon-B2d9yic_.js";import"./ProgressBar-ChejSowJ.js";import"./TimeseriesGauge-D_LyK8hS.js";import"./useQueries-B31qkQu4.js";import"./suspense-DBlaIW4n.js";import"./format-2niohfpq.js";import"./Modal-BEBsG6op.js";import"./index-BSiZIXYH.js";import"./index-XDodYxLy.js";import"./modalStack-DxHx75M7.js";import"./zIndex-BGbNBNA8.js";import"./TimeseriesPanel-BLlsLjPW.js";import"./index-C8PtwUle.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-kaT690SH.js";import"./HoverCard-BTWh615-.js";import"./gauge-stats-BzAlBUFF.js";import"./DiagnosticsTree-Co63GyvS.js";import"./Tree-DkTEIP7m.js";import"./TreeNode-DG0we7Jz.js";import"./JsonView-CAfD8K_m.js";const{expect:c,fn:u,userEvent:R,within:_}=__STORYBOOK_MODULE_TEST__,rn={title:"Charts/TaskProgress",component:b,argTypes:{title:{control:"text"},compact:{control:"boolean"},snapshots:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source."}}}};function m(a,t){const i=t.filter(n=>["success","PASS"].includes(n.status??"")).length,x=t.filter(n=>["failed","FAIL","ERR"].includes(n.status??"")).length,A=t.filter(n=>n.status==="running").length;return[{id:"fix-run",name:"Apply selected fixes",type:"group",status:a,groupId:"g1",kind:"sql-fix",total:t.length,completed:i,failed:x,running:A},...t.map((n,p)=>({id:`t${p}`,name:n.name??`task ${p}`,type:"task",groupId:"g1",status:n.status??"pending",...n}))]}const o={args:{snapshots:m("running",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"REORGANIZE idx_client",status:"running"},{name:"UPDATE STATISTICS dbo.AsPolicy",status:"pending"}])}},s={args:{snapshots:m("failed",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"failed",error:"Lock request timeout",logs:[{level:"error",message:"Lock request time out period exceeded."}]}])}},e={args:{snapshots:m("success",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"success",duration:"0.4s"}]),title:"Defrag fixes"}},r={args:{snapshots:[{id:"commit-project",name:"Commit gavel",type:"group",status:"running",groupId:"commit-1",kind:"gavel-commit",total:2,running:1,controls:["stop"]},{id:"commit-one",name:"Commit one.go",description:"one.go",type:"task",groupId:"commit-1",status:"running",controls:["stop"]},{id:"commit-two",name:"Commit two.go",description:"two.go",type:"task",groupId:"commit-1",status:"pending",controls:["stop"]}],onControl:u(),onTaskControl:u()},play:async({canvasElement:a,args:t})=>{const i=_(a);await R.click(i.getByRole("button",{name:"Stop Commit one.go"})),await c(t.onTaskControl).toHaveBeenCalledWith("stop",c.objectContaining({id:"commit-one"}),c.objectContaining({id:"commit-project"}))}};var l,d,g;o.parameters={...o.parameters,docs:{...(l=o.parameters)==null?void 0:l.docs,source:{originalSource:`{
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
}`,...(g=(d=o.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};var C,T,S;s.parameters={...s.parameters,docs:{...(C=s.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(S=(T=s.parameters)==null?void 0:T.docs)==null?void 0:S.source}}};var I,h,y;e.parameters={...e.parameters,docs:{...(I=e.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(y=(h=e.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var E,f,k;r.parameters={...r.parameters,docs:{...(E=r.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    snapshots: [{
      id: "commit-project",
      name: "Commit gavel",
      type: "group",
      status: "running",
      groupId: "commit-1",
      kind: "gavel-commit",
      total: 2,
      running: 1,
      controls: ["stop"]
    }, {
      id: "commit-one",
      name: "Commit one.go",
      description: "one.go",
      type: "task",
      groupId: "commit-1",
      status: "running",
      controls: ["stop"]
    }, {
      id: "commit-two",
      name: "Commit two.go",
      description: "two.go",
      type: "task",
      groupId: "commit-1",
      status: "pending",
      controls: ["stop"]
    }],
    onControl: fn(),
    onTaskControl: fn()
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Stop Commit one.go"
    }));
    await expect(args.onTaskControl).toHaveBeenCalledWith("stop", expect.objectContaining({
      id: "commit-one"
    }), expect.objectContaining({
      id: "commit-project"
    }));
  }
}`,...(k=(f=r.parameters)==null?void 0:f.docs)==null?void 0:k.source}}};const an=["Running","WithFailure","Complete","ControllableChildren"];export{e as Complete,r as ControllableChildren,o as Running,s as WithFailure,an as __namedExportsOrder,rn as default};
