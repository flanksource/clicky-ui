import{j as r}from"./iframe-CRAMrqdr.js";import{C as e}from"./CommandOutput-CyBXU0EO.js";import{S as R}from"./rpc-story.fixtures-C7z6A7K8.js";import"./preload-helper-BpddQVpQ.js";import"./DataTable-CSory7qv.js";import"./SortableHeader-BDxzOEMM.js";import"./utils-DW-IJACk.js";import"./loading-C6pXG8vv.js";import"./router-D9Y2fZfJ.js";import"./Modal-oPG10GDr.js";import"./index-OBWOC1jm.js";import"./index-Dhhf_61s.js";import"./Icon-BMbq9_zN.js";import"./button-DMzgHLRl.js";import"./index-CPURVhFy.js";import"./modalStack-CwY5BXIM.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CN4V-jPS.js";import"./floating-ui.react-CfpWOLb9.js";import"./FilterPill-D2dqjYSS.js";import"./Combobox-BlOvR2S7.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Qn5q0z3i.js";import"./MultiSelect-Djvz-tMb.js";import"./RangeSlider-NDy24q6w.js";import"./TimeRange-BQ0MqSd7.js";import"./select-VRx-e_Ni.js";import"./WorkloadPicker-DiWxfrCb.js";import"./NamespacePicker-Dow2X7GM.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-ClLnH0b8.js";import"./TagList-Cx6UfecG.js";import"./Badge-D_cUJGQB.js";import"./HoverCard-Bb-2z-j6.js";import"./Properties-CLxSZpPj.js";import"./IconButton-Dgyjf8-C.js";import"./DropdownMenu-DfpWvqFK.js";import"./DropdownMenuSubmenu-Cfi5dRDD.js";import"./StatusDot-RD8JAo5O.js";import"./Clicky-B84KOcyT.js";import"./queryClient-BzIqeiR8.js";import"./suspense-LpSg7tjn.js";import"./useQuery-CbHTW0oz.js";import"./FilterForm-C3ljG9Dx.js";import"./formMetadata-CppcBPv0.js";import"./ErrorDetails-CwSJwTcu.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-C3hD7EzX.js";import"./TreeNode-DbKuTGej.js";import"./ObjectGraph-BmrV1oXh.js";import"./ExecutionTree-DMtAVSYw.js";import"./CodeBlock-BvQviV8T.js";import"./CodeDiff-Dn7im8_m.js";import"./SegmentedControl-Cl1OXQjv.js";import"./HighlightedTokens-XtgKphvB.js";import"./JsonView-lIQuAVJ4.js";import"./RenderedStackTrace-BLT6ySKh.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Bu3QT9TA.js";import"./FrameSourceWindow-DU3t8C6T.js";import"./useDebugAction-BhQdoJIx.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
