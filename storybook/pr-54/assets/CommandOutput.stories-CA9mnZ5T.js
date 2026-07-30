import{j as r}from"./iframe-BLMcgo_c.js";import{C as o}from"./CommandOutput-LDH4gOk0.js";import{S as R}from"./rpc-story.fixtures-D_Y6BK0D.js";import"./preload-helper-V0wJDdBF.js";import"./DataTable-PlMOUTHy.js";import"./SortableHeader-CSg98qW-.js";import"./utils-CR52uffu.js";import"./loading-iB_CRy-d.js";import"./Modal-BHR92wmy.js";import"./index-0GhwRIX8.js";import"./index-C6bGw4eq.js";import"./Icon-BjbjSuBq.js";import"./button-CEv4-a2z.js";import"./index-0zBpNI7D.js";import"./modalStack-D_rEmCN1.js";import"./zIndex-CigQ76av.js";import"./FilterBar-C_H9k_nL.js";import"./floating-ui.react-CNA9gpd9.js";import"./FilterPill-CbSFJXot.js";import"./Combobox-_lDNxkJT.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-C1a9DNKH.js";import"./MultiSelect-BBiKYftZ.js";import"./RangeSlider-Bp62seHz.js";import"./TimeRange-B8e-Z5ZI.js";import"./select-CijM4oyP.js";import"./Timestamp-Cc-tKo2X.js";import"./TagList-D1pD3VSL.js";import"./Badge-iQY0V9yL.js";import"./HoverCard-B_pkxN57.js";import"./Properties-D-5UQf25.js";import"./IconButton-L0ivsM0w.js";import"./DropdownMenu-CQgT7g8D.js";import"./DropdownMenuSubmenu-CA72N--A.js";import"./StatusDot-Ct3IJVj0.js";import"./Clicky-SiRnPfL0.js";import"./queryClient-DfcB1qXz.js";import"./suspense-C_QNafVG.js";import"./useQuery-C0FKZRw9.js";import"./FilterForm-z8THU0XR.js";import"./types-BHfRQr8X.js";import"./Tree-DM9VbXSX.js";import"./TreeNode-DizV2hB8.js";import"./ObjectGraph-B394ijQR.js";import"./ExecutionTree-CRoDmtGM.js";import"./CodeBlock-Bq3gmovv.js";import"./CodeDiff-D0RHEXPA.js";import"./SegmentedControl-BHAvUbO0.js";import"./code-highlight-BFfnWKQ0.js";import"./JsonView-HLu_KbKF.js";import"./RenderedStackTrace-CV5zcOlJ.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
