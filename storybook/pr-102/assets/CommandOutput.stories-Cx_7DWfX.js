import{j as r}from"./iframe-BItsxAjD.js";import{C as t}from"./CommandOutput-DSU2qEWc.js";import{S as R}from"./rpc-story.fixtures-CfYy7yef.js";import"./preload-helper-BZq7nIkI.js";import"./DataTable-D5Q05Upm.js";import"./SortableHeader-Cs9TmWHa.js";import"./utils-DW-IJACk.js";import"./loading-BOeFbzh-.js";import"./router-D5_cI9zc.js";import"./Modal-D259elha.js";import"./index-DVxbQ3kE.js";import"./index-CRQMcvkA.js";import"./Icon-Dq8eEpLP.js";import"./button-25dF40vQ.js";import"./index-CPURVhFy.js";import"./modalStack-D_ClFrlM.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-B8SLkawx.js";import"./floating-ui.react-CNVnZXsN.js";import"./FilterPill-DOPLjimn.js";import"./filter-bar-multi-DKn2MepO.js";import"./Combobox-D5npeKNx.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-DCNe0ZvV.js";import"./MultiSelect-23Lsfwm4.js";import"./RangeSlider-CUZZBmKD.js";import"./TimeRange-xAnMQgDf.js";import"./select-BNBwrLsc.js";import"./WorkloadPicker-C-TBIGI3.js";import"./NamespacePicker-D5-oB4gu.js";import"./index-JQhHWXK7.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BhS81XUm.js";import"./TagList-XvJfuJPO.js";import"./Badge-B4WuduE9.js";import"./HoverCard-BRPRrgTD.js";import"./Properties-CqKyb_jW.js";import"./IconButton-DN_Y5FZs.js";import"./DropdownMenu-D3oVIRg_.js";import"./DropdownMenuSubmenu-C4lOloCs.js";import"./format-2niohfpq.js";import"./JsonView-CWGyot2w.js";import"./AccordionList-B60ONwgr.js";import"./collections-CoHfwOze.js";import"./StatusDot-q2qArgZj.js";import"./Clicky-DwvC8UwM.js";import"./queryClient-Cym4Rb27.js";import"./suspense-DFBOv1sW.js";import"./useQuery-rGcR8PSI.js";import"./FilterForm-Cq_KAX_5.js";import"./formMetadata-DZJdePT_.js";import"./operationErrorDiagnostics-BrkosVQM.js";import"./ErrorDetails-rgl_Pehu.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-Cfrvkts8.js";import"./TreeNode-DRwHEDi3.js";import"./ObjectGraph-OPxqJegG.js";import"./ExecutionTree-BpYuuuTT.js";import"./CodeBlock-BiU00fp_.js";import"./CodeDiff-DMKkLlC0.js";import"./SegmentedControl-B1BHyTOC.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-kfpOc-CU.js";import"./RenderedStackTrace-9QW_TwD_.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BJwE_44Y.js";import"./FrameSourceWindow-C4QIQcC6.js";import"./useDebugAction-BaE3Y790.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},qr={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const zr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,zr as __namedExportsOrder,qr as default};
