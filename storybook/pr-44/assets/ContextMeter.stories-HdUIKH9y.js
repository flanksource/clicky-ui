import{ah as D,j as u}from"./iframe-BK7fwFVO.js";import{C as m}from"./ContextMeter-DlPakxyo.js";import"./preload-helper-CLp6iKya.js";import"./utils-CR52uffu.js";import"./HoverCard-CDlOtfM7.js";import"./index-V9FlwRvu.js";import"./index-DVBV8i_H.js";import"./modalStack-CjOkifgI.js";import"./zIndex-CigQ76av.js";const{expect:t,userEvent:E,waitFor:_,within:c}=__STORYBOOK_MODULE_TEST__,G={title:"Chat/ContextMeter",component:m,tags:["autodocs"],parameters:{docs:{description:{component:'The unified context-window meter. `mode="bar"` (SessionViewer header) and `mode="gauge"` (chat toolbar) share one hover popover: model, context-window breakdown, per-bucket token usage and cost + budget. Domain-agnostic — callers feed plain numbers.'}}},argTypes:{mode:{control:"inline-radio",options:["bar","gauge"]},usedPercent:{control:{type:"range",min:0,max:100,step:1}}},render:o=>u.jsx("div",{className:"flex min-h-56 items-start justify-center p-10",children:u.jsx(m,{...o})})},d={usedPercent:74,usedTokens:148e3,windowTokens:2e5,messageCount:32,model:"claude-opus-4-8",modelIcon:D("anthropic"),tokens:{input:12e4,output:18e3,reasoning:6e3,cacheRead:4e4,cacheWrite:4e3,total:188e3},cost:{input:.36,output:.54,reasoning:.18,cacheRead:.12,cacheWrite:.04,total:1.24},budget:{used:1.24,total:5,remaining:3.76}},a={args:{mode:"bar",...d},play:async({canvasElement:o})=>{const i=c(o);await E.hover(i.getByLabelText("Context 74% used"));const e=c(document.body);await _(()=>t(e.getByText("claude-opus-4-8")).toBeInTheDocument()),await t(e.getByText("Output")).toBeInTheDocument(),await t(e.getByText("18k")).toBeInTheDocument(),await t(e.getByText("$0.54")).toBeInTheDocument(),await t(e.getByText("$1.24 / $5.00")).toBeInTheDocument()}},s={args:{mode:"gauge",...d},play:async({canvasElement:o})=>{const i=c(o);await E.hover(i.getByLabelText("Context 74% used"));const e=c(document.body);await _(()=>t(e.getByText("Tokens")).toBeInTheDocument()),await t(e.getByText("Messages")).toBeInTheDocument()}},n={args:{mode:"gauge",usedPercent:42,usedTokens:84e3,windowTokens:2e5,messageCount:12,model:"gpt-5-codex",modelIcon:D("openai"),cost:{total:.42}}},r={args:{mode:"bar",...d,usedPercent:97}};var p,g,l;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
    // Tokens + Cost merged into one table: the Output bucket shows both cells.
    await expect(body.getByText("Output")).toBeInTheDocument();
    await expect(body.getByText("18k")).toBeInTheDocument();
    await expect(body.getByText("$0.54")).toBeInTheDocument();
    await expect(body.getByText("$1.24 / $5.00")).toBeInTheDocument();
  }
}`,...(l=(g=a.parameters)==null?void 0:g.docs)==null?void 0:l.source}}};var h,y,T;s.parameters={...s.parameters,docs:{...(h=s.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
}`,...(T=(y=s.parameters)==null?void 0:y.docs)==null?void 0:T.source}}};var x,w,B,b,v;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(B=(w=n.parameters)==null?void 0:w.docs)==null?void 0:B.source},description:{story:"Chat only knows a single total cost — the popover shows just the total.",...(v=(b=n.parameters)==null?void 0:b.docs)==null?void 0:v.description}}};var I,C,k;r.parameters={...r.parameters,docs:{...(I=r.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    mode: "bar",
    ...RICH,
    usedPercent: 97
  }
}`,...(k=(C=r.parameters)==null?void 0:C.docs)==null?void 0:k.source}}};const H=["Bar","Gauge","ChatGaugeMinimal","Critical"];export{a as Bar,n as ChatGaugeMinimal,r as Critical,s as Gauge,H as __namedExportsOrder,G as default};
