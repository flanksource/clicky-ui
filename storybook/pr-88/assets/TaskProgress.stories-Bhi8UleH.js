import{T as _}from"./TaskProgress-fxqoHJSO.js";import"./iframe-DjmnUs_s.js";import"./preload-helper-BlVIKJwt.js";import"./button-DfMIapuu.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-jlJ4TQvy.js";import"./CopyButton-DORRiO3j.js";import"./IconButton-CPXwZoyZ.js";import"./Icon-CWJyCkxy.js";import"./clipboard-B_0f2RyG.js";import"./SplitButton--LNiGh3w.js";import"./DropdownMenu-BzgZIIYx.js";import"./floating-ui.react-DWJ6pxmL.js";import"./index-DsmV4W2z.js";import"./index-CouXz6mu.js";import"./DropdownMenuSubmenu-CYFI-0pu.js";import"./modalStack-Bqy7OkQU.js";import"./zIndex-BGbNBNA8.js";import"./ProgressBar-3WabhYda.js";import"./TimeseriesGauge-DbjJcIA4.js";import"./format-2niohfpq.js";import"./Modal-DJ5NvytA.js";import"./TimeseriesPanel-Cp9RL3RL.js";import"./timeseries-query-_jVFbW6V.js";import"./suspense-Dj5pR5v4.js";import"./index-BF8c1I0o.js";import"./index-DnL3XN75.js";import"./GaugeHoverCard-DfTHKnS1.js";import"./HoverCard-dWtrhYr9.js";import"./gauge-stats-BzAlBUFF.js";import"./DiagnosticsTree-Ctg4sLHL.js";import"./Tree-fCJ2E4k3.js";import"./TreeNode-DyyyypDE.js";import"./use-resource-clock-kH5a83HR.js";import"./shell-command-K5vcnqpg.js";import"./JsonView-0809oQhO.js";import"./collections-CoHfwOze.js";import"./AnsiHtml-DdvIE50x.js";import"./string-Ye519DiV.js";const{expect:o,fn:d,userEvent:U,within:O}=__STORYBOOK_MODULE_TEST__,St={title:"Charts/TaskProgress",component:_,argTypes:{title:{control:"text"},compact:{control:"boolean"},snapshots:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:"Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source."}}}};function u(s,t){const e=t.filter(n=>["success","PASS"].includes(n.status??"")).length,D=t.filter(n=>["failed","FAIL","ERR"].includes(n.status??"")).length,L=t.filter(n=>n.status==="running").length;return[{id:"fix-run",name:"Apply selected fixes",type:"group",status:s,groupId:"g1",kind:"sql-fix",total:t.length,completed:e,failed:D,running:L},...t.map((n,l)=>({id:`t${l}`,name:n.name??`task ${l}`,type:"task",groupId:"g1",status:n.status??"pending",...n}))]}const r={args:{snapshots:u("running",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"REORGANIZE idx_client",status:"running"},{name:"UPDATE STATISTICS dbo.AsPolicy",status:"pending"}])}},a={args:{snapshots:u("failed",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"failed",error:"Lock request timeout",logs:[{level:"error",message:"Lock request time out period exceeded."}]}])}},i={args:{snapshots:u("failed",[{name:"Measure dev",status:"success",duration:"527ms"},{name:"Export from dev",status:"failed",duration:"15.298s",error:"export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",logs:[{level:"error",message:"export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled"}]},{name:"Verify dev",status:"canceled",duration:"15.899s",error:"dependency failed"}])},play:async({canvasElement:s})=>{const t=O(s),e=d();Object.defineProperty(navigator,"clipboard",{value:{writeText:e},configurable:!0}),await U.click(t.getByRole("button",{name:"Copy"})),await o(e).toHaveBeenCalledWith(o.stringContaining("export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled")),await o(t.getByRole("button",{name:"Copied"})).toBeInTheDocument()}},c={args:{snapshots:[{id:"commit-run",name:"Commit gavel",type:"group",status:"failed",groupId:"commit-1",kind:"gavel-commit",total:1,failed:1,controls:["retry"]},{id:"commit-task",name:"Create commit",type:"task",groupId:"commit-1",status:"failed",error:"exit status 1",stderr:`error: nothing added to commit but untracked files present
`,details:{command:"git",args:["commit","-m","fix bug","src/report generator.ts"],cwd:"/repo path",status:"exited",exitCode:1}}],onControl:d()}},m={args:{snapshots:u("success",[{name:"REBUILD idx_policy",status:"success",duration:"2.1s"},{name:"UPDATE STATISTICS dbo.AsClient",status:"success",duration:"0.4s"}]),title:"Defrag fixes"}},p={args:{snapshots:[{id:"commit-project",name:"Commit gavel",type:"group",status:"running",groupId:"commit-1",kind:"gavel-commit",total:2,running:1,controls:["stop"]},{id:"commit-one",name:"Commit one.go",description:"one.go",type:"task",groupId:"commit-1",status:"running",controls:["stop"]},{id:"commit-two",name:"Commit two.go",description:"two.go",type:"task",groupId:"commit-1",status:"pending",controls:["stop"]}],onControl:d(),onTaskControl:d()},play:async({canvasElement:s,args:t})=>{const e=O(s);await U.click(e.getByRole("button",{name:"Stop Commit one.go"})),await o(t.onTaskControl).toHaveBeenCalledWith("stop",o.objectContaining({id:"commit-one"}),o.objectContaining({id:"commit-project"}))}};var g,T,C;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(C=(T=r.parameters)==null?void 0:T.docs)==null?void 0:C.source}}};var x,y,f;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(f=(y=a.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var h,A,I;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(I=(A=i.parameters)==null?void 0:A.docs)==null?void 0:I.source}}};var v,S,b;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    snapshots: [{
      id: "commit-run",
      name: "Commit gavel",
      type: "group",
      status: "failed",
      groupId: "commit-1",
      kind: "gavel-commit",
      total: 1,
      failed: 1,
      controls: ["retry"]
    }, {
      id: "commit-task",
      name: "Create commit",
      type: "task",
      groupId: "commit-1",
      status: "failed",
      error: "exit status 1",
      stderr: "error: nothing added to commit but untracked files present\\n",
      details: {
        command: "git",
        args: ["commit", "-m", "fix bug", "src/report generator.ts"],
        cwd: "/repo path",
        status: "exited",
        exitCode: 1
      }
    }],
    onControl: fn()
  }
}`,...(b=(S=c.parameters)==null?void 0:S.docs)==null?void 0:b.source}}};var E,k,w;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(w=(k=m.parameters)==null?void 0:k.docs)==null?void 0:w.source}}};var R,B,P;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(P=(B=p.parameters)==null?void 0:B.docs)==null?void 0:P.source}}};const bt=["Running","WithFailure","CopyRunDetails","FailedWithRetry","Complete","ControllableChildren"];export{m as Complete,p as ControllableChildren,i as CopyRunDetails,c as FailedWithRetry,r as Running,a as WithFailure,bt as __namedExportsOrder,St as default};
