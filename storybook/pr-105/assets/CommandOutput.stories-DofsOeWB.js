import{j as r}from"./iframe-Dxfrw1Ky.js";import{C as t}from"./CommandOutput-BK19I0y8.js";import{S as R}from"./rpc-story.fixtures-CQMnOQkP.js";import"./preload-helper-BBRSUrHX.js";import"./DataTable-BIhpbnpq.js";import"./SortableHeader-Bfd9tbsl.js";import"./utils-DW-IJACk.js";import"./loading-DdWtU95m.js";import"./router-BkznFUli.js";import"./Modal-D6Y2Y0Td.js";import"./index-Di5WmKv6.js";import"./index-OnsKW3gm.js";import"./Icon-uVU5xHJk.js";import"./button-Cd-gFBA2.js";import"./index-CPURVhFy.js";import"./modalStack-DQoL9jC8.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CRB8Fu3i.js";import"./floating-ui.react-CnFTnPO5.js";import"./FilterPill-DPJ4_JlW.js";import"./filter-bar-multi-B5teDMbU.js";import"./Combobox-CkPoK2Rk.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Do5gRvQn.js";import"./MultiSelect-UaYFpP5m.js";import"./RangeSlider-DswKR2c-.js";import"./TimeRange-DViFc0-X.js";import"./select-C8OQW2cZ.js";import"./WorkloadPicker-BMOl_vHV.js";import"./NamespacePicker-Bacf9vZs.js";import"./index-BUwwOD0W.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BdeaaCOh.js";import"./TagList-BlEnFNAp.js";import"./Badge-aB9oNZTO.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-BpuwyYbr.js";import"./Properties-D97LrD4y.js";import"./IconButton-XTWE7kYN.js";import"./DropdownMenu-BrgsovJR.js";import"./DropdownMenuSubmenu-ngeQOpm6.js";import"./format-2niohfpq.js";import"./JsonView-C0lt5M6a.js";import"./AccordionList-BTYKiV83.js";import"./collections-CoHfwOze.js";import"./StatusDot-uL2bc0oE.js";import"./Clicky-C3bTBzZ0.js";import"./queryClient-CPpX_vd7.js";import"./suspense-D1Bcd_NK.js";import"./useQuery-nhd9EeT_.js";import"./FilterForm-CAN1dgDl.js";import"./formMetadata-BdgDHWr9.js";import"./operationErrorDiagnostics-DZqt9INO.js";import"./ErrorDetails-fD9me7tt.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-D-3f6UEm.js";import"./TreeNode-4m2l8kkX.js";import"./ObjectGraph-BwSS9FFF.js";import"./ExecutionTree-DGjYRSNH.js";import"./CodeBlock-CQnknqX7.js";import"./CodeDiff-BA7bdpa9.js";import"./SegmentedControl-CYXceJe4.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-XtrfG8Yo.js";import"./HighlightedTokens-B3JYBooh.js";import"./RenderedStackTrace-DO0RFo-M.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DY_07810.js";import"./FrameSourceWindow-CdOXq4HW.js";import"./useDebugAction-ChCzLIlV.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
