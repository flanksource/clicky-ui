import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./TaskProgress-CJOLCg5P.js";function r(e,t){let n=t.filter(e=>[`success`,`PASS`].includes(e.status??``)).length,r=t.filter(e=>[`failed`,`FAIL`,`ERR`].includes(e.status??``)).length,i=t.filter(e=>e.status===`running`).length;return[{id:`fix-run`,name:`Apply selected fixes`,type:`group`,status:e,groupId:`g1`,kind:`sql-fix`,total:t.length,completed:n,failed:r,running:i},...t.map((e,t)=>({id:`t${t}`,name:e.name??`task ${t}`,type:`task`,groupId:`g1`,status:e.status??`pending`,...e}))]}var i,a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{t(),{expect:i,fn:a,userEvent:o,within:s}=__STORYBOOK_MODULE_TEST__,c={title:`Charts/TaskProgress`,component:n,argTypes:{title:{control:`text`},compact:{control:`boolean`},snapshots:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:`Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source.`}}}},l={args:{snapshots:r(`running`,[{name:`REBUILD idx_policy`,status:`success`,duration:`2.1s`},{name:`REORGANIZE idx_client`,status:`running`},{name:`UPDATE STATISTICS dbo.AsPolicy`,status:`pending`}])}},u={args:{snapshots:r(`running`,[{name:`Stage files`,status:`success`,duration:`0.4s`},{name:`Commit`,status:`running`,prompts:[{id:`p-lock`,kind:`select`,state:`pending`,title:`Stale git lock detected: .git/index.lock (age 12s, 0 bytes, no process has it open). Remove and retry?`,schema:{type:`object`,properties:{choice:{type:`string`,enum:[`0`,`1`],"x-enum-labels":{0:`Remove and retry`,1:`Cancel`}}},required:[`choice`]}}]}])}},d={args:{snapshots:r(`failed`,[{name:`REBUILD idx_policy`,status:`success`,duration:`2.1s`},{name:`UPDATE STATISTICS dbo.AsClient`,status:`failed`,error:`Lock request timeout`,logs:[{level:`error`,message:`Lock request time out period exceeded.`}]}])}},f={args:{snapshots:r(`failed`,[{name:`Measure dev`,status:`success`,duration:`527ms`},{name:`Export from dev`,status:`failed`,duration:`15.298s`,error:`export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled`,logs:[{level:`error`,message:`export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled`}]},{name:`Verify dev`,status:`canceled`,duration:`15.899s`,error:`dependency failed`}])},play:async({canvasElement:e})=>{let t=s(e),n=a();Object.defineProperty(navigator,"clipboard",{value:{writeText:n},configurable:!0}),await o.click(t.getByRole(`button`,{name:`Copy`})),await i(n).toHaveBeenCalledWith(i.stringContaining(`export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled`)),await i(t.getByRole(`button`,{name:`Copied`})).toBeInTheDocument()}},p={args:{snapshots:[{id:`commit-run`,name:`Commit gavel`,type:`group`,status:`failed`,groupId:`commit-1`,kind:`gavel-commit`,total:1,failed:1,controls:[`retry`]},{id:`commit-task`,name:`Create commit`,type:`task`,groupId:`commit-1`,status:`failed`,error:`exit status 1`,stderr:`error: nothing added to commit but untracked files present
`,details:{command:`git`,args:[`commit`,`-m`,`fix bug`,`src/report generator.ts`],cwd:`/repo path`,status:`exited`,exitCode:1}}],onControl:a()}},m={args:{snapshots:r(`success`,[{name:`REBUILD idx_policy`,status:`success`,duration:`2.1s`},{name:`UPDATE STATISTICS dbo.AsClient`,status:`success`,duration:`0.4s`}]),title:`Defrag fixes`}},h={args:{snapshots:[{id:`commit-project`,name:`Commit gavel`,type:`group`,status:`running`,groupId:`commit-1`,kind:`gavel-commit`,total:2,running:1,controls:[`stop`]},{id:`commit-one`,name:`Commit one.go`,description:`one.go`,type:`task`,groupId:`commit-1`,status:`running`,controls:[`stop`]},{id:`commit-two`,name:`Commit two.go`,description:`two.go`,type:`task`,groupId:`commit-1`,status:`pending`,controls:[`stop`]}],onControl:a(),onTaskControl:a()},play:async({canvasElement:e,args:t})=>{let n=s(e);await o.click(n.getByRole(`button`,{name:`Stop Commit one.go`})),await i(t.onTaskControl).toHaveBeenCalledWith(`stop`,i.objectContaining({id:`commit-one`}),i.objectContaining({id:`commit-project`}))}},g=[`Running`,`WaitingForAnswer`,`WithFailure`,`CopyRunDetails`,`FailedWithRetry`,`Complete`,`ControllableChildren`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    snapshots: run("running", [{
      name: "Stage files",
      status: "success",
      duration: "0.4s"
    }, {
      name: "Commit",
      status: "running",
      prompts: [{
        id: "p-lock",
        kind: "select",
        state: "pending",
        title: "Stale git lock detected: .git/index.lock (age 12s, 0 bytes, no process has it open). Remove and retry?",
        schema: {
          type: "object",
          properties: {
            choice: {
              type: "string",
              enum: ["0", "1"],
              "x-enum-labels": {
                "0": "Remove and retry",
                "1": "Cancel"
              }
            }
          },
          required: ["choice"]
        }
      }]
    }])
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}}})))()}_();export{m as Complete,h as ControllableChildren,f as CopyRunDetails,p as FailedWithRetry,l as Running,u as WaitingForAnswer,d as WithFailure,g as __namedExportsOrder,c as default};