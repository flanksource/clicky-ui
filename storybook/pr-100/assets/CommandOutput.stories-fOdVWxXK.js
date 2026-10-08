import{j as r}from"./iframe-DiGWdYeS.js";import{C as t}from"./CommandOutput-2BsAnBj9.js";import{S as R}from"./rpc-story.fixtures-D5etiLTh.js";import"./preload-helper-CLP1olNy.js";import"./DataTable-tFYAQ2mc.js";import"./SortableHeader-CNQgiP_K.js";import"./utils-DW-IJACk.js";import"./loading-do6Jc8dp.js";import"./router-COBBYGif.js";import"./Modal-Lv5UDAp3.js";import"./index-Bs9RhWmJ.js";import"./index-3jltqwNg.js";import"./Icon-CXYnH2qb.js";import"./button-B88NSOe0.js";import"./index-CPURVhFy.js";import"./modalStack-D4VFZXfx.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DpBPYw_q.js";import"./floating-ui.react-B1LFNbTF.js";import"./FilterPill-C9Y2AHds.js";import"./Combobox-DkBaY_Zh.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Cj6dgW4z.js";import"./MultiSelect-CRVxfxy1.js";import"./RangeSlider-DcKpfXwF.js";import"./TimeRange-DmB3zEkS.js";import"./select-C3FKGKpO.js";import"./WorkloadPicker-CWHWM8zu.js";import"./NamespacePicker-qpUVkQSx.js";import"./index-C3MokWFe.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Bwb8IrZZ.js";import"./TagList-DRjYIxk8.js";import"./Badge-B4Sqf9xK.js";import"./HoverCard-CNTm_9cf.js";import"./Properties-BXEaTHct.js";import"./IconButton-dxd2gk7y.js";import"./DropdownMenu-BgRv5Hkt.js";import"./DropdownMenuSubmenu-CyZ1Donu.js";import"./StatusDot-Bja0ISbT.js";import"./Clicky-CTKABUcJ.js";import"./queryClient-B9_uv8vX.js";import"./suspense-D-800eSR.js";import"./useQuery-xOtqdqeH.js";import"./FilterForm-BxYrTEm8.js";import"./formMetadata-dUjuveR9.js";import"./ErrorDetails-DWQcsryd.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-8sIwi2ln.js";import"./TreeNode-BRhH8gFW.js";import"./ObjectGraph-BR3q0COW.js";import"./ExecutionTree-DK3nfHoa.js";import"./CodeBlock-W_Ds-mcM.js";import"./CodeDiff-KPQ8SLmO.js";import"./SegmentedControl-Czoh7U1p.js";import"./HighlightedTokens-BbcRqCG6.js";import"./JsonView-CKM0fZaH.js";import"./AccordionList-COZSOkta.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-DWY84KXy.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-szTx1PaD.js";import"./FrameSourceWindow-NuwXGvru.js";import"./useDebugAction-D97FcvLI.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
