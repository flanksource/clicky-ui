import{j as r}from"./iframe-B_zRd-Wy.js";import{C as e}from"./CommandOutput-B1jdVANP.js";import{S as R}from"./rpc-story.fixtures-CV4uV7jI.js";import"./preload-helper-Dy2teTf6.js";import"./DataTable-DcVk8MeN.js";import"./SortableHeader-Dm7uLNl-.js";import"./utils-DW-IJACk.js";import"./loading-CRKXYVmY.js";import"./Modal-DBGye44F.js";import"./index-5BdIEgAK.js";import"./index-H37-8Ifz.js";import"./Icon-CL04iPIR.js";import"./button-DQyvef4I.js";import"./index-CPURVhFy.js";import"./modalStack-FiA0edkU.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Bgmi_b2N.js";import"./floating-ui.react-CKuAmzYZ.js";import"./FilterPill-DOFYB3hq.js";import"./Combobox-DDpl6Soq.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-JwFk0mZw.js";import"./MultiSelect-C1NwdKN8.js";import"./RangeSlider-BqFtwBfK.js";import"./TimeRange-B2g9ujpz.js";import"./select-CG68ntFP.js";import"./WorkloadPicker-Cqn2It_N.js";import"./NamespacePicker-BkFtxwGp.js";import"./index-BJ90KxdW.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BU0A9uqx.js";import"./TagList-2162btpO.js";import"./Badge-szGwFoao.js";import"./HoverCard-BS3d_5kX.js";import"./Properties-gxRImng2.js";import"./IconButton-B0Y7xmot.js";import"./DropdownMenu-CgNHTYK4.js";import"./DropdownMenuSubmenu-C5xeJim-.js";import"./StatusDot-donlJo1l.js";import"./Clicky-DXV8lbgN.js";import"./queryClient-BFpS-xoJ.js";import"./suspense-bxjB9gZj.js";import"./useQuery-CCtr9H10.js";import"./FilterForm-Cg1o1FfQ.js";import"./formMetadata-DoFixh3h.js";import"./ErrorDetails-phOuUjUE.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-Ddwjnl2t.js";import"./TreeNode-z_kpDKFi.js";import"./ObjectGraph-AANuLYmE.js";import"./ExecutionTree-CZ1JuWh3.js";import"./CodeBlock-C8wOG93g.js";import"./CodeDiff-BYvI5XKK.js";import"./SegmentedControl-Cii1nhy_.js";import"./HighlightedTokens-BM4R64Fl.js";import"./JsonView-DBaAKuRy.js";import"./RenderedStackTrace-CbSiZ_wg.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DB-rzoCQ.js";import"./FrameSourceWindow-DomhJap2.js";import"./useDebugAction-ChJdGh5L.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
