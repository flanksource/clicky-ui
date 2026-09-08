import{T as U}from"./TaskProgress-DhQR64Dr.js";import"./iframe-D7AEzmiZ.js";import"./preload-helper-hq9vNfsk.js";import"./button-qcdX8b7r.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Cul39Clz.js";import"./CopyButton-BZlr1C1g.js";import"./IconButton-CETqdsAT.js";import"./Icon-BHlfVGs3.js";import"./clipboard-DckDwBhc.js";import"./SplitButton-DOOv7cwA.js";import"./DropdownMenu-Bs5Osu-C.js";import"./floating-ui.react-r1UfLjHW.js";import"./index-DOqUsOzE.js";import"./index-ChecR3Pf.js";import"./DropdownMenuSubmenu-znATrmj7.js";import"./modalStack-BBzzK_XK.js";import"./zIndex-BGbNBNA8.js";import"./AnsiHtml-IdGWOqof.js";import"./ProgressBar-CfjOG6HF.js";import"./TimeseriesGauge-DYlr2SRX.js";import"./useQueries-CsmyJZx4.js";import"./suspense-TEhGRCRW.js";import"./format-2niohfpq.js";import"./Modal-D4dCfCM0.js";import"./TimeseriesPanel-CnKiCwwY.js";import"./index-CY6NJdRW.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-BOoZS9J7.js";import"./HoverCard-D6mUI4fG.js";import"./gauge-stats-BzAlBUFF.js";import"./DiagnosticsTree-Bnv4FzEZ.js";import"./Tree-B-7Aw9OS.js";import"./TreeNode-CSZW85Dj.js";import"./JsonView-DUzBdQDr.js";const{expect:o,fn:u,userEvent:R,within:k}=__STORYBOOK_MODULE_TEST__,An={title:"Charts/TaskProgress",component:U,argTypes:{title:{control:"text"},compact:{control:"boolean"},snapshots:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source."}}}};function p(s,n){const e=n.filter(t=>["success","PASS"].includes(t.status??"")).length,B=n.filter(t=>["failed","FAIL","ERR"].includes(t.status??"")).length,P=n.filter(t=>t.status==="running").length;return[{id:"fix-run",name:"Apply selected fixes",type:"group",status:s,groupId:"g1",kind:"sql-fix",total:n.length,completed:e,failed:B,running:P},...n.map((t,l)=>({id:`t${l}`,name:t.name??`task ${l}`,type:"task",groupId:"g1",status:t.status??"pending",...t}))]}const a={args:{snapshots:p("running",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"REORGANIZE idx_client",status:"running"},{name:"UPDATE STATISTICS dbo.AsPolicy",status:"pending"}])}},r={args:{snapshots:p("failed",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"failed",error:"Lock request timeout",logs:[{level:"error",message:"Lock request time out period exceeded."}]}])}},i={args:{snapshots:p("failed",[{name:"Measure dev",status:"success",duration:"527ms"},{name:"Export from dev",status:"failed",duration:"15.298s",error:"export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",logs:[{level:"error",message:"export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled"}]},{name:"Verify dev",status:"canceled",duration:"15.899s",error:"dependency failed"}])},play:async({canvasElement:s})=>{const n=k(s),e=u();Object.defineProperty(navigator,"clipboard",{value:{writeText:e},configurable:!0}),await R.click(n.getByRole("button",{name:"Copy"})),await o(e).toHaveBeenCalledWith(o.stringContaining("export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled")),await o(n.getByRole("button",{name:"Copied"})).toBeInTheDocument()}},c={args:{snapshots:p("success",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"success",duration:"0.4s"}]),title:"Defrag fixes"}},m={args:{snapshots:[{id:"commit-project",name:"Commit gavel",type:"group",status:"running",groupId:"commit-1",kind:"gavel-commit",total:2,running:1,controls:["stop"]},{id:"commit-one",name:"Commit one.go",description:"one.go",type:"task",groupId:"commit-1",status:"running",controls:["stop"]},{id:"commit-two",name:"Commit two.go",description:"two.go",type:"task",groupId:"commit-1",status:"pending",controls:["stop"]}],onControl:u(),onTaskControl:u()},play:async({canvasElement:s,args:n})=>{const e=k(s);await R.click(e.getByRole("button",{name:"Stop Commit one.go"})),await o(n.onTaskControl).toHaveBeenCalledWith("stop",o.objectContaining({id:"commit-one"}),o.objectContaining({id:"commit-project"}))}};var d,g,T;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(T=(g=a.parameters)==null?void 0:g.docs)==null?void 0:T.source}}};var C,A,x;r.parameters={...r.parameters,docs:{...(C=r.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(x=(A=r.parameters)==null?void 0:A.docs)==null?void 0:x.source}}};var y,I,f;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    snapshots: run("failed", [{
      name: "Measure dev",
      status: "success",
      duration: "527ms"
    }, {
      name: "Export from dev",
      status: "failed",
      duration: "15.298s",
      error: "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",
      logs: [{
        level: "error",
        message: "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled"
      }]
    }, {
      name: "Verify dev",
      status: "canceled",
      duration: "15.899s",
      error: "dependency failed"
    }])
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // Real chromium denies writeText without the clipboard-write permission,
    // so stub it and assert the affordance rather than the OS clipboard.
    const writeText = fn();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText
      },
      configurable: true
    });
    await userEvent.click(canvas.getByRole("button", {
      name: "Copy"
    }));
    await expect(writeText).toHaveBeenCalledWith(expect.stringContaining("export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled"));
    await expect(canvas.getByRole("button", {
      name: "Copied"
    })).toBeInTheDocument();
  }
}`,...(f=(I=i.parameters)==null?void 0:I.docs)==null?void 0:f.source}}};var h,S,v;c.parameters={...c.parameters,docs:{...(h=c.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(v=(S=c.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};var E,b,w;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(w=(b=m.parameters)==null?void 0:b.docs)==null?void 0:w.source}}};const xn=["Running","WithFailure","CopyRunDetails","Complete","ControllableChildren"];export{c as Complete,m as ControllableChildren,i as CopyRunDetails,a as Running,r as WithFailure,xn as __namedExportsOrder,An as default};
