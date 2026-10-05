import{j as r}from"./iframe-3PyLJ2TM.js";import{C as t}from"./CommandOutput-BGH2gY_t.js";import{S as R}from"./rpc-story.fixtures-QpoukFtv.js";import"./preload-helper-BCNcasCO.js";import"./DataTable-BaUUnAfv.js";import"./SortableHeader-CIs_Oa0J.js";import"./utils-DW-IJACk.js";import"./loading-CSw9PWsW.js";import"./router-CQ1FahF_.js";import"./Modal-CgHCFO42.js";import"./index-CgLXIHcd.js";import"./index-qqzrnE86.js";import"./Icon-BZD3ke3N.js";import"./button-DwXbKSmw.js";import"./index-CPURVhFy.js";import"./modalStack-D5gAHSM-.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CGMDl5Kc.js";import"./floating-ui.react-oWH__shU.js";import"./FilterPill-DJ0u6M-E.js";import"./Combobox-CtwV8HwY.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DtCJk5nd.js";import"./MultiSelect-D2uoJyN5.js";import"./RangeSlider-p2RrywI1.js";import"./TimeRange-CC9JpUD4.js";import"./select-CW6JcOqk.js";import"./WorkloadPicker-BlU1fYBE.js";import"./NamespacePicker-CuUvd8m2.js";import"./index-CBigCKQU.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DxNu1pbk.js";import"./TagList-CEimejeM.js";import"./Badge-DlFZ3fZf.js";import"./HoverCard-C9nOd3IV.js";import"./Properties-ns1Ox2VB.js";import"./IconButton-CEm3hGcd.js";import"./DropdownMenu-8DmwIAK4.js";import"./DropdownMenuSubmenu-CGWZ46fu.js";import"./StatusDot-B_OxOezc.js";import"./Clicky-E_d0q_RT.js";import"./queryClient-eOF60azq.js";import"./suspense-9OLRUhuM.js";import"./useQuery-B1_8JvOS.js";import"./FilterForm-_Y54yLBK.js";import"./formMetadata-CRTrx6G0.js";import"./ErrorDetails-DNmnMvMB.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-_rirOFE4.js";import"./TreeNode-CUNcRKBr.js";import"./ObjectGraph-jxxzWpZx.js";import"./ExecutionTree-jWD5d-1s.js";import"./CodeBlock-DVeBJfyW.js";import"./CodeDiff-BYp5iPYE.js";import"./SegmentedControl-BXINvaq-.js";import"./HighlightedTokens-0iEUn_qc.js";import"./JsonView-B5WpSyQF.js";import"./AccordionList-B0Y1Qj5k.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-DkQ0OqL-.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CeLtmbF7.js";import"./FrameSourceWindow-CaVMMbsd.js";import"./useDebugAction-NY8vv6Xp.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Ar={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(p=e.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Dr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,e as Table,s as Text,Dr as __namedExportsOrder,Ar as default};
