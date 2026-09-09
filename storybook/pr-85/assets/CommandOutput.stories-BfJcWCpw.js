import{j as r}from"./iframe-BNefQpor.js";import{C as e}from"./CommandOutput-ByuVkuea.js";import{S as R}from"./rpc-story.fixtures-BRQ7yhu5.js";import"./preload-helper-BvsCWBK3.js";import"./DataTable-Cj_dnzGR.js";import"./SortableHeader-CbX2dvi0.js";import"./utils-DW-IJACk.js";import"./loading-C39MVSz-.js";import"./router-BHvqksm0.js";import"./Modal-0C9g1z3t.js";import"./index-DPbJXMEv.js";import"./index-C0j4VFB1.js";import"./Icon-Wyal3cEo.js";import"./button-DzbDFHiG.js";import"./index-CPURVhFy.js";import"./modalStack-Ex--0n26.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D8UKqCRR.js";import"./floating-ui.react-CAaUf1g-.js";import"./FilterPill-B-I7OT5q.js";import"./Combobox-DQBzXAlP.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-m-mQGuIY.js";import"./MultiSelect-Bu2fQyw8.js";import"./RangeSlider-C6VyblUQ.js";import"./TimeRange-DZTak6Yo.js";import"./select-C26WemBw.js";import"./WorkloadPicker-HSXtcOtU.js";import"./NamespacePicker-7bVQ8q6w.js";import"./index-DA3YuafW.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DxFT-f8X.js";import"./TagList-uQe_Pz6j.js";import"./Badge-8CVShKQz.js";import"./HoverCard-BT2elvub.js";import"./Properties-DtWRSIUU.js";import"./IconButton-B46C5Nql.js";import"./DropdownMenu-CC-C7gGw.js";import"./DropdownMenuSubmenu-DHHN9TUM.js";import"./StatusDot-1JACEmby.js";import"./Clicky-CqlMJcKs.js";import"./queryClient-5lwNYNzh.js";import"./suspense-D6SmlCML.js";import"./useQuery-Ck6TaFqU.js";import"./FilterForm-DqkajNtC.js";import"./formMetadata-C7cZOP0j.js";import"./ErrorDetails-4cDe6l_O.js";import"./callout-tones-EFt49BYo.js";import"./Tree-DW8edlsO.js";import"./TreeNode-DBuNdeiV.js";import"./ObjectGraph-DYE4Afa-.js";import"./ExecutionTree-BlYc2N_b.js";import"./CodeBlock-cPHBUwLq.js";import"./CodeDiff-CutDbvTd.js";import"./SegmentedControl-DFDUwH_x.js";import"./HighlightedTokens-CkaeK1Qo.js";import"./JsonView-DvOBxzDj.js";import"./RenderedStackTrace-ChDRpJuV.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-jPAruyyp.js";import"./FrameSourceWindow-DGU1mcTp.js";import"./useDebugAction-qpiui3TS.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
