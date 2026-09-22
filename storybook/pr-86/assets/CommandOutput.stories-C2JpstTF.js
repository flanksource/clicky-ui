import{j as r}from"./iframe-DyL4RmGG.js";import{C as e}from"./CommandOutput-CU6FPM68.js";import{S as R}from"./rpc-story.fixtures-JPf8WlwB.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-B9Ni89Cc.js";import"./SortableHeader-CsBsanRr.js";import"./utils-DW-IJACk.js";import"./loading-BIPMexql.js";import"./router-P2eAZl8q.js";import"./Modal-D7h-gNLF.js";import"./index-MomY5yw3.js";import"./index-BKFNVha0.js";import"./Icon-COVZwsWL.js";import"./button-BTOItCTV.js";import"./index-CPURVhFy.js";import"./modalStack-CzjsIGEp.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D3TyIYlq.js";import"./floating-ui.react-D_VnvmSA.js";import"./FilterPill-Dc-XIIV5.js";import"./Combobox-BG0Xf9lH.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BYL8bwfW.js";import"./MultiSelect-DUX4HHkw.js";import"./RangeSlider-CmrMRIzO.js";import"./TimeRange-DiFGKwdF.js";import"./select-Ccdp56zq.js";import"./WorkloadPicker-RqDiaXWc.js";import"./NamespacePicker-DSdKRtWc.js";import"./index-CZuWoAov.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BgTC8mmn.js";import"./TagList-CdGtnH4Z.js";import"./Badge-CuymrnrW.js";import"./HoverCard-BfwUXTN4.js";import"./Properties-haC5AlD6.js";import"./IconButton-C8c2Bsu4.js";import"./DropdownMenu-BUAttuFQ.js";import"./DropdownMenuSubmenu-D9QpaiqI.js";import"./StatusDot-Dwn1oJ3O.js";import"./Clicky-B9LogNQU.js";import"./queryClient-Xt9RVV6X.js";import"./suspense-jN3_x6dp.js";import"./useQuery-CCeNnrIr.js";import"./FilterForm-Ddj2N-Do.js";import"./formMetadata-CR-9BXXl.js";import"./ErrorDetails-B2VTKF_s.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DbKiRmyq.js";import"./TreeNode-C5L9qvxU.js";import"./ObjectGraph-DPbNrDLB.js";import"./ExecutionTree-B3IxltO8.js";import"./CodeBlock-D4_Ksmg1.js";import"./CodeDiff-1daKgTMf.js";import"./SegmentedControl-CkXrgfJk.js";import"./HighlightedTokens-H9zsTVBN.js";import"./JsonView-DhsCquBn.js";import"./RenderedStackTrace-BMZBc9zZ.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DEf2SALW.js";import"./FrameSourceWindow-BNmz6tFO.js";import"./useDebugAction-B87PsPa9.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
