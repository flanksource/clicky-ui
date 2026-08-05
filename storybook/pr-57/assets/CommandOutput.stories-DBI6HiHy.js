import{j as r}from"./iframe-B_YORxVu.js";import{C as o}from"./CommandOutput-DcA2AHAk.js";import{S as R}from"./rpc-story.fixtures-Dxij8OlF.js";import"./preload-helper-DOqJbnTS.js";import"./DataTable-BDsHfnxq.js";import"./SortableHeader-CFXjVj_q.js";import"./utils-CR52uffu.js";import"./loading-pMtHz37B.js";import"./Modal-B4OsKOmd.js";import"./index-CfE1U_s6.js";import"./index-BRenbefL.js";import"./Icon-DjLJbeXf.js";import"./button-D9BhcXI8.js";import"./index-0zBpNI7D.js";import"./modalStack-BJ_GGWUZ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CIa5SyUw.js";import"./floating-ui.react-D-fTvToP.js";import"./FilterPill-qyCKSkER.js";import"./Combobox-C5z8LI3F.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BrMfJRCo.js";import"./MultiSelect-CJH1iNcX.js";import"./RangeSlider-BPoIjqNZ.js";import"./TimeRange-D_FelsTz.js";import"./select-BZpvsKD3.js";import"./Timestamp-D9jIvOD8.js";import"./TagList-DucigsZz.js";import"./Badge-Dxm4rhu4.js";import"./HoverCard-4dx96xWm.js";import"./Properties-i__Vk37o.js";import"./IconButton-CqoUdsEZ.js";import"./DropdownMenu-DUc74WUd.js";import"./DropdownMenuSubmenu-D4jsPGhx.js";import"./StatusDot-DWnztYc-.js";import"./Clicky-CECw5I1m.js";import"./queryClient-uSdsAt3j.js";import"./suspense-CZxcdsx1.js";import"./mutation-wYrl-QMr.js";import"./useQuery-Dg8eqbl6.js";import"./FilterForm-jgXYZNnh.js";import"./types-BHfRQr8X.js";import"./Tree-FTAuC4G-.js";import"./TreeNode-DR29kqP3.js";import"./ObjectGraph-BDX9WAtB.js";import"./ExecutionTree-BxK8XKHN.js";import"./CodeBlock-VZZhQhuK.js";import"./CodeDiff-ByzIf6rH.js";import"./SegmentedControl-z8ZDC1ID.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-CppafzCm.js";import"./RenderedStackTrace-BAOCkSBP.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Nr={title:"Clicky-RPC/CommandOutput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},s={args:{response:v},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},a={args:{response:N},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})},n={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:e=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(o,{...e})})};var m,i,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(O=(S=n.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Tr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,n as Loading,t as Table,s as Text,Tr as __namedExportsOrder,Nr as default};
