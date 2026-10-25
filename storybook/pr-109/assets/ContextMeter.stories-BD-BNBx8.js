import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,r}from"./iframe-Dg1Ec6oM.js";import{n as i,t as a}from"./ContextMeter-C7WQy7lF.js";var o,s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{i(),n(),o=t(),{expect:s,userEvent:c,waitFor:l,within:u}=__STORYBOOK_MODULE_TEST__,d={title:`Chat/ContextMeter`,component:a,tags:[`autodocs`],parameters:{docs:{description:{component:'The unified context-window meter. `mode="bar"` (SessionViewer header) and `mode="gauge"` (chat toolbar) share one hover popover: model, copyable session id, execution mode, context-window breakdown, per-bucket token usage and cost + budget. Domain-agnostic — callers feed plain values.'}}},argTypes:{mode:{control:`inline-radio`,options:[`bar`,`gauge`]},usedPercent:{control:{type:`range`,min:0,max:100,step:1}}},render:e=>(0,o.jsx)(`div`,{className:`flex min-h-56 items-start justify-center p-10`,children:(0,o.jsx)(a,{...e})})},f={usedPercent:74,usedTokens:148e3,windowTokens:2e5,messageCount:32,sessionId:`session-01JZQX7TXAXQM0RHD7XCGBF8F0`,provider:`anthropic`,executionMode:`cmux`,model:`anthropic/claude-opus-4-8`,modelIcon:r(`anthropic`),effort:`high`,tokens:{input:12e4,output:18e3,reasoning:6e3,cacheRead:4e4,cacheWrite:4e3,total:188e3},cost:{input:.36,output:.54,reasoning:.18,cacheRead:.12,cacheWrite:.04,total:1.24},budget:{used:1.24,total:5,remaining:3.76}},p={args:{mode:`bar`,...f},play:async({canvasElement:e})=>{let t=u(e);await c.hover(t.getByLabelText(`Context 74% used`));let n=u(await u(document.body).findByRole(`tooltip`));await s(t.getByTitle(`anthropic/claude-opus-4-8`)).toHaveTextContent(`opus-4.8`),await s(n.getByText(`anthropic/claude-opus-4-8`)).toBeInTheDocument(),await s(n.getByText(`High effort`)).toBeInTheDocument(),await s(n.getByText(`cmux`)).toBeInTheDocument(),await s(n.getByRole(`button`,{name:`Copy session ID`})).toBeInTheDocument(),await s(n.getByText(`Output`)).toBeInTheDocument(),await s(n.getByText(`18k`)).toBeInTheDocument(),await s(n.getByText(`$0.54`)).toBeInTheDocument(),await s(n.getByText(`$1.24 / $5.00`)).toBeInTheDocument()}},m={args:{mode:`gauge`,...f},play:async({canvasElement:e})=>{let t=u(e);await c.hover(t.getByLabelText(`Context 74% used`));let n=u(document.body);await l(()=>s(n.getByText(`Tokens`)).toBeInTheDocument()),await s(n.getByText(`Messages`)).toBeInTheDocument()}},h={args:{mode:`bar`,...f},render:e=>(0,o.jsx)(`div`,{className:`@container flex w-80 justify-end p-4`,children:(0,o.jsx)(a,{...e})})},g={args:{mode:`gauge`,usedPercent:42,usedTokens:84e3,windowTokens:2e5,messageCount:12,model:`gpt-5-codex`,modelIcon:r(`openai`),cost:{total:.42}}},_={args:{mode:`bar`,...f,usedPercent:97}},v=[`Bar`,`Gauge`,`NarrowBar`,`ChatGaugeMinimal`,`Critical`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByLabelText("Context 74% used"));
    // Scoped to the card rather than the body: the bar trigger already names
    // the model, so waiting on body text would resolve while the card is still
    // inside its open delay — and would then match the trigger twice over.
    const card = within(await within(document.body).findByRole("tooltip"));
    await expect(canvas.getByTitle("anthropic/claude-opus-4-8")).toHaveTextContent("opus-4.8");
    await expect(card.getByText("anthropic/claude-opus-4-8")).toBeInTheDocument();
    await expect(card.getByText("High effort")).toBeInTheDocument();
    await expect(card.getByText("cmux")).toBeInTheDocument();
    await expect(card.getByRole("button", {
      name: "Copy session ID"
    })).toBeInTheDocument();
    // Tokens + Cost merged into one table: the Output bucket shows both cells.
    await expect(card.getByText("Output")).toBeInTheDocument();
    await expect(card.getByText("18k")).toBeInTheDocument();
    await expect(card.getByText("$0.54")).toBeInTheDocument();
    await expect(card.getByText("$1.24 / $5.00")).toBeInTheDocument();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    mode: "gauge",
    ...RICH
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByLabelText("Context 74% used"));
    const body = within(document.body);
    await waitFor(() => expect(body.getByText("Tokens")).toBeInTheDocument());
    await expect(body.getByText("Messages")).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH
  },
  render: args => <div className="@container flex w-80 justify-end p-4">
      <ContextMeter {...args} />
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    mode: "gauge",
    usedPercent: 42,
    usedTokens: 84_000,
    windowTokens: 200_000,
    messageCount: 12,
    model: "gpt-5-codex",
    modelIcon: providerIcon("openai"),
    cost: {
      total: 0.42
    }
  }
}`,...g.parameters?.docs?.source},description:{story:`Chat only knows a single total cost — the popover shows just the total.`,...g.parameters?.docs?.description}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH,
    usedPercent: 97
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{p as Bar,g as ChatGaugeMinimal,_ as Critical,m as Gauge,h as NarrowBar,v as __namedExportsOrder,d as default};