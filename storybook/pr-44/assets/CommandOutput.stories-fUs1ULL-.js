import{j as r}from"./iframe-BpRSSwZm.js";import{C as o}from"./CommandOutput-DZ3S8M8o.js";import{S as R}from"./rpc-story.fixtures-DXnHj7G9.js";import"./preload-helper-CLp6iKya.js";import"./DataTable-C_TP0TMN.js";import"./SortableHeader-Bu9W0epj.js";import"./utils-CR52uffu.js";import"./loading-B8gOCNAl.js";import"./router-D9vrXfcM.js";import"./Modal-B4v8wYIW.js";import"./index-Y5o9M25-.js";import"./index-DUpNOTYa.js";import"./Icon-mdei39NN.js";import"./button-DLaYyks1.js";import"./index-0zBpNI7D.js";import"./modalStack-qb8VAS8H.js";import"./zIndex-CigQ76av.js";import"./FilterBar-BnTl-4Gp.js";import"./floating-ui.react-ydHiv85u.js";import"./FilterPill-sEltd1ql.js";import"./Combobox-DjE7sgYB.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DRQNNMH2.js";import"./MultiSelect-eMPySnKt.js";import"./RangeSlider-D8uMZEDj.js";import"./TimeRange-CFDfjNdi.js";import"./select-DHhlOnRO.js";import"./Timestamp-CbLTiDkv.js";import"./TagList-DL29ue-V.js";import"./Badge-DQwt5d9M.js";import"./HoverCard-DWlCv7iK.js";import"./Properties-D_EIRMMi.js";import"./IconButton-DIUFES9F.js";import"./DropdownMenu-CzLZmhEc.js";import"./DropdownMenuSubmenu-C_C-NJyU.js";import"./StatusDot-D03eDjdi.js";import"./Clicky-BrTo3dqy.js";import"./suspense-Bm9qLk9Q.js";import"./useQuery-tUnMcK4b.js";import"./FilterForm-n8pm_xBr.js";import"./types-BHfRQr8X.js";import"./Tree-y1ekuV-M.js";import"./TreeNode-D11JrkY-.js";import"./ObjectGraph-B-MeAXJL.js";import"./ExecutionTree-BIiUZLJe.js";import"./CodeBlock-C4tvl0Xs.js";import"./CodeDiff-DAjIEADB.js";import"./SegmentedControl-D-o8xn64.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-DrQbbUFP.js";import"./RenderedStackTrace-hlaca-Th.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
