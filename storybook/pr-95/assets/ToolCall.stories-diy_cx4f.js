import{j as L}from"./iframe-DXCHqMT7.js";import{T as st,c as dt,t as ut}from"./ToolCall-DxkbFMDm.js";import{S as mt}from"./Chat.fixtures-BPCnUBG1.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./button-tbjJwnTf.js";import"./index-CPURVhFy.js";import"./loading-CFBgJ_my.js";import"./Icon-CzqsX9Zi.js";import"./types-DnFuV5L5.js";import"./CodeBlock-DfLdBRTj.js";import"./CodeDiff-D96T_Lqc.js";import"./SegmentedControl-CPSYGN3s.js";import"./HighlightedTokens-BwAjdB1B.js";import"./JsonView-B6IE9BVn.js";import"./KeyValueList-DN8u_5BM.js";import"./DataTable-C9vdgrje.js";import"./SortableHeader-p1ELe-TS.js";import"./router-BummLNfq.js";import"./Modal-DuOJllmE.js";import"./index-nXD4GtBn.js";import"./index-h3UUAFeB.js";import"./modalStack-ZxYyB433.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C0qdRizE.js";import"./floating-ui.react-BFoHRFAR.js";import"./FilterPill-kd8dcFZz.js";import"./Combobox-DftKas2V.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CaIRSwlz.js";import"./MultiSelect-HKrSw_53.js";import"./RangeSlider-B8q2faFd.js";import"./TimeRange-D0EjkUCW.js";import"./select-CUXTJRVv.js";import"./WorkloadPicker-S3aLZAFo.js";import"./NamespacePicker-DATdNae9.js";import"./index-Br80NOr9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-B9u6m3Jx.js";import"./TagList-DT6fFCMe.js";import"./Badge-CxYDrKcj.js";import"./HoverCard-Lk0Lira2.js";import"./Properties-DVIMzZsy.js";import"./IconButton-DJ_I_ndq.js";import"./DropdownMenu-CajicWca.js";import"./DropdownMenuSubmenu-CG6RB2PG.js";import"./StatusDot-jH57yqnf.js";const{expect:t,fn:pt,userEvent:E,within:o}=__STORYBOOK_MODULE_TEST__;var N;const it=(N=mt[1])==null?void 0:N.parts[0];function l(e){return{...it,...e}}const B={namespace:"default",status:"Running",limit:20},_="call-pods-list",S="call-deployments-scale",i="approval-deployments-scale",x={deployment:"api",namespace:"default",dryRun:!1,targets:[{container:"api",replicas:6},{container:"worker",replicas:2}]},da={title:"Chat/ToolCall",component:st,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, compact input args while collapsed, and the full input → output result while expanded. Input and output are rendered by the tool render registry — heuristically by default, by a standard renderer for known coding-agent tools, or by a host adapter when one claims the call. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:it,defaultOpen:!1,onApprove:pt()}},n=e=>L.jsx("div",{className:"max-w-2xl",children:L.jsx(st,{...e})}),f={render:n},T={args:{defaultOpen:!0},render:n},c={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:_,state:"input-streaming",input:{namespace:"default"}}},parameters:{docs:{description:{story:"AI SDK `input-streaming`: the tool input is incomplete and execution has not started."}}},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByLabelText("Pending")).toBeInTheDocument(),await t(e.textContent).toContain("namespace"),await t(e.textContent).toContain("default")}},d={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:_,state:"input-available",input:B}},parameters:{docs:{description:{story:"AI SDK `input-available`: the complete input is visible while the tool runs."}}},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByLabelText("Running")).toBeInTheDocument(),await t(e.textContent).toContain("Running"),await t(e.textContent).toContain("20")}},u={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:_,state:"output-available",input:B,output:{data:[{id:"pod-1",name:"api-7c9",restarts:0},{id:"pod-2",name:"worker-1f2",restarts:3}],page:{limit:20,offset:0,total:2}}}},parameters:{docs:{description:{story:"AI SDK `output-available`: the final input and structured result are rendered together."}}},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByLabelText("Completed")).toBeInTheDocument(),await t(e.textContent).toContain("api-7c9"),await t(e.textContent).toContain("worker-1f2")}},m={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:_,state:"output-error",input:B,errorText:"cluster API returned 503: service unavailable"}},parameters:{docs:{description:{story:"AI SDK `output-error`: the attempted input stays visible beside the terminal error."}}},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByLabelText("Error")).toBeInTheDocument(),await t(a.getByText("cluster API returned 503: service unavailable")).toBeInTheDocument()}},y={args:{defaultOpen:!0,part:l({toolName:"pods_list",input:{namespace:"default",status:"Running",limit:20},output:{data:[{id:"pod-1",name:"api-7c9",restarts:0,startedAt:"2026-01-14T09:12:00Z"},{id:"pod-2",name:"worker-1f2",restarts:3,startedAt:"2026-01-15T11:40:00Z"},{id:"pod-3",name:"cache-8ab",restarts:1,startedAt:"2026-01-16T08:05:00Z"}],page:{limit:20,offset:0,total:37}}})},render:n},g={args:{defaultOpen:!0,part:l({toolName:"pods_get",input:{id:"pod-1041"},output:{id:"pod-1041",name:"api-7c9",status:"RUNNING",startedAt:"2026-01-31T00:00:00Z",containers:6}})},render:n},s={args:{defaultOpen:!0,part:l({toolName:"manifests_apply",input:{namespace:"default",cluster:"prod-1",dryRun:!1},output:{created:12,updated:3,skipped:41,errors:0}})},render:n},p={args:{onApprove:pt(),part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:S,state:"approval-requested",approval:{id:i},input:x}},parameters:{docs:{description:{story:"AI SDK `approval-requested`: the proposed input is force-opened before the user approves or denies it."}}},render:n,play:async({args:e,canvasElement:a})=>{const r=o(a);await t(r.getByLabelText("Awaiting approval")).toBeInTheDocument(),await t(a.textContent).toContain("deployment"),await E.click(r.getByRole("button",{name:"Approve"})),await E.click(r.getByRole("button",{name:"Deny"})),await t(e.onApprove).toHaveBeenNthCalledWith(1,i,!0),await t(e.onApprove).toHaveBeenNthCalledWith(2,i,!1)}},v={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:S,state:"approval-responded",approval:{id:i,approved:!0},input:x}},parameters:{docs:{description:{story:"AI SDK `approval-responded`: Captain has recorded approval and the tool is resuming."}}},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByLabelText("Responded")).toBeInTheDocument(),await t(a.queryByRole("button",{name:"Approve"})).not.toBeInTheDocument(),await t(a.queryByRole("button",{name:"Deny"})).not.toBeInTheDocument()}},h={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:S,state:"output-denied",approval:{id:i,approved:!1,reason:"Scale the staging deployment first."},input:x}},parameters:{docs:{description:{story:"AI SDK `output-denied`: the request and denial envelope remain visible as terminal history."}}},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByLabelText("Denied")).toBeInTheDocument(),await t(e.textContent).toContain("deployment"),await t(a.queryByRole("button",{name:"Approve"})).not.toBeInTheDocument()}},A={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:S,state:"output-available",approval:{id:i,approved:!0},input:x,output:{updated:2,replicas:8,errors:0}}},parameters:{docs:{description:{story:"AI SDK `output-available` after approval: the accepted input and terminal result stay correlated."}}},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByLabelText("Completed")).toBeInTheDocument(),await t(e.textContent).toContain("updated"),await t(e.textContent).toContain("replicas"),await t(a.queryByRole("button",{name:"Approve"})).not.toBeInTheDocument()}},yt={name:"deployments_scale",label:"Scale deployment",entity:"deployments",inputSchema:{type:"object",properties:{deployment:{type:"string",title:"Deployment"},namespace:{type:"string",title:"Namespace"},dryRun:{type:"boolean",title:"Dry run"},targets:{type:"array",title:"Scale targets"}}}},I={args:{...p.args,tool:yt},render:n},gt=dt([ut("demo:manifests_apply","manifests_apply",{renderSummary:e=>`applied ${String(e.output.created)}`,renderOutput:e=>L.jsxs("div",{className:"rounded-md border border-emerald-600/40 bg-emerald-500/10 p-density-2 text-sm",children:["Created ",String(e.output.created)," resources."]})})]),C={args:{...s.args,registry:gt},render:n},lt="call-agent-review";function D(e,a,r,ct){return l({toolCallId:e,toolName:a,state:r,input:ct,output:r==="output-available"?"ok":void 0,toolMetadata:{parentToolCallId:lt}})}const w={args:{defaultOpen:!0,part:l({toolCallId:lt,toolName:"Agent",input:{subagent_type:"general-purpose",description:"Review children 1-5",run_in_background:!0},output:"Async agent launched successfully."}),subcalls:[D("call-sub-1","Bash","output-available",{command:"gavel todos get d961560d"}),D("call-sub-2","Bash","output-available",{command:"git log --oneline -5"}),D("call-sub-3","Read","input-available",{file_path:"pkg/ledger/report.go"})]},render:n,play:async({canvasElement:e})=>{const a=o(e);await t(a.getByText("3 calls · 1 running")).toBeInTheDocument(),await t(e.querySelector('[data-slot="tool-call-subcalls"]')).not.toBeNull()}},b={args:{defaultOpen:!0,part:l({toolName:"nodes_get",input:{id:"node-9"},output:{output:JSON.stringify({id:"node-9",name:"ip-10-0-1-9",status:"READY"})}})},render:n};var O,R,P;f.parameters={...f.parameters,docs:{...(O=f.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: wrap
}`,...(P=(R=f.parameters)==null?void 0:R.docs)==null?void 0:P.source}}};var k,q,U;T.parameters={...T.parameters,docs:{...(k=T.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: wrap
}`,...(U=(q=T.parameters)==null?void 0:q.docs)==null?void 0:U.source}}};var K,j,W,Z,V;c.parameters={...c.parameters,docs:{...(K=c.parameters)==null?void 0:K.docs,source:{originalSource:`{
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
}`,...(W=(j=c.parameters)==null?void 0:j.docs)==null?void 0:W.source},description:{story:"The model is still streaming a partial input object.",...(V=(Z=c.parameters)==null?void 0:Z.docs)==null?void 0:V.description}}};var H,G,M,J,Y;d.parameters={...d.parameters,docs:{...(H=d.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(M=(G=d.parameters)==null?void 0:G.docs)==null?void 0:M.source},description:{story:"Input is complete and the tool is executing.",...(Y=(J=d.parameters)==null?void 0:J.docs)==null?void 0:Y.description}}};var $,z,F,Q,X;u.parameters={...u.parameters,docs:{...($=u.parameters)==null?void 0:$.docs,source:{originalSource:`{
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
}`,...(F=(z=u.parameters)==null?void 0:z.docs)==null?void 0:F.source},description:{story:"A tool completed successfully with structured output.",...(X=(Q=u.parameters)==null?void 0:Q.docs)==null?void 0:X.description}}};var ee,te,ae,ne,oe;m.parameters={...m.parameters,docs:{...(ee=m.parameters)==null?void 0:ee.docs,source:{originalSource:`{
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
}`,...(ae=(te=m.parameters)==null?void 0:te.docs)==null?void 0:ae.source},description:{story:"A tool reached a terminal error with the attempted input retained.",...(oe=(ne=m.parameters)==null?void 0:ne.docs)==null?void 0:oe.description}}};var re,se,pe,ie,le;y.parameters={...y.parameters,docs:{...(re=y.parameters)==null?void 0:re.docs,source:{originalSource:`{
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
}`,...(pe=(se=y.parameters)==null?void 0:se.docs)==null?void 0:pe.source},description:{story:"A clicky `PagedResult` renders as a table with a row count, not raw JSON.",...(le=(ie=y.parameters)==null?void 0:ie.docs)==null?void 0:le.description}}};var ce,de,ue,me,ye;g.parameters={...g.parameters,docs:{...(ce=g.parameters)==null?void 0:ce.docs,source:{originalSource:`{
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
}`,...(ue=(de=g.parameters)==null?void 0:de.docs)==null?void 0:ue.source},description:{story:"A single record renders as a heading + id chip + field list.",...(ye=(me=g.parameters)==null?void 0:me.docs)==null?void 0:ye.description}}};var ge,ve,he,Ae,Ie;s.parameters={...s.parameters,docs:{...(ge=s.parameters)==null?void 0:ge.docs,source:{originalSource:`{
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
}`,...(he=(ve=s.parameters)==null?void 0:ve.docs)==null?void 0:he.source},description:{story:"An all-numeric result renders as count tiles — the usual shape of a write.",...(Ie=(Ae=s.parameters)==null?void 0:Ae.docs)==null?void 0:Ie.description}}};var Ce,we,be,fe,Te;p.parameters={...p.parameters,docs:{...(Ce=p.parameters)==null?void 0:Ce.docs,source:{originalSource:`{
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
}`,...(be=(we=p.parameters)==null?void 0:we.docs)==null?void 0:be.source},description:{story:"A pending write force-opens its input and exposes both decisions.",...(Te=(fe=p.parameters)==null?void 0:fe.docs)==null?void 0:Te.description}}};var _e,Se,xe,De,Le;v.parameters={...v.parameters,docs:{...(_e=v.parameters)==null?void 0:_e.docs,source:{originalSource:`{
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
}`,...(xe=(Se=v.parameters)==null?void 0:Se.docs)==null?void 0:xe.source},description:{story:"The user approved the input and execution is resuming.",...(Le=(De=v.parameters)==null?void 0:De.docs)==null?void 0:Le.description}}};var Be,Ee,Ne,Oe,Re;h.parameters={...h.parameters,docs:{...(Be=h.parameters)==null?void 0:Be.docs,source:{originalSource:`{
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
}`,...(Ne=(Ee=h.parameters)==null?void 0:Ee.docs)==null?void 0:Ne.source},description:{story:"The user denied the proposed input, terminating the call without output.",...(Re=(Oe=h.parameters)==null?void 0:Oe.docs)==null?void 0:Re.description}}};var Pe,ke,qe,Ue,Ke;A.parameters={...A.parameters,docs:{...(Pe=A.parameters)==null?void 0:Pe.docs,source:{originalSource:`{
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
}`,...(qe=(ke=A.parameters)==null?void 0:ke.docs)==null?void 0:qe.source},description:{story:"An approved write completed and carries both approval and output.",...(Ke=(Ue=A.parameters)==null?void 0:Ue.docs)==null?void 0:Ke.description}}};var je,We,Ze,Ve,He;I.parameters={...I.parameters,docs:{...(je=I.parameters)==null?void 0:je.docs,source:{originalSource:`{
  args: {
    ...ApprovalRequested.args,
    tool: SCALE_TOOL
  } as Story["args"],
  render: wrap
}`,...(Ze=(We=I.parameters)==null?void 0:We.docs)==null?void 0:Ze.source},description:{story:"With a catalog entry, params are labelled from the tool's published schema.",...(He=(Ve=I.parameters)==null?void 0:Ve.docs)==null?void 0:He.description}}};var Ge,Me,Je,Ye,$e;C.parameters={...C.parameters,docs:{...(Ge=C.parameters)==null?void 0:Ge.docs,source:{originalSource:`{
  args: {
    ...Counts.args,
    registry: hostRegistry
  } as Story["args"],
  render: wrap
}`,...(Je=(Me=C.parameters)==null?void 0:Me.docs)==null?void 0:Je.source},description:{story:"A host adapter claims one tool; every other call keeps the built-ins.",...($e=(Ye=C.parameters)==null?void 0:Ye.docs)==null?void 0:$e.description}}};var ze,Fe,Qe,Xe,et;w.parameters={...w.parameters,docs:{...(ze=w.parameters)==null?void 0:ze.docs,source:{originalSource:`{
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
}`,...(Qe=(Fe=w.parameters)==null?void 0:Fe.docs)==null?void 0:Qe.source},description:{story:`A background Agent call returns at once; the calls its subagent keeps making
 nest beneath it, with a running count in the header.`,...(et=(Xe=w.parameters)==null?void 0:Xe.docs)==null?void 0:et.description}}};var tt,at,nt,ot,rt;b.parameters={...b.parameters,docs:{...(tt=b.parameters)==null?void 0:tt.docs,source:{originalSource:`{
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
}`,...(nt=(at=b.parameters)==null?void 0:at.docs)==null?void 0:nt.source},description:{story:'The transport double-encodes results as `{output: "<json>"}`; the renderer\n unwraps that before anything else sees it.',...(rt=(ot=b.parameters)==null?void 0:ot.docs)==null?void 0:rt.description}}};const ua=["Collapsed","Expanded","InputStreaming","InputAvailable","OutputAvailable","OutputError","PagedList","EntityRecord","Counts","ApprovalRequested","ApprovalApproved","ApprovalDenied","ApprovalCompleted","SchemaLabelledParams","WithHostAdapter","SubagentCalls","TransportEnvelope"];export{v as ApprovalApproved,A as ApprovalCompleted,h as ApprovalDenied,p as ApprovalRequested,f as Collapsed,s as Counts,g as EntityRecord,T as Expanded,d as InputAvailable,c as InputStreaming,u as OutputAvailable,m as OutputError,y as PagedList,I as SchemaLabelledParams,w as SubagentCalls,b as TransportEnvelope,C as WithHostAdapter,ua as __namedExportsOrder,da as default};
