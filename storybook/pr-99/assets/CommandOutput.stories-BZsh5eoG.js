import{j as r}from"./iframe-DPCKfhUU.js";import{C as t}from"./CommandOutput-C7EiQbJ5.js";import{S as R}from"./rpc-story.fixtures-B1DXPvnt.js";import"./preload-helper-BCNcasCO.js";import"./DataTable-DV72dPij.js";import"./SortableHeader-Cb5KVF_5.js";import"./utils-DW-IJACk.js";import"./loading-BG9apmJx.js";import"./router-BFwEQD9N.js";import"./Modal-C2yzBEFr.js";import"./index-B3Aoa8ie.js";import"./index-C7L_BM3M.js";import"./Icon-DSGt7Mo2.js";import"./button-BRy1qK7g.js";import"./index-CPURVhFy.js";import"./modalStack-CXC147LT.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dhhd2ltF.js";import"./floating-ui.react-BEtJE_L2.js";import"./FilterPill-BH7sqdYv.js";import"./Combobox-CnZ1Ars5.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-C8b6LJoe.js";import"./MultiSelect-BmqEVc_p.js";import"./RangeSlider-D0k6ky-r.js";import"./TimeRange-CYHfjysz.js";import"./select-CJBzvO-L.js";import"./WorkloadPicker-BklWKNgW.js";import"./NamespacePicker-DLOcX6Zo.js";import"./index-Mce-3mm_.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DHdGxE3t.js";import"./TagList-De_gUxR3.js";import"./Badge-C9IzEfrw.js";import"./HoverCard-ByQQA9lk.js";import"./Properties-BGWYJaCD.js";import"./IconButton-BV5YYNFo.js";import"./DropdownMenu-CY5RY703.js";import"./DropdownMenuSubmenu-Dg2RBf62.js";import"./StatusDot-BqBxciGA.js";import"./Clicky-DR5Y8VPy.js";import"./queryClient-CH-Q1fLz.js";import"./suspense-Cu5yEGLz.js";import"./useQuery-DXk0UROZ.js";import"./FilterForm-BxAq6DCf.js";import"./formMetadata-fzDaMxNs.js";import"./ErrorDetails-BHxxYFD5.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DStVmgew.js";import"./TreeNode-B5lgtrlv.js";import"./ObjectGraph-HIB3s4T-.js";import"./ExecutionTree-C2BeZKi-.js";import"./CodeBlock-BtQodoMG.js";import"./CodeDiff-hsr2OoIp.js";import"./SegmentedControl-B33AJU3E.js";import"./HighlightedTokens-BUwvGOgD.js";import"./JsonView-B1k9i-kj.js";import"./AccordionList-08Q1Y_BZ.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-CfLCUoIe.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DagupW_Z.js";import"./FrameSourceWindow-B6aB4RHD.js";import"./useDebugAction-B0BcbwNB.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Ar={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=e.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(g=(x=a.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;m.parameters={...m.parameters,docs:{...(E=m.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Dr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,e as Table,s as Text,Dr as __namedExportsOrder,Ar as default};
