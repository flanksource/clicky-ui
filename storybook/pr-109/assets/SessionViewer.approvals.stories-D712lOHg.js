import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./SessionViewer-DbU5SHHV.js";import{n as i,t as a}from"./SessionInspector.approvals-D-rmGT9W.js";function o(e){return{tool:e.tool,...e.toolUseId?{toolCallId:e.toolUseId}:{},approvalId:`approval-${e.kind}`,kind:e.kind,request:e,...e.input?{input:e.input}:{}}}var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{i(),n(),s=t(),{expect:c,fn:l,userEvent:u,within:d}=__STORYBOOK_MODULE_TEST__,f={tool:`Bash`,input:{command:`gavel pr status 85 2>&1 | tail -60`,dangerouslyDisableSandbox:!0},toolUseId:`toolu_01Bash`,kind:`command`,escalates:!0,interruptible:!0,supportedScopes:[`request`],command:{command:`gavel pr status 85 2>&1 | tail -60`,unsandboxed:!0}},p={tool:`exec_command`,toolUseId:`appr_rebase`,kind:`command`,reason:`May I continue the active rebase, which must update Git metadata in the parent repository's .git directory outside this worktree?`,escalates:!0,interruptible:!0,supportedScopes:[`request`,`session`],command:{command:`GIT_EDITOR=true git rebase --continue`,cwd:`/repo/.shell/worktrees/gavel-pr-110-fix`,proposedPolicy:[`git`,`rebase`]}},m={tool:`apply_patch`,toolUseId:`item_patch`,kind:`filesystem`,escalates:!0,interruptible:!0,supportedScopes:[`request`,`session`],filesystem:{operation:`patch`,paths:[`/repo/facet/src/components/ListTable.tsx`],changes:[{path:`/repo/facet/src/components/ListTable.tsx`,kind:`delete`}]}},h={tool:`Edit`,toolUseId:`toolu_01Edit`,kind:`filesystem`,interruptible:!0,supportedScopes:[`request`],filesystem:{operation:`edit`,paths:[`/repo/pkg/api/permission_capabilities.go`]}},g={tool:`exec_command`,toolUseId:`appr_network`,kind:`network`,escalates:!0,interruptible:!0,supportedScopes:[`request`,`session`],network:{host:`api.github.com`,protocol:`https`,command:`./.bin/gavel serve flanksource/gavel --addr 127.0.0.1 --port 9092 --status`}},_={tool:`request_permissions`,toolUseId:`item_permissions`,kind:`permissions`,reason:`Rebase must update Git metadata in the parent repository's .git directory`,escalates:!0,interruptible:!1,supportedScopes:[`turn`,`session`],permissions:{filesystem:{writableRoots:[`/repo/gavel/.git`]},network:{access:`unrestricted`}}},v={tool:`AskUserQuestion`,toolUseId:`item_question`,kind:`question`,interruptible:!1,questions:[{id:`data_model`,context:`Data Model`,text:"How should the new rate-table model relate to the existing `forex_rates` table?",options:[`Generic Plus Bridge (Recommended)`,`Replace Forex`,`Forex Separate`],optionDescriptions:{"Replace Forex":`Migrate forex rows into the generic table and drop forex_rates.`}},{id:`rate_inputs`,context:`Rate Inputs`,text:`What should be the primary v1 source for generated rate tables?`}]},y={tool:`Elicitation`,toolUseId:`elicit:1`,kind:`elicitation`,interruptible:!0,elicitation:{server:`github`,mode:`form`,message:`Which repository should the issue be filed in?`,schema:{type:`object`,properties:{repo:{type:`string`,title:`Repository`,enum:[`flanksource/captain`,`flanksource/gavel`]},labels:{type:`string`,title:`Labels`}},required:[`repo`]}}},b={tool:`Elicitation`,toolUseId:`elicit:2`,kind:`elicitation`,interruptible:!0,elicitation:{server:`linear`,mode:`url`,message:`Authorize access to your workspace`,url:`https://linear.example/oauth/authorize?state=el_1`,elicitationId:`el_1`}},x={tool:`mcp__playwright__browser_tabs`,input:{action:`close`,index:0},toolUseId:`toolu_tabs`,kind:`tool`,interruptible:!0},S={tool:`ExitPlanMode`,toolUseId:`toolu_plan`,kind:`plan`,interruptible:!0,supportedScopes:[`request`],input:{plan:`## Phase 1: plan approvals

- Add \`ApprovalKindPlan\` with the plan as its payload
- Map Claude's \`ExitPlanMode\` and the cmux plan dialog

## Phase 2: consumers

- Render the plan and offer **Approve plan** / **Keep planning**`,planFilePath:`/repo/.claude/plans/unified-approval-callback.md`},plan:{content:`## Phase 1: plan approvals

- Add \`ApprovalKindPlan\` with the plan as its payload
- Map Claude's \`ExitPlanMode\` and the cmux plan dialog

## Phase 2: consumers

- Render the plan and offer **Approve plan** / **Keep planning**`,path:`/repo/.claude/plans/unified-approval-callback.md`}},C={title:`AI/SessionViewer/Approvals`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Pending approvals rendered by kind. A `SessionPendingTool` with a typed `request` shows what is being asked for (command, paths, host, grants, form) and only the actions that request allows: Cancel when `interruptible`, a scope choice for each entry of `supportedScopes`, per-entry subset selection for permission grants, and a JSON-schema form for form-mode elicitation. A pending tool with no `kind`/`request` renders as before."}}},argTypes:{session:{table:{disable:!0}}},args:{session:[],showHeader:!1,onPendingToolDecision:l()},render:e=>(0,s.jsx)(`div`,{className:`max-w-2xl`,children:(0,s.jsx)(r,{...e})})},w={args:{pendingTools:[{tool:`Bash`,toolCallId:`toolu_old`,input:{command:`npm test`}}]},play:async({canvasElement:e})=>{let t=d(e);await c(t.getByRole(`button`,{name:`Allow`})).toBeInTheDocument(),await c(t.queryByRole(`button`,{name:`Cancel`})).not.toBeInTheDocument(),await c(t.queryByLabelText(`Approval scope`)).not.toBeInTheDocument()}},T={args:{pendingTools:[o(x)]},play:async({canvasElement:e,args:t})=>{let n=d(e);await u.click(n.getByRole(`button`,{name:`Cancel`})),await c(t.onPendingToolDecision).toHaveBeenCalledWith(c.objectContaining({allow:!1,interrupt:!0}))}},E={args:{pendingTools:[o(f)]},play:async({canvasElement:e})=>{let t=d(e);await c(t.getByText(`Unsandboxed`)).toBeInTheDocument(),await c(t.getByText(`Escalates sandbox`)).toBeInTheDocument(),await c(t.queryByLabelText(`Approval scope`)).not.toBeInTheDocument()}},D={args:{pendingTools:[o(p)]},play:async({canvasElement:e,args:t})=>{let n=d(e);await u.selectOptions(n.getByLabelText(`Approval scope`),`session`),await u.click(n.getByRole(`button`,{name:`Allow`})),await c(t.onPendingToolDecision).toHaveBeenCalledWith(c.objectContaining({allow:!0,scope:`session`}))}},O={args:{pendingTools:[o(m)]},play:async({canvasElement:e})=>{let t=d(e);await c(t.getByText(`patch`)).toBeInTheDocument(),await c(t.getByText(`delete`)).toBeInTheDocument()}},k={args:{pendingTools:[o(h)]}},A={args:{pendingTools:[o(g)]},play:async({canvasElement:e})=>{await c(d(e).getByText(`api.github.com`)).toBeInTheDocument()}},j={args:{pendingTools:[o(_)]},play:async({canvasElement:e,args:t})=>{let n=d(e);await u.click(n.getByLabelText(`Network access: unrestricted`)),await u.selectOptions(n.getByLabelText(`Approval scope`),`turn`),await u.click(n.getByRole(`button`,{name:`Allow selected`})),await c(t.onPendingToolDecision).toHaveBeenCalledWith(c.objectContaining({allow:!0,scope:`turn`,grants:{filesystem:{writableRoots:[`/repo/gavel/.git`]}}}))}},M={args:{pendingTools:[o(v)]},play:async({canvasElement:e})=>{let t=d(e);await c(t.getByRole(`button`,{name:`Send answer`})).toBeDisabled(),await c(t.queryByRole(`button`,{name:`Cancel`})).not.toBeInTheDocument()}},N={args:{pendingTools:[o(y)]},play:async({canvasElement:e})=>{let t=d(e);await c(t.getByRole(`button`,{name:`Submit`})).toBeDisabled(),await c(t.getByRole(`button`,{name:`Decline`})).toBeInTheDocument(),await c(t.getByRole(`button`,{name:`Cancel`})).toBeInTheDocument()}},P={args:{pendingTools:[o(b)]},play:async({canvasElement:e,args:t})=>{let n=d(e);await c(n.getByRole(`link`)).toHaveAttribute(`href`,`https://linear.example/oauth/authorize?state=el_1`),await u.click(n.getByRole(`button`,{name:`Done`})),await c(t.onPendingToolDecision).toHaveBeenCalledWith(c.objectContaining({allow:!0}))}},F={args:{pendingTools:[o(S)]},play:async({canvasElement:e,args:t})=>{let n=d(e);await u.type(n.getByRole(`textbox`,{name:`Plan feedback`}),`Split phase 2`),await u.click(n.getByRole(`button`,{name:/Send feedback/})),await c(t.onPendingToolDecision).toHaveBeenCalledWith(c.objectContaining({allow:!1,message:`Split phase 2`}))}},I={render:()=>(0,s.jsx)(`div`,{className:`max-w-2xl`,children:(0,s.jsx)(a,{approvals:void 0,onResolve:l(),requests:[{id:`a1`,kind:`tool_approval`,state:`pending`,tool:`request_permissions`,request:_},{id:`a2`,kind:`tool_approval`,state:`pending`,tool:`Elicitation`,request:y}]})})},L=[`UntypedTool`,`ToolWithCancel`,`CommandSandboxEscape`,`CommandWithSessionScope`,`FilesystemPatch`,`FilesystemEdit`,`NetworkAccess`,`PermissionsSubset`,`Question`,`ElicitationForm`,`ElicitationUrl`,`PlanApproval`,`InspectorApprovalsTab`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CLAUDE_EDIT)]
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    pendingTools: [pending(CODEX_NETWORK)]
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("api.github.com")).toBeInTheDocument();
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
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
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
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
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`ExitPlanMode outside a plan-only run: the plan, then Approve plan, Keep
 planning, or Send feedback (a deny whose message the agent plans against).`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:"The Inspector's Approvals tab draws the same per-kind controls from\n `session.requests[].request`, and resolves through `onResolve`.",...I.parameters?.docs?.description}}}})))()}R();export{E as CommandSandboxEscape,D as CommandWithSessionScope,N as ElicitationForm,P as ElicitationUrl,k as FilesystemEdit,O as FilesystemPatch,I as InspectorApprovalsTab,A as NetworkAccess,j as PermissionsSubset,F as PlanApproval,M as Question,T as ToolWithCancel,w as UntypedTool,L as __namedExportsOrder,C as default};