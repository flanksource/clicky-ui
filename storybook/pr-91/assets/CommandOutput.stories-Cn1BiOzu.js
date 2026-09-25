import{j as r}from"./iframe-DxH86FBA.js";import{C as e}from"./CommandOutput-CK8uV67W.js";import{S as R}from"./rpc-story.fixtures-PGD5Zdia.js";import"./preload-helper-CwXsRPHT.js";import"./DataTable-Dea7G-99.js";import"./SortableHeader-DjHmFvj-.js";import"./utils-DW-IJACk.js";import"./loading-DCaPMG1Q.js";import"./router-BWt9CQWg.js";import"./Modal-i45K_l92.js";import"./index-L0gHVN2T.js";import"./index-CZl4QIDy.js";import"./Icon-w2YOVKhv.js";import"./button-O6d4Fxrc.js";import"./index-CPURVhFy.js";import"./modalStack-DuyRP-Gh.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DvhEU1sY.js";import"./floating-ui.react-DSfQFonv.js";import"./FilterPill-Df2C1Mtk.js";import"./Combobox-THEiNRgN.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bohm6PVx.js";import"./MultiSelect-D5Q4hKOt.js";import"./RangeSlider-L3xi1L8_.js";import"./TimeRange-DL8fsPh4.js";import"./select-D5Eidm6d.js";import"./WorkloadPicker-BYkdP8oF.js";import"./NamespacePicker-IG95wyrx.js";import"./index-DWlcCXij.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BEF7w3Cd.js";import"./TagList-DGZniD0r.js";import"./Badge-ul0vb2Pp.js";import"./HoverCard-BGftSBK_.js";import"./Properties-DN4TjyBB.js";import"./IconButton-C9GSHWpU.js";import"./DropdownMenu-D1hlo_Nj.js";import"./DropdownMenuSubmenu-t2kTmtnY.js";import"./StatusDot-Bk9YGGtj.js";import"./Clicky-PLLonyM0.js";import"./queryClient-bxPR4XMB.js";import"./suspense-Ds0fW1nV.js";import"./useQuery-ClfnYRUt.js";import"./FilterForm-BU7FgY94.js";import"./formMetadata-Csc6P2gb.js";import"./ErrorDetails-D9qLjSdC.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DYj4yj7v.js";import"./TreeNode-0_t9gltg.js";import"./ObjectGraph-caalOJxF.js";import"./ExecutionTree-DomyZCC3.js";import"./CodeBlock-DPXYBExk.js";import"./CodeDiff-D61IJrGu.js";import"./SegmentedControl-DLtJY0HA.js";import"./HighlightedTokens-DNniJjSO.js";import"./JsonView-GcXUgX4X.js";import"./RenderedStackTrace-CjjP8EnL.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-0XbbxrnZ.js";import"./FrameSourceWindow-C3F45jA9.js";import"./useDebugAction-DkTbyXqV.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
