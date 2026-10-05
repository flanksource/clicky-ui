import{j as r}from"./iframe-DXCHqMT7.js";import{C as e}from"./CommandOutput-BqeUgJ2T.js";import{S as R}from"./rpc-story.fixtures-B8cWrK77.js";import"./preload-helper-DxStcPpW.js";import"./DataTable-C9vdgrje.js";import"./SortableHeader-p1ELe-TS.js";import"./utils-DW-IJACk.js";import"./loading-CFBgJ_my.js";import"./router-BummLNfq.js";import"./Modal-DuOJllmE.js";import"./index-nXD4GtBn.js";import"./index-h3UUAFeB.js";import"./Icon-CzqsX9Zi.js";import"./button-tbjJwnTf.js";import"./index-CPURVhFy.js";import"./modalStack-ZxYyB433.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C0qdRizE.js";import"./floating-ui.react-BFoHRFAR.js";import"./FilterPill-kd8dcFZz.js";import"./Combobox-DftKas2V.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CaIRSwlz.js";import"./MultiSelect-HKrSw_53.js";import"./RangeSlider-B8q2faFd.js";import"./TimeRange-D0EjkUCW.js";import"./select-CUXTJRVv.js";import"./WorkloadPicker-S3aLZAFo.js";import"./NamespacePicker-DATdNae9.js";import"./index-Br80NOr9.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-B9u6m3Jx.js";import"./TagList-DT6fFCMe.js";import"./Badge-CxYDrKcj.js";import"./HoverCard-Lk0Lira2.js";import"./Properties-DVIMzZsy.js";import"./IconButton-DJ_I_ndq.js";import"./DropdownMenu-CajicWca.js";import"./DropdownMenuSubmenu-CG6RB2PG.js";import"./StatusDot-jH57yqnf.js";import"./Clicky-BaYEp0YJ.js";import"./queryClient-Dqt5jCSI.js";import"./suspense-B8X58D_n.js";import"./useQuery-DURn7wfC.js";import"./FilterForm-DZvaNKYU.js";import"./formMetadata-DTdBWd0z.js";import"./ErrorDetails-BrMRdbGK.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DTl6AF5L.js";import"./TreeNode-DJqFFmEK.js";import"./ObjectGraph-CM3aTE1T.js";import"./ExecutionTree-C7V2s0Qh.js";import"./CodeBlock-DfLdBRTj.js";import"./CodeDiff-D96T_Lqc.js";import"./SegmentedControl-CPSYGN3s.js";import"./HighlightedTokens-BwAjdB1B.js";import"./JsonView-B6IE9BVn.js";import"./RenderedStackTrace-CyIIAr6a.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DN8PDc6q.js";import"./FrameSourceWindow-BcyE_L-P.js";import"./useDebugAction-DfgSyXAQ.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
