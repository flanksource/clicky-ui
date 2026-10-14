import{j as T}from"./iframe-4S_rqkhx.js";import{S as ge}from"./SessionInspector.approvals-BgU9eMrw.js";import{S as x}from"./SessionViewer-AlTAaidt.js";import"./preload-helper-BZq7nIkI.js";import"./KeyValueList-CK26N2OH.js";import"./utils-DW-IJACk.js";import"./Icon-D5QCb7Dz.js";import"./ToolCall-BzIAOzl9.js";import"./button-BpUyE0O_.js";import"./index-CPURVhFy.js";import"./loading-1HgYxxJ4.js";import"./types-DnFuV5L5.js";import"./CodeBlock-BpNlfi-N.js";import"./CodeDiff-DNi4VGZD.js";import"./SegmentedControl-DocL_txn.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BkGLTY6_.js";import"./JsonView-DSVWInHq.js";import"./AccordionList-DmoCt6PE.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-D9TRIDLv.js";import"./DataTable-5ziinbLW.js";import"./SortableHeader-DcKCVZpp.js";import"./router-COrMSiXX.js";import"./Modal-D6s3gqO4.js";import"./index-Cvd_Abow.js";import"./index-BMI4_Cei.js";import"./modalStack-C75NiPFe.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dp77h1kI.js";import"./floating-ui.react-OaSgb022.js";import"./FilterPill-DIfiwld4.js";import"./filter-bar-multi-5qNdCbbr.js";import"./Combobox-B0ZmjhD8.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DN47MwkR.js";import"./MultiSelect-49R8ZV-3.js";import"./RangeSlider-DlTQImZt.js";import"./TimeRange-m0Eg84ef.js";import"./select-D1G4I_RS.js";import"./WorkloadPicker-BLB9-4rF.js";import"./NamespacePicker-DxTH5Z-F.js";import"./index-CbBMnxt9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DlSYHCht.js";import"./TagList-36ZLgV9Y.js";import"./HoverCard-CZLnR6uk.js";import"./Properties-CYkb1cQz.js";import"./IconButton-4hlHCpTR.js";import"./DropdownMenu-uwjLYJFW.js";import"./DropdownMenuSubmenu-1Z9V4LyC.js";import"./format-2niohfpq.js";import"./StatusDot-BLfk0qn0.js";import"./runtime-mode-x_8OBwhN.js";import"./SessionViewer.model-2dWoqJb_.js";import"./agent-action-icons-DjGnKtUQ.js";import"./effort-icons-yUY6dvur.js";import"./session-tones-BVWRqRHz.js";import"./session-categories-D3sZFy-M.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-DmdeUQ_o.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./DateField-BvNkqxlq.js";import"./DatePicker-BbAa6mCn.js";import"./TreePickerField-Zm--n607.js";import"./Tree-6e4PruJA.js";import"./TreeNode-CQh0qeFF.js";import"./InputField-BLPzKh9o.js";import"./use-hotkey-BIPwMSF7.js";import"./ListMenu-BUyM01vE.js";import"./Markdown-CvI16UAM.js";import"./Callout-CFBCbpqP.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-CBllkj8G.js";import"./ContextMeter-jMQ6ntCk.js";const{expect:t,fn:me,userEvent:i,within:o}=__STORYBOOK_MODULE_TEST__;function s(e){return{tool:e.tool,...e.toolUseId?{toolCallId:e.toolUseId}:{},approvalId:`approval-${e.kind}`,kind:e.kind,request:e,...e.input?{input:e.input}:{}}}const he={tool:"Bash",input:{command:"gavel pr status 85 2>&1 | tail -60",dangerouslyDisableSandbox:!0},toolUseId:"toolu_01Bash",kind:"command",escalates:!0,interruptible:!0,supportedScopes:["request"],command:{command:"gavel pr status 85 2>&1 | tail -60",unsandboxed:!0}},ve={tool:"exec_command",toolUseId:"appr_rebase",kind:"command",reason:"May I continue the active rebase, which must update Git metadata in the parent repository's .git directory outside this worktree?",escalates:!0,interruptible:!0,supportedScopes:["request","session"],command:{command:"GIT_EDITOR=true git rebase --continue",cwd:"/repo/.shell/worktrees/gavel-pr-110-fix",proposedPolicy:["git","rebase"]}},ye={tool:"apply_patch",toolUseId:"item_patch",kind:"filesystem",escalates:!0,interruptible:!0,supportedScopes:["request","session"],filesystem:{operation:"patch",paths:["/repo/facet/src/components/ListTable.tsx"],changes:[{path:"/repo/facet/src/components/ListTable.tsx",kind:"delete"}]}},we={tool:"Edit",toolUseId:"toolu_01Edit",kind:"filesystem",interruptible:!0,supportedScopes:["request"],filesystem:{operation:"edit",paths:["/repo/pkg/api/permission_capabilities.go"]}},be={tool:"exec_command",toolUseId:"appr_network",kind:"network",escalates:!0,interruptible:!0,supportedScopes:["request","session"],network:{host:"api.github.com",protocol:"https",command:"./.bin/gavel serve flanksource/gavel --addr 127.0.0.1 --port 9092 --status"}},de={tool:"request_permissions",toolUseId:"item_permissions",kind:"permissions",reason:"Rebase must update Git metadata in the parent repository's .git directory",escalates:!0,interruptible:!1,supportedScopes:["turn","session"],permissions:{filesystem:{writableRoots:["/repo/gavel/.git"]},network:{access:"unrestricted"}}},Te={tool:"AskUserQuestion",toolUseId:"item_question",kind:"question",interruptible:!1,questions:[{id:"data_model",context:"Data Model",text:"How should the new rate-table model relate to the existing `forex_rates` table?",options:["Generic Plus Bridge (Recommended)","Replace Forex","Forex Separate"],optionDescriptions:{"Replace Forex":"Migrate forex rows into the generic table and drop forex_rates."}},{id:"rate_inputs",context:"Rate Inputs",text:"What should be the primary v1 source for generated rate tables?"}]},ue={tool:"Elicitation",toolUseId:"elicit:1",kind:"elicitation",interruptible:!0,elicitation:{server:"github",mode:"form",message:"Which repository should the issue be filed in?",schema:{type:"object",properties:{repo:{type:"string",title:"Repository",enum:["flanksource/captain","flanksource/gavel"]},labels:{type:"string",title:"Labels"}},required:["repo"]}}},xe={tool:"Elicitation",toolUseId:"elicit:2",kind:"elicitation",interruptible:!0,elicitation:{server:"linear",mode:"url",message:"Authorize access to your workspace",url:"https://linear.example/oauth/authorize?state=el_1",elicitationId:"el_1"}},Be={tool:"mcp__playwright__browser_tabs",input:{action:"close",index:0},toolUseId:"toolu_tabs",kind:"tool",interruptible:!0},Ee={tool:"ExitPlanMode",toolUseId:"toolu_plan",kind:"plan",interruptible:!0,supportedScopes:["request"],input:{plan:`## Phase 1: plan approvals

- Add \`ApprovalKindPlan\` with the plan as its payload
- Map Claude's \`ExitPlanMode\` and the cmux plan dialog

## Phase 2: consumers

- Render the plan and offer **Approve plan** / **Keep planning**`,planFilePath:"/repo/.claude/plans/unified-approval-callback.md"},plan:{content:`## Phase 1: plan approvals

- Add \`ApprovalKindPlan\` with the plan as its payload
- Map Claude's \`ExitPlanMode\` and the cmux plan dialog

## Phase 2: consumers

- Render the plan and offer **Approve plan** / **Keep planning**`,path:"/repo/.claude/plans/unified-approval-callback.md"}},Jn={title:"AI/SessionViewer/Approvals",component:x,tags:["autodocs"],parameters:{docs:{description:{component:"Pending approvals rendered by kind. A `SessionPendingTool` with a typed `request` shows what is being asked for (command, paths, host, grants, form) and only the actions that request allows: Cancel when `interruptible`, a scope choice for each entry of `supportedScopes`, per-entry subset selection for permission grants, and a JSON-schema form for form-mode elicitation. A pending tool with no `kind`/`request` renders as before."}}},argTypes:{session:{table:{disable:!0}}},args:{session:[],showHeader:!1,onPendingToolDecision:me()},render:e=>T.jsx("div",{className:"max-w-2xl",children:T.jsx(x,{...e})})},l={args:{pendingTools:[{tool:"Bash",toolCallId:"toolu_old",input:{command:"npm test"}}]},play:async({canvasElement:e})=>{const n=o(e);await t(n.getByRole("button",{name:"Allow"})).toBeInTheDocument(),await t(n.queryByRole("button",{name:"Cancel"})).not.toBeInTheDocument(),await t(n.queryByLabelText("Approval scope")).not.toBeInTheDocument()}},c={args:{pendingTools:[s(Be)]},play:async({canvasElement:e,args:n})=>{const a=o(e);await i.click(a.getByRole("button",{name:"Cancel"})),await t(n.onPendingToolDecision).toHaveBeenCalledWith(t.objectContaining({allow:!1,interrupt:!0}))}},m={args:{pendingTools:[s(he)]},play:async({canvasElement:e})=>{const n=o(e);await t(n.getByText("Unsandboxed")).toBeInTheDocument(),await t(n.getByText("Escalates sandbox")).toBeInTheDocument(),await t(n.queryByLabelText("Approval scope")).not.toBeInTheDocument()}},d={args:{pendingTools:[s(ve)]},play:async({canvasElement:e,args:n})=>{const a=o(e);await i.selectOptions(a.getByLabelText("Approval scope"),"session"),await i.click(a.getByRole("button",{name:"Allow"})),await t(n.onPendingToolDecision).toHaveBeenCalledWith(t.objectContaining({allow:!0,scope:"session"}))}},u={args:{pendingTools:[s(ye)]},play:async({canvasElement:e})=>{const n=o(e);await t(n.getByText("patch")).toBeInTheDocument(),await t(n.getByText("delete")).toBeInTheDocument()}},g={args:{pendingTools:[s(we)]}},h={args:{pendingTools:[s(be)]},play:async({canvasElement:e})=>{await t(o(e).getByText("api.github.com")).toBeInTheDocument()}},v={args:{pendingTools:[s(de)]},play:async({canvasElement:e,args:n})=>{const a=o(e);await i.click(a.getByLabelText("Network access: unrestricted")),await i.selectOptions(a.getByLabelText("Approval scope"),"turn"),await i.click(a.getByRole("button",{name:"Allow selected"})),await t(n.onPendingToolDecision).toHaveBeenCalledWith(t.objectContaining({allow:!0,scope:"turn",grants:{filesystem:{writableRoots:["/repo/gavel/.git"]}}}))}},y={args:{pendingTools:[s(Te)]},play:async({canvasElement:e})=>{const n=o(e);await t(n.getByRole("button",{name:"Send answer"})).toBeDisabled(),await t(n.queryByRole("button",{name:"Cancel"})).not.toBeInTheDocument()}},w={args:{pendingTools:[s(ue)]},play:async({canvasElement:e})=>{const n=o(e);await t(n.getByRole("button",{name:"Submit"})).toBeDisabled(),await t(n.getByRole("button",{name:"Decline"})).toBeInTheDocument(),await t(n.getByRole("button",{name:"Cancel"})).toBeInTheDocument()}},b={args:{pendingTools:[s(xe)]},play:async({canvasElement:e,args:n})=>{const a=o(e);await t(a.getByRole("link")).toHaveAttribute("href","https://linear.example/oauth/authorize?state=el_1"),await i.click(a.getByRole("button",{name:"Done"})),await t(n.onPendingToolDecision).toHaveBeenCalledWith(t.objectContaining({allow:!0}))}},r={args:{pendingTools:[s(Ee)]},play:async({canvasElement:e,args:n})=>{const a=o(e);await i.type(a.getByRole("textbox",{name:"Plan feedback"}),"Split phase 2"),await i.click(a.getByRole("button",{name:/Send feedback/})),await t(n.onPendingToolDecision).toHaveBeenCalledWith(t.objectContaining({allow:!1,message:"Split phase 2"}))}},p={render:()=>T.jsx("div",{className:"max-w-2xl",children:T.jsx(ge,{approvals:void 0,onResolve:me(),requests:[{id:"a1",kind:"tool_approval",state:"pending",tool:"request_permissions",request:de},{id:"a2",kind:"tool_approval",state:"pending",tool:"Elicitation",request:ue}]})})};var B,E,_;l.parameters={...l.parameters,docs:{...(B=l.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    pendingTools: [{
      tool: "Bash",
      toolCallId: "toolu_old",
      input: {
        command: "npm test"
      }
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Allow"
    })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", {
      name: "Cancel"
    })).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText("Approval scope")).not.toBeInTheDocument();
  }
}`,...(_=(E=l.parameters)==null?void 0:E.docs)==null?void 0:_.source}}};var S,C,D;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CONNECTOR_TOOL)]
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: "Cancel"
    }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(expect.objectContaining({
      allow: false,
      interrupt: true
    }));
  }
}`,...(D=(C=c.parameters)==null?void 0:C.docs)==null?void 0:D.source}}};var I,k,R;m.parameters={...m.parameters,docs:{...(I=m.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CLAUDE_BASH_ESCAPE)]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Unsandboxed")).toBeInTheDocument();
    await expect(canvas.getByText("Escalates sandbox")).toBeInTheDocument();
    await expect(canvas.queryByLabelText("Approval scope")).not.toBeInTheDocument();
  }
}`,...(R=(k=m.parameters)==null?void 0:k.docs)==null?void 0:R.source}}};var f,A,P;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CODEX_REBASE)]
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("Approval scope"), "session");
    await userEvent.click(canvas.getByRole("button", {
      name: "Allow"
    }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(expect.objectContaining({
      allow: true,
      scope: "session"
    }));
  }
}`,...(P=(A=d.parameters)==null?void 0:A.docs)==null?void 0:P.source}}};var O,U,q;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CODEX_PATCH)]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("patch")).toBeInTheDocument();
    await expect(canvas.getByText("delete")).toBeInTheDocument();
  }
}`,...(q=(U=u.parameters)==null?void 0:U.docs)==null?void 0:q.source}}};var L,M,N;g.parameters={...g.parameters,docs:{...(L=g.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CLAUDE_EDIT)]
  }
}`,...(N=(M=g.parameters)==null?void 0:M.docs)==null?void 0:N.source}}};var H,W,j;h.parameters={...h.parameters,docs:{...(H=h.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CODEX_NETWORK)]
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("api.github.com")).toBeInTheDocument();
  }
}`,...(j=(W=h.parameters)==null?void 0:W.docs)==null?void 0:j.source}}};var F,X,K;v.parameters={...v.parameters,docs:{...(F=v.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CODEX_PERMISSIONS)]
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("Network access: unrestricted"));
    await userEvent.selectOptions(canvas.getByLabelText("Approval scope"), "turn");
    await userEvent.click(canvas.getByRole("button", {
      name: "Allow selected"
    }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(expect.objectContaining({
      allow: true,
      scope: "turn",
      grants: {
        filesystem: {
          writableRoots: ["/repo/gavel/.git"]
        }
      }
    }));
  }
}`,...(K=(X=v.parameters)==null?void 0:X.docs)==null?void 0:K.source}}};var Q,z,G;y.parameters={...y.parameters,docs:{...(Q=y.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CODEX_QUESTION)]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Send answer"
    })).toBeDisabled();
    await expect(canvas.queryByRole("button", {
      name: "Cancel"
    })).not.toBeInTheDocument();
  }
}`,...(G=(z=y.parameters)==null?void 0:z.docs)==null?void 0:G.source}}};var V,J,Y;w.parameters={...w.parameters,docs:{...(V=w.parameters)==null?void 0:V.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(MCP_FORM)]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Submit"
    })).toBeDisabled();
    await expect(canvas.getByRole("button", {
      name: "Decline"
    })).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Cancel"
    })).toBeInTheDocument();
  }
}`,...(Y=(J=w.parameters)==null?void 0:J.docs)==null?void 0:Y.source}}};var $,Z,ee;b.parameters={...b.parameters,docs:{...($=b.parameters)==null?void 0:$.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(MCP_URL)]
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toHaveAttribute("href", "https://linear.example/oauth/authorize?state=el_1");
    await userEvent.click(canvas.getByRole("button", {
      name: "Done"
    }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(expect.objectContaining({
      allow: true
    }));
  }
}`,...(ee=(Z=b.parameters)==null?void 0:Z.docs)==null?void 0:ee.source}}};var ne,te,ae,oe,se;r.parameters={...r.parameters,docs:{...(ne=r.parameters)==null?void 0:ne.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(PLAN_EXIT)]
  },
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole("textbox", {
      name: "Plan feedback"
    }), "Split phase 2");
    await userEvent.click(canvas.getByRole("button", {
      name: /Send feedback/
    }));
    await expect(args.onPendingToolDecision).toHaveBeenCalledWith(expect.objectContaining({
      allow: false,
      message: "Split phase 2"
    }));
  }
}`,...(ae=(te=r.parameters)==null?void 0:te.docs)==null?void 0:ae.source},description:{story:`ExitPlanMode outside a plan-only run: the plan, then Approve plan, Keep
 planning, or Send feedback (a deny whose message the agent plans against).`,...(se=(oe=r.parameters)==null?void 0:oe.docs)==null?void 0:se.description}}};var ie,re,pe,le,ce;p.parameters={...p.parameters,docs:{...(ie=p.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  render: () => <div className="max-w-2xl">
      <SessionApprovalsPanel approvals={undefined} onResolve={fn()} requests={[{
      id: "a1",
      kind: "tool_approval",
      state: "pending",
      tool: "request_permissions",
      request: CODEX_PERMISSIONS
    }, {
      id: "a2",
      kind: "tool_approval",
      state: "pending",
      tool: "Elicitation",
      request: MCP_FORM
    }]} />
    </div>
}`,...(pe=(re=p.parameters)==null?void 0:re.docs)==null?void 0:pe.source},description:{story:"The Inspector's Approvals tab draws the same per-kind controls from\n `session.requests[].request`, and resolves through `onResolve`.",...(ce=(le=p.parameters)==null?void 0:le.docs)==null?void 0:ce.description}}};const Yn=["UntypedTool","ToolWithCancel","CommandSandboxEscape","CommandWithSessionScope","FilesystemPatch","FilesystemEdit","NetworkAccess","PermissionsSubset","Question","ElicitationForm","ElicitationUrl","PlanApproval","InspectorApprovalsTab"];export{m as CommandSandboxEscape,d as CommandWithSessionScope,w as ElicitationForm,b as ElicitationUrl,g as FilesystemEdit,u as FilesystemPatch,p as InspectorApprovalsTab,h as NetworkAccess,v as PermissionsSubset,r as PlanApproval,y as Question,c as ToolWithCancel,l as UntypedTool,Yn as __namedExportsOrder,Jn as default};
