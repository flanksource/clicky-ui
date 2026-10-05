import{j as r}from"./iframe-yuMqpJhb.js";import{C as e}from"./CommandOutput-CIjf23rA.js";import{S as R}from"./rpc-story.fixtures-DsDRx-br.js";import"./preload-helper-DxStcPpW.js";import"./DataTable-bLf9wGKl.js";import"./SortableHeader-DqaG3Pw4.js";import"./utils-DW-IJACk.js";import"./loading-C6QaURdm.js";import"./router-Db0OnKk4.js";import"./Modal-CvmmoTwj.js";import"./index-CKljaMc-.js";import"./index-Ca38k3Ve.js";import"./Icon-DbERJsbC.js";import"./button-FFEDo1GN.js";import"./index-CPURVhFy.js";import"./modalStack-CC6_3ego.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C0zU87ot.js";import"./floating-ui.react-DiVVYB8B.js";import"./FilterPill-D01PQpRY.js";import"./Combobox-BWMTt1c4.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-D6erpvXq.js";import"./MultiSelect-CWHNK50W.js";import"./RangeSlider-iJULwvbw.js";import"./TimeRange-Cahel21p.js";import"./select-C6IyLzeu.js";import"./WorkloadPicker-B77oOyGf.js";import"./NamespacePicker-BCrELL6P.js";import"./index-DZYJBkUd.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-DvBl9sa0.js";import"./TagList-xE5NHcug.js";import"./Badge-BxnYNHl7.js";import"./HoverCard-DVGyFeXQ.js";import"./Properties-PiiQtLrA.js";import"./IconButton-CLZ4GHfp.js";import"./DropdownMenu-DvzMpi7l.js";import"./DropdownMenuSubmenu-CLNEOxi7.js";import"./StatusDot-liH0cyV8.js";import"./Clicky-DoCssCXa.js";import"./queryClient-FhgaZrfW.js";import"./suspense-BawmdS-P.js";import"./useQuery-B77b418i.js";import"./FilterForm-DZKTct8-.js";import"./formMetadata-Bj8XScqz.js";import"./ErrorDetails-DLd1X7dB.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CNa4Jwo5.js";import"./TreeNode-BiehcMpK.js";import"./ObjectGraph-Dl-u2rsg.js";import"./ExecutionTree-N8hf12Vs.js";import"./CodeBlock-BCbuh5Mz.js";import"./CodeDiff-CdsCzbWc.js";import"./SegmentedControl-CItDZC2L.js";import"./HighlightedTokens-Mt22SU9Y.js";import"./JsonView-Cjjo78UN.js";import"./RenderedStackTrace-CJRvctiU.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CuCq94pY.js";import"./FrameSourceWindow-Cz6qLtPP.js";import"./useDebugAction-BDxrv_QV.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
