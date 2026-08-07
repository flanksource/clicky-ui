import{j as r}from"./iframe-D67R8bbl.js";import{C as o}from"./CommandOutput-Cy4GDrfR.js";import{S as R}from"./rpc-story.fixtures-BbhykSFG.js";import"./preload-helper-DOqJbnTS.js";import"./DataTable-CaeoLlDX.js";import"./SortableHeader-DxNelsAH.js";import"./utils-CR52uffu.js";import"./loading-DP1-eLX0.js";import"./Modal-1Le8WqYW.js";import"./index-C_dsp8ua.js";import"./index-oLIJbLP-.js";import"./Icon-00lqZtC6.js";import"./button-B2bNDku0.js";import"./index-0zBpNI7D.js";import"./modalStack-C9QH0czZ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Duk6_79F.js";import"./floating-ui.react-BtRXUcG_.js";import"./FilterPill-sHOUOS6w.js";import"./Combobox-CeAjpFOD.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-kTuYkj_o.js";import"./MultiSelect-KOsHntV-.js";import"./RangeSlider-D2ibsQzf.js";import"./TimeRange-Ab17F-yg.js";import"./select-CdiVheQc.js";import"./Timestamp-D-NcJsOp.js";import"./TagList-9QOGAv__.js";import"./Badge-CHwM5g8P.js";import"./HoverCard-CmT1a-0w.js";import"./Properties-CtT3PEHb.js";import"./IconButton-BuzR3ewI.js";import"./DropdownMenu-CDTUpdji.js";import"./DropdownMenuSubmenu-2o-p-5ar.js";import"./StatusDot-B10hZu0f.js";import"./Clicky-D0RgpgsU.js";import"./queryClient-oA7bqceF.js";import"./suspense-CSF7qThl.js";import"./useQuery-Dzc8SiVb.js";import"./FilterForm-CflEM87z.js";import"./types-BHfRQr8X.js";import"./Tree-OUiJW__0.js";import"./TreeNode-tbuSp1Aa.js";import"./ObjectGraph-BRa1u6ZT.js";import"./ExecutionTree-C_qhmmiv.js";import"./CodeBlock-CPSY-gS6.js";import"./CodeDiff-TZc5ReZ3.js";import"./SegmentedControl-CXLCk4s0.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-BbHOU84J.js";import"./RenderedStackTrace-B173wpFU.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},vr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(p=(i=t.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    response: TEXT_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;n.parameters={...n.parameters,docs:{...(E=n.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Nr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,Nr as __namedExportsOrder,vr as default};
