import{j as r}from"./iframe-Dd752MYf.js";import{C as o}from"./CommandOutput-DqQ3ljgz.js";import{S as R}from"./rpc-story.fixtures-0gWXJCqq.js";import"./preload-helper-B2LPdJL4.js";import"./DataTable-BZKk4EL7.js";import"./SortableHeader-gr8hzJGg.js";import"./utils-CR52uffu.js";import"./loading-Cf-BAp-_.js";import"./Modal-BSuZsloP.js";import"./index-DIEIIbJ9.js";import"./index-DUsaV9HH.js";import"./Icon-9CMiNgil.js";import"./button-oBk_H1Zb.js";import"./index-0zBpNI7D.js";import"./modalStack-Bx1u-msU.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-fOx97ty3.js";import"./floating-ui.react-BkDfFHxo.js";import"./FilterPill-BW2EVU2l.js";import"./Combobox-DkmILrX4.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-69bNTbeH.js";import"./MultiSelect-DnpVH0A0.js";import"./RangeSlider-D_8GqZjC.js";import"./TimeRange-ChFkp1Al.js";import"./select-Ddx3qY70.js";import"./Timestamp-CcW3ak_D.js";import"./TagList-D3gW21JY.js";import"./Badge-B3qsnIIF.js";import"./HoverCard-Crti9dY4.js";import"./Properties-BDD0BLQa.js";import"./IconButton-C1pNAZbT.js";import"./DropdownMenu-ERsj2HNy.js";import"./DropdownMenuSubmenu-U-7b-fg3.js";import"./StatusDot-CcgQ-eNO.js";import"./Clicky-DRxWjmR3.js";import"./queryClient-B1QWIaGw.js";import"./suspense-CFyf-78g.js";import"./useQuery-BEgyAIho.js";import"./FilterForm-DIB7AwMy.js";import"./types-BHfRQr8X.js";import"./Tree-CZTGgUia.js";import"./TreeNode-BVxZefmo.js";import"./ObjectGraph-DqD4QGHN.js";import"./ExecutionTree-9yVYXE-k.js";import"./CodeBlock-DJn6wlWo.js";import"./CodeDiff-uian-6aN.js";import"./SegmentedControl-BKbAH4_-.js";import"./code-highlight-Dq2IweCb.js";import"./JsonView-DIJ3Gg6E.js";import"./RenderedStackTrace-CGl2Ztfd.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
