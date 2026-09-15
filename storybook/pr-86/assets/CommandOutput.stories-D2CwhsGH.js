import{j as r}from"./iframe-9fOldjr2.js";import{C as e}from"./CommandOutput-vC5UNaPe.js";import{S as R}from"./rpc-story.fixtures-C9FpsJ-b.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-1i3iGrv9.js";import"./SortableHeader-DAqfmNib.js";import"./utils-DW-IJACk.js";import"./loading-CEI-SvW7.js";import"./router-Bj-enKmb.js";import"./Modal-DUXQNAPs.js";import"./index-C34MHfKY.js";import"./index-Bi8EVZEl.js";import"./Icon-BkUgp3wm.js";import"./button-DHo1DwEi.js";import"./index-CPURVhFy.js";import"./modalStack-C6PZaG8M.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C3h1BYM5.js";import"./floating-ui.react-CNbHq_-f.js";import"./FilterPill-CHM0Kb7W.js";import"./Combobox-Cdlj5MHl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BzPCAMNs.js";import"./MultiSelect-BUfYPvta.js";import"./RangeSlider-gX8ppj-P.js";import"./TimeRange-M3RpSG5G.js";import"./select-Wy56f_jX.js";import"./WorkloadPicker-BNvFs__t.js";import"./NamespacePicker-BTHp2RPE.js";import"./index-DPG4NjsX.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-CfaLxd-H.js";import"./TagList-BXfzI3QT.js";import"./Badge-aYQWjHd1.js";import"./HoverCard-CDbRR8TA.js";import"./Properties-DtC8xiyA.js";import"./IconButton-DGapLpij.js";import"./DropdownMenu-kAL-O-YL.js";import"./DropdownMenuSubmenu-KZosVDwz.js";import"./StatusDot-BGFiPq91.js";import"./Clicky-CYy69ALv.js";import"./queryClient-DTo9rMUm.js";import"./suspense-BORGsMKf.js";import"./useQuery-CJ6kUDNs.js";import"./FilterForm-dVdkfcgB.js";import"./formMetadata-DXUrmcIH.js";import"./ErrorDetails-ClkwCrRJ.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DwHYUdy_.js";import"./TreeNode-DO9UNtIs.js";import"./ObjectGraph-B_AyJxdZ.js";import"./ExecutionTree-a0d4TN_b.js";import"./CodeBlock-DgVzoKze.js";import"./CodeDiff-D64NQ070.js";import"./SegmentedControl-B5VHoHdT.js";import"./HighlightedTokens-BePCfC_h.js";import"./JsonView-DgqDpvMS.js";import"./RenderedStackTrace-8biP5aZw.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DM_k4dFS.js";import"./FrameSourceWindow-CEDwdXI_.js";import"./useDebugAction-DIJoJzV_.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
