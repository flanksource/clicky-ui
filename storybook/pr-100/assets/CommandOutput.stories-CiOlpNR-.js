import{j as r}from"./iframe-49i2VeV0.js";import{C as t}from"./CommandOutput-D3VxaDzf.js";import{S as R}from"./rpc-story.fixtures-Bgu-VP9y.js";import"./preload-helper-CLP1olNy.js";import"./DataTable-Dh0Rp8ah.js";import"./SortableHeader-z43roO1E.js";import"./utils-DW-IJACk.js";import"./loading-ivhQ-8Oz.js";import"./router-Dxk10Q8I.js";import"./Modal-C0PiPlai.js";import"./index-BmfiYcQm.js";import"./index-COeekDrS.js";import"./Icon-CQyVAhLN.js";import"./button-BGdRDUEK.js";import"./index-CPURVhFy.js";import"./modalStack-DtPrVreh.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-B60gax3e.js";import"./floating-ui.react-D9st_Ili.js";import"./FilterPill-CJM8CCUD.js";import"./Combobox-BPv-GTrS.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CQSx9Faf.js";import"./MultiSelect-CspOQKqu.js";import"./RangeSlider-NzgrqzdX.js";import"./TimeRange-ChfshZs_.js";import"./select-488pM7Zz.js";import"./WorkloadPicker-BhTiB8sI.js";import"./NamespacePicker-BLppQHd6.js";import"./index-CN4yxxmJ.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BhvAsRA0.js";import"./TagList-Cat-I6sO.js";import"./Badge-DmOWNVI_.js";import"./HoverCard-Nv6W7Mzd.js";import"./Properties-BgtFJszi.js";import"./IconButton-ByEpJOjF.js";import"./DropdownMenu-zKmQ3di2.js";import"./DropdownMenuSubmenu-DjDp9DGD.js";import"./StatusDot-BV2_Fh2V.js";import"./Clicky-DComb6Ab.js";import"./queryClient-BQFg4snn.js";import"./suspense-tu3MV1zO.js";import"./useQuery-DqSC1LEY.js";import"./FilterForm-C1yLImYo.js";import"./formMetadata-DS0Loy5k.js";import"./ErrorDetails-6kxtUUoF.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BFkscNw0.js";import"./TreeNode-BGl04jkk.js";import"./ObjectGraph-8ZR4MViQ.js";import"./ExecutionTree-B9N4yXPm.js";import"./CodeBlock-DanP_04g.js";import"./CodeDiff-BoZLkBEw.js";import"./SegmentedControl-DQyG9Uij.js";import"./HighlightedTokens-BQjA9qCL.js";import"./JsonView-CZgQJ4VW.js";import"./AccordionList-DKmKrDqZ.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-C9TfGaGE.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-xxFbbTUO.js";import"./FrameSourceWindow-CCLtJz_n.js";import"./useDebugAction-B4OXZ8xk.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
