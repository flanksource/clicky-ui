import{j as r}from"./iframe-i4NO8c1E.js";import{C as e}from"./CommandOutput-B7NBO06p.js";import{S as R}from"./rpc-story.fixtures-Dqt4VG7e.js";import"./preload-helper-BlVIKJwt.js";import"./DataTable-Db_MymIm.js";import"./SortableHeader-Q2D_vpwD.js";import"./utils-DW-IJACk.js";import"./loading-DnEu1w-x.js";import"./router-BMuzg1Ev.js";import"./Modal-Dd2S2-_M.js";import"./index-DWciXVe1.js";import"./index-DEkhUzMm.js";import"./Icon-0OQ-QiFy.js";import"./button-IkBZAOc5.js";import"./index-CPURVhFy.js";import"./modalStack-BYsD3NGk.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D_oX65V9.js";import"./floating-ui.react-CZe8-7HK.js";import"./FilterPill-C80r3osm.js";import"./Combobox-B2mxizyE.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DdyCgkg3.js";import"./MultiSelect-BYUdv49T.js";import"./RangeSlider-Br7-UQ1q.js";import"./TimeRange-qiPHz8BS.js";import"./select-BckbOhrF.js";import"./WorkloadPicker-C71l4ptm.js";import"./NamespacePicker-CLlX85sq.js";import"./index-FGRaKX4A.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BCNJiiiv.js";import"./TagList-pvI1Pj0j.js";import"./Badge-B6MJiOJm.js";import"./HoverCard-RVi8pXL2.js";import"./Properties-CJdGVwGL.js";import"./IconButton-yDMtv4_j.js";import"./DropdownMenu-D0XmeiBD.js";import"./DropdownMenuSubmenu-DDvaJL7u.js";import"./StatusDot-DbYUeTyl.js";import"./Clicky-CIZJlbm_.js";import"./queryClient-dzBNKRSa.js";import"./suspense-CQwkdriE.js";import"./useQuery-2LJCXhTo.js";import"./FilterForm-CtmO42pI.js";import"./formMetadata-DCnC-GzU.js";import"./ErrorDetails-lfzDKb-z.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BNwzUv5X.js";import"./TreeNode-DPzcDfl8.js";import"./ObjectGraph-DGUfZsmB.js";import"./ExecutionTree-Cdig0IFH.js";import"./CodeBlock-BGsGTuKI.js";import"./CodeDiff-B_gaadla.js";import"./SegmentedControl-BZS04MJf.js";import"./HighlightedTokens-CQy1Ma1d.js";import"./JsonView-Dj4e_qpk.js";import"./RenderedStackTrace-EWHFV7oy.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-B7dc2aBo.js";import"./FrameSourceWindow-Dufpx1Oh.js";import"./useDebugAction-DGkuqVKq.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
