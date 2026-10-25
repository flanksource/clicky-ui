import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{d as n,r}from"./fixtures-DQ4-m9zu.js";import{n as i,t as a}from"./TerminalCastPlayer-CwkC3U5W.js";var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{r(),i(),o=t(),{expect:s,within:c}=__STORYBOOK_MODULE_TEST__,l=`{"version":2,"width":60,"height":6,"duration":1.5,"command":"/bin/sh -c echo hi","_gavel":{"exit_code":3,"snapshots":[[1500,"hi\\nhi\\nbye"]],"final":"hi\\nhi\\nbye","truncated":true}}
[0.01,"o","hi\\r\\n"]
[0.75,"o","\\u001b[32mhi\\u001b[0m\\r\\n"]
[1.2,"o","bye\\r\\n"]`,u={title:`Data/Traces/TerminalCastPlayer`,component:a,parameters:{docs:{description:{component:"Replays a `terminal` trace: play/pause, a scrubber, 1x/2x/4x speed and jump-to-end, honouring resizes, with the exit code as a badge. The screen is settled from the raw output (carriage returns, cursor moves, erase, colour) and drawn with AnsiHtml. A downloaded asciinema v2 `.cast` renders the same through `castText`; a recorded snapshot is offered as the Settled screen view."}}}},d={render:()=>(0,o.jsx)(a,{events:n}),play:async({canvasElement:e})=>{await s(c(e).getByText(`exit 0`)).toBeInTheDocument()}},f={render:()=>(0,o.jsx)(a,{castText:l}),play:async({canvasElement:e})=>{let t=c(e);await s(t.getByText(`exit 3`)).toBeInTheDocument(),await s(t.getByText(`output truncated`)).toBeInTheDocument()}},p={render:()=>(0,o.jsx)(a,{events:n,autoPlay:!0})},m={render:()=>(0,o.jsx)(a,{events:[]})},h=[`Events`,`DownloadedCast`,`AutoPlay`,`Empty`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer events={terminalEvents} />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("exit 0")).toBeInTheDocument();
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer castText={DOWNLOADED_CAST} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("exit 3")).toBeInTheDocument();
    await expect(canvas.getByText("output truncated")).toBeInTheDocument();
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer events={terminalEvents} autoPlay />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer events={[]} />
}`,...m.parameters?.docs?.source}}}})))()}g();export{p as AutoPlay,f as DownloadedCast,m as Empty,d as Events,h as __namedExportsOrder,u as default};