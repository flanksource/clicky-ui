import{j as r}from"./iframe-Cvtq5r5o.js";import{C as e}from"./CommandOutput-Bsmd0sFk.js";import{S as R}from"./rpc-story.fixtures-tbnPiE0-.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-6umEL7s5.js";import"./SortableHeader-BOhP5e0I.js";import"./utils-DW-IJACk.js";import"./loading-DKOjjMZb.js";import"./router-CnKgVooF.js";import"./Modal-B2iT9EIZ.js";import"./index-ClajA7XS.js";import"./index-kUH0lmcJ.js";import"./Icon-AK-L3art.js";import"./button-D_f9KbYW.js";import"./index-CPURVhFy.js";import"./modalStack-Br6WXpFW.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CYMayfG9.js";import"./floating-ui.react-Cvq7eJTv.js";import"./FilterPill-CiLj5-dG.js";import"./Combobox-DmcYmCM1.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-OpVNRO9P.js";import"./MultiSelect-DcdrjFJ7.js";import"./RangeSlider-CjNa1mqr.js";import"./TimeRange-2UMh_tst.js";import"./select-Dj5LQxng.js";import"./WorkloadPicker-B6PIQp81.js";import"./NamespacePicker-BqHwlbCZ.js";import"./index-CEHxgROo.js";import"./data-table-filter-values-B85q5-NK.js";import"./Timestamp-BOykg1TB.js";import"./TagList-Dcwau9uV.js";import"./Badge-BzeiO1Yp.js";import"./HoverCard-DLH-UG-1.js";import"./Properties-BORP7nVE.js";import"./IconButton-ivpc4D5G.js";import"./DropdownMenu-CpW9tjic.js";import"./DropdownMenuSubmenu-BdylLhlN.js";import"./StatusDot-PzezozPO.js";import"./Clicky-nTE7NUd3.js";import"./queryClient-C_3tmXS4.js";import"./suspense-CbGELY4z.js";import"./useQuery-qVWjwK3e.js";import"./FilterForm-CjSbRj13.js";import"./formMetadata-DmPYmLcw.js";import"./ErrorDetails-BBquMb5k.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BQH8cTxt.js";import"./TreeNode-D1_gaJB-.js";import"./ObjectGraph-BxIcAz2o.js";import"./ExecutionTree-Bgmj6bMQ.js";import"./CodeBlock-DO3W0pdQ.js";import"./CodeDiff-_RtAmjv0.js";import"./SegmentedControl-f6EmF-nP.js";import"./HighlightedTokens-Ct2ZVa0K.js";import"./JsonView-DJPIgKT4.js";import"./RenderedStackTrace-B4PG_qDu.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-xBC_3HXU.js";import"./FrameSourceWindow-jZ_hIgHw.js";import"./useDebugAction-BdNyOFFr.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},kr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Lr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Lr as __namedExportsOrder,kr as default};
