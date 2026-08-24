import{j as r}from"./iframe-1nhP4pBA.js";import{C as e}from"./CommandOutput-DsaP68HZ.js";import{S as R}from"./rpc-story.fixtures-CAED4tIQ.js";import"./preload-helper-C9Uksf5K.js";import"./DataTable-Byaaf8H5.js";import"./SortableHeader-DOyv7UJG.js";import"./utils-DW-IJACk.js";import"./loading-Ch-5BGAb.js";import"./Modal-BEBsG6op.js";import"./index-BSiZIXYH.js";import"./index-XDodYxLy.js";import"./Icon-B2d9yic_.js";import"./button--4D2VPD7.js";import"./index-CPURVhFy.js";import"./modalStack-DxHx75M7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C_3aF3TU.js";import"./floating-ui.react-BFwwEc5i.js";import"./FilterPill-CXYMNTt5.js";import"./Combobox-BCbQu6RQ.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-D-pa_he-.js";import"./MultiSelect-B50Px8dh.js";import"./RangeSlider-4m86cNh6.js";import"./TimeRange-D-87v7d_.js";import"./select-B2pQvorm.js";import"./WorkloadPicker-bAN7wney.js";import"./NamespacePicker-Brgo_DSM.js";import"./index-BVDmj5Ga.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-DGhpHWxh.js";import"./TagList-BRJUUHzy.js";import"./Badge-B1noozuz.js";import"./HoverCard-BTWh615-.js";import"./Properties-BMf0F3x3.js";import"./IconButton-ChHOhmH9.js";import"./DropdownMenu-CAJOgHVv.js";import"./DropdownMenuSubmenu-BMDGCenv.js";import"./StatusDot-2IRk4KZC.js";import"./Clicky-BVTkl8Wb.js";import"./queryClient-Drs06rU2.js";import"./suspense-DBlaIW4n.js";import"./useQuery-Bch4MnZl.js";import"./FilterForm-E9UcUJoo.js";import"./formMetadata-C5xWBaoU.js";import"./ErrorDetails-CdNsAEg6.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-DkTEIP7m.js";import"./TreeNode-DG0we7Jz.js";import"./ObjectGraph-DlZsNYY-.js";import"./ExecutionTree-qQ06rFao.js";import"./CodeBlock-svEp_1B4.js";import"./CodeDiff-BWpF67Jd.js";import"./SegmentedControl-BX0icOeA.js";import"./HighlightedTokens-BrlLwXpa.js";import"./JsonView-CAfD8K_m.js";import"./RenderedStackTrace-B7-iG5k4.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Cb9m8vKM.js";import"./FrameSourceWindow-iVvp6sss.js";import"./useDebugAction-RywGGJub.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},kr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Lr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Lr as __namedExportsOrder,kr as default};
