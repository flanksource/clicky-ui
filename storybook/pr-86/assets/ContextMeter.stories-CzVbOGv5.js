import{as as k,j as m}from"./iframe-DAGeDdmW.js";import{C as u}from"./ContextMeter-C4b6Qc1d.js";import"./preload-helper-CcRYDqr-.js";import"./utils-DW-IJACk.js";import"./tokens-5o2CVjOb.js";import"./Icon-IzT7REGK.js";import"./HoverCard-BVfeNivj.js";import"./index-DLrg9pPu.js";import"./index-DIhTiILn.js";import"./modalStack-Cb0rES9i.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-c6eabZaZ.js";const{expect:t,userEvent:f,waitFor:R,within:a}=__STORYBOOK_MODULE_TEST__,X={title:"Chat/ContextMeter",component:u,tags:["autodocs"],parameters:{docs:{description:{component:'The unified context-window meter. `mode="bar"` (SessionViewer header) and `mode="gauge"` (chat toolbar) share one hover popover: model, copyable session id, execution mode, context-window breakdown, per-bucket token usage and cost + budget. Domain-agnostic — callers feed plain values.'}}},argTypes:{mode:{control:"inline-radio",options:["bar","gauge"]},usedPercent:{control:{type:"range",min:0,max:100,step:1}}},render:o=>m.jsx("div",{className:"flex min-h-56 items-start justify-center p-10",children:m.jsx(u,{...o})})},d={usedPercent:74,usedTokens:148e3,windowTokens:2e5,messageCount:32,sessionId:"session-01JZQX7TXAXQM0RHD7XCGBF8F0",executionMode:"cmux",model:"claude-opus-4-8",modelIcon:k("anthropic"),effort:"high",tokens:{input:12e4,output:18e3,reasoning:6e3,cacheRead:4e4,cacheWrite:4e3,total:188e3},cost:{input:.36,output:.54,reasoning:.18,cacheRead:.12,cacheWrite:.04,total:1.24},budget:{used:1.24,total:5,remaining:3.76}},s={args:{mode:"bar",...d},play:async({canvasElement:o})=>{const i=a(o);await f.hover(i.getByLabelText("Context 74% used"));const e=a(await a(document.body).findByRole("tooltip"));await t(e.getByText("claude-opus-4-8")).toBeInTheDocument(),await t(e.getByText("High effort")).toBeInTheDocument(),await t(e.getByText("cmux")).toBeInTheDocument(),await t(e.getByRole("button",{name:"Copy session ID"})).toBeInTheDocument(),await t(e.getByText("Output")).toBeInTheDocument(),await t(e.getByText("18k")).toBeInTheDocument(),await t(e.getByText("$0.54")).toBeInTheDocument(),await t(e.getByText("$1.24 / $5.00")).toBeInTheDocument()}},r={args:{mode:"gauge",...d},play:async({canvasElement:o})=>{const i=a(o);await f.hover(i.getByLabelText("Context 74% used"));const e=a(document.body);await R(()=>t(e.getByText("Tokens")).toBeInTheDocument()),await t(e.getByText("Messages")).toBeInTheDocument()}},n={args:{mode:"gauge",usedPercent:42,usedTokens:84e3,windowTokens:2e5,messageCount:12,model:"gpt-5-codex",modelIcon:k("openai"),cost:{total:.42}}},c={args:{mode:"bar",...d,usedPercent:97}};var p,g,l;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
    await expect(card.getByText("claude-opus-4-8")).toBeInTheDocument();
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
}`,...(l=(g=s.parameters)==null?void 0:g.docs)==null?void 0:l.source}}};var h,x,T;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(T=(x=r.parameters)==null?void 0:x.docs)==null?void 0:T.source}}};var w,y,B,b,I;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(B=(y=n.parameters)==null?void 0:y.docs)==null?void 0:B.source},description:{story:"Chat only knows a single total cost — the popover shows just the total.",...(I=(b=n.parameters)==null?void 0:b.docs)==null?void 0:I.description}}};var v,D,C;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH,
    usedPercent: 97
  }
}`,...(C=(D=c.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};const Q=["Bar","Gauge","ChatGaugeMinimal","Critical"];export{s as Bar,n as ChatGaugeMinimal,c as Critical,r as Gauge,Q as __namedExportsOrder,X as default};
