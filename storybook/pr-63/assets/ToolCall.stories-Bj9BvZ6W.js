import{j as _}from"./iframe-DIGBtUIu.js";import{T as Xe,c as at,t as nt}from"./ToolCall--LEIFiCm.js";import{S as rt}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./button-BhKCLqoA.js";import"./index-0zBpNI7D.js";import"./loading-D2cuqAxD.js";import"./Icon-Ckp6RE90.js";import"./types-B1SOX9si.js";import"./CodeBlock-qb2M-WhO.js";import"./CodeDiff-DyOqFPkh.js";import"./SegmentedControl-CoaMDtpF.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-CIcBiLEe.js";import"./KeyValueList-DBmzKskq.js";import"./DataTable-CjiYOErP.js";import"./SortableHeader-DeCdyOuq.js";import"./Modal-BFrt9RBg.js";import"./index-CXQUnhiw.js";import"./index-evrdMFRC.js";import"./modalStack-C-EkQo6g.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DKEM-yVt.js";import"./floating-ui.react-CxgHPOfO.js";import"./FilterPill-DbdXEpGC.js";import"./Combobox-BgSWV58v.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DMZ4d6C6.js";import"./MultiSelect-DkVf6nxu.js";import"./RangeSlider-BP_bF84e.js";import"./TimeRange-BV4OpJTO.js";import"./select-DECEq3dq.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-CAeQnq5s.js";import"./TagList-ChUpvwJX.js";import"./Badge-CeO7XmU6.js";import"./HoverCard-DlH6gDP1.js";import"./Properties-CsbDH91a.js";import"./IconButton-CAaA5K_1.js";import"./DropdownMenu-CVD-ABeT.js";import"./DropdownMenuSubmenu-BK5dfo9E.js";import"./StatusDot-CWR5z1ge.js";const{expect:t,fn:et,userEvent:L,within:r}=__STORYBOOK_MODULE_TEST__;var B;const tt=(B=rt[1])==null?void 0:B.parts[0];function f(e){return{...tt,...e}}const D={namespace:"default",status:"Running",limit:20},T="call-pods-list",x="call-deployments-scale",p="approval-deployments-scale",S={deployment:"api",namespace:"default",dryRun:!1,targets:[{container:"api",replicas:6},{container:"worker",replicas:2}]},Ft={title:"Chat/ToolCall",component:Xe,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, compact input args while collapsed, and the full input → output result while expanded. Input and output are rendered by the tool render registry — heuristically by default, by a standard renderer for known coding-agent tools, or by a host adapter when one claims the call. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:tt,defaultOpen:!1,onApprove:et()}},n=e=>_.jsx("div",{className:"max-w-2xl",children:_.jsx(Xe,{...e})}),w={render:n},C={args:{defaultOpen:!0},render:n},i={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:T,state:"input-streaming",input:{namespace:"default"}}},parameters:{docs:{description:{story:"AI SDK `input-streaming`: the tool input is incomplete and execution has not started."}}},render:n,play:async({canvasElement:e})=>{const a=r(e);await t(a.getByLabelText("Pending")).toBeInTheDocument(),await t(e.textContent).toContain("namespace"),await t(e.textContent).toContain("default")}},l={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:T,state:"input-available",input:D}},parameters:{docs:{description:{story:"AI SDK `input-available`: the complete input is visible while the tool runs."}}},render:n,play:async({canvasElement:e})=>{const a=r(e);await t(a.getByLabelText("Running")).toBeInTheDocument(),await t(e.textContent).toContain("Running"),await t(e.textContent).toContain("20")}},d={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:T,state:"output-available",input:D,output:{data:[{id:"pod-1",name:"api-7c9",restarts:0},{id:"pod-2",name:"worker-1f2",restarts:3}],page:{limit:20,offset:0,total:2}}}},parameters:{docs:{description:{story:"AI SDK `output-available`: the final input and structured result are rendered together."}}},render:n,play:async({canvasElement:e})=>{const a=r(e);await t(a.getByLabelText("Completed")).toBeInTheDocument(),await t(e.textContent).toContain("api-7c9"),await t(e.textContent).toContain("worker-1f2")}},c={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"pods_list",toolCallId:T,state:"output-error",input:D,errorText:"cluster API returned 503: service unavailable"}},parameters:{docs:{description:{story:"AI SDK `output-error`: the attempted input stays visible beside the terminal error."}}},render:n,play:async({canvasElement:e})=>{const a=r(e);await t(a.getByLabelText("Error")).toBeInTheDocument(),await t(a.getByText("cluster API returned 503: service unavailable")).toBeInTheDocument()}},u={args:{defaultOpen:!0,part:f({toolName:"pods_list",input:{namespace:"default",status:"Running",limit:20},output:{data:[{id:"pod-1",name:"api-7c9",restarts:0,startedAt:"2026-01-14T09:12:00Z"},{id:"pod-2",name:"worker-1f2",restarts:3,startedAt:"2026-01-15T11:40:00Z"},{id:"pod-3",name:"cache-8ab",restarts:1,startedAt:"2026-01-16T08:05:00Z"}],page:{limit:20,offset:0,total:37}}})},render:n},m={args:{defaultOpen:!0,part:f({toolName:"pods_get",input:{id:"pod-1041"},output:{id:"pod-1041",name:"api-7c9",status:"RUNNING",startedAt:"2026-01-31T00:00:00Z",containers:6}})},render:n},o={args:{defaultOpen:!0,part:f({toolName:"manifests_apply",input:{namespace:"default",cluster:"prod-1",dryRun:!1},output:{created:12,updated:3,skipped:41,errors:0}})},render:n},s={args:{onApprove:et(),part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:x,state:"approval-requested",approval:{id:p},input:S}},parameters:{docs:{description:{story:"AI SDK `approval-requested`: the proposed input is force-opened before the user approves or denies it."}}},render:n,play:async({args:e,canvasElement:a})=>{const b=r(a);await t(b.getByLabelText("Awaiting approval")).toBeInTheDocument(),await t(a.textContent).toContain("deployment"),await L.click(b.getByRole("button",{name:"Approve"})),await L.click(b.getByRole("button",{name:"Deny"})),await t(e.onApprove).toHaveBeenNthCalledWith(1,p,!0),await t(e.onApprove).toHaveBeenNthCalledWith(2,p,!1)}},y={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:x,state:"approval-responded",approval:{id:p,approved:!0},input:S}},parameters:{docs:{description:{story:"AI SDK `approval-responded`: Captain has recorded approval and the tool is resuming."}}},render:n,play:async({canvasElement:e})=>{const a=r(e);await t(a.getByLabelText("Responded")).toBeInTheDocument(),await t(a.queryByRole("button",{name:"Approve"})).not.toBeInTheDocument(),await t(a.queryByRole("button",{name:"Deny"})).not.toBeInTheDocument()}},v={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:x,state:"output-denied",approval:{id:p,approved:!1,reason:"Scale the staging deployment first."},input:S}},parameters:{docs:{description:{story:"AI SDK `output-denied`: the request and denial envelope remain visible as terminal history."}}},render:n,play:async({canvasElement:e})=>{const a=r(e);await t(a.getByLabelText("Denied")).toBeInTheDocument(),await t(e.textContent).toContain("deployment"),await t(a.queryByRole("button",{name:"Approve"})).not.toBeInTheDocument()}},g={args:{defaultOpen:!0,part:{type:"dynamic-tool",toolName:"deployments_scale",toolCallId:x,state:"output-available",approval:{id:p,approved:!0},input:S,output:{updated:2,replicas:8,errors:0}}},parameters:{docs:{description:{story:"AI SDK `output-available` after approval: the accepted input and terminal result stay correlated."}}},render:n,play:async({canvasElement:e})=>{const a=r(e);await t(a.getByLabelText("Completed")).toBeInTheDocument(),await t(e.textContent).toContain("updated"),await t(e.textContent).toContain("replicas"),await t(a.queryByRole("button",{name:"Approve"})).not.toBeInTheDocument()}},ot={name:"deployments_scale",label:"Scale deployment",entity:"deployments",inputSchema:{type:"object",properties:{deployment:{type:"string",title:"Deployment"},namespace:{type:"string",title:"Namespace"},dryRun:{type:"boolean",title:"Dry run"},targets:{type:"array",title:"Scale targets"}}}},h={args:{...s.args,tool:ot},render:n},st=at([nt("demo:manifests_apply","manifests_apply",{renderSummary:e=>`applied ${String(e.output.created)}`,renderOutput:e=>_.jsxs("div",{className:"rounded-md border border-emerald-600/40 bg-emerald-500/10 p-density-2 text-sm",children:["Created ",String(e.output.created)," resources."]})})]),A={args:{...o.args,registry:st},render:n},I={args:{defaultOpen:!0,part:f({toolName:"nodes_get",input:{id:"node-9"},output:{output:JSON.stringify({id:"node-9",name:"ip-10-0-1-9",status:"READY"})}})},render:n};var E,O,N;w.parameters={...w.parameters,docs:{...(E=w.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: wrap
}`,...(N=(O=w.parameters)==null?void 0:O.docs)==null?void 0:N.source}}};var P,R,U;C.parameters={...C.parameters,docs:{...(P=C.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: wrap
}`,...(U=(R=C.parameters)==null?void 0:R.docs)==null?void 0:U.source}}};var q,K,k,j,W;i.parameters={...i.parameters,docs:{...(q=i.parameters)==null?void 0:q.docs,source:{originalSource:`{
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
}`,...(k=(K=i.parameters)==null?void 0:K.docs)==null?void 0:k.source},description:{story:"The model is still streaming a partial input object.",...(W=(j=i.parameters)==null?void 0:j.docs)==null?void 0:W.description}}};var Z,V,H,M,G;l.parameters={...l.parameters,docs:{...(Z=l.parameters)==null?void 0:Z.docs,source:{originalSource:`{
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
}`,...(H=(V=l.parameters)==null?void 0:V.docs)==null?void 0:H.source},description:{story:"Input is complete and the tool is executing.",...(G=(M=l.parameters)==null?void 0:M.docs)==null?void 0:G.description}}};var J,Y,$,z,F;d.parameters={...d.parameters,docs:{...(J=d.parameters)==null?void 0:J.docs,source:{originalSource:`{
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
}`,...($=(Y=d.parameters)==null?void 0:Y.docs)==null?void 0:$.source},description:{story:"A tool completed successfully with structured output.",...(F=(z=d.parameters)==null?void 0:z.docs)==null?void 0:F.description}}};var Q,X,ee,te,ae;c.parameters={...c.parameters,docs:{...(Q=c.parameters)==null?void 0:Q.docs,source:{originalSource:`{
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
}`,...(ee=(X=c.parameters)==null?void 0:X.docs)==null?void 0:ee.source},description:{story:"A tool reached a terminal error with the attempted input retained.",...(ae=(te=c.parameters)==null?void 0:te.docs)==null?void 0:ae.description}}};var ne,re,oe,se,pe;u.parameters={...u.parameters,docs:{...(ne=u.parameters)==null?void 0:ne.docs,source:{originalSource:`{
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
}`,...(oe=(re=u.parameters)==null?void 0:re.docs)==null?void 0:oe.source},description:{story:"A clicky `PagedResult` renders as a table with a row count, not raw JSON.",...(pe=(se=u.parameters)==null?void 0:se.docs)==null?void 0:pe.description}}};var ie,le,de,ce,ue;m.parameters={...m.parameters,docs:{...(ie=m.parameters)==null?void 0:ie.docs,source:{originalSource:`{
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
}`,...(de=(le=m.parameters)==null?void 0:le.docs)==null?void 0:de.source},description:{story:"A single record renders as a heading + id chip + field list.",...(ue=(ce=m.parameters)==null?void 0:ce.docs)==null?void 0:ue.description}}};var me,ye,ve,ge,he;o.parameters={...o.parameters,docs:{...(me=o.parameters)==null?void 0:me.docs,source:{originalSource:`{
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
}`,...(ve=(ye=o.parameters)==null?void 0:ye.docs)==null?void 0:ve.source},description:{story:"An all-numeric result renders as count tiles — the usual shape of a write.",...(he=(ge=o.parameters)==null?void 0:ge.docs)==null?void 0:he.description}}};var Ae,Ie,we,Ce,fe;s.parameters={...s.parameters,docs:{...(Ae=s.parameters)==null?void 0:Ae.docs,source:{originalSource:`{
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
}`,...(we=(Ie=s.parameters)==null?void 0:Ie.docs)==null?void 0:we.source},description:{story:"A pending write force-opens its input and exposes both decisions.",...(fe=(Ce=s.parameters)==null?void 0:Ce.docs)==null?void 0:fe.description}}};var Te,xe,Se,be,_e;y.parameters={...y.parameters,docs:{...(Te=y.parameters)==null?void 0:Te.docs,source:{originalSource:`{
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
}`,...(Se=(xe=y.parameters)==null?void 0:xe.docs)==null?void 0:Se.source},description:{story:"The user approved the input and execution is resuming.",...(_e=(be=y.parameters)==null?void 0:be.docs)==null?void 0:_e.description}}};var De,Le,Be,Ee,Oe;v.parameters={...v.parameters,docs:{...(De=v.parameters)==null?void 0:De.docs,source:{originalSource:`{
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
}`,...(Be=(Le=v.parameters)==null?void 0:Le.docs)==null?void 0:Be.source},description:{story:"The user denied the proposed input, terminating the call without output.",...(Oe=(Ee=v.parameters)==null?void 0:Ee.docs)==null?void 0:Oe.description}}};var Ne,Pe,Re,Ue,qe;g.parameters={...g.parameters,docs:{...(Ne=g.parameters)==null?void 0:Ne.docs,source:{originalSource:`{
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
}`,...(Re=(Pe=g.parameters)==null?void 0:Pe.docs)==null?void 0:Re.source},description:{story:"An approved write completed and carries both approval and output.",...(qe=(Ue=g.parameters)==null?void 0:Ue.docs)==null?void 0:qe.description}}};var Ke,ke,je,We,Ze;h.parameters={...h.parameters,docs:{...(Ke=h.parameters)==null?void 0:Ke.docs,source:{originalSource:`{
  args: {
    ...ApprovalRequested.args,
    tool: SCALE_TOOL
  } as Story["args"],
  render: wrap
}`,...(je=(ke=h.parameters)==null?void 0:ke.docs)==null?void 0:je.source},description:{story:"With a catalog entry, params are labelled from the tool's published schema.",...(Ze=(We=h.parameters)==null?void 0:We.docs)==null?void 0:Ze.description}}};var Ve,He,Me,Ge,Je;A.parameters={...A.parameters,docs:{...(Ve=A.parameters)==null?void 0:Ve.docs,source:{originalSource:`{
  args: {
    ...Counts.args,
    registry: hostRegistry
  } as Story["args"],
  render: wrap
}`,...(Me=(He=A.parameters)==null?void 0:He.docs)==null?void 0:Me.source},description:{story:"A host adapter claims one tool; every other call keeps the built-ins.",...(Je=(Ge=A.parameters)==null?void 0:Ge.docs)==null?void 0:Je.description}}};var Ye,$e,ze,Fe,Qe;I.parameters={...I.parameters,docs:{...(Ye=I.parameters)==null?void 0:Ye.docs,source:{originalSource:`{
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
}`,...(ze=($e=I.parameters)==null?void 0:$e.docs)==null?void 0:ze.source},description:{story:'The transport double-encodes results as `{output: "<json>"}`; the renderer\n unwraps that before anything else sees it.',...(Qe=(Fe=I.parameters)==null?void 0:Fe.docs)==null?void 0:Qe.description}}};const Qt=["Collapsed","Expanded","InputStreaming","InputAvailable","OutputAvailable","OutputError","PagedList","EntityRecord","Counts","ApprovalRequested","ApprovalApproved","ApprovalDenied","ApprovalCompleted","SchemaLabelledParams","WithHostAdapter","TransportEnvelope"];export{y as ApprovalApproved,g as ApprovalCompleted,v as ApprovalDenied,s as ApprovalRequested,w as Collapsed,o as Counts,m as EntityRecord,C as Expanded,l as InputAvailable,i as InputStreaming,d as OutputAvailable,c as OutputError,u as PagedList,h as SchemaLabelledParams,I as TransportEnvelope,A as WithHostAdapter,Qt as __namedExportsOrder,Ft as default};
