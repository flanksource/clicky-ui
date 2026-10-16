import{j as r}from"./iframe-BUpmsD4_.js";import{C as t}from"./CommandOutput-4Xi_n9ln.js";import{S as R}from"./rpc-story.fixtures-IL9bCJai.js";import"./preload-helper-PGaPgbNH.js";import"./DataTable-D0ZAr8Wn.js";import"./SortableHeader-DzqJplk3.js";import"./utils-DW-IJACk.js";import"./loading-BVCwDMQn.js";import"./router-ivxbOHGV.js";import"./Modal-D_AIawBk.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./Icon-DTAROQQs.js";import"./button-C45Fp5VT.js";import"./index-CPURVhFy.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D1B1BCNq.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./FilterPill-ZhMJAiFw.js";import"./filter-bar-multi-EJU47-mi.js";import"./Combobox-CaQ5ogPs.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B_Xf9fMG.js";import"./MultiSelect-DOVvlLhk.js";import"./RangeSlider-u6TDUAHA.js";import"./TimeRange-DLbdylta.js";import"./select-CBErET8H.js";import"./WorkloadPicker-BqShn2mb.js";import"./NamespacePicker-BYq-r1wS.js";import"./index-DuJeJ7XF.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Ca1ZM5fk.js";import"./TagList-DnAzIPxU.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-CJMlbbGv.js";import"./Properties-CzvVSyin.js";import"./IconButton-CdsDTQWb.js";import"./DropdownMenu-LyJi-wEU.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./format-2niohfpq.js";import"./JsonView-B4Nw9Fl0.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./StatusDot-CD9gWk6p.js";import"./Clicky-U7i-tlhv.js";import"./queryClient-Dwqg-59C.js";import"./suspense-CJ82XoP1.js";import"./useQuery-DnvQgVYm.js";import"./FilterForm-CNfrkdH0.js";import"./formMetadata-DNbOQsJU.js";import"./apiClient-CY-NAGGf.js";import"./string-XSKS3ZaR.js";import"./operationErrorDiagnostics-CisyiiNn.js";import"./ErrorDetails-BvfUfNFo.js";import"./callout-tones-EFt49BYo.js";import"./Tree-B-YvG_G5.js";import"./TreeNode-D7MwMn0M.js";import"./ObjectGraph-IYqy-Y21.js";import"./ExecutionTree-BZo1dA4E.js";import"./CodeBlock-8BACWTJZ.js";import"./CodeDiff-B_c0QWKI.js";import"./SegmentedControl-BzAaXjE5.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-B84SNtUw.js";import"./HighlightedTokens-wwLksTd_.js";import"./RenderedStackTrace-BnrQqCc_.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-C5aLaa6B.js";import"./FrameSourceWindow-CS1fR05x.js";import"./useDebugAction-CQFB2Oc4.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Br={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Fr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,Fr as __namedExportsOrder,Br as default};
