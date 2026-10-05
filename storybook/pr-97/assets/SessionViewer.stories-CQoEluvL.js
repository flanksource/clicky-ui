import{j as I}from"./iframe-DW9dAhLx.js";import{S as E}from"./SessionViewer-CoMzAqVn.js";import{S as p}from"./SessionViewer.fixtures-PqJX3fzL.js";import"./preload-helper-Bcd_tUTe.js";import"./index-DiWddUzE.js";import"./index-Cs0vdkxh.js";import"./utils-DW-IJACk.js";import"./Icon-DoAlPc9w.js";import"./button-CfAeUDeP.js";import"./index-CPURVhFy.js";import"./loading-Bax3wqdJ.js";import"./SessionViewer.model-zEchFOj6.js";import"./agent-action-icons-DM9F6DZl.js";import"./effort-icons-BQsgSs0V.js";import"./session-tones-BVWRqRHz.js";import"./CodeBlock-CjVUlwYp.js";import"./CodeDiff-CEMXqTRo.js";import"./SegmentedControl-CrfNu512.js";import"./HighlightedTokens-DH2GJFTr.js";import"./JsonView-B_IDkh71.js";import"./AccordionList-lICbzCbb.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-NamFkPhe.js";import"./string-Ye519DiV.js";import"./JsonSchemaForm-XMqyymLx.js";import"./DropdownMenu-CsIU3qeo.js";import"./floating-ui.react-FGKoCoTL.js";import"./DropdownMenuSubmenu-BadwR1Tm.js";import"./modalStack-D91MpMqq.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DYrk4NqW.js";import"./IconButton-BDUka6O0.js";import"./HoverCard-CHmcbby2.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-C6agGzel.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-Cg9Uya7g.js";import"./FilterPill-DCFbiDxg.js";import"./DateField-BUfkjBN_.js";import"./DatePicker-d8w_Bm-J.js";import"./DateTimePicker-B-wlRanM.js";import"./TreePickerField-Dn1-AQ6m.js";import"./Tree-CD_mN7D4.js";import"./TreeNode-9NrhBGqV.js";import"./InputField-CiZ8v9tc.js";import"./use-hotkey-D2H8Mc1z.js";import"./ListMenu-DvV973Bk.js";import"./Markdown-Dn8P8Ljn.js";import"./Callout-yh49Z4PH.js";import"./callout-tones-EFt49BYo.js";import"./tokens-5o2CVjOb.js";import"./MessageFilePart-C7Qjnhf_.js";import"./ContextMeter-BxPTBu8B.js";import"./runtime-mode-C8QhQhFi.js";const{expect:e,userEvent:u,within:i}=__STORYBOOK_MODULE_TEST__,dt={title:"AI/SessionViewer",component:E,tags:["autodocs"],parameters:{docs:{description:{component:'Renders a recorded AI coding-agent session (the captain `pkg/ai/history` JSON schema — Claude Code / Codex transcripts) as a vertical action log. Each entry sits on a tone-colored disc from the Flanksource "Agent Action Icons" set — file reads, edits, shell runs, sub-agent tasks, skills and MCP calls each read at a glance. Tool calls expand to their input and response; assistant prose and reasoning render inline. Pass parsed `SessionEntry[]` or raw log text (JSON array or JSONL) via `session`.'}}},argTypes:{defaultExpanded:{control:"boolean"},showThinking:{control:"boolean"},showHeader:{control:"boolean"},showMenu:{control:"boolean"},defaultDensity:{control:"inline-radio",options:[void 0,"compact","comfortable","spacious"]},session:{table:{disable:!0}},className:{table:{disable:!0}}},render:t=>I.jsx("div",{className:"max-w-2xl",children:I.jsx(E,{...t})})},ce={id:"question-session",source:"codex",provider:"codex",model:"gpt-5-codex",messages:[{id:"q-user",role:"user",parts:[{type:"text",text:"Generate the migration and ask before touching production settings."}]},{id:"q-ask",role:"assistant",parts:[{type:"dynamic-tool",toolName:"AskUserQuestion",state:"approval-requested",input:{questions:[{id:"scope",header:"Scope",question:"Which deployment scope should this migration target?",options:[{label:"Project",description:"Only the current workspace and test database."},{label:"Global",description:"Every configured workspace that uses this template."}]},{id:"checks",header:"Checks",question:"Which verification steps should run before applying it?",multiSelect:!0,options:["Typecheck","Unit tests","Preview SQL"]}]},approval:{id:"approval-question-1"}}],provenance:{timestamp:"2026-07-09T09:00:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}},{id:"q-answer",role:"assistant",parts:[{type:"dynamic-tool",toolName:"AskUserQuestion",state:"output-available",input:{questions:[{id:"scope",header:"Scope",question:"Which deployment scope should this migration target?",options:[{label:"Project",description:"Only the current workspace and test database."},{label:"Global",description:"Every configured workspace that uses this template."}]}]},output:`Scope: Project
Additional details: Run typecheck and preview SQL before applying.`,approval:{id:"approval-question-1",approved:!0}}],provenance:{timestamp:"2026-07-09T09:01:15Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}}],turns:[{id:"turn-1",index:1,messageIds:["q-user","q-ask","q-answer"]}],approvals:{approved:1}},pe={id:"approval-status-session",source:"codex",provider:"codex",model:"gpt-5-codex",messages:[{id:"a-user",role:"user",parts:[{type:"text",text:"Run the checks, but wait for approval before network or filesystem changes."}]},{id:"a-pending",role:"assistant",parts:[{type:"dynamic-tool",toolName:"Bash",state:"approval-requested",input:{command:"pnpm test -- --runInBand"},approval:{id:"approval-bash-1"}}],provenance:{timestamp:"2026-07-09T09:05:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}},{id:"a-approved",role:"assistant",parts:[{type:"dynamic-tool",toolName:"Bash",state:"output-available",input:{command:"pnpm test -- --runInBand"},output:"Tests: 42 passed",approval:{id:"approval-bash-1",approved:!0}}],provenance:{timestamp:"2026-07-09T09:06:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}},{id:"a-denied",role:"assistant",parts:[{type:"dynamic-tool",toolName:"WebFetch",state:"approval-responded",input:{url:"https://prod.example.com/config"},approval:{id:"approval-web-1",approved:!1,reason:"Use staging credentials first."}}],provenance:{timestamp:"2026-07-09T09:07:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}}],turns:[{id:"turn-1",index:1,messageIds:["a-user","a-pending","a-approved","a-denied"]}],approvals:{approved:1,denied:1,denials:[{toolUseId:"approval-web-1",tool:"WebFetch",reason:"Use staging credentials first."}]}},g={args:{session:p}},h={args:{session:p,defaultExpanded:!0}},w={args:{session:p,showThinking:!1}},y={args:{session:p,defaultDensity:"compact"}},x={parameters:{docs:{description:{story:"Enable **Show estimated tool cost** in the three-dot menu to see input, output, reasoning, cache usage and estimated dollars. Captain supplies `parts[].estimatedCost` as `{ cost, sharedCalls }`. Each model request includes conversation context and is shared equally across its tool calls; reading tool results belongs to later requests. Calls without usage data show Estimate unavailable. Estimates are hidden by default."}}},args:{session:{id:"estimated-tool-costs",messages:[{id:"priced-call",role:"assistant",parts:[{type:"dynamic-tool",toolName:"Read",toolCallId:"read-example",state:"output-available",input:{file_path:"example.go"},output:"package example",estimatedCost:{sharedCalls:2,cost:{inputTokens:1e3,outputTokens:20,reasoningTokens:5,cacheReadTokens:8e3,inputCost:.002,outputCost:2e-4,cacheReadCost:8e-4}}},{type:"dynamic-tool",toolName:"Bash",toolCallId:"unpriced-example",state:"output-available",input:{command:"pwd"},output:"/workspace"}]}]}}},T={args:{session:ce,defaultExpanded:!0},play:async({canvasElement:t,step:a})=>{const o=i(t),n="Which deployment scope should this migration target?",s=t.querySelectorAll('[data-event-kind="tool"]');await e(s).toHaveLength(2),await e(o.getAllByText(n)).toHaveLength(2);const m=s[0],l=s[1],r=i(m),c=i(l);await a("renders the pending question and options",async()=>{await e(r.getByText("Ask user")).toBeInTheDocument(),await e(r.getByText(n)).toBeInTheDocument(),await e(r.getByText("Project")).toBeInTheDocument(),await e(r.getByText("Only the current workspace and test database.")).toBeInTheDocument(),await e(r.getByText("Preview SQL")).toBeInTheDocument(),await e(r.getByText("Awaiting approval")).toBeInTheDocument()}),await a("renders the approved question history and answer",async()=>{await e(c.getByText("Ask user")).toBeInTheDocument(),await e(c.getByText(n)).toBeInTheDocument(),await e(c.getByText("Project")).toBeInTheDocument(),await e(c.getByText("Only the current workspace and test database.")).toBeInTheDocument(),await e(c.getByText("Approved")).toBeInTheDocument(),await e(l.textContent).toContain("Scope: Project"),await e(l.textContent).toContain("Run typecheck and preview SQL before applying.")})}},v={args:{session:[],showHeader:!1,pendingTools:[{tool:"AskUserQuestion",toolCallId:"ask-pending-1",input:ce.messages[1].parts[0].input}],onPendingToolDecision:async()=>{}},play:async({canvasElement:t})=>{const a=i(t);await e(a.getByRole("button",{name:"Send answer"})).toBeInTheDocument(),await e(a.getByRole("button",{name:"Reject"})).toBeInTheDocument(),await e(a.getAllByRole("radio")).toHaveLength(2),await e(a.getAllByRole("checkbox")).toHaveLength(3)}},B={args:{session:pe,defaultExpanded:!0},play:async({canvasElement:t,step:a})=>{const o=i(t);await a("shows pending, approved and denied tool rows",async()=>{await e(o.getByText("Awaiting approval")).toBeInTheDocument(),await e(o.getByText("Approved")).toBeInTheDocument(),await e(o.getByText("Denied: Use staging credentials first.")).toBeInTheDocument()}),await a("keeps the underlying request visible",async()=>{var n;await e((n=t.querySelector("ol"))==null?void 0:n.textContent).toContain("pnpm test -- --runInBand"),await e(o.getByText("https://prod.example.com/config")).toBeInTheDocument()})}},d={args:{session:p,defaultTheme:"dark",className:"max-w-2xl rounded-md p-4"},render:t=>I.jsx(E,{...t}),play:async({canvasElement:t})=>{const a=t.querySelector('[data-theme="dark"]');await e(getComputedStyle(a).backgroundColor).toBe("rgb(17, 24, 39)");const o=a.querySelector('[data-event-kind="assistant"] .text-foreground');await e(getComputedStyle(o).color).toBe("rgb(249, 250, 251)")}},S={args:{session:p},play:async({canvasElement:t,step:a})=>{const o=i(t),n=i(document.body);await a("user prompts are right-aligned",async()=>{const s=t.querySelector('[data-event-kind="user"]');await e(s).toBeTruthy(),await e(s).toHaveClass("justify-end")}),await a("the 3-dot menu overrides density and theme",async()=>{var r;await e(t.querySelector("[data-density]")).toBeNull(),await u.click(o.getByRole("button",{name:"Session options"})),await u.click(n.getByRole("menuitemradio",{name:"Compact"})),await e(t.querySelector('[data-density="compact"]')).toBeTruthy();const m=(r=[...t.querySelectorAll("ol > li")].find(c=>{var b;return(b=c.textContent)==null?void 0:b.includes("Timeline.tsx")}))==null?void 0:r.querySelector("span.rounded-full"),l=getComputedStyle(m).backgroundColor;await u.click(n.getByRole("menuitemradio",{name:"Dark"})),await e(t.querySelector('[data-theme="dark"]')).toBeTruthy(),await e(getComputedStyle(m).backgroundColor).not.toBe(l)}),await a("hiding the Explore category removes its rows",async()=>{const s=t.querySelector("ol");await e(i(s).getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument(),await u.click(n.getByRole("menuitemcheckbox",{name:"Explore"})),await e(i(s).queryByText("packages/ui/src/data/Timeline.tsx")).not.toBeInTheDocument(),await e(s.textContent).toContain("pnpm --filter @flanksource/clicky-ui test SessionViewer")})}},k={args:{session:p},play:async({canvasElement:t,step:a})=>{const o=i(t);await a("agent actions render inline without label prefixes",async()=>{var n;await e(o.getByText("iconify: search icons")).toBeInTheDocument(),await e(o.queryByText("Read file")).not.toBeInTheDocument(),await e(o.getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument(),await e(o.queryByText("Run command")).not.toBeInTheDocument(),await e((n=t.querySelector("ol"))==null?void 0:n.textContent).toContain("pnpm --filter @flanksource/clicky-ui test SessionViewer")}),await a("expanding a shell call reveals its response",async()=>{await e(o.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument(),await u.click(o.getByRole("button",{name:"Toggle response"})),await e(o.getByText(/Tests: 8 passed/)).toBeInTheDocument()}),await a("the terminal API error is surfaced",async()=>{await e(o.getByText("rate_limit (HTTP 429)")).toBeInTheDocument()})}};var f,C,R;g.parameters={...g.parameters,docs:{...(f=g.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION
  }
}`,...(R=(C=g.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var D,q,A;h.parameters={...h.parameters,docs:{...(D=h.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    defaultExpanded: true
  }
}`,...(A=(q=h.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};var N,P,O;w.parameters={...w.parameters,docs:{...(N=w.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    showThinking: false
  }
}`,...(O=(P=w.parameters)==null?void 0:P.docs)==null?void 0:O.source}}};var L,_,M;y.parameters={...y.parameters,docs:{...(L=y.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    defaultDensity: "compact"
  }
}`,...(M=(_=y.parameters)==null?void 0:_.docs)==null?void 0:M.source}}};var H,j,U;x.parameters={...x.parameters,docs:{...(H=x.parameters)==null?void 0:H.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Enable **Show estimated tool cost** in the three-dot menu to see input, output, reasoning, cache usage and estimated dollars. Captain supplies \`parts[].estimatedCost\` as \`{ cost, sharedCalls }\`. Each model request includes conversation context and is shared equally across its tool calls; reading tool results belongs to later requests. Calls without usage data show Estimate unavailable. Estimates are hidden by default."
      }
    }
  },
  args: {
    session: {
      id: "estimated-tool-costs",
      messages: [{
        id: "priced-call",
        role: "assistant",
        parts: [{
          type: "dynamic-tool",
          toolName: "Read",
          toolCallId: "read-example",
          state: "output-available",
          input: {
            file_path: "example.go"
          },
          output: "package example",
          estimatedCost: {
            sharedCalls: 2,
            cost: {
              inputTokens: 1000,
              outputTokens: 20,
              reasoningTokens: 5,
              cacheReadTokens: 8000,
              inputCost: 0.002,
              outputCost: 0.0002,
              cacheReadCost: 0.0008
            }
          }
        }, {
          type: "dynamic-tool",
          toolName: "Bash",
          toolCallId: "unpriced-example",
          state: "output-available",
          input: {
            command: "pwd"
          },
          output: "/workspace"
        }]
      }]
    } satisfies UnifiedSessionInput
  }
}`,...(U=(j=x.parameters)==null?void 0:j.docs)==null?void 0:U.source}}};var Q,W,V;T.parameters={...T.parameters,docs:{...(Q=T.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    session: QUESTION_SESSION,
    defaultExpanded: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const question = "Which deployment scope should this migration target?";
    const toolRows = canvasElement.querySelectorAll<HTMLElement>('[data-event-kind="tool"]');
    await expect(toolRows).toHaveLength(2);
    await expect(canvas.getAllByText(question)).toHaveLength(2);
    const pendingRowElement = toolRows[0]!;
    const completedRowElement = toolRows[1]!;
    const pendingRow = within(pendingRowElement);
    const completedRow = within(completedRowElement);
    await step("renders the pending question and options", async () => {
      await expect(pendingRow.getByText("Ask user")).toBeInTheDocument();
      await expect(pendingRow.getByText(question)).toBeInTheDocument();
      await expect(pendingRow.getByText("Project")).toBeInTheDocument();
      await expect(pendingRow.getByText("Only the current workspace and test database.")).toBeInTheDocument();
      await expect(pendingRow.getByText("Preview SQL")).toBeInTheDocument();
      await expect(pendingRow.getByText("Awaiting approval")).toBeInTheDocument();
    });
    await step("renders the approved question history and answer", async () => {
      await expect(completedRow.getByText("Ask user")).toBeInTheDocument();
      await expect(completedRow.getByText(question)).toBeInTheDocument();
      await expect(completedRow.getByText("Project")).toBeInTheDocument();
      await expect(completedRow.getByText("Only the current workspace and test database.")).toBeInTheDocument();
      await expect(completedRow.getByText("Approved")).toBeInTheDocument();
      await expect(completedRowElement.textContent).toContain("Scope: Project");
      await expect(completedRowElement.textContent).toContain("Run typecheck and preview SQL before applying.");
    });
  }
}`,...(V=(W=T.parameters)==null?void 0:W.docs)==null?void 0:V.source}}};var F,Z,G;v.parameters={...v.parameters,docs:{...(F=v.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    session: [],
    showHeader: false,
    pendingTools: [{
      tool: "AskUserQuestion",
      toolCallId: "ask-pending-1",
      input: (QUESTION_SESSION.messages[1].parts[0] as {
        input: Record<string, unknown>;
      }).input
    }],
    onPendingToolDecision: async () => {}
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", {
      name: "Send answer"
    })).toBeInTheDocument();
    await expect(canvas.getByRole("button", {
      name: "Reject"
    })).toBeInTheDocument();
    await expect(canvas.getAllByRole("radio")).toHaveLength(2);
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(3);
  }
}`,...(G=(Z=v.parameters)==null?void 0:Z.docs)==null?void 0:G.source}}};var J,K,Y;B.parameters={...B.parameters,docs:{...(J=B.parameters)==null?void 0:J.docs,source:{originalSource:`{
  args: {
    session: APPROVAL_STATUS_SESSION,
    defaultExpanded: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("shows pending, approved and denied tool rows", async () => {
      await expect(canvas.getByText("Awaiting approval")).toBeInTheDocument();
      await expect(canvas.getByText("Approved")).toBeInTheDocument();
      await expect(canvas.getByText("Denied: Use staging credentials first.")).toBeInTheDocument();
    });
    await step("keeps the underlying request visible", async () => {
      await expect(canvasElement.querySelector("ol")?.textContent).toContain("pnpm test -- --runInBand");
      await expect(canvas.getByText("https://prod.example.com/config")).toBeInTheDocument();
    });
  }
}`,...(Y=(K=B.parameters)==null?void 0:K.docs)==null?void 0:Y.source}}};var z,X,$,ee,te;d.parameters={...d.parameters,docs:{...(z=d.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    defaultTheme: "dark",
    className: "max-w-2xl rounded-md p-4"
  },
  render: args => <SessionViewer {...args} />,
  play: async ({
    canvasElement
  }) => {
    const viewer = canvasElement.querySelector('[data-theme="dark"]') as HTMLElement;
    await expect(getComputedStyle(viewer).backgroundColor).toBe("rgb(17, 24, 39)");
    const assistantMessage = viewer.querySelector('[data-event-kind="assistant"] .text-foreground') as HTMLElement;
    await expect(getComputedStyle(assistantMessage).color).toBe("rgb(249, 250, 251)");
  }
}`,...($=(X=d.parameters)==null?void 0:X.docs)==null?void 0:$.source},description:{story:'A self-contained dark override: paints `data-theme="dark"` on its own root\n (which also carries the background) regardless of the surrounding page theme.',...(te=(ee=d.parameters)==null?void 0:ee.docs)==null?void 0:te.description}}};var ae,oe,ne;S.parameters={...S.parameters,docs:{...(ae=S.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    // The 3-dot menu portals to document.body, so query it from there.
    const menu = within(document.body);
    await step("user prompts are right-aligned", async () => {
      const userRow = canvasElement.querySelector('[data-event-kind="user"]');
      await expect(userRow).toBeTruthy();
      await expect(userRow).toHaveClass("justify-end");
    });
    await step("the 3-dot menu overrides density and theme", async () => {
      await expect(canvasElement.querySelector("[data-density]")).toBeNull();
      await userEvent.click(canvas.getByRole("button", {
        name: "Session options"
      }));
      await userEvent.click(menu.getByRole("menuitemradio", {
        name: "Compact"
      }));
      await expect(canvasElement.querySelector('[data-density="compact"]')).toBeTruthy();

      // The Read row's tone disc must actually repaint dark (not just flip the
      // data-theme attribute) — guards the \`dark:\`-vs-\`[data-theme]\` regression.
      const rows = [...canvasElement.querySelectorAll("ol > li")];
      const readDisc = rows.find(li => li.textContent?.includes("Timeline.tsx"))?.querySelector("span.rounded-full") as HTMLElement;
      const lightBg = getComputedStyle(readDisc).backgroundColor;
      await userEvent.click(menu.getByRole("menuitemradio", {
        name: "Dark"
      }));
      await expect(canvasElement.querySelector('[data-theme="dark"]')).toBeTruthy();
      await expect(getComputedStyle(readDisc).backgroundColor).not.toBe(lightBg);
    });
    await step("hiding the Explore category removes its rows", async () => {
      const list = canvasElement.querySelector("ol") as HTMLElement;
      await expect(within(list).getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument();
      await userEvent.click(menu.getByRole("menuitemcheckbox", {
        name: "Explore"
      }));
      await expect(within(list).queryByText("packages/ui/src/data/Timeline.tsx")).not.toBeInTheDocument();
      // The shell row survives; its command is shiki-highlighted (split across
      // token spans), so match on textContent rather than a single element.
      await expect(list.textContent).toContain("pnpm --filter @flanksource/clicky-ui test SessionViewer");
    });
  }
}`,...(ne=(oe=S.parameters)==null?void 0:oe.docs)==null?void 0:ne.source}}};var se,ie,re;k.parameters={...k.parameters,docs:{...(se=k.parameters)==null?void 0:se.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("agent actions render inline without label prefixes", async () => {
      await expect(canvas.getByText("iconify: search icons")).toBeInTheDocument();
      // File rows show the cwd-relative path, shell rows the bare command.
      await expect(canvas.queryByText("Read file")).not.toBeInTheDocument();
      await expect(canvas.getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument();
      await expect(canvas.queryByText("Run command")).not.toBeInTheDocument();
      // The command is shiki-highlighted into token spans — assert on textContent.
      await expect(canvasElement.querySelector("ol")?.textContent).toContain("pnpm --filter @flanksource/clicky-ui test SessionViewer");
    });
    await step("expanding a shell call reveals its response", async () => {
      await expect(canvas.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", {
        name: "Toggle response"
      }));
      await expect(canvas.getByText(/Tests: 8 passed/)).toBeInTheDocument();
    });
    await step("the terminal API error is surfaced", async () => {
      await expect(canvas.getByText("rate_limit (HTTP 429)")).toBeInTheDocument();
    });
  }
}`,...(re=(ie=k.parameters)==null?void 0:ie.docs)==null?void 0:re.source}}};const ut=["Default","Expanded","WithoutReasoning","CompactDensity","EstimatedToolCosts","AskUserQuestion","PendingQuestionControls","ApprovalStatuses","DarkThemed","MenuFiltersAndAlignment","InteractsWithActions"];export{B as ApprovalStatuses,T as AskUserQuestion,y as CompactDensity,d as DarkThemed,g as Default,x as EstimatedToolCosts,h as Expanded,k as InteractsWithActions,S as MenuFiltersAndAlignment,v as PendingQuestionControls,w as WithoutReasoning,ut as __namedExportsOrder,dt as default};
