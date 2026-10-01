import{j as r}from"./iframe-DFqoVmES.js";import{C as e}from"./CommandOutput-DeduObv4.js";import{S as R}from"./rpc-story.fixtures-DCH4TquI.js";import"./preload-helper-Btgbu5YQ.js";import"./DataTable-lb_tY3DO.js";import"./SortableHeader-gDhxuFH6.js";import"./utils-DW-IJACk.js";import"./loading-a0chOUxC.js";import"./router-mq6bNbaH.js";import"./Modal-DyLthMq_.js";import"./index-SNQUh-rf.js";import"./index-aojGc9A7.js";import"./Icon-C2VnWBhA.js";import"./button-CousEx7c.js";import"./index-CPURVhFy.js";import"./modalStack-D8oWGv-3.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BdW58AUV.js";import"./floating-ui.react-F5U4WUZ1.js";import"./FilterPill-ZHEqr9b-.js";import"./Combobox-DOasJ9T3.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B7P2O0KF.js";import"./MultiSelect-DhqxlvOC.js";import"./RangeSlider-CwKZMA91.js";import"./TimeRange-CiUP6QBK.js";import"./select-DLCEgKD7.js";import"./WorkloadPicker-9tlmfqwQ.js";import"./NamespacePicker-D6_hq0Rq.js";import"./index-f-QiBoYb.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C8idDDd2.js";import"./TagList-DGjO1rdc.js";import"./Badge-CuaFn_de.js";import"./HoverCard-BR1rDq5O.js";import"./Properties-DvJU1Mna.js";import"./IconButton-Rdjt8MPB.js";import"./DropdownMenu-0zQ_bkuC.js";import"./DropdownMenuSubmenu-D8TwUdJ9.js";import"./StatusDot-CVeeXoK_.js";import"./Clicky-DsQJt7Nn.js";import"./queryClient-CKGRbbdd.js";import"./suspense-Bk7KMvFA.js";import"./useQuery-CTPWykCk.js";import"./FilterForm-C51HZccD.js";import"./formMetadata-BcBzK_NS.js";import"./ErrorDetails-DtiHeMH8.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-2T1xqs8T.js";import"./TreeNode-D8wnqwU0.js";import"./ObjectGraph-Dx63KqGs.js";import"./ExecutionTree-759okkv7.js";import"./CodeBlock-B9ujCA73.js";import"./CodeDiff-D39VjvBJ.js";import"./SegmentedControl-CHoriPdF.js";import"./HighlightedTokens-DcHvhSPu.js";import"./JsonView-BwRJ4HFa.js";import"./RenderedStackTrace-B7YgelJd.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-B7xjpJmP.js";import"./FrameSourceWindow-oD4RIKJ4.js";import"./useDebugAction-D_qdAnJi.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Mr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Xr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Xr as __namedExportsOrder,Mr as default};
