import{j as r}from"./iframe-DBr7zNeS.js";import{C as o}from"./CommandOutput-DpEGDEah.js";import{S as R}from"./rpc-story.fixtures-D0IR56PB.js";import"./preload-helper-DOqJbnTS.js";import"./DataTable-B2m3n0es.js";import"./SortableHeader-DM8CAR9h.js";import"./utils-CR52uffu.js";import"./loading-BPm7-hB-.js";import"./Modal-BzNkJxbb.js";import"./index-DBE-7TL_.js";import"./index-C-JF4fJV.js";import"./Icon-BJt4CZDw.js";import"./button--5fQhbPU.js";import"./index-0zBpNI7D.js";import"./modalStack-C6iTnFFa.js";import"./zIndex-CigQ76av.js";import"./FilterBar-BHnbvGY6.js";import"./floating-ui.react-BCE0IOJT.js";import"./FilterPill-WxwJ1QL9.js";import"./Combobox-DTB8HFTN.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-qAZFKFT2.js";import"./MultiSelect-ByU1bG3I.js";import"./RangeSlider-KloiZnQb.js";import"./TimeRange-gf_40WHB.js";import"./select-DAheWgSH.js";import"./Timestamp-B5T8MNEq.js";import"./TagList-CZ1MPPmD.js";import"./Badge-F5qv-XWB.js";import"./HoverCard-CZ0fVunH.js";import"./Properties-Bi0j1f_B.js";import"./IconButton-DlLMtFGc.js";import"./DropdownMenu-QeSunhD0.js";import"./DropdownMenuSubmenu-XC3IPjqo.js";import"./StatusDot-CM0lad9X.js";import"./Clicky-4qqDL9wl.js";import"./queryClient-CIFdlNPk.js";import"./suspense-B9xzBg3Z.js";import"./mutation-DjAaOOqk.js";import"./useQuery-D9jr5NkO.js";import"./FilterForm-zITJuKMX.js";import"./types-BHfRQr8X.js";import"./Tree-Cuyc1ZQ2.js";import"./TreeNode-DgHLhj1_.js";import"./ObjectGraph-D7ZEJNV6.js";import"./ExecutionTree-DQ5B-PXd.js";import"./CodeBlock-CYMDJQRj.js";import"./CodeDiff-CU74KV1I.js";import"./SegmentedControl-BUfs-Zk7.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-abkuV3YG.js";import"./RenderedStackTrace-CWhkQaQG.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
