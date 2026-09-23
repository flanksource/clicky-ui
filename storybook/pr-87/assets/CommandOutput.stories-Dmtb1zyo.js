import{j as r}from"./iframe-Cxdv9pi7.js";import{C as e}from"./CommandOutput-B3r0PjhU.js";import{S as R}from"./rpc-story.fixtures-DeRznb4D.js";import"./preload-helper-DU1Q6aPJ.js";import"./DataTable-D8-94cTt.js";import"./SortableHeader-B4oPcjSS.js";import"./utils-DW-IJACk.js";import"./loading-BfmDh766.js";import"./router-DdBNp8gn.js";import"./Modal-Kx8XoI2v.js";import"./index-BRY3IRA4.js";import"./index-CkkiTvvU.js";import"./Icon-TQmWXc2S.js";import"./button-CDUpBuy9.js";import"./index-CPURVhFy.js";import"./modalStack-C_WhG_d9.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Cvmpirj_.js";import"./floating-ui.react-mjp4aH0C.js";import"./FilterPill-4MdiEeIE.js";import"./Combobox-B0h9NCBj.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BPSia-hN.js";import"./MultiSelect-CFMQ6ZtD.js";import"./RangeSlider-CVjotkm5.js";import"./TimeRange-CWALHETR.js";import"./select-DKBCBXRK.js";import"./WorkloadPicker-DC8WWEPi.js";import"./NamespacePicker-C_VymA-J.js";import"./index-BqC3x6pn.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-eT6bGImm.js";import"./TagList-CZry1hBB.js";import"./Badge-DvE9OLG-.js";import"./HoverCard-89Zdu8CL.js";import"./Properties-DLVUf3n9.js";import"./IconButton-eNA5Ynby.js";import"./DropdownMenu-Cqi-ljGX.js";import"./DropdownMenuSubmenu-P1llKkBa.js";import"./StatusDot-Dg9mat1A.js";import"./Clicky-VK9F7Dte.js";import"./queryClient-BvfX_gQa.js";import"./suspense-BBKIdfHr.js";import"./useQuery-B2XDA36M.js";import"./FilterForm-BjGff0cy.js";import"./formMetadata-D_gFXAbi.js";import"./ErrorDetails-Dq4zVYZC.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BkNuhnkb.js";import"./TreeNode-B1D0wvGU.js";import"./ObjectGraph-CICt2gCI.js";import"./ExecutionTree-3pcCKn64.js";import"./CodeBlock-COdx_xEw.js";import"./CodeDiff-B_kUey21.js";import"./SegmentedControl-hhBGtqdI.js";import"./HighlightedTokens-DBaNk6YB.js";import"./JsonView-Ds_lvjLt.js";import"./RenderedStackTrace-BFEyqhTp.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DXewFYj2.js";import"./FrameSourceWindow-B0-u_snW.js";import"./useDebugAction-CAsfFxlL.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
