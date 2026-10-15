import{j as r}from"./iframe-DgmZMBKH.js";import{C as t}from"./CommandOutput-DLScqASV.js";import{S as R}from"./rpc-story.fixtures-BrPuWVSP.js";import"./preload-helper-BBRSUrHX.js";import"./DataTable-DLM3RoiO.js";import"./SortableHeader-CvK-UD5r.js";import"./utils-DW-IJACk.js";import"./loading-DyPnp4V1.js";import"./router-ewoeQE3l.js";import"./Modal-CHXTJS63.js";import"./index-Cgx2wwAK.js";import"./index-DAaBVM8v.js";import"./Icon-COMQMXZj.js";import"./button-D2u3DN_P.js";import"./index-CPURVhFy.js";import"./modalStack-DVmi-TW5.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CiW2zgXq.js";import"./floating-ui.react-C3ET48Mi.js";import"./FilterPill-BT8q1R31.js";import"./filter-bar-multi-Bq0a6khQ.js";import"./Combobox-BPdyRRYK.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-O9lN17EE.js";import"./MultiSelect-D80CYoeK.js";import"./RangeSlider-Dxbvtwh2.js";import"./TimeRange-D56Kt8WY.js";import"./select-Dxhm9jtK.js";import"./WorkloadPicker-p6PpGnQi.js";import"./NamespacePicker-DrrQVfeY.js";import"./index-BU-kuIbr.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BFKKOWaG.js";import"./TagList-BR07zvWf.js";import"./Badge-DxXPlLVw.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-D9JAxC3e.js";import"./Properties-Bdq0MR4F.js";import"./IconButton-DuZ8w2HQ.js";import"./DropdownMenu-gsWLznB7.js";import"./DropdownMenuSubmenu-CBJxpw_g.js";import"./format-2niohfpq.js";import"./JsonView-PTiSkJw0.js";import"./AccordionList-CdfyVxaN.js";import"./collections-CoHfwOze.js";import"./StatusDot-zGBvK3uz.js";import"./Clicky-DO2QsYVR.js";import"./queryClient-CKjncHPv.js";import"./suspense-V3Rb4fN9.js";import"./useQuery-ClGI9Z0B.js";import"./FilterForm-ojM__cDC.js";import"./formMetadata-Br0VNyH5.js";import"./operationErrorDiagnostics-Cbt3wMA3.js";import"./ErrorDetails-C4KSudOM.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-C9PPpVHY.js";import"./TreeNode-D7--K_Ib.js";import"./ObjectGraph-CEifxF6f.js";import"./ExecutionTree-CAr-64_7.js";import"./CodeBlock-C3Pf8vEa.js";import"./CodeDiff-BTioSQ_u.js";import"./SegmentedControl-5L49tJPa.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-C-qCgi-g.js";import"./RenderedStackTrace-s2z4MbN8.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-QQ0Ue89P.js";import"./FrameSourceWindow-DngsTTnH.js";import"./useDebugAction--mo5Cer-.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},zr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(l=(c=s.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,x,g;m.parameters={...m.parameters,docs:{...(u=m.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    response: ERROR_RESPONSE
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(g=(x=m.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Br=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,Br as __namedExportsOrder,zr as default};
