import{j as r}from"./iframe-DIGBtUIu.js";import{C as o}from"./CommandOutput-A-cm-R_o.js";import{S as R}from"./rpc-story.fixtures-BPZVxZWD.js";import"./preload-helper-Bz0j3TbD.js";import"./DataTable-CjiYOErP.js";import"./SortableHeader-DeCdyOuq.js";import"./utils-CR52uffu.js";import"./loading-D2cuqAxD.js";import"./Modal-BFrt9RBg.js";import"./index-CXQUnhiw.js";import"./index-evrdMFRC.js";import"./Icon-Ckp6RE90.js";import"./button-BhKCLqoA.js";import"./index-0zBpNI7D.js";import"./modalStack-C-EkQo6g.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DKEM-yVt.js";import"./floating-ui.react-CxgHPOfO.js";import"./FilterPill-DbdXEpGC.js";import"./Combobox-BgSWV58v.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DMZ4d6C6.js";import"./MultiSelect-DkVf6nxu.js";import"./RangeSlider-BP_bF84e.js";import"./TimeRange-BV4OpJTO.js";import"./select-DECEq3dq.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-CAeQnq5s.js";import"./TagList-ChUpvwJX.js";import"./Badge-CeO7XmU6.js";import"./HoverCard-DlH6gDP1.js";import"./Properties-CsbDH91a.js";import"./IconButton-CAaA5K_1.js";import"./DropdownMenu-CVD-ABeT.js";import"./DropdownMenuSubmenu-BK5dfo9E.js";import"./StatusDot-CWR5z1ge.js";import"./Clicky-Bbz1eKBc.js";import"./queryClient-BkwAYQYi.js";import"./suspense-DhOaPLvl.js";import"./useQuery-q_NYHJuJ.js";import"./FilterForm-BvrGPXw3.js";import"./formMetadata-B-1Ycvjf.js";import"./types-BHfRQr8X.js";import"./Tree-BC3pW9RS.js";import"./TreeNode-Bbb9eaqn.js";import"./ObjectGraph-BYtuhiVK.js";import"./ExecutionTree-CwhkCF8t.js";import"./CodeBlock-qb2M-WhO.js";import"./CodeDiff-DyOqFPkh.js";import"./SegmentedControl-CoaMDtpF.js";import"./code-highlight-Ev9vknTQ.js";import"./JsonView-CIcBiLEe.js";import"./RenderedStackTrace-BFqMqWLo.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
