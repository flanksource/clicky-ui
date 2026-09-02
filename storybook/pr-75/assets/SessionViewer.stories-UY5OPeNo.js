import{j as k}from"./iframe-RmXz6z0S.js";import{S as p,a as I}from"./SessionViewer.fixtures-DLZYETPI.js";import"./preload-helper-CoNDIDFR.js";import"./index-Dcplh2pp.js";import"./index-B9HoHPg8.js";import"./utils-DW-IJACk.js";import"./Icon-C5PBASJ5.js";import"./SessionViewer.model-jh5LGdk1.js";import"./session-tones-DB12P3hm.js";import"./CodeBlock-CoJJ2mS1.js";import"./CodeDiff-7vCxYKi_.js";import"./SegmentedControl-BZ9aJu3d.js";import"./HighlightedTokens-COG8Yyzj.js";import"./JsonView-oLDEacYi.js";import"./agent-action-icons-DUtzoiLa.js";import"./effort-icons-KgfipxKB.js";import"./button-CGTHhixy.js";import"./index-CPURVhFy.js";import"./loading-BitfFYjk.js";import"./string-CyHXGyw7.js";import"./Markdown-BKVR_OEB.js";import"./Callout-C3WLbUMD.js";import"./callout-tones-DN7X2Ehz.js";import"./ContextMeter-CbktG9nH.js";import"./tokens-5o2CVjOb.js";import"./HoverCard-DfO4Rl00.js";import"./modalStack-BrOZVbb2.js";import"./zIndex-BGbNBNA8.js";import"./DropdownMenu-CnJq5_O0.js";import"./floating-ui.react-CS_5YbfH.js";import"./DropdownMenuSubmenu-_lJsyYNk.js";const{expect:e,userEvent:u,within:r}=__STORYBOOK_MODULE_TEST__,_e={title:"AI/SessionViewer",component:I,tags:["autodocs"],parameters:{docs:{description:{component:'Renders a recorded AI coding-agent session (the captain `pkg/ai/history` JSON schema — Claude Code / Codex transcripts) as a vertical action log. Each entry sits on a tone-colored disc from the Flanksource "Agent Action Icons" set — file reads, edits, shell runs, sub-agent tasks, skills and MCP calls each read at a glance. Tool calls expand to their input and response; assistant prose and reasoning render inline. Pass parsed `SessionEntry[]` or raw log text (JSON array or JSONL) via `session`.'}}},argTypes:{defaultExpanded:{control:"boolean"},showThinking:{control:"boolean"},showHeader:{control:"boolean"},showMenu:{control:"boolean"},defaultDensity:{control:"inline-radio",options:[void 0,"compact","comfortable","spacious"]},session:{table:{disable:!0}},className:{table:{disable:!0}}},render:t=>k.jsx("div",{className:"max-w-2xl",children:k.jsx(I,{...t})})},oe={id:"question-session",source:"codex",provider:"codex",model:"gpt-5-codex",messages:[{id:"q-user",role:"user",parts:[{type:"text",text:"Generate the migration and ask before touching production settings."}]},{id:"q-ask",role:"assistant",parts:[{type:"dynamic-tool",toolName:"AskUserQuestion",state:"approval-requested",input:{questions:[{id:"scope",header:"Scope",question:"Which deployment scope should this migration target?",options:[{label:"Project",description:"Only the current workspace and test database."},{label:"Global",description:"Every configured workspace that uses this template."}]},{id:"checks",header:"Checks",question:"Which verification steps should run before applying it?",multiSelect:!0,options:["Typecheck","Unit tests","Preview SQL"]}]},approval:{id:"approval-question-1"}}],provenance:{timestamp:"2026-07-09T09:00:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}},{id:"q-answer",role:"assistant",parts:[{type:"dynamic-tool",toolName:"AskUserQuestion",state:"output-available",input:{questions:[{id:"scope",header:"Scope",question:"Which deployment scope should this migration target?",options:[{label:"Project",description:"Only the current workspace and test database."},{label:"Global",description:"Every configured workspace that uses this template."}]}]},output:`Scope: Project
Additional details: Run typecheck and preview SQL before applying.`,approval:{id:"approval-question-1",approved:!0}}],provenance:{timestamp:"2026-07-09T09:01:15Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}}],turns:[{id:"turn-1",index:1,messageIds:["q-user","q-ask","q-answer"]}],approvals:{approved:1}},se={id:"approval-status-session",source:"codex",provider:"codex",model:"gpt-5-codex",messages:[{id:"a-user",role:"user",parts:[{type:"text",text:"Run the checks, but wait for approval before network or filesystem changes."}]},{id:"a-pending",role:"assistant",parts:[{type:"dynamic-tool",toolName:"Bash",state:"approval-requested",input:{command:"pnpm test -- --runInBand"},approval:{id:"approval-bash-1"}}],provenance:{timestamp:"2026-07-09T09:05:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}},{id:"a-approved",role:"assistant",parts:[{type:"dynamic-tool",toolName:"Bash",state:"output-available",input:{command:"pnpm test -- --runInBand"},output:"Tests: 42 passed",approval:{id:"approval-bash-1",approved:!0}}],provenance:{timestamp:"2026-07-09T09:06:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}},{id:"a-denied",role:"assistant",parts:[{type:"dynamic-tool",toolName:"WebFetch",state:"approval-responded",input:{url:"https://prod.example.com/config"},approval:{id:"approval-web-1",approved:!1,reason:"Use staging credentials first."}}],provenance:{timestamp:"2026-07-09T09:07:00Z",cwd:"/repo",model:"gpt-5-codex",source:"codex"}}],turns:[{id:"turn-1",index:1,messageIds:["a-user","a-pending","a-approved","a-denied"]}],approvals:{approved:1,denied:1,denials:[{toolUseId:"approval-web-1",tool:"WebFetch",reason:"Use staging credentials first."}]}},g={args:{session:p}},w={args:{session:p,defaultExpanded:!0}},y={args:{session:p,showThinking:!1}},h={args:{session:p,defaultDensity:"compact"}},x={args:{session:oe,defaultExpanded:!0},play:async({canvasElement:t,step:a})=>{const n=r(t),o="Which deployment scope should this migration target?",s=t.querySelectorAll('[data-event-kind="tool"]');await e(s).toHaveLength(2),await e(n.getAllByText(o)).toHaveLength(2);const m=s[0],l=s[1],i=r(m),c=r(l);await a("renders the pending question and options",async()=>{await e(i.getByText("Ask user")).toBeInTheDocument(),await e(i.getByText(o)).toBeInTheDocument(),await e(i.getByText("Project")).toBeInTheDocument(),await e(i.getByText("Only the current workspace and test database.")).toBeInTheDocument(),await e(i.getByText("Preview SQL")).toBeInTheDocument(),await e(i.getByText("Awaiting approval")).toBeInTheDocument()}),await a("renders the approved question history and answer",async()=>{await e(c.getByText("Ask user")).toBeInTheDocument(),await e(c.getByText(o)).toBeInTheDocument(),await e(c.getByText("Project")).toBeInTheDocument(),await e(c.getByText("Only the current workspace and test database.")).toBeInTheDocument(),await e(c.getByText("Approved")).toBeInTheDocument(),await e(l.textContent).toContain("Scope: Project"),await e(l.textContent).toContain("Run typecheck and preview SQL before applying.")})}},T={args:{session:[],showHeader:!1,pendingTools:[{tool:"AskUserQuestion",toolCallId:"ask-pending-1",input:oe.messages[1].parts[0].input}],onPendingToolDecision:async()=>{}},play:async({canvasElement:t})=>{const a=r(t);await e(a.getByRole("button",{name:"Send answer"})).toBeInTheDocument(),await e(a.getByRole("button",{name:"Reject"})).toBeInTheDocument(),await e(a.getAllByRole("radio")).toHaveLength(2),await e(a.getAllByRole("checkbox")).toHaveLength(3)}},B={args:{session:se,defaultExpanded:!0},play:async({canvasElement:t,step:a})=>{const n=r(t);await a("shows pending, approved and denied tool rows",async()=>{await e(n.getByText("Awaiting approval")).toBeInTheDocument(),await e(n.getByText("Approved")).toBeInTheDocument(),await e(n.getByText("Denied: Use staging credentials first.")).toBeInTheDocument()}),await a("keeps the underlying request visible",async()=>{var o;await e((o=t.querySelector("ol"))==null?void 0:o.textContent).toContain("pnpm test -- --runInBand"),await e(n.getByText("https://prod.example.com/config")).toBeInTheDocument()})}},d={args:{session:p,defaultTheme:"dark",className:"max-w-2xl rounded-md p-4"},render:t=>k.jsx(I,{...t}),play:async({canvasElement:t})=>{const a=t.querySelector('[data-theme="dark"]');await e(getComputedStyle(a).backgroundColor).toBe("rgb(17, 24, 39)");const n=a.querySelector('[data-event-kind="assistant"] .text-foreground');await e(getComputedStyle(n).color).toBe("rgb(249, 250, 251)")}},v={args:{session:p},play:async({canvasElement:t,step:a})=>{const n=r(t),o=r(document.body);await a("user prompts are right-aligned",async()=>{const s=t.querySelector('[data-event-kind="user"]');await e(s).toBeTruthy(),await e(s).toHaveClass("justify-end")}),await a("the 3-dot menu overrides density and theme",async()=>{var i;await e(t.querySelector("[data-density]")).toBeNull(),await u.click(n.getByRole("button",{name:"Session options"})),await u.click(o.getByRole("menuitemradio",{name:"Compact"})),await e(t.querySelector('[data-density="compact"]')).toBeTruthy();const m=(i=[...t.querySelectorAll("ol > li")].find(c=>{var E;return(E=c.textContent)==null?void 0:E.includes("Timeline.tsx")}))==null?void 0:i.querySelector("span.rounded-full"),l=getComputedStyle(m).backgroundColor;await u.click(o.getByRole("menuitemradio",{name:"Dark"})),await e(t.querySelector('[data-theme="dark"]')).toBeTruthy(),await e(getComputedStyle(m).backgroundColor).not.toBe(l)}),await a("hiding the Explore category removes its rows",async()=>{const s=t.querySelector("ol");await e(r(s).getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument(),await u.click(o.getByRole("menuitemcheckbox",{name:"Explore"})),await e(r(s).queryByText("packages/ui/src/data/Timeline.tsx")).not.toBeInTheDocument(),await e(s.textContent).toContain("pnpm --filter @flanksource/clicky-ui test SessionViewer")})}},S={args:{session:p},play:async({canvasElement:t,step:a})=>{const n=r(t);await a("agent actions render inline without label prefixes",async()=>{var o;await e(n.getByText("iconify: search icons")).toBeInTheDocument(),await e(n.queryByText("Read file")).not.toBeInTheDocument(),await e(n.getByText("packages/ui/src/data/Timeline.tsx")).toBeInTheDocument(),await e(n.queryByText("Run command")).not.toBeInTheDocument(),await e((o=t.querySelector("ol"))==null?void 0:o.textContent).toContain("pnpm --filter @flanksource/clicky-ui test SessionViewer")}),await a("expanding a shell call reveals its response",async()=>{await e(n.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument(),await u.click(n.getByRole("button",{name:"Toggle response"})),await e(n.getByText(/Tests: 8 passed/)).toBeInTheDocument()}),await a("the terminal API error is surfaced",async()=>{await e(n.getByText("rate_limit (HTTP 429)")).toBeInTheDocument()})}};var D,f,b;g.parameters={...g.parameters,docs:{...(D=g.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION
  }
}`,...(b=(f=g.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var R,q,A;w.parameters={...w.parameters,docs:{...(R=w.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    defaultExpanded: true
  }
}`,...(A=(q=w.parameters)==null?void 0:q.docs)==null?void 0:A.source}}};var C,P,O;y.parameters={...y.parameters,docs:{...(C=y.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    showThinking: false
  }
}`,...(O=(P=y.parameters)==null?void 0:P.docs)==null?void 0:O.source}}};var L,N,_;h.parameters={...h.parameters,docs:{...(L=h.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    defaultDensity: "compact"
  }
}`,...(_=(N=h.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};var M,H,j;x.parameters={...x.parameters,docs:{...(M=x.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(j=(H=x.parameters)==null?void 0:H.docs)==null?void 0:j.source}}};var U,Q,W;T.parameters={...T.parameters,docs:{...(U=T.parameters)==null?void 0:U.docs,source:{originalSource:`{
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
}`,...(W=(Q=T.parameters)==null?void 0:Q.docs)==null?void 0:W.source}}};var V,F,Z;B.parameters={...B.parameters,docs:{...(V=B.parameters)==null?void 0:V.docs,source:{originalSource:`{
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
}`,...(Z=(F=B.parameters)==null?void 0:F.docs)==null?void 0:Z.source}}};var G,J,K,Y,z;d.parameters={...d.parameters,docs:{...(G=d.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(K=(J=d.parameters)==null?void 0:J.docs)==null?void 0:K.source},description:{story:'A self-contained dark override: paints `data-theme="dark"` on its own root\n (which also carries the background) regardless of the surrounding page theme.',...(z=(Y=d.parameters)==null?void 0:Y.docs)==null?void 0:z.description}}};var X,$,ee;v.parameters={...v.parameters,docs:{...(X=v.parameters)==null?void 0:X.docs,source:{originalSource:`{
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
}`,...(ee=($=v.parameters)==null?void 0:$.docs)==null?void 0:ee.source}}};var te,ae,ne;S.parameters={...S.parameters,docs:{...(te=S.parameters)==null?void 0:te.docs,source:{originalSource:`{
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
}`,...(ne=(ae=S.parameters)==null?void 0:ae.docs)==null?void 0:ne.source}}};const Me=["Default","Expanded","WithoutReasoning","CompactDensity","AskUserQuestion","PendingQuestionControls","ApprovalStatuses","DarkThemed","MenuFiltersAndAlignment","InteractsWithActions"];export{B as ApprovalStatuses,x as AskUserQuestion,h as CompactDensity,d as DarkThemed,g as Default,w as Expanded,S as InteractsWithActions,v as MenuFiltersAndAlignment,T as PendingQuestionControls,y as WithoutReasoning,Me as __namedExportsOrder,_e as default};
