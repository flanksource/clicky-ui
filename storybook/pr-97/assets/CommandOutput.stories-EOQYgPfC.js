import{j as r}from"./iframe-DW9dAhLx.js";import{C as t}from"./CommandOutput-8wP6C8GT.js";import{S as R}from"./rpc-story.fixtures-giu5sqR6.js";import"./preload-helper-Bcd_tUTe.js";import"./DataTable-KhH8cXYG.js";import"./SortableHeader-D4adnFIw.js";import"./utils-DW-IJACk.js";import"./loading-Bax3wqdJ.js";import"./router-CG8Z5VvH.js";import"./Modal-C6agGzel.js";import"./index-DiWddUzE.js";import"./index-Cs0vdkxh.js";import"./Icon-DoAlPc9w.js";import"./button-CfAeUDeP.js";import"./index-CPURVhFy.js";import"./modalStack-D91MpMqq.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CYzLDpR_.js";import"./floating-ui.react-FGKoCoTL.js";import"./FilterPill-DCFbiDxg.js";import"./Combobox-Cg9Uya7g.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B-wlRanM.js";import"./MultiSelect-BB0LGxTk.js";import"./RangeSlider-PRIKM0IH.js";import"./TimeRange-Dm9hzaFH.js";import"./select-0joD2KNd.js";import"./WorkloadPicker-C9tSf8ip.js";import"./NamespacePicker-qJZnDyJF.js";import"./index-DWjlvldA.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-aASNRO8Q.js";import"./TagList-Bkq1A4_q.js";import"./Badge-NamFkPhe.js";import"./HoverCard-CHmcbby2.js";import"./Properties-DYrk4NqW.js";import"./IconButton-BDUka6O0.js";import"./DropdownMenu-CsIU3qeo.js";import"./DropdownMenuSubmenu-BadwR1Tm.js";import"./StatusDot-CU3ynp1C.js";import"./Clicky-CRckRJNZ.js";import"./queryClient-BU1lb1vY.js";import"./suspense-BJkfMO3i.js";import"./useQuery-B6HW3yl7.js";import"./FilterForm-D0JtzeAb.js";import"./formMetadata-CcZV9aIs.js";import"./ErrorDetails-Cs_T-8Wv.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CD_mN7D4.js";import"./TreeNode-9NrhBGqV.js";import"./ObjectGraph-dK6znucT.js";import"./ExecutionTree-CJN_edj5.js";import"./CodeBlock-CjVUlwYp.js";import"./CodeDiff-CEMXqTRo.js";import"./SegmentedControl-CrfNu512.js";import"./HighlightedTokens-DH2GJFTr.js";import"./JsonView-B_IDkh71.js";import"./AccordionList-lICbzCbb.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-BHsTR-gL.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CPge80YT.js";import"./FrameSourceWindow-C0aJox68.js";import"./useDebugAction-DsG17SE3.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
