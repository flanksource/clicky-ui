import{j as e}from"./iframe-Ch1BYoLl.js";import{H as t}from"./HoverCard-DbBpdw4N.js";import"./preload-helper-B4w--iqy.js";import"./index-DWuQH2px.js";import"./index-D4kBRSRx.js";import"./utils-BLSKlp9E.js";import"./modalStack-CXz3gd3A.js";import"./zIndex-CigQ76av.js";const f={title:"Overlay/HoverCard",component:t,args:{trigger:e.jsx("button",{className:"rounded border border-border px-2 py-1",children:"Hover me"}),children:e.jsx("div",{className:"text-sm",children:"Details"}),placement:"top",delay:0,arrow:!0},parameters:{docs:{description:{component:"Portaled hover card that escapes clipped table rows, dropdowns, and modals. It supports preferred placement, viewport clamping, open delay, and a hover grace period."}}}},r={render:()=>e.jsx("div",{className:"p-density-8 flex justify-center",children:e.jsxs(t,{trigger:e.jsx("span",{className:"underline cursor-help",children:"hover me"}),placement:"top",children:[e.jsx("div",{className:"font-medium",children:"Up to date"}),e.jsx("div",{className:"text-muted-foreground mt-0.5",children:"Last synced 2m ago"})]})})},s={render:()=>e.jsx("div",{className:"p-density-8 flex justify-center",children:e.jsxs(t,{trigger:e.jsx("span",{className:"underline cursor-help",children:"hover me"}),placement:"bottom",children:[e.jsx("div",{className:"font-medium",children:"Up to date"}),e.jsx("div",{className:"text-muted-foreground mt-0.5",children:"Last synced 2m ago"})]})})};var a,o,d;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  render: () => <div className="p-density-8 flex justify-center">
      <HoverCard trigger={<span className="underline cursor-help">hover me</span>} placement="top">
        <div className="font-medium">Up to date</div>
        <div className="text-muted-foreground mt-0.5">Last synced 2m ago</div>
      </HoverCard>
    </div>
}`,...(d=(o=r.parameters)==null?void 0:o.docs)==null?void 0:d.source}}};var n,m,c;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <div className="p-density-8 flex justify-center">
      <HoverCard trigger={<span className="underline cursor-help">hover me</span>} placement="bottom">
        <div className="font-medium">Up to date</div>
        <div className="text-muted-foreground mt-0.5">Last synced 2m ago</div>
      </HoverCard>
    </div>
}`,...(c=(m=s.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};const j=["Default","BottomPlacement"];export{s as BottomPlacement,r as Default,j as __namedExportsOrder,f as default};
