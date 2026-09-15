import{j as r}from"./iframe-DeBYCw4x.js";import{C as e}from"./CommandOutput-DJoPjFAc.js";import{S as R}from"./rpc-story.fixtures-BfsjhXP9.js";import"./preload-helper-CcRYDqr-.js";import"./DataTable-IYtBl-7_.js";import"./SortableHeader-BZfABJLP.js";import"./utils-DW-IJACk.js";import"./loading-ho48Z2wq.js";import"./router-BS0K7T7L.js";import"./Modal-DKr8ZZ_E.js";import"./index-Dt3DPIKA.js";import"./index-MmMKnFNW.js";import"./Icon-CGwyQOB1.js";import"./button-DB9m7UYN.js";import"./index-CPURVhFy.js";import"./modalStack-Bmz6C5Fa.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-mv1uq_Za.js";import"./floating-ui.react-CJIncd7i.js";import"./FilterPill-DFY6Z2w0.js";import"./Combobox-Blg1URfg.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-TXnXjNJ7.js";import"./MultiSelect-BAke_gC4.js";import"./RangeSlider-CY-mpLNd.js";import"./TimeRange-1nQfxhxt.js";import"./select-C_dZVFqX.js";import"./WorkloadPicker-BOLGZqyS.js";import"./NamespacePicker-10mVS6un.js";import"./index-CmecybCa.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-a37Nl5NZ.js";import"./TagList-Rpz24aG6.js";import"./Badge-vEaYC1aM.js";import"./HoverCard-DMwhGn2K.js";import"./Properties-Cm7NvER_.js";import"./IconButton-Jb6_soVo.js";import"./DropdownMenu-CuKG9hF1.js";import"./DropdownMenuSubmenu-BoEIYSWu.js";import"./StatusDot-BMvWjruJ.js";import"./Clicky-CvDMrm6R.js";import"./queryClient-B_9eng9g.js";import"./suspense-BzBLBQV6.js";import"./useQuery-CIeNeFpw.js";import"./FilterForm-CfIiAqUM.js";import"./formMetadata-KKPMiMb9.js";import"./ErrorDetails-2EvkPZ_X.js";import"./callout-tones-EFt49BYo.js";import"./Tree-Bd-CblJ-.js";import"./TreeNode-B4k1eimf.js";import"./ObjectGraph-C2vmLach.js";import"./ExecutionTree-CjtwqpWl.js";import"./CodeBlock-dTiR47dd.js";import"./CodeDiff-BRl1lE7u.js";import"./SegmentedControl-x-wxcPhD.js";import"./HighlightedTokens-Cwnl1Dqa.js";import"./JsonView--QZM-KTF.js";import"./RenderedStackTrace-H49LypnM.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-nNJztAv_.js";import"./FrameSourceWindow-DBCQ9moF.js";import"./useDebugAction-RL5VQ3ui.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
