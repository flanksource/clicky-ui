import{j as r}from"./iframe-ODiXRaeD.js";import{C as e}from"./CommandOutput-Baa9ll-s.js";import{S as R}from"./rpc-story.fixtures-BERb9Xbj.js";import"./preload-helper-DUVrmzNZ.js";import"./DataTable-CNdaUV2U.js";import"./SortableHeader-fwxMXi-K.js";import"./utils-DW-IJACk.js";import"./loading-BGUot--s.js";import"./router-LJxTBAX2.js";import"./Modal-LKsOOO6Y.js";import"./index-DoPuVbTh.js";import"./index-DUxqcZ0I.js";import"./Icon-CulP8OOJ.js";import"./button-vfp9rbvl.js";import"./index-CPURVhFy.js";import"./modalStack-CqgS2p7j.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BWfbRqTp.js";import"./floating-ui.react-DXashjmJ.js";import"./FilterPill-DCe4YYsD.js";import"./Combobox-bl4stDBW.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-fMg4dziS.js";import"./MultiSelect-Dqzi9BW_.js";import"./RangeSlider-BumHhnr7.js";import"./TimeRange-Ds4BKog5.js";import"./select-DyHJLQMz.js";import"./WorkloadPicker-BCAeYQLA.js";import"./NamespacePicker-Bexcruy9.js";import"./index-7xTk_PNV.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-YXg3wtDZ.js";import"./TagList-M8q95IVs.js";import"./Badge-2T1VklgA.js";import"./HoverCard-BdexRlW3.js";import"./Properties-B6qIL-s9.js";import"./IconButton-Dhr37kem.js";import"./DropdownMenu-Cnc4cnjr.js";import"./DropdownMenuSubmenu-CAYBYAzj.js";import"./StatusDot-Bp5dkfAo.js";import"./Clicky-eSzDztCl.js";import"./queryClient-6YFIuJXN.js";import"./suspense-DZo8rYoC.js";import"./useQuery-Cz6IKwBd.js";import"./FilterForm-BHsLVt18.js";import"./formMetadata-C8mAb-87.js";import"./ErrorDetails-BS9zGTCk.js";import"./callout-tones-EFt49BYo.js";import"./Tree-Do7CmvPC.js";import"./TreeNode-DzGpQWEW.js";import"./ObjectGraph-CErra6pW.js";import"./ExecutionTree-COMfTfFv.js";import"./CodeBlock-0JMXL0li.js";import"./CodeDiff-BBTi1off.js";import"./SegmentedControl-Bv1pVWWz.js";import"./HighlightedTokens-ByVXtaAr.js";import"./JsonView-CY5kuzeJ.js";import"./RenderedStackTrace-D56VpfPv.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-eKdblVs0.js";import"./FrameSourceWindow-Ct6LkgCs.js";import"./useDebugAction-RP-TdEDK.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Lr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Mr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Mr as __namedExportsOrder,Lr as default};
