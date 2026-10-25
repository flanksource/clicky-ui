import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,r}from"./Chat.fixtures-Dz7Ke9Ag.js";import{a as i,c as a,l as o,n as s,o as c,t as l}from"./ToolCall-DgTi-RTM.js";function u(e){return{..._,...e}}function d(e,t,n,r){return u({toolCallId:e,toolName:t,state:n,input:r,output:n===`output-available`?`ok`:void 0,toolMetadata:{parentToolCallId:H}})}var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{s(),r(),c(),a(),f=t(),{expect:p,fn:m,userEvent:h,within:g}=__STORYBOOK_MODULE_TEST__,_=n[1]?.parts[0],v={namespace:`default`,status:`Running`,limit:20},y=`call-pods-list`,b=`call-deployments-scale`,x=`approval-deployments-scale`,S={deployment:`api`,namespace:`default`,dryRun:!1,targets:[{container:`api`,replicas:6},{container:`worker`,replicas:2}]},C={title:`Chat/ToolCall`,component:l,tags:[`autodocs`],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, compact input args while collapsed, and the full input → output result while expanded. Input and output are rendered by the tool render registry — heuristically by default, by a standard renderer for known coding-agent tools, or by a host adapter when one claims the call. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:`boolean`},onApprove:{control:!1}},args:{part:_,defaultOpen:!1,onApprove:m()}},w=e=>(0,f.jsx)(`div`,{className:`max-w-2xl`,children:(0,f.jsx)(l,{...e})}),T={render:w},E={args:{defaultOpen:!0},render:w},D={args:{defaultOpen:!0,part:{type:`dynamic-tool`,toolName:`pods_list`,toolCallId:y,state:`input-streaming`,input:{namespace:`default`}}},parameters:{docs:{description:{story:"AI SDK `input-streaming`: the tool input is incomplete and execution has not started."}}},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByLabelText(`Pending`)).toBeInTheDocument(),await p(e.textContent).toContain(`namespace`),await p(e.textContent).toContain(`default`)}},O={args:{defaultOpen:!0,part:{type:`dynamic-tool`,toolName:`pods_list`,toolCallId:y,state:`input-available`,input:v}},parameters:{docs:{description:{story:"AI SDK `input-available`: the complete input is visible while the tool runs."}}},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByLabelText(`Running`)).toBeInTheDocument(),await p(e.textContent).toContain(`Running`),await p(e.textContent).toContain(`20`)}},k={args:{defaultOpen:!0,part:{type:`dynamic-tool`,toolName:`pods_list`,toolCallId:y,state:`output-available`,input:v,output:{data:[{id:`pod-1`,name:`api-7c9`,restarts:0},{id:`pod-2`,name:`worker-1f2`,restarts:3}],page:{limit:20,offset:0,total:2}}}},parameters:{docs:{description:{story:"AI SDK `output-available`: the final input and structured result are rendered together."}}},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByLabelText(`Completed`)).toBeInTheDocument(),await p(e.textContent).toContain(`api-7c9`),await p(e.textContent).toContain(`worker-1f2`)}},A={args:{defaultOpen:!0,part:{type:`dynamic-tool`,toolName:`pods_list`,toolCallId:y,state:`output-error`,input:v,errorText:`cluster API returned 503: service unavailable`}},parameters:{docs:{description:{story:"AI SDK `output-error`: the attempted input stays visible beside the terminal error."}}},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByLabelText(`Error`)).toBeInTheDocument(),await p(t.getByText(`cluster API returned 503: service unavailable`)).toBeInTheDocument()}},j={args:{defaultOpen:!0,part:u({toolName:`pods_list`,input:{namespace:`default`,status:`Running`,limit:20},output:{data:[{id:`pod-1`,name:`api-7c9`,restarts:0,startedAt:`2026-01-14T09:12:00Z`},{id:`pod-2`,name:`worker-1f2`,restarts:3,startedAt:`2026-01-15T11:40:00Z`},{id:`pod-3`,name:`cache-8ab`,restarts:1,startedAt:`2026-01-16T08:05:00Z`}],page:{limit:20,offset:0,total:37}}})},render:w},M={args:{defaultOpen:!0,part:u({toolName:`pods_get`,input:{id:`pod-1041`},output:{id:`pod-1041`,name:`api-7c9`,status:`RUNNING`,startedAt:`2026-01-31T00:00:00Z`,containers:6}})},render:w},N={args:{defaultOpen:!0,part:u({toolName:`manifests_apply`,input:{namespace:`default`,cluster:`prod-1`,dryRun:!1},output:{created:12,updated:3,skipped:41,errors:0}})},render:w},P={args:{onApprove:m(),part:{type:`dynamic-tool`,toolName:`deployments_scale`,toolCallId:b,state:`approval-requested`,approval:{id:x},input:S}},parameters:{docs:{description:{story:"AI SDK `approval-requested`: the proposed input is force-opened before the user approves or denies it."}}},render:w,play:async({args:e,canvasElement:t})=>{let n=g(t);await p(n.getByLabelText(`Awaiting approval`)).toBeInTheDocument(),await p(t.textContent).toContain(`deployment`),await h.click(n.getByRole(`button`,{name:`Approve`})),await h.click(n.getByRole(`button`,{name:`Deny`})),await p(e.onApprove).toHaveBeenNthCalledWith(1,x,!0),await p(e.onApprove).toHaveBeenNthCalledWith(2,x,!1)}},F={args:{defaultOpen:!0,part:{type:`dynamic-tool`,toolName:`deployments_scale`,toolCallId:b,state:`approval-responded`,approval:{id:x,approved:!0},input:S}},parameters:{docs:{description:{story:"AI SDK `approval-responded`: Captain has recorded approval and the tool is resuming."}}},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByLabelText(`Responded`)).toBeInTheDocument(),await p(t.queryByRole(`button`,{name:`Approve`})).not.toBeInTheDocument(),await p(t.queryByRole(`button`,{name:`Deny`})).not.toBeInTheDocument()}},I={args:{defaultOpen:!0,part:{type:`dynamic-tool`,toolName:`deployments_scale`,toolCallId:b,state:`output-denied`,approval:{id:x,approved:!1,reason:`Scale the staging deployment first.`},input:S}},parameters:{docs:{description:{story:"AI SDK `output-denied`: the request and denial envelope remain visible as terminal history."}}},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByLabelText(`Denied`)).toBeInTheDocument(),await p(e.textContent).toContain(`deployment`),await p(t.queryByRole(`button`,{name:`Approve`})).not.toBeInTheDocument()}},L={args:{defaultOpen:!0,part:{type:`dynamic-tool`,toolName:`deployments_scale`,toolCallId:b,state:`output-available`,approval:{id:x,approved:!0},input:S,output:{updated:2,replicas:8,errors:0}}},parameters:{docs:{description:{story:"AI SDK `output-available` after approval: the accepted input and terminal result stay correlated."}}},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByLabelText(`Completed`)).toBeInTheDocument(),await p(e.textContent).toContain(`updated`),await p(e.textContent).toContain(`replicas`),await p(t.queryByRole(`button`,{name:`Approve`})).not.toBeInTheDocument()}},R={name:`deployments_scale`,label:`Scale deployment`,entity:`deployments`,inputSchema:{type:`object`,properties:{deployment:{type:`string`,title:`Deployment`},namespace:{type:`string`,title:`Namespace`},dryRun:{type:`boolean`,title:`Dry run`},targets:{type:`array`,title:`Scale targets`}}}},z={args:{...P.args,tool:R},render:w},B=i([o(`demo:manifests_apply`,`manifests_apply`,{renderSummary:e=>`applied ${String(e.output.created)}`,renderOutput:e=>(0,f.jsxs)(`div`,{className:`rounded-md border border-emerald-600/40 bg-emerald-500/10 p-density-2 text-sm`,children:[`Created `,String(e.output.created),` resources.`]})})]),V={args:{...N.args,registry:B},render:w},H=`call-agent-review`,U={args:{defaultOpen:!0,part:u({toolCallId:H,toolName:`Agent`,input:{subagent_type:`general-purpose`,description:`Review children 1-5`,run_in_background:!0},output:`Async agent launched successfully.`}),subcalls:[d(`call-sub-1`,`Bash`,`output-available`,{command:`gavel todos get d961560d`}),d(`call-sub-2`,`Bash`,`output-available`,{command:`git log --oneline -5`}),d(`call-sub-3`,`Read`,`input-available`,{file_path:`pkg/ledger/report.go`})]},render:w,play:async({canvasElement:e})=>{let t=g(e);await p(t.getByText(`3 calls · 1 running`)).toBeInTheDocument(),await p(e.querySelector(`[data-slot="tool-call-subcalls"]`)).not.toBeNull()}},W={args:{defaultOpen:!0,part:u({toolName:`nodes_get`,input:{id:`node-9`},output:{output:JSON.stringify({id:`node-9`,name:`ip-10-0-1-9`,status:`READY`})}})},render:w},G=[`Collapsed`,`Expanded`,`InputStreaming`,`InputAvailable`,`OutputAvailable`,`OutputError`,`PagedList`,`EntityRecord`,`Counts`,`ApprovalRequested`,`ApprovalApproved`,`ApprovalDenied`,`ApprovalCompleted`,`SchemaLabelledParams`,`WithHostAdapter`,`SubagentCalls`,`TransportEnvelope`],T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: wrap
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: wrap
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "input-streaming",
      input: {
        namespace: "default"
      }
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`input-streaming\`: the tool input is incomplete and execution has not started."
      }
    }
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Pending")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("namespace");
    await expect(canvasElement.textContent).toContain("default");
  }
}`,...D.parameters?.docs?.source},description:{story:`The model is still streaming a partial input object.`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "input-available",
      input: LIST_INPUT
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`input-available\`: the complete input is visible while the tool runs."
      }
    }
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Running")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("Running");
    await expect(canvasElement.textContent).toContain("20");
  }
}`,...O.parameters?.docs?.source},description:{story:`Input is complete and the tool is executing.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "output-available",
      input: LIST_INPUT,
      output: {
        data: [{
          id: "pod-1",
          name: "api-7c9",
          restarts: 0
        }, {
          id: "pod-2",
          name: "worker-1f2",
          restarts: 3
        }],
        page: {
          limit: 20,
          offset: 0,
          total: 2
        }
      }
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`output-available\`: the final input and structured result are rendered together."
      }
    }
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Completed")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("api-7c9");
    await expect(canvasElement.textContent).toContain("worker-1f2");
  }
}`,...k.parameters?.docs?.source},description:{story:`A tool completed successfully with structured output.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "pods_list",
      toolCallId: LIST_CALL_ID,
      state: "output-error",
      input: LIST_INPUT,
      errorText: "cluster API returned 503: service unavailable"
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`output-error\`: the attempted input stays visible beside the terminal error."
      }
    }
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Error")).toBeInTheDocument();
    await expect(canvas.getByText("cluster API returned 503: service unavailable")).toBeInTheDocument();
  }
}`,...A.parameters?.docs?.source},description:{story:`A tool reached a terminal error with the attempted input retained.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "pods_list",
      input: {
        namespace: "default",
        status: "Running",
        limit: 20
      },
      output: {
        data: [{
          id: "pod-1",
          name: "api-7c9",
          restarts: 0,
          startedAt: "2026-01-14T09:12:00Z"
        }, {
          id: "pod-2",
          name: "worker-1f2",
          restarts: 3,
          startedAt: "2026-01-15T11:40:00Z"
        }, {
          id: "pod-3",
          name: "cache-8ab",
          restarts: 1,
          startedAt: "2026-01-16T08:05:00Z"
        }],
        page: {
          limit: 20,
          offset: 0,
          total: 37
        }
      }
    })
  },
  render: wrap
}`,...j.parameters?.docs?.source},description:{story:"A clicky `PagedResult` renders as a table with a row count, not raw JSON.",...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "pods_get",
      input: {
        id: "pod-1041"
      },
      output: {
        id: "pod-1041",
        name: "api-7c9",
        status: "RUNNING",
        startedAt: "2026-01-31T00:00:00Z",
        containers: 6
      }
    })
  },
  render: wrap
}`,...M.parameters?.docs?.source},description:{story:`A single record renders as a heading + id chip + field list.`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "manifests_apply",
      input: {
        namespace: "default",
        cluster: "prod-1",
        dryRun: false
      },
      output: {
        created: 12,
        updated: 3,
        skipped: 41,
        errors: 0
      }
    })
  },
  render: wrap
}`,...N.parameters?.docs?.source},description:{story:`An all-numeric result renders as count tiles — the usual shape of a write.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    onApprove: fn(),
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "approval-requested",
      approval: {
        id: SCALE_APPROVAL_ID
      },
      input: SCALE_INPUT
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`approval-requested\`: the proposed input is force-opened before the user approves or denies it."
      }
    }
  },
  render: wrap,
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Awaiting approval")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("deployment");
    await userEvent.click(canvas.getByRole("button", {
      name: "Approve"
    }));
    await userEvent.click(canvas.getByRole("button", {
      name: "Deny"
    }));
    await expect(args.onApprove).toHaveBeenNthCalledWith(1, SCALE_APPROVAL_ID, true);
    await expect(args.onApprove).toHaveBeenNthCalledWith(2, SCALE_APPROVAL_ID, false);
  }
}`,...P.parameters?.docs?.source},description:{story:`A pending write force-opens its input and exposes both decisions.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "approval-responded",
      approval: {
        id: SCALE_APPROVAL_ID,
        approved: true
      },
      input: SCALE_INPUT
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`approval-responded\`: Captain has recorded approval and the tool is resuming."
      }
    }
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Responded")).toBeInTheDocument();
    await expect(canvas.queryByRole("button", {
      name: "Approve"
    })).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", {
      name: "Deny"
    })).not.toBeInTheDocument();
  }
}`,...F.parameters?.docs?.source},description:{story:`The user approved the input and execution is resuming.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "output-denied",
      approval: {
        id: SCALE_APPROVAL_ID,
        approved: false,
        reason: "Scale the staging deployment first."
      },
      input: SCALE_INPUT
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`output-denied\`: the request and denial envelope remain visible as terminal history."
      }
    }
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Denied")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("deployment");
    await expect(canvas.queryByRole("button", {
      name: "Approve"
    })).not.toBeInTheDocument();
  }
}`,...I.parameters?.docs?.source},description:{story:`The user denied the proposed input, terminating the call without output.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: {
      type: "dynamic-tool",
      toolName: "deployments_scale",
      toolCallId: SCALE_CALL_ID,
      state: "output-available",
      approval: {
        id: SCALE_APPROVAL_ID,
        approved: true
      },
      input: SCALE_INPUT,
      output: {
        updated: 2,
        replicas: 8,
        errors: 0
      }
    } satisfies DynamicToolUIPart
  },
  parameters: {
    docs: {
      description: {
        story: "AI SDK \`output-available\` after approval: the accepted input and terminal result stay correlated."
      }
    }
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText("Completed")).toBeInTheDocument();
    await expect(canvasElement.textContent).toContain("updated");
    await expect(canvasElement.textContent).toContain("replicas");
    await expect(canvas.queryByRole("button", {
      name: "Approve"
    })).not.toBeInTheDocument();
  }
}`,...L.parameters?.docs?.source},description:{story:`An approved write completed and carries both approval and output.`,...L.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    ...ApprovalRequested.args,
    tool: SCALE_TOOL
  } as Story["args"],
  render: wrap
}`,...z.parameters?.docs?.source},description:{story:`With a catalog entry, params are labelled from the tool's published schema.`,...z.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    ...Counts.args,
    registry: hostRegistry
  } as Story["args"],
  render: wrap
}`,...V.parameters?.docs?.source},description:{story:`A host adapter claims one tool; every other call keeps the built-ins.`,...V.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: toolPart({
      toolCallId: AGENT_CALL_ID,
      toolName: "Agent",
      input: {
        subagent_type: "general-purpose",
        description: "Review children 1-5",
        run_in_background: true
      },
      output: "Async agent launched successfully."
    }),
    subcalls: [subagentCall("call-sub-1", "Bash", "output-available", {
      command: "gavel todos get d961560d"
    }), subagentCall("call-sub-2", "Bash", "output-available", {
      command: "git log --oneline -5"
    }), subagentCall("call-sub-3", "Read", "input-available", {
      file_path: "pkg/ledger/report.go"
    })]
  },
  render: wrap,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("3 calls · 1 running")).toBeInTheDocument();
    await expect(canvasElement.querySelector('[data-slot="tool-call-subcalls"]')).not.toBeNull();
  }
}`,...U.parameters?.docs?.source},description:{story:`A background Agent call returns at once; the calls its subagent keeps making
 nest beneath it, with a running count in the header.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true,
    part: toolPart({
      toolName: "nodes_get",
      input: {
        id: "node-9"
      },
      output: {
        output: JSON.stringify({
          id: "node-9",
          name: "ip-10-0-1-9",
          status: "READY"
        })
      }
    })
  },
  render: wrap
}`,...W.parameters?.docs?.source},description:{story:'The transport double-encodes results as `{output: "<json>"}`; the renderer\n unwraps that before anything else sees it.',...W.parameters?.docs?.description}}}})))()}K();export{F as ApprovalApproved,L as ApprovalCompleted,I as ApprovalDenied,P as ApprovalRequested,T as Collapsed,N as Counts,M as EntityRecord,E as Expanded,O as InputAvailable,D as InputStreaming,k as OutputAvailable,A as OutputError,j as PagedList,z as SchemaLabelledParams,U as SubagentCalls,W as TransportEnvelope,V as WithHostAdapter,G as __namedExportsOrder,C as default};