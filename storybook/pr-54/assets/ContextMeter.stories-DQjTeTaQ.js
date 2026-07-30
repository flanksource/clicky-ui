import{ah as k,j as m}from"./iframe-BLMcgo_c.js";import{C as u}from"./ContextMeter-BJ_NjsP6.js";import"./preload-helper-V0wJDdBF.js";import"./utils-CR52uffu.js";import"./Icon-BjbjSuBq.js";import"./HoverCard-B_pkxN57.js";import"./index-0GhwRIX8.js";import"./index-C6bGw4eq.js";import"./modalStack-D_rEmCN1.js";import"./zIndex-CigQ76av.js";import"./effort-icons-CR1cFjWZ.js";const{expect:t,userEvent:f,waitFor:E,within:c}=__STORYBOOK_MODULE_TEST__,F={title:"Chat/ContextMeter",component:u,tags:["autodocs"],parameters:{docs:{description:{component:'The unified context-window meter. `mode="bar"` (SessionViewer header) and `mode="gauge"` (chat toolbar) share one hover popover: model, context-window breakdown, per-bucket token usage and cost + budget. Domain-agnostic — callers feed plain numbers.'}}},argTypes:{mode:{control:"inline-radio",options:["bar","gauge"]},usedPercent:{control:{type:"range",min:0,max:100,step:1}}},render:o=>m.jsx("div",{className:"flex min-h-56 items-start justify-center p-10",children:m.jsx(u,{...o})})},d={usedPercent:74,usedTokens:148e3,windowTokens:2e5,messageCount:32,model:"claude-opus-4-8",modelIcon:k("anthropic"),effort:"high",tokens:{input:12e4,output:18e3,reasoning:6e3,cacheRead:4e4,cacheWrite:4e3,total:188e3},cost:{input:.36,output:.54,reasoning:.18,cacheRead:.12,cacheWrite:.04,total:1.24},budget:{used:1.24,total:5,remaining:3.76}},a={args:{mode:"bar",...d},play:async({canvasElement:o})=>{const i=c(o);await f.hover(i.getByLabelText("Context 74% used"));const e=c(document.body);await E(()=>t(e.getByText("claude-opus-4-8")).toBeInTheDocument()),await t(e.getByText("High effort")).toBeInTheDocument(),await t(e.getByText("Output")).toBeInTheDocument(),await t(e.getByText("18k")).toBeInTheDocument(),await t(e.getByText("$0.54")).toBeInTheDocument(),await t(e.getByText("$1.24 / $5.00")).toBeInTheDocument()}},s={args:{mode:"gauge",...d},play:async({canvasElement:o})=>{const i=c(o);await f.hover(i.getByLabelText("Context 74% used"));const e=c(document.body);await E(()=>t(e.getByText("Tokens")).toBeInTheDocument()),await t(e.getByText("Messages")).toBeInTheDocument()}},n={args:{mode:"gauge",usedPercent:42,usedTokens:84e3,windowTokens:2e5,messageCount:12,model:"gpt-5-codex",modelIcon:k("openai"),cost:{total:.42}}},r={args:{mode:"bar",...d,usedPercent:97}};var p,g,l;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByLabelText("Context 74% used"));
    const body = within(document.body);
    await waitFor(() => expect(body.getByText("claude-opus-4-8")).toBeInTheDocument());
    await expect(body.getByText("High effort")).toBeInTheDocument();
    // Tokens + Cost merged into one table: the Output bucket shows both cells.
    await expect(body.getByText("Output")).toBeInTheDocument();
    await expect(body.getByText("18k")).toBeInTheDocument();
    await expect(body.getByText("$0.54")).toBeInTheDocument();
    await expect(body.getByText("$1.24 / $5.00")).toBeInTheDocument();
  }
}`,...(l=(g=a.parameters)==null?void 0:g.docs)==null?void 0:l.source}}};var h,T,y;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(y=(T=s.parameters)==null?void 0:T.docs)==null?void 0:y.source}}};var x,w,B,b,I;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(B=(w=n.parameters)==null?void 0:w.docs)==null?void 0:B.source},description:{story:"Chat only knows a single total cost — the popover shows just the total.",...(I=(b=n.parameters)==null?void 0:b.docs)==null?void 0:I.description}}};var v,C,D;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH,
    usedPercent: 97
  }
}`,...(D=(C=r.parameters)==null?void 0:C.docs)==null?void 0:D.source}}};const W=["Bar","Gauge","ChatGaugeMinimal","Critical"];export{a as Bar,n as ChatGaugeMinimal,r as Critical,s as Gauge,W as __namedExportsOrder,F as default};
