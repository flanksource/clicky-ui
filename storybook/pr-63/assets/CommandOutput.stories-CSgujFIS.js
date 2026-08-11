import{j as r}from"./iframe-DQ4bl7_4.js";import{C as o}from"./CommandOutput-Dn4I_jVI.js";import{S as R}from"./rpc-story.fixtures-BTQdgIkA.js";import"./preload-helper-Bz0j3TbD.js";import"./DataTable-BIhIWVdv.js";import"./SortableHeader-Bl25FxIR.js";import"./utils-CR52uffu.js";import"./loading-DLaiJr6O.js";import"./Modal-A8cU230p.js";import"./index-COx9F93F.js";import"./index-CSwS8kWJ.js";import"./Icon-DnY4_zIX.js";import"./button-BeRBp0Vq.js";import"./index-0zBpNI7D.js";import"./modalStack-iZddL8t7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-XaiX_XX5.js";import"./floating-ui.react-Dv7k8fxD.js";import"./FilterPill-Dv_PE72E.js";import"./Combobox-CyMFz8Gz.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DD4D3IeG.js";import"./MultiSelect-M2Un-Ynr.js";import"./RangeSlider-DOxPOVM4.js";import"./TimeRange-DPn6r5BI.js";import"./select-Do8XwOIJ.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-C0LdJH7o.js";import"./TagList-CwX7ZRct.js";import"./Badge-BQiYcG35.js";import"./HoverCard-rof_d5zl.js";import"./Properties-C41onsKP.js";import"./IconButton-BGaAj_3G.js";import"./DropdownMenu-CwoDXHYK.js";import"./DropdownMenuSubmenu-DGHn6Q5L.js";import"./StatusDot-C19dgJ6r.js";import"./Clicky-BCZARzou.js";import"./queryClient-De70mCZd.js";import"./suspense-BrFwC3ta.js";import"./useQuery-Dj6lRoNB.js";import"./FilterForm-BHlJZIOp.js";import"./formMetadata-BO3IGT96.js";import"./types-BHfRQr8X.js";import"./Tree-BqDaXQ4q.js";import"./TreeNode-B3_q2G5T.js";import"./ObjectGraph-B_0OQOqH.js";import"./ExecutionTree-BIAU4tbx.js";import"./CodeBlock-DmsWW9nz.js";import"./CodeDiff-B_zFeLLt.js";import"./SegmentedControl-nX18AODg.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-BHIpvIaJ.js";import"./RenderedStackTrace-Dp8bUrFY.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Tr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const yr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,yr as __namedExportsOrder,Tr as default};
