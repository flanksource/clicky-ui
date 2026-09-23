import{j as e}from"./iframe-Dm9WDfFk.js";import{C as t}from"./Chat-Ci12ChVD.js";import{m as d,S as m,a as O,b as L,M as N}from"./Chat.fixtures-6Nm8DO-D.js";import"./preload-helper-C0z-shBz.js";import"./utils-DW-IJACk.js";import"./Conversation-y9FFjpHN.js";import"./Icon-C0Xeje0M.js";import"./Message-s7cwDv3e.js";import"./Markdown-BlWd-DKg.js";import"./Callout-COIy-KvZ.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-4dLkcMVd.js";import"./CodeDiff-CgCKqRcG.js";import"./SegmentedControl-DaA1qzu_.js";import"./HighlightedTokens-BzzDcGha.js";import"./JsonView-CTnjgbsl.js";import"./ToolCall-DXLDqeMP.js";import"./button-CENLUU5j.js";import"./index-CPURVhFy.js";import"./loading-CJ6V0nN9.js";import"./types-B4ZMggem.js";import"./KeyValueList-RYV1_xhp.js";import"./DataTable-CeOfk4Uz.js";import"./SortableHeader-JDO5J5Id.js";import"./router-oF-f9wpK.js";import"./Modal-PsjUms9d.js";import"./index-Bx4ElzK1.js";import"./index-Dgu1a0Qq.js";import"./modalStack-CvvHbawO.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Hmt9C_ts.js";import"./floating-ui.react-DeWqyg5S.js";import"./FilterPill-DLi3O7KQ.js";import"./Combobox-B6cKgKZT.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DdbNDnim.js";import"./MultiSelect-BTw-vIYs.js";import"./RangeSlider-CTxK6L3-.js";import"./TimeRange-GzY8P0so.js";import"./select-Bec3eoyV.js";import"./WorkloadPicker-PMTbjtOo.js";import"./NamespacePicker-CkK3AU_h.js";import"./index-DeTidxWH.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DLU2eSYb.js";import"./TagList-CFxRXuAa.js";import"./Badge-yGc8mW4C.js";import"./HoverCard-BSW2cf0b.js";import"./Properties-Di6szT3e.js";import"./IconButton-CjT-t9Vt.js";import"./DropdownMenu-DymU7aS1.js";import"./DropdownMenuSubmenu-BWkoW6LP.js";import"./StatusDot-d2ZrEGhv.js";import"./MessageActions-7C5e6lbo.js";import"./Reasoning-CcCzqQxH.js";import"./MessageFilePart-SKgygsc0.js";import"./PromptInput-DX_Ilmo0.js";import"./Attachment-B67KskgH.js";import"./Suggestion-DuZxA5aW.js";import"./effort-icons-BfJNuKc4.js";import"./RuntimeBar-ChEiZ5o0.js";import"./runtime-mode-BQ66h75Y.js";import"./InputField-D8BJc-O5.js";import"./use-hotkey-BBqhoW5z.js";import"./ContextMeter-DpumByYq.js";import"./tokens-5o2CVjOb.js";const{expect:o,userEvent:u,waitFor:j,within:c}=__STORYBOOK_MODULE_TEST__,Qe={title:"Data/Chat",component:t,parameters:{layout:"fullscreen",docs:{description:{component:"Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport."}}}},a={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),suggestions:["List all pods","Show failing checks",{label:"Restart api",prompt:"Restart the api service"}],emptyState:e.jsxs("div",{className:"space-y-1",children:[e.jsx("h3",{className:"font-medium text-sm",children:"Ask about your app"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"Type a question — the assistant can call your app's operations."})]})})})},s={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(200),initialMessages:m,placeholder:"Try: list pods"})})},n={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:d(),models:N,modelsApi:null,defaultModel:"anthropic/claude-sonnet-4-5",enableAttachments:!0,initialMessages:m})}),play:async({canvasElement:C})=>{const l=c(C),k=l.getByRole("button",{name:"Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"}),_=l.getByLabelText("Context 0% used");await u.hover(_);const r=c(document.body);await j(()=>o(r.getByRole("tooltip")).toBeInTheDocument()),await o(c(r.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument(),await u.click(k),await o(r.getByRole("menu")).toHaveAttribute("aria-label","Runtime controls"),await o(r.getByRole("radiogroup",{name:"Runtime mode"})).toBeInTheDocument()}},i={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:O(),initialMessages:m,placeholder:"Ask anything"})})},p={render:()=>e.jsx("div",{className:"h-[600px] border border-border",children:e.jsx(t,{transport:L(),initialMessages:m,placeholder:"Try: restart the api service"})})};var h,b,y;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} suggestions={["List all pods", "Show failing checks", {
      label: "Restart api",
      prompt: "Restart the api service"
    }]} emptyState={<div className="space-y-1">
            <h3 className="font-medium text-sm">Ask about your app</h3>
            <p className="text-muted-foreground text-sm">
              Type a question — the assistant can call your app&apos;s operations.
            </p>
          </div>} />
    </div>
}`,...(y=(b=a.parameters)==null?void 0:b.docs)==null?void 0:y.source}}};var g,x,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,...(v=(x=s.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var S,T,M;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const runtime = canvas.getByRole("button", {
      name: "Runtime: Claude, API, Claude Sonnet 4.5, effort Medium"
    });
    const meter = canvas.getByLabelText("Context 0% used");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument();
    await userEvent.click(runtime);
    await expect(body.getByRole("menu")).toHaveAttribute("aria-label", "Runtime controls");
    await expect(body.getByRole("radiogroup", {
      name: "Runtime mode"
    })).toBeInTheDocument();
  }
}`,...(M=(T=n.parameters)==null?void 0:T.docs)==null?void 0:M.source}}};var R,A,E;i.parameters={...i.parameters,docs:{...(R=i.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...(E=(A=i.parameters)==null?void 0:A.docs)==null?void 0:E.source}}};var B,f,w;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...(w=(f=p.parameters)==null?void 0:f.docs)==null?void 0:w.source}}};const Xe=["Empty","Streaming","WithRuntimeBar","Reasoning","ToolApproval"];export{a as Empty,i as Reasoning,s as Streaming,p as ToolApproval,n as WithRuntimeBar,Xe as __namedExportsOrder,Qe as default};
