import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{f as t,n,p as r,t as i}from"./TaskProgress-DeuOn91X.js";import{a,n as o,o as s,r as c,s as l,t as u}from"./TaskSession.story-support-hIRR8R7F.js";function d(e){return{startedAt:new Date(b).toISOString(),finishedAt:new Date(b+e).toISOString()}}function f(e,t,n){return{seq:e,level:t,message:n,time:new Date(b).toISOString()}}function p(e,t){let n=t.filter(e=>[`success`,`PASS`].includes(e.status??``)).length,r=t.filter(e=>[`failed`,`FAIL`,`ERR`].includes(e.status??``)).length,i=t.filter(e=>e.status===`running`).length;return[{id:`fix-run`,name:`Apply selected fixes`,type:`group`,status:e,groupId:`g1`,kind:`sql-fix`,total:t.length,completed:n,failed:r,running:i},...t.map((e,t)=>({id:`t${t}`,name:e.name??`task ${t}`,type:`task`,groupId:`g1`,status:e.status??`pending`,...e}))]}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j;function M(){return(M=e((()=>{n(),s(),r(),{expect:m,fn:h,userEvent:g,waitFor:_,within:v}=__STORYBOOK_MODULE_TEST__,y={title:`Charts/TaskProgress`,component:i,argTypes:{title:{control:`text`},compact:{control:`boolean`},snapshots:{table:{disable:!0}},className:{table:{disable:!0}}},parameters:{docs:{description:{component:`Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source.`}}}},b=Date.parse(`2026-10-15T07:00:00Z`),x={args:{snapshots:p(`running`,[{name:`REBUILD idx_policy`,status:`success`,...d(2100)},{name:`REORGANIZE idx_client`,status:`running`,startedAt:new Date(Date.now()-8e3).toISOString()},{name:`UPDATE STATISTICS dbo.AsPolicy`,status:`pending`}])}},S={args:{snapshots:[{id:`comparison`,groupId:`comparison`,type:`group`,name:`Compare DEV0BASE and acme/rules#main`,status:`running`},{id:`source`,groupId:`source`,parentGroupId:`comparison`,type:`group`,name:`[acme/rules] Read main`,status:`running`},{id:`refs`,groupId:`source`,type:`task`,name:`[acme/rules] Resolve main`,labels:{repository:`acme/rules`,ref:`main`},status:`success`,description:`Using cached result`},{id:`tree`,groupId:`source`,type:`task`,name:`[acme/rules] Read files @49ec96f75b56`,labels:{repository:`acme/rules`,operation:`cat-file`},status:`running`,description:`Reading objects`,progress:3,maxValue:5,progressMetrics:{unit:`files`,bytes:1048576,bytesPerSecond:524288}}]}},C={args:{snapshots:p(`running`,[{name:`Stage files`,status:`success`,...d(400)},{name:`Commit`,status:`running`,prompts:[{id:`p-lock`,kind:`select`,state:`pending`,title:`Stale git lock detected: .git/index.lock (age 12s, 0 bytes, no process has it open). Remove and retry?`,schema:{type:`object`,properties:{choice:{type:`string`,enum:[`0`,`1`],"x-enum-labels":{0:`Remove and retry`,1:`Cancel`}}},required:[`choice`]}}]}])}},w={args:{snapshots:p(`failed`,[{name:`REBUILD idx_policy`,status:`success`,...d(2100)},{name:`UPDATE STATISTICS dbo.AsClient`,status:`failed`,error:`Lock request timeout`,logs:[f(1,`error`,`Lock request time out period exceeded.`)]}])}},T={args:{snapshots:p(`failed`,[{name:`Measure dev`,status:`success`,...d(527)},{name:`Export from dev`,status:`failed`,...d(15298),error:`export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled`,logs:[f(1,`error`,`export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled`)]},{name:`Verify dev`,status:`canceled`,...d(15899),error:`dependency failed`}])},play:async({canvasElement:e})=>{let t=v(e),n=h();Object.defineProperty(navigator,"clipboard",{value:{writeText:n},configurable:!0}),await g.click(t.getByRole(`button`,{name:`Copy`})),await m(n).toHaveBeenCalledWith(m.stringContaining(`export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled`)),await m(t.getByRole(`button`,{name:`Copied`})).toBeInTheDocument()}},E={args:{snapshots:[{id:`commit-run`,name:`Commit gavel`,type:`group`,status:`failed`,groupId:`commit-1`,kind:`gavel-commit`,total:1,failed:1,controls:[`retry`]},{id:`commit-task`,name:`Create commit`,type:`task`,groupId:`commit-1`,status:`failed`,error:`exit status 1`,stderr:`error: nothing added to commit but untracked files present
`,details:{command:`git`,args:[`commit`,`-m`,`fix bug`,`src/report generator.ts`],cwd:`/repo path`,status:`exited`,exitCode:1}}],onControl:h()}},D=t(),O={decorators:[l],parameters:{docs:{description:{story:'A task that drives a captain session (`session: {type: "captain", id, href, summary}`). The row draws the session\'s model, context gauge, action count and latest tool call from the server-computed `summary` — it reads and follows nothing. Expanding it opens the session inspector in a first "Session" tab: it reads the transcript once and takes live entries from `sessionFeed` (`useTaskRun(...).sessionFeed`), the session frames multiplexed on the task stream. Without a feed the transcript is read once and not followed.'}}},args:{snapshots:p(`running`,[{name:`Run prompt`,status:`running`,startedAt:new Date(Date.now()-8e3).toISOString(),session:c}]),sessionFeed:D.feed},play:async({canvasElement:e})=>{let t=v(e),n=await t.findByTestId(`session-task-summary`);await m(v(n).getByText(`6 actions`)).toBeInTheDocument(),await m(v(n).getByText(`claude-opus-4-8`)).toBeInTheDocument(),await m(v(n).getByLabelText(`Context 8% used`)).toBeInTheDocument(),await g.click(t.getByText(`Run prompt`)),await m(await t.findByRole(`button`,{name:`Session`})).toHaveAttribute(`aria-current`,`true`),await m(await t.findByTestId(`task-session-detail`)).toBeInTheDocument(),D.dispatch(`session`,a(u)),await _(()=>m(t.getByText(o)).toBeInTheDocument())}},k={args:{snapshots:p(`success`,[{name:`REBUILD idx_policy`,status:`success`,...d(2100)},{name:`UPDATE STATISTICS dbo.AsClient`,status:`success`,...d(400)}]),title:`Defrag fixes`}},A={args:{snapshots:[{id:`commit-project`,name:`Commit gavel`,type:`group`,status:`running`,groupId:`commit-1`,kind:`gavel-commit`,total:2,running:1,controls:[`stop`]},{id:`commit-one`,name:`Commit one.go`,description:`one.go`,type:`task`,groupId:`commit-1`,status:`running`,controls:[`stop`]},{id:`commit-two`,name:`Commit two.go`,description:`two.go`,type:`task`,groupId:`commit-1`,status:`pending`,controls:[`stop`]}],onControl:h(),onTaskControl:h()},play:async({canvasElement:e,args:t})=>{let n=v(e);await g.click(n.getByRole(`button`,{name:`Stop Commit one.go`})),await m(t.onTaskControl).toHaveBeenCalledWith(`stop`,m.objectContaining({id:`commit-one`}),m.objectContaining({id:`commit-project`}))}},j=[`Running`,`NestedGitReads`,`WaitingForAnswer`,`WithFailure`,`CopyRunDetails`,`FailedWithRetry`,`CaptainSession`,`Complete`,`ControllableChildren`],x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    snapshots: run("running", [{
      name: "REBUILD idx_policy",
      status: "success",
      ...took(2100)
    },
    // A running task carries only its start; the elapsed time ticks client-side.
    {
      name: "REORGANIZE idx_client",
      status: "running",
      startedAt: new Date(Date.now() - 8_000).toISOString()
    }, {
      name: "UPDATE STATISTICS dbo.AsPolicy",
      status: "pending"
    }])
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    snapshots: [{
      id: "comparison",
      groupId: "comparison",
      type: "group",
      name: "Compare DEV0BASE and acme/rules#main",
      status: "running"
    }, {
      id: "source",
      groupId: "source",
      parentGroupId: "comparison",
      type: "group",
      name: "[acme/rules] Read main",
      status: "running"
    }, {
      id: "refs",
      groupId: "source",
      type: "task",
      name: "[acme/rules] Resolve main",
      labels: {
        repository: "acme/rules",
        ref: "main"
      },
      status: "success",
      description: "Using cached result"
    }, {
      id: "tree",
      groupId: "source",
      type: "task",
      name: "[acme/rules] Read files @49ec96f75b56",
      labels: {
        repository: "acme/rules",
        operation: "cat-file"
      },
      status: "running",
      description: "Reading objects",
      progress: 3,
      maxValue: 5,
      progressMetrics: {
        unit: "files",
        bytes: 1048576,
        bytesPerSecond: 524288
      }
    }]
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    snapshots: run("running", [{
      name: "Stage files",
      status: "success",
      ...took(400)
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    snapshots: run("failed", [{
      name: "REBUILD idx_policy",
      status: "success",
      ...took(2100)
    }, {
      name: "UPDATE STATISTICS dbo.AsClient",
      status: "failed",
      error: "Lock request timeout",
      logs: [log(1, "error", "Lock request time out period exceeded.")]
    }])
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    snapshots: run("failed", [{
      name: "Measure dev",
      status: "success",
      ...took(527)
    }, {
      name: "Export from dev",
      status: "failed",
      ...took(15298),
      error: "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",
      logs: [log(1, "error", "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled")]
    }, {
      name: "Verify dev",
      status: "canceled",
      ...took(15899),
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  decorators: [withCaptainSessionFetch],
  parameters: {
    docs: {
      description: {
        story: 'A task that drives a captain session (\`session: {type: "captain", id, href, summary}\`). The row draws the session\\'s model, context gauge, action count and latest tool call from the server-computed \`summary\` — it reads and follows nothing. Expanding it opens the session inspector in a first "Session" tab: it reads the transcript once and takes live entries from \`sessionFeed\` (\`useTaskRun(...).sessionFeed\`), the session frames multiplexed on the task stream. Without a feed the transcript is read once and not followed.'
      }
    }
  },
  args: {
    snapshots: run("running", [{
      name: "Run prompt",
      status: "running",
      startedAt: new Date(Date.now() - 8_000).toISOString(),
      session: CAPTAIN_SESSION_REF
    }]),
    sessionFeed: captainSessionFeed.feed
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const summary = await canvas.findByTestId("session-task-summary");
    await expect(within(summary).getByText("6 actions")).toBeInTheDocument();
    await expect(within(summary).getByText("claude-opus-4-8")).toBeInTheDocument();
    await expect(within(summary).getByLabelText("Context 8% used")).toBeInTheDocument();
    await userEvent.click(canvas.getByText("Run prompt"));
    await expect(await canvas.findByRole("button", {
      name: "Session"
    })).toHaveAttribute("aria-current", "true");
    await expect(await canvas.findByTestId("task-session-detail")).toBeInTheDocument();

    // The inspector subscribes to the feed before it reads the transcript, so a
    // frame sent now reaches it whenever the read lands.
    captainSessionFeed.dispatch("session", captainSessionFrame(CAPTAIN_SESSION_LIVE_ENTRY));
    await waitFor(() => expect(canvas.getByText(CAPTAIN_SESSION_LIVE_TEXT)).toBeInTheDocument());
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    snapshots: run("success", [{
      name: "REBUILD idx_policy",
      status: "success",
      ...took(2100)
    }, {
      name: "UPDATE STATISTICS dbo.AsClient",
      status: "success",
      ...took(400)
    }]),
    title: "Defrag fixes"
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}}})))()}M();export{O as CaptainSession,k as Complete,A as ControllableChildren,T as CopyRunDetails,E as FailedWithRetry,S as NestedGitReads,x as Running,C as WaitingForAnswer,w as WithFailure,j as __namedExportsOrder,y as default};