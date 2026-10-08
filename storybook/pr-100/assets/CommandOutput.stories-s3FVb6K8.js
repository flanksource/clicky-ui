import{j as r}from"./iframe-PIqemlGB.js";import{C as t}from"./CommandOutput-GyEtP_oq.js";import{S as R}from"./rpc-story.fixtures-DxgWbMD3.js";import"./preload-helper-CLP1olNy.js";import"./DataTable-BB1Wfh0H.js";import"./SortableHeader-YxMsDA6S.js";import"./utils-DW-IJACk.js";import"./loading-CckofzUs.js";import"./router-BKvyW-mx.js";import"./Modal-CZcXzZ1_.js";import"./index-32mlo6to.js";import"./index-DewUnPhR.js";import"./Icon-BnoLxMF1.js";import"./button-Cpqh3UK7.js";import"./index-CPURVhFy.js";import"./modalStack-CRXEK55e.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DwRdQ7VZ.js";import"./floating-ui.react-xo2j_cLW.js";import"./FilterPill-D7eYNNGY.js";import"./Combobox-Cq5Cwgai.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CDhMiyrN.js";import"./MultiSelect-yxv-lAiu.js";import"./RangeSlider-BG7N4rt4.js";import"./TimeRange-CSrBIew_.js";import"./select-C7X0Y6pI.js";import"./WorkloadPicker-LYXB4GXR.js";import"./NamespacePicker-oPgmu1Tq.js";import"./index-CAmlEtzE.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-H6K8rOUp.js";import"./TagList-CKxPl2C0.js";import"./Badge-DB04oQsn.js";import"./HoverCard-B7Vt-bLX.js";import"./Properties-CGJRTav9.js";import"./IconButton-gbin6MpU.js";import"./DropdownMenu-BJXir522.js";import"./DropdownMenuSubmenu-B4D0dxHv.js";import"./StatusDot-7d-SCqTg.js";import"./Clicky-DRuv7H-Z.js";import"./queryClient-BK_A812U.js";import"./suspense-CTpCM1El.js";import"./useQuery-5DNLP7uE.js";import"./FilterForm-B2bXq9Jx.js";import"./formMetadata-zKCvPDIO.js";import"./ErrorDetails-EOB3UyzM.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-B16uzPzy.js";import"./TreeNode-BsRpZsGS.js";import"./ObjectGraph-CypNUCky.js";import"./ExecutionTree-lKImakd_.js";import"./CodeBlock-j2E1n8ER.js";import"./CodeDiff-Dg5qylaS.js";import"./SegmentedControl-BPtmGqZE.js";import"./HighlightedTokens-B_4xh0bQ.js";import"./JsonView-r0_NeGqp.js";import"./AccordionList-wX34OlLO.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-viQQasiJ.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-C0zqi0u3.js";import"./FrameSourceWindow-BNTF74iS.js";import"./useDebugAction-Be6RNqeG.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
