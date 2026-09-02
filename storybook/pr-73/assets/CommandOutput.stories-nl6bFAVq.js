import{j as r}from"./iframe-z_87u_i8.js";import{C as e}from"./CommandOutput-CzAnU8kH.js";import{S as R}from"./rpc-story.fixtures-CJFJatTa.js";import"./preload-helper-CF8-vpnN.js";import"./DataTable-8VqtnoPY.js";import"./SortableHeader-bAb4Ghhg.js";import"./utils-DW-IJACk.js";import"./loading-Cm1g_EBX.js";import"./router-fzEdyM0X.js";import"./Modal-BeIIxoJI.js";import"./index-ChBxwgT3.js";import"./index-DRRKWcil.js";import"./Icon-C9ocM_xh.js";import"./button-CJTNZJ-T.js";import"./index-CPURVhFy.js";import"./modalStack-CP4qI3Kt.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Di2LT9C1.js";import"./floating-ui.react-BejTFmOT.js";import"./FilterPill-LwJBfj_W.js";import"./Combobox-DK8e0no7.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DFCCVSCP.js";import"./MultiSelect-BrbcD_4O.js";import"./RangeSlider-DRSUXfC0.js";import"./TimeRange-uYzq3TS1.js";import"./select-9ddVKvGE.js";import"./WorkloadPicker-BYFLOH5c.js";import"./NamespacePicker-BBREDp39.js";import"./index-BohWVV1E.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CkXUtmdj.js";import"./TagList-DU5wVCgN.js";import"./Badge-BsO2uSdd.js";import"./HoverCard-HszSLRoL.js";import"./Properties-CGWhPx35.js";import"./IconButton-DjuJu4SP.js";import"./DropdownMenu-B-msHBwS.js";import"./DropdownMenuSubmenu-rye4V25j.js";import"./StatusDot-Co8kql96.js";import"./Clicky-DHtDZmMe.js";import"./queryClient-Dy0p3Dqe.js";import"./suspense-nTUcgQsj.js";import"./useQuery-BHcAtdka.js";import"./FilterForm-C8HmHISV.js";import"./formMetadata-Dx9LZ1KN.js";import"./ErrorDetails-DC6_RB8a.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-D_zw0rmX.js";import"./TreeNode-CDnNAXyA.js";import"./ObjectGraph-CODxbstT.js";import"./ExecutionTree-DAMfiguX.js";import"./CodeBlock-CGI02UCw.js";import"./CodeDiff-BLdup0MV.js";import"./SegmentedControl-DeFMsDAj.js";import"./HighlightedTokens-6jIi_OKg.js";import"./JsonView-C4V0FWRs.js";import"./RenderedStackTrace-me-wOq63.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Mh6JLxw6.js";import"./FrameSourceWindow-cnx9YLjH.js";import"./useDebugAction-BZTQrpMu.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Lr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Mr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Mr as __namedExportsOrder,Lr as default};
