import{j as r}from"./iframe-DcJ_qxo-.js";import{C as o}from"./CommandOutput-BcV8AagL.js";import{S as R}from"./rpc-story.fixtures-EnZKdHlU.js";import"./preload-helper-BHaa9cja.js";import"./DataTable-D6hTUrMR.js";import"./SortableHeader-CbJNAr7J.js";import"./utils-CR52uffu.js";import"./loading-drhO3A8d.js";import"./Modal-D5LfNLhd.js";import"./index-CJzp93fx.js";import"./index-C87Cj4N-.js";import"./Icon-CpsIiiDa.js";import"./button-BrhqiWW9.js";import"./index-0zBpNI7D.js";import"./modalStack-Ndcu_IxN.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BfZzPbE4.js";import"./floating-ui.react-16yx2Bpr.js";import"./FilterPill-O7bahigf.js";import"./Combobox-Df76UW-U.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-kJldhYxi.js";import"./MultiSelect-C9B0ZTpo.js";import"./RangeSlider-iGqTrEne.js";import"./TimeRange-BMnaVn4b.js";import"./select-Jm7dVTv6.js";import"./data-table-filter-values-DUyokwAE.js";import"./Timestamp-Du22-tbp.js";import"./TagList-5MY6A5cp.js";import"./Badge-YaZzxPY4.js";import"./HoverCard-CrzSmvg1.js";import"./Properties---5GJGoh.js";import"./IconButton-D2nL-Ooa.js";import"./DropdownMenu-D4y_4CEm.js";import"./DropdownMenuSubmenu-CEuZulqI.js";import"./StatusDot-DnRzunyz.js";import"./Clicky-_Uhe5uGg.js";import"./queryClient-Dqu5jory.js";import"./suspense-D06MIgr4.js";import"./useQuery-CZHg3eKq.js";import"./FilterForm-D8rGEGwh.js";import"./formMetadata-CXcCP4wB.js";import"./types-BHfRQr8X.js";import"./Tree-BmGkeGo1.js";import"./TreeNode-Bzh77Ysr.js";import"./ObjectGraph-DRUAxPL8.js";import"./ExecutionTree-B8ED3pue.js";import"./CodeBlock-DY9bu_LA.js";import"./CodeDiff-CAQ6_WlG.js";import"./SegmentedControl-CTUfr_W4.js";import"./code-highlight-D4J1xWXq.js";import"./JsonView-BEjODu5h.js";import"./RenderedStackTrace-Bx_QFKN5.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
