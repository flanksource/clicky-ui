import{am as k,j as m}from"./iframe-DIGBtUIu.js";import{C as u}from"./ContextMeter-CyR_B2AO.js";import"./preload-helper-Bz0j3TbD.js";import"./utils-CR52uffu.js";import"./tokens-5o2CVjOb.js";import"./Icon-Ckp6RE90.js";import"./HoverCard-DlH6gDP1.js";import"./index-CXQUnhiw.js";import"./index-evrdMFRC.js";import"./modalStack-C-EkQo6g.js";import"./zIndex-BGbNBNA8.js";import"./effort-icons-1tP-hGJQ.js";const{expect:t,userEvent:f,waitFor:E,within:r}=__STORYBOOK_MODULE_TEST__,X={title:"Chat/ContextMeter",component:u,tags:["autodocs"],parameters:{docs:{description:{component:'The unified context-window meter. `mode="bar"` (SessionViewer header) and `mode="gauge"` (chat toolbar) share one hover popover: model, copyable session id, execution mode, context-window breakdown, per-bucket token usage and cost + budget. Domain-agnostic — callers feed plain values.'}}},argTypes:{mode:{control:"inline-radio",options:["bar","gauge"]},usedPercent:{control:{type:"range",min:0,max:100,step:1}}},render:o=>m.jsx("div",{className:"flex min-h-56 items-start justify-center p-10",children:m.jsx(u,{...o})})},d={usedPercent:74,usedTokens:148e3,windowTokens:2e5,messageCount:32,sessionId:"session-01JZQX7TXAXQM0RHD7XCGBF8F0",executionMode:"cmux",model:"claude-opus-4-8",modelIcon:k("anthropic"),effort:"high",tokens:{input:12e4,output:18e3,reasoning:6e3,cacheRead:4e4,cacheWrite:4e3,total:188e3},cost:{input:.36,output:.54,reasoning:.18,cacheRead:.12,cacheWrite:.04,total:1.24},budget:{used:1.24,total:5,remaining:3.76}},a={args:{mode:"bar",...d},play:async({canvasElement:o})=>{const i=r(o);await f.hover(i.getByLabelText("Context 74% used"));const e=r(document.body);await E(()=>t(e.getByText("claude-opus-4-8")).toBeInTheDocument()),await t(e.getByText("High effort")).toBeInTheDocument(),await t(e.getByText("cmux")).toBeInTheDocument(),await t(e.getByRole("button",{name:"Copy session ID"})).toBeInTheDocument(),await t(e.getByText("Output")).toBeInTheDocument(),await t(e.getByText("18k")).toBeInTheDocument(),await t(e.getByText("$0.54")).toBeInTheDocument(),await t(e.getByText("$1.24 / $5.00")).toBeInTheDocument()}},s={args:{mode:"gauge",...d},play:async({canvasElement:o})=>{const i=r(o);await f.hover(i.getByLabelText("Context 74% used"));const e=r(document.body);await E(()=>t(e.getByText("Tokens")).toBeInTheDocument()),await t(e.getByText("Messages")).toBeInTheDocument()}},n={args:{mode:"gauge",usedPercent:42,usedTokens:84e3,windowTokens:2e5,messageCount:12,model:"gpt-5-codex",modelIcon:k("openai"),cost:{total:.42}}},c={args:{mode:"bar",...d,usedPercent:97}};var p,g,l;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
    await expect(body.getByText("cmux")).toBeInTheDocument();
    await expect(body.getByRole("button", {
      name: "Copy session ID"
    })).toBeInTheDocument();
    // Tokens + Cost merged into one table: the Output bucket shows both cells.
    await expect(body.getByText("Output")).toBeInTheDocument();
    await expect(body.getByText("18k")).toBeInTheDocument();
    await expect(body.getByText("$0.54")).toBeInTheDocument();
    await expect(body.getByText("$1.24 / $5.00")).toBeInTheDocument();
  }
}`,...(l=(g=a.parameters)==null?void 0:g.docs)==null?void 0:l.source}}};var y,T,x;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
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
}`,...(x=(T=s.parameters)==null?void 0:T.docs)==null?void 0:x.source}}};var h,B,w,b,I;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(w=(B=n.parameters)==null?void 0:B.docs)==null?void 0:w.source},description:{story:"Chat only knows a single total cost — the popover shows just the total.",...(I=(b=n.parameters)==null?void 0:b.docs)==null?void 0:I.description}}};var D,v,C;c.parameters={...c.parameters,docs:{...(D=c.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH,
    usedPercent: 97
  }
}`,...(C=(v=c.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};const Q=["Bar","Gauge","ChatGaugeMinimal","Critical"];export{a as Bar,n as ChatGaugeMinimal,c as Critical,s as Gauge,Q as __namedExportsOrder,X as default};
