import{j as r}from"./iframe-lrV_tcxP.js";import{C as e}from"./CommandOutput-DCcyl5t_.js";import{S as R}from"./rpc-story.fixtures-BrooiI_T.js";import"./preload-helper-C6Lb07j8.js";import"./DataTable-B6uH4tVP.js";import"./SortableHeader-D8VoQno0.js";import"./utils-DW-IJACk.js";import"./loading-CtyMrwzj.js";import"./router-lpEa8JvA.js";import"./Modal-d3Ocuae-.js";import"./index-BxMM_6lR.js";import"./index-7ZhegYQ4.js";import"./Icon-CgtLhDD0.js";import"./button-BU3MdbYZ.js";import"./index-CPURVhFy.js";import"./modalStack-CuObymKB.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-yqHcWIlk.js";import"./floating-ui.react-BjmYh6Tq.js";import"./FilterPill-T1PjefyC.js";import"./Combobox-BpVdXaBr.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CNJQ5rSJ.js";import"./MultiSelect-YZf0uY0Q.js";import"./RangeSlider-C6iEQFcv.js";import"./TimeRange-BVDWHMkE.js";import"./select-D4Pxas8v.js";import"./WorkloadPicker-D-qW2wFt.js";import"./NamespacePicker-c6inuzP6.js";import"./index-C-iBM5hH.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DNFEm4Fq.js";import"./TagList-Cf-n2SkU.js";import"./Badge-CwI3nE3C.js";import"./HoverCard-BPKJuZIK.js";import"./Properties-Ddakk3uZ.js";import"./IconButton-C0oFeP8R.js";import"./DropdownMenu-C3985j7f.js";import"./DropdownMenuSubmenu-cIJcHKET.js";import"./StatusDot-smpWPsRO.js";import"./Clicky-B40EqI3Z.js";import"./queryClient-DvJYHpqL.js";import"./suspense-DSn5RAak.js";import"./useQuery-B56W-NMP.js";import"./FilterForm-BBciUVuu.js";import"./formMetadata-yKgzwTex.js";import"./ErrorDetails-LSHJkQwQ.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DTFvcU99.js";import"./TreeNode-auTAEHbf.js";import"./ObjectGraph-IYt0RlIy.js";import"./ExecutionTree-CBMZEW0r.js";import"./CodeBlock-SsjEYIsY.js";import"./CodeDiff-DafLqdNk.js";import"./SegmentedControl-BXjzjuqN.js";import"./HighlightedTokens-2g2fPKpS.js";import"./JsonView-BAT_M2es.js";import"./RenderedStackTrace-DaIeEu5w.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-fVxE10-Z.js";import"./FrameSourceWindow-B7QAzBjK.js";import"./useDebugAction-CHPTO7EU.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
