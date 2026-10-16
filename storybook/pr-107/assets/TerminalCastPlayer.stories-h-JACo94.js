import{j as s}from"./iframe-BsAqiW63.js";import{t as g}from"./fixtures-C3TGvGxW.js";import{T as e}from"./TerminalCastPlayer-Cqy8Ridx.js";import"./preload-helper-Drww7zV3.js";import"./button-BtSAOAKJ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BJEbCWIe.js";import"./SegmentedControl-CKXvowSa.js";import"./Icon-Dyy6aaqa.js";import"./AnsiHtml-fT4U1N1H.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";const{expect:c,within:D}=__STORYBOOK_MODULE_TEST__,B=['{"version":2,"width":60,"height":6,"duration":1.5,"command":"/bin/sh -c echo hi","_gavel":{"exit_code":3,"snapshots":[[1500,"hi\\nhi\\nbye"]],"final":"hi\\nhi\\nbye","truncated":true}}','[0.01,"o","hi\\r\\n"]','[0.75,"o","\\u001b[32mhi\\u001b[0m\\r\\n"]','[1.2,"o","bye\\r\\n"]'].join(`
`),W={title:"Data/Traces/TerminalCastPlayer",component:e,parameters:{docs:{description:{component:"Replays a `terminal` trace: play/pause, a scrubber, 1x/2x/4x speed and jump-to-end, honouring resizes, with the exit code as a badge. The screen is settled from the raw output (carriage returns, cursor moves, erase, colour) and drawn with AnsiHtml. A downloaded asciinema v2 `.cast` renders the same through `castText`; a recorded snapshot is offered as the Settled screen view."}}}},t={render:()=>s.jsx(e,{events:g}),play:async({canvasElement:o})=>{await c(D(o).getByText("exit 0")).toBeInTheDocument()}},a={render:()=>s.jsx(e,{castText:B}),play:async({canvasElement:o})=>{const i=D(o);await c(i.getByText("exit 3")).toBeInTheDocument(),await c(i.getByText("output truncated")).toBeInTheDocument()}},r={render:()=>s.jsx(e,{events:g,autoPlay:!0})},n={render:()=>s.jsx(e,{events:[]})};var m,p,d;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer events={terminalEvents} />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("exit 0")).toBeInTheDocument();
  }
}`,...(d=(p=t.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};var u,l,h;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer castText={DOWNLOADED_CAST} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("exit 3")).toBeInTheDocument();
    await expect(canvas.getByText("output truncated")).toBeInTheDocument();
  }
}`,...(h=(l=a.parameters)==null?void 0:l.docs)==null?void 0:h.source}}};var y,x,T;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer events={terminalEvents} autoPlay />
}`,...(T=(x=r.parameters)==null?void 0:x.docs)==null?void 0:T.source}}};var v,w,E;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <TerminalCastPlayer events={[]} />
}`,...(E=(w=n.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};const z=["Events","DownloadedCast","AutoPlay","Empty"];export{r as AutoPlay,a as DownloadedCast,n as Empty,t as Events,z as __namedExportsOrder,W as default};
