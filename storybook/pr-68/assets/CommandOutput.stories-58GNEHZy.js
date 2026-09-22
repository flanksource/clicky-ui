import{j as r}from"./iframe-BTxADGbc.js";import{C as e}from"./CommandOutput-CFvpnbfl.js";import{S as R}from"./rpc-story.fixtures-BsF85teU.js";import"./preload-helper-95TtevsV.js";import"./DataTable-CKshF43V.js";import"./SortableHeader-BpG9FLli.js";import"./utils-DW-IJACk.js";import"./loading-ZXW1-FyE.js";import"./router-CiqoLGl0.js";import"./Modal-BJSsoZSJ.js";import"./index-RbZdIcw5.js";import"./index-Bz5-7ute.js";import"./Icon-DyQmy9zD.js";import"./button-uOKQbD2U.js";import"./index-CPURVhFy.js";import"./modalStack-CBI-I8Y5.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-yYKLUgrv.js";import"./floating-ui.react-s2gbsc2n.js";import"./FilterPill-BtWteifY.js";import"./Combobox-C3rdbpG1.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-al_sBZQx.js";import"./MultiSelect-CFdHhfPl.js";import"./RangeSlider-jqxYk1GP.js";import"./TimeRange-CLUngLZP.js";import"./select-XLvWghXg.js";import"./WorkloadPicker-QJPIrp89.js";import"./NamespacePicker-D7Kg-gcT.js";import"./index-CXdr-XwC.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C6MZi5gA.js";import"./TagList-CVxQuAya.js";import"./Badge-8t6xVVQj.js";import"./HoverCard-Cms3aoCY.js";import"./Properties-VVxglCX7.js";import"./IconButton-Df5t7P9x.js";import"./DropdownMenu-CfcxM9h_.js";import"./DropdownMenuSubmenu-WTMYamx5.js";import"./StatusDot-B4MdnWlu.js";import"./Clicky-CLNSLSE4.js";import"./queryClient-mH0Kj2UO.js";import"./suspense-R121YCY6.js";import"./useQuery-Do8-jH8C.js";import"./FilterForm-vmPSk3e6.js";import"./formMetadata-BDZzPW2I.js";import"./ErrorDetails-BE-ycS1n.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CITsSa4C.js";import"./TreeNode-BbGDjTv7.js";import"./ObjectGraph-j4Rcayj4.js";import"./ExecutionTree-BNRCxPtm.js";import"./CodeBlock-DralUSHB.js";import"./CodeDiff-Md3mH8qB.js";import"./SegmentedControl-Cb6p-V2x.js";import"./HighlightedTokens-DoVhJSb4.js";import"./JsonView-CF7nUUT6.js";import"./RenderedStackTrace-CNv8TvjE.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Dkv1Dtnx.js";import"./FrameSourceWindow-Ha-iWi99.js";import"./useDebugAction-Uzb-NrBT.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Mr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=t.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Xr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Xr as __namedExportsOrder,Mr as default};
