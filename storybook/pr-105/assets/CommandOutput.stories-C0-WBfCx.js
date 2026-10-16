import{j as r}from"./iframe-bSdY4VSM.js";import{C as t}from"./CommandOutput-DAj_xJ7Z.js";import{S as R}from"./rpc-story.fixtures-Dh5yMOAa.js";import"./preload-helper-BBRSUrHX.js";import"./DataTable-C1YJlkfc.js";import"./SortableHeader-BFkzc-7v.js";import"./utils-DW-IJACk.js";import"./loading-DatIFuv1.js";import"./router-CGvwFh1S.js";import"./Modal-j0TiIO3T.js";import"./index-qiGgzLbL.js";import"./index-C1RppemT.js";import"./Icon-a8_JJTRy.js";import"./button-Cxa_VEHI.js";import"./index-CPURVhFy.js";import"./modalStack-BcOP8sXO.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CLDtmKI0.js";import"./floating-ui.react-BVimmY-p.js";import"./FilterPill-BcIZlN36.js";import"./filter-bar-multi-uGRcbfGS.js";import"./Combobox-B2s9FN2-.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BbaRDASk.js";import"./MultiSelect-BjbqR_PC.js";import"./RangeSlider-B6Z_Mmj_.js";import"./TimeRange-DSRiiLnj.js";import"./select-BSuI-P7O.js";import"./WorkloadPicker-Dt88fymP.js";import"./NamespacePicker-CZPwmVmx.js";import"./index-B028GE4s.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DwcVt-iJ.js";import"./TagList-DDDo_p5T.js";import"./Badge-Bxewb1oq.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-ByHwbgrO.js";import"./Properties-BrkW7QpM.js";import"./IconButton-DzjrNdJS.js";import"./DropdownMenu-B1tJ_OJ0.js";import"./DropdownMenuSubmenu-CPJ_qk78.js";import"./format-2niohfpq.js";import"./JsonView-8YTA5m7Q.js";import"./AccordionList-DWjw4rR4.js";import"./collections-CoHfwOze.js";import"./StatusDot-MR_Ldq0C.js";import"./Clicky-CT0mhbrP.js";import"./queryClient-BKmMGTFQ.js";import"./suspense-CBcPC1aY.js";import"./useQuery-GQB-e-Ic.js";import"./FilterForm-BsMlYQxX.js";import"./formMetadata-BCyssbsw.js";import"./operationErrorDiagnostics-q2oQzKZN.js";import"./ErrorDetails-BbZM26Te.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-SrirDnjM.js";import"./TreeNode-PFT8yUDM.js";import"./ObjectGraph-JIL9b9Gu.js";import"./ExecutionTree-BnU6eZ5_.js";import"./CodeBlock-D39N8RJm.js";import"./CodeDiff-UlAbHhaJ.js";import"./SegmentedControl-DCXKfMBz.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-DuEWhsUM.js";import"./RenderedStackTrace-DVxX-qXw.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-UJyUHWdn.js";import"./FrameSourceWindow-DEi_c1Ne.js";import"./useDebugAction-DLi_oXKA.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
