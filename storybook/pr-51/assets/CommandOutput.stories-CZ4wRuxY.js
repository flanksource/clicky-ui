import{j as r}from"./iframe-BQHWjYXO.js";import{C as o}from"./CommandOutput-Cl9XJJIV.js";import{S as R}from"./rpc-story.fixtures-BZzQUD7i.js";import"./preload-helper-NECxGHhd.js";import"./DataTable-BdUWSmAj.js";import"./SortableHeader-Ju28BIjH.js";import"./utils-CR52uffu.js";import"./loading-CVssmfQF.js";import"./router-D1ozWhGX.js";import"./Modal-D2ePUGYK.js";import"./index-DfkcjULU.js";import"./index-DK2AMwkg.js";import"./Icon-DqVmIZAK.js";import"./button-CAHLihQQ.js";import"./index-0zBpNI7D.js";import"./modalStack-BV2RLcYb.js";import"./zIndex-CigQ76av.js";import"./FilterBar-CZYh5N_g.js";import"./floating-ui.react-68_lqgwR.js";import"./FilterPill-Ba81rHjB.js";import"./Combobox-Gm9lQ51G.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CcTeHnYK.js";import"./MultiSelect-DKZ6qUce.js";import"./RangeSlider-1REq9wFg.js";import"./TimeRange-DOQFufnU.js";import"./select-IBLTTtpA.js";import"./Timestamp-ogkjtWvq.js";import"./TagList-BYfprnrw.js";import"./Badge-DdAztv0i.js";import"./HoverCard-BuR0Rsqt.js";import"./Properties-5emfQEf6.js";import"./IconButton-CNrVHGU1.js";import"./DropdownMenu-BbjZol6M.js";import"./DropdownMenuSubmenu-CySj_Ja0.js";import"./StatusDot-BXbcZk5l.js";import"./Clicky-zj9-tFOj.js";import"./suspense-B0H5aSjH.js";import"./useQuery-Bw7YK2Oc.js";import"./FilterForm-Cu-FcOYu.js";import"./types-BHfRQr8X.js";import"./Tree-CAK6FhXI.js";import"./TreeNode-B5TpxXc9.js";import"./ObjectGraph-DZEREAVn.js";import"./ExecutionTree-BVe_Vqjp.js";import"./CodeBlock-DPyDzznt.js";import"./CodeDiff-CVr8sbI2.js";import"./SegmentedControl-DKiFPaCK.js";import"./code-highlight-Btxs0MAv.js";import"./JsonView-BsfgZLD9.js";import"./RenderedStackTrace-Bl6avqLr.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
