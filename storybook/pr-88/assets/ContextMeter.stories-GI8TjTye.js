import{as as j,j as u}from"./iframe-DjmnUs_s.js";import{C as p}from"./ContextMeter-E_bpQg_T.js";import"./preload-helper-BlVIKJwt.js";import"./utils-DW-IJACk.js";import"./tokens-5o2CVjOb.js";import"./Icon-CWJyCkxy.js";import"./HoverCard-dWtrhYr9.js";import"./index-DsmV4W2z.js";import"./index-CouXz6mu.js";import"./modalStack-Bqy7OkQU.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-WMF41mBt.js";import"./runtime-mode-DrXAr8Ax.js";const{expect:t,userEvent:H,waitFor:M,within:a}=__STORYBOOK_MODULE_TEST__,J={title:"Chat/ContextMeter",component:p,tags:["autodocs"],parameters:{docs:{description:{component:'The unified context-window meter. `mode="bar"` (SessionViewer header) and `mode="gauge"` (chat toolbar) share one hover popover: model, copyable session id, execution mode, context-window breakdown, per-bucket token usage and cost + budget. Domain-agnostic — callers feed plain values.'}}},argTypes:{mode:{control:"inline-radio",options:["bar","gauge"]},usedPercent:{control:{type:"range",min:0,max:100,step:1}}},render:o=>u.jsx("div",{className:"flex min-h-56 items-start justify-center p-10",children:u.jsx(p,{...o})})},m={usedPercent:74,usedTokens:148e3,windowTokens:2e5,messageCount:32,sessionId:"session-01JZQX7TXAXQM0RHD7XCGBF8F0",provider:"anthropic",executionMode:"cmux",model:"anthropic/claude-opus-4-8",modelIcon:j("anthropic"),effort:"high",tokens:{input:12e4,output:18e3,reasoning:6e3,cacheRead:4e4,cacheWrite:4e3,total:188e3},cost:{input:.36,output:.54,reasoning:.18,cacheRead:.12,cacheWrite:.04,total:1.24},budget:{used:1.24,total:5,remaining:3.76}},r={args:{mode:"bar",...m},play:async({canvasElement:o})=>{const s=a(o);await H.hover(s.getByLabelText("Context 74% used"));const e=a(await a(document.body).findByRole("tooltip"));await t(s.getByTitle("anthropic/claude-opus-4-8")).toHaveTextContent("opus-4.8"),await t(e.getByText("anthropic/claude-opus-4-8")).toBeInTheDocument(),await t(e.getByText("High effort")).toBeInTheDocument(),await t(e.getByText("cmux")).toBeInTheDocument(),await t(e.getByRole("button",{name:"Copy session ID"})).toBeInTheDocument(),await t(e.getByText("Output")).toBeInTheDocument(),await t(e.getByText("18k")).toBeInTheDocument(),await t(e.getByText("$0.54")).toBeInTheDocument(),await t(e.getByText("$1.24 / $5.00")).toBeInTheDocument()}},c={args:{mode:"gauge",...m},play:async({canvasElement:o})=>{const s=a(o);await H.hover(s.getByLabelText("Context 74% used"));const e=a(document.body);await M(()=>t(e.getByText("Tokens")).toBeInTheDocument()),await t(e.getByText("Messages")).toBeInTheDocument()}},i={args:{mode:"bar",...m},render:o=>u.jsx("div",{className:"@container flex w-80 justify-end p-4",children:u.jsx(p,{...o})})},n={args:{mode:"gauge",usedPercent:42,usedTokens:84e3,windowTokens:2e5,messageCount:12,model:"gpt-5-codex",modelIcon:j("openai"),cost:{total:.42}}},d={args:{mode:"bar",...m,usedPercent:97}};var g,l,h;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
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
}`,...(h=(l=r.parameters)==null?void 0:l.docs)==null?void 0:h.source}}};var x,T,w;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(w=(T=c.parameters)==null?void 0:T.docs)==null?void 0:w.source}}};var y,B,b;i.parameters={...i.parameters,docs:{...(y=i.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH
  },
  render: args => <div className="@container flex w-80 justify-end p-4">
      <ContextMeter {...args} />
    </div>
}`,...(b=(B=i.parameters)==null?void 0:B.docs)==null?void 0:b.source}}};var v,I,C,D,f;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
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
}`,...(C=(I=n.parameters)==null?void 0:I.docs)==null?void 0:C.source},description:{story:"Chat only knows a single total cost — the popover shows just the total.",...(f=(D=n.parameters)==null?void 0:D.docs)==null?void 0:f.description}}};var k,R,E;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH,
    usedPercent: 97
  }
}`,...(E=(R=d.parameters)==null?void 0:R.docs)==null?void 0:E.source}}};const K=["Bar","Gauge","NarrowBar","ChatGaugeMinimal","Critical"];export{r as Bar,n as ChatGaugeMinimal,d as Critical,c as Gauge,i as NarrowBar,K as __namedExportsOrder,J as default};
