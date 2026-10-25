import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{a as n,i as r,n as i,o as a,r as o,t as s}from"./Chat.fixtures-Dz7Ke9Ag.js";import{n as c,t as l}from"./Chat-BVYHZcgK.js";var u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{c(),o(),u=t(),{expect:d,userEvent:f,waitFor:p,within:m}=__STORYBOOK_MODULE_TEST__,h={title:`Data/Chat`,component:l,parameters:{layout:`fullscreen`,docs:{description:{component:`Self-contained AI chat over the Vercel AI SDK v6 UI Message Stream protocol. Streams assistant markdown and renders clicky operation tool-calls (args → result). The footer toolbar has a RuntimeBar combo for provider family, execution mode, model, and reasoning effort, plus a context gauge that appears as soon as session or model metadata resolves. The backend owns runtime selection and tool execution; these stories drive a mock transport.`}}}},g={render:()=>(0,u.jsx)(`div`,{className:`h-[600px] border border-border`,children:(0,u.jsx)(l,{transport:n(),suggestions:[`List all pods`,`Show failing checks`,{label:`Restart api`,prompt:`Restart the api service`}],emptyState:(0,u.jsxs)(`div`,{className:`space-y-1`,children:[(0,u.jsx)(`h3`,{className:`font-medium text-sm`,children:`Ask about your app`}),(0,u.jsx)(`p`,{className:`text-muted-foreground text-sm`,children:`Type a question — the assistant can call your app's operations.`})]})})})},_={render:()=>(0,u.jsx)(`div`,{className:`h-[600px] border border-border`,children:(0,u.jsx)(l,{transport:n(200),initialMessages:i,placeholder:`Try: list pods`})})},v={render:()=>(0,u.jsx)(`div`,{className:`h-[600px] border border-border`,children:(0,u.jsx)(l,{transport:n(),models:s,modelsApi:null,defaultModel:`anthropic/claude-sonnet-4-5`,enableAttachments:!0,initialMessages:i})}),play:async({canvasElement:e})=>{let t=m(e),n=m(t.getByRole(`group`,{name:`Runtime`})),r=n.getByTitle(`Runtime mode — API`);await d(n.getByRole(`combobox`,{name:`Model`})).toHaveTextContent(`Claude Sonnet 4.5`),await d(n.getByTitle(`Reasoning effort`)).toHaveTextContent(`Medium`);let i=t.getByLabelText(`Context unavailable`);await f.hover(i);let a=m(document.body);await p(()=>d(a.getByRole(`tooltip`)).toBeInTheDocument()),await d(m(a.getByRole(`tooltip`)).getAllByText(`Unavailable`).length).toBeGreaterThan(0),await d(m(a.getByRole(`tooltip`)).queryByText(`Claude Sonnet 4.5`)).not.toBeInTheDocument(),await f.click(r);let o=await a.findByRole(`menu`,{name:`Runtime mode`});await d(m(o).getByRole(`menuitem`,{name:`API`})).toBeInTheDocument(),await f.keyboard(`{Escape}`)}},y={render:()=>(0,u.jsx)(`div`,{className:`h-[600px] border border-border`,children:(0,u.jsx)(l,{transport:a(),initialMessages:i,placeholder:`Ask anything`})})},b={render:()=>(0,u.jsx)(`div`,{className:`h-[600px] border border-border`,children:(0,u.jsx)(l,{transport:r(),initialMessages:i,placeholder:`Try: restart the api service`})})},x=[`Empty`,`Streaming`,`WithRuntimeBar`,`Reasoning`,`ToolApproval`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport(200)} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: list pods" />
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockChatTransport()} models={MOCK_MODELS} modelsApi={null} defaultModel="anthropic/claude-sonnet-4-5" enableAttachments initialMessages={SAMPLE_TOOL_MESSAGES} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const runtime = within(canvas.getByRole("group", {
      name: "Runtime"
    }));
    const mode = runtime.getByTitle("Runtime mode — API");
    await expect(runtime.getByRole("combobox", {
      name: "Model"
    })).toHaveTextContent("Claude Sonnet 4.5");
    await expect(runtime.getByTitle("Reasoning effort")).toHaveTextContent("Medium");
    const meter = canvas.getByLabelText("Context unavailable");
    await userEvent.hover(meter);
    const body = within(document.body);
    await waitFor(() => expect(body.getByRole("tooltip")).toBeInTheDocument());
    await expect(within(body.getByRole("tooltip")).getAllByText("Unavailable").length).toBeGreaterThan(0);
    await expect(within(body.getByRole("tooltip")).queryByText("Claude Sonnet 4.5")).not.toBeInTheDocument();
    await userEvent.click(mode);
    const menu = await body.findByRole("menu", {
      name: "Runtime mode"
    });
    await expect(within(menu).getByRole("menuitem", {
      name: "API"
    })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockReasoningTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Ask anything" />
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[600px] border border-border">
      <Chat transport={mockApprovalTransport()} initialMessages={SAMPLE_TOOL_MESSAGES} placeholder="Try: restart the api service" />
    </div>
}`,...b.parameters?.docs?.source}}}})))()}S();export{g as Empty,y as Reasoning,_ as Streaming,b as ToolApproval,v as WithRuntimeBar,x as __namedExportsOrder,h as default};