import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./SessionViewer-DxoEQD9c.js";import{n as i,r as a}from"./SessionViewer.fixtures-CirnqNbw.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{n(),a(),o=t(),{expect:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`AI/SessionViewer`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:'Renders a recorded AI coding-agent session (the captain `pkg/ai/history` JSON schema — Claude Code / Codex transcripts) as a vertical action log. Each entry sits on a tone-colored disc from the Flanksource "Agent Action Icons" set — file reads, edits, shell runs, sub-agent tasks, skills and MCP calls each read at a glance. Tool calls expand to their input and response; assistant prose and reasoning render inline. Pass parsed `SessionEntry[]` or raw log text (JSON array or JSONL) via `session`.'}}},argTypes:{defaultExpanded:{control:`boolean`},showThinking:{control:`boolean`},showHeader:{control:`boolean`},showMenu:{control:`boolean`},defaultDensity:{control:`inline-radio`,options:[void 0,`compact`,`comfortable`,`spacious`]},session:{table:{disable:!0}},className:{table:{disable:!0}}},render:e=>(0,o.jsx)(`div`,{className:`max-w-2xl`,children:(0,o.jsx)(r,{...e})})},d={id:`question-session`,source:`codex`,provider:`codex`,model:`gpt-5-codex`,messages:[{id:`q-user`,role:`user`,parts:[{type:`text`,text:`Generate the migration and ask before touching production settings.`}]},{id:`q-ask`,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:`AskUserQuestion`,state:`approval-requested`,input:{questions:[{id:`scope`,header:`Scope`,question:`Which deployment scope should this migration target?`,options:[{label:`Project`,description:`Only the current workspace and test database.`},{label:`Global`,description:`Every configured workspace that uses this template.`}]},{id:`checks`,header:`Checks`,question:`Which verification steps should run before applying it?`,multiSelect:!0,options:[`Typecheck`,`Unit tests`,`Preview SQL`]}]},approval:{id:`approval-question-1`}}],provenance:{timestamp:`2026-07-09T09:00:00Z`,cwd:`/repo`,model:`gpt-5-codex`,source:`codex`}},{id:`q-answer`,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:`AskUserQuestion`,state:`output-available`,input:{questions:[{id:`scope`,header:`Scope`,question:`Which deployment scope should this migration target?`,options:[{label:`Project`,description:`Only the current workspace and test database.`},{label:`Global`,description:`Every configured workspace that uses this template.`}]}]},output:`Scope: Project
Additional details: Run typecheck and preview SQL before applying.`,approval:{id:`approval-question-1`,approved:!0}}],provenance:{timestamp:`2026-07-09T09:01:15Z`,cwd:`/repo`,model:`gpt-5-codex`,source:`codex`}}],turns:[{id:`turn-1`,index:1,messageIds:[`q-user`,`q-ask`,`q-answer`]}],approvals:{approved:1}},f={id:`approval-status-session`,source:`codex`,provider:`codex`,model:`gpt-5-codex`,messages:[{id:`a-user`,role:`user`,parts:[{type:`text`,text:`Run the checks, but wait for approval before network or filesystem changes.`}]},{id:`a-pending`,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:`Bash`,state:`approval-requested`,input:{command:`pnpm test -- --runInBand`},approval:{id:`approval-bash-1`}}],provenance:{timestamp:`2026-07-09T09:05:00Z`,cwd:`/repo`,model:`gpt-5-codex`,source:`codex`}},{id:`a-approved`,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:`Bash`,state:`output-available`,input:{command:`pnpm test -- --runInBand`},output:`Tests: 42 passed`,approval:{id:`approval-bash-1`,approved:!0}}],provenance:{timestamp:`2026-07-09T09:06:00Z`,cwd:`/repo`,model:`gpt-5-codex`,source:`codex`}},{id:`a-denied`,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:`WebFetch`,state:`approval-responded`,input:{url:`https://prod.example.com/config`},approval:{id:`approval-web-1`,approved:!1,reason:`Use staging credentials first.`}}],provenance:{timestamp:`2026-07-09T09:07:00Z`,cwd:`/repo`,model:`gpt-5-codex`,source:`codex`}}],turns:[{id:`turn-1`,index:1,messageIds:[`a-user`,`a-pending`,`a-approved`,`a-denied`]}],approvals:{approved:1,denied:1,denials:[{toolUseId:`approval-web-1`,tool:`WebFetch`,reason:`Use staging credentials first.`}]}},p={args:{session:i}},m={args:{session:i,defaultExpanded:!0}},h={args:{session:i,showThinking:!1}},g={args:{session:i,defaultDensity:`compact`}},_={parameters:{docs:{description:{story:"Enable **Show estimated tool cost** in the three-dot menu to see input, output, reasoning, cache usage and estimated dollars. Captain supplies `parts[].estimatedCost` as `{ cost, sharedCalls }`. Each model request includes conversation context and is shared equally across its tool calls; reading tool results belongs to later requests. Calls without usage data show Estimate unavailable. Estimates are hidden by default."}}},args:{session:{id:`estimated-tool-costs`,messages:[{id:`priced-call`,role:`assistant`,parts:[{type:`dynamic-tool`,toolName:`Read`,toolCallId:`read-example`,state:`output-available`,input:{file_path:`example.go`},output:`package example`,estimatedCost:{sharedCalls:2,cost:{inputTokens:1e3,outputTokens:20,reasoningTokens:5,cacheReadTokens:8e3,inputCost:.002,outputCost:2e-4,cacheReadCost:8e-4}}},{type:`dynamic-tool`,toolName:`Bash`,toolCallId:`unpriced-example`,state:`output-available`,input:{command:`pwd`},output:`/workspace`}]}]}}},v={args:{session:d,defaultExpanded:!0},play:async({canvasElement:e,step:t})=>{let n=l(e),r=`Which deployment scope should this migration target?`,i=e.querySelectorAll(`[data-event-kind="tool"]`);await s(i).toHaveLength(2),await s(n.getAllByText(r)).toHaveLength(2);let a=i[0],o=i[1],c=l(a),u=l(o);await t(`renders the pending question and options`,async()=>{await s(c.getByText(`Ask user`)).toBeInTheDocument(),await s(c.getByText(r)).toBeInTheDocument(),await s(c.getByText(`Project`)).toBeInTheDocument(),await s(c.getByText(`Only the current workspace and test database.`)).toBeInTheDocument(),await s(c.getByText(`Preview SQL`)).toBeInTheDocument(),await s(c.getByText(`Awaiting approval`)).toBeInTheDocument()}),await t(`renders the approved question history and answer`,async()=>{await s(u.getByText(`Ask user`)).toBeInTheDocument(),await s(u.getByText(r)).toBeInTheDocument(),await s(u.getByText(`Project`)).toBeInTheDocument(),await s(u.getByText(`Only the current workspace and test database.`)).toBeInTheDocument(),await s(u.getByText(`Approved`)).toBeInTheDocument(),await s(o.textContent).toContain(`Scope: Project`),await s(o.textContent).toContain(`Run typecheck and preview SQL before applying.`)})}},y={args:{session:[],showHeader:!1,pendingTools:[{tool:`AskUserQuestion`,toolCallId:`ask-pending-1`,input:d.messages[1].parts[0].input}],onPendingToolDecision:async()=>{}},play:async({canvasElement:e})=>{let t=l(e);await s(t.getByRole(`button`,{name:`Send answer`})).toBeInTheDocument(),await s(t.getByRole(`button`,{name:`Reject`})).toBeInTheDocument(),await s(t.getAllByRole(`radio`)).toHaveLength(2),await s(t.getAllByRole(`checkbox`)).toHaveLength(3)}},b={args:{session:f,defaultExpanded:!0},play:async({canvasElement:e,step:t})=>{let n=l(e);await t(`shows pending, approved and denied tool rows`,async()=>{await s(n.getByText(`Awaiting approval`)).toBeInTheDocument(),await s(n.getByText(`Approved`)).toBeInTheDocument(),await s(n.getByText(`Denied: Use staging credentials first.`)).toBeInTheDocument()}),await t(`keeps the underlying request visible`,async()=>{await s(e.querySelector(`ol`)?.textContent).toContain(`pnpm test -- --runInBand`),await s(n.getAllByText(`https://prod.example.com/config`)).toHaveLength(2)})}},x={args:{session:i,defaultTheme:`dark`,className:`max-w-2xl rounded-md p-4`},render:e=>(0,o.jsx)(r,{...e}),play:async({canvasElement:e})=>{let t=e.querySelector(`[data-theme="dark"]`);await s(getComputedStyle(t).backgroundColor).toBe(`rgb(17, 24, 39)`);let n=t.querySelector(`[data-event-kind="assistant"] .text-foreground`);await s(getComputedStyle(n).color).toBe(`rgb(249, 250, 251)`)}},S={args:{session:i},play:async({canvasElement:e,step:t})=>{let n=l(e),r=l(document.body);await t(`user prompts are right-aligned`,async()=>{let t=e.querySelector(`[data-event-kind="user"]`);await s(t).toBeTruthy(),await s(t).toHaveClass(`justify-end`)}),await t(`the 3-dot menu overrides density and theme`,async()=>{await s(e.querySelector(`[data-density]`)).toBeNull(),await c.click(n.getByRole(`button`,{name:`Session options`})),await c.click(r.getByRole(`menuitemradio`,{name:`Compact`})),await s(e.querySelector(`[data-density="compact"]`)).toBeTruthy();let t=[...e.querySelectorAll(`ol > li`)].find(e=>e.textContent?.includes(`Timeline.tsx`))?.querySelector(`span.rounded-full`),i=getComputedStyle(t).backgroundColor;await c.click(r.getByRole(`menuitemradio`,{name:`Dark`})),await s(e.querySelector(`[data-theme="dark"]`)).toBeTruthy(),await s(getComputedStyle(t).backgroundColor).not.toBe(i)}),await t(`hiding the Explore category removes its rows`,async()=>{let t=e.querySelector(`ol`);await s(l(t).getByText(`packages/ui/src/data/Timeline.tsx`)).toBeInTheDocument(),await c.click(r.getByRole(`menuitemcheckbox`,{name:`Explore`})),await s(l(t).queryByText(`packages/ui/src/data/Timeline.tsx`)).not.toBeInTheDocument(),await s(t.textContent).toContain(`pnpm --filter @flanksource/clicky-ui test SessionViewer`)})}},C={args:{session:i},play:async({canvasElement:e,step:t})=>{let n=l(e);await t(`agent actions render inline without label prefixes`,async()=>{await s(n.getByText(`iconify: search icons`)).toBeInTheDocument(),await s(n.queryByText(`Read file`)).not.toBeInTheDocument(),await s(n.getByText(`packages/ui/src/data/Timeline.tsx`)).toBeInTheDocument(),await s(n.queryByText(`Run command`)).not.toBeInTheDocument(),await s(e.querySelector(`ol`)?.textContent).toContain(`pnpm --filter @flanksource/clicky-ui test SessionViewer`)}),await t(`expanding a shell call reveals its response`,async()=>{await s(n.queryByText(/Tests: 8 passed/)).not.toBeInTheDocument(),await c.click(n.getByRole(`button`,{name:`Toggle response`})),await s(n.getByText(/Tests: 8 passed/)).toBeInTheDocument()}),await t(`the terminal API error is surfaced`,async()=>{await s(n.getByText(`rate_limit (HTTP 429)`)).toBeInTheDocument()})}},w=[`Default`,`Expanded`,`WithoutReasoning`,`CompactDensity`,`EstimatedToolCosts`,`AskUserQuestion`,`PendingQuestionControls`,`ApprovalStatuses`,`DarkThemed`,`MenuFiltersAndAlignment`,`InteractsWithActions`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    defaultExpanded: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    showThinking: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    session: SAMPLE_SESSION,
    defaultDensity: "compact"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
      // Once as the header's inline param, once in the expanded request body.
      await expect(canvas.getAllByText("https://prod.example.com/config")).toHaveLength(2);
    });
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source},description:{story:'A self-contained dark override: paints `data-theme="dark"` on its own root\n (which also carries the background) regardless of the surrounding page theme.',...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}}})))()}T();export{b as ApprovalStatuses,v as AskUserQuestion,g as CompactDensity,x as DarkThemed,p as Default,_ as EstimatedToolCosts,m as Expanded,C as InteractsWithActions,S as MenuFiltersAndAlignment,y as PendingQuestionControls,h as WithoutReasoning,w as __namedExportsOrder,u as default};