import{j as r}from"./iframe-BsAqiW63.js";import{C as t}from"./CommandOutput-TaN6eWTL.js";import{S as R}from"./rpc-story.fixtures-BYn_LGxv.js";import"./preload-helper-Drww7zV3.js";import"./DataTable-BJptSIQ7.js";import"./SortableHeader-kFQrF4xZ.js";import"./utils-DW-IJACk.js";import"./loading-BJEbCWIe.js";import"./router-BgYu87PQ.js";import"./Modal-qlF4Wnfg.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./Icon-Dyy6aaqa.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BRWLo9rk.js";import"./floating-ui.react-C__wji9y.js";import"./FilterPill-Bzw0s4Xn.js";import"./filter-bar-multi-UjrkZIQp.js";import"./Combobox-BKuWHLhN.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bx8fiptj.js";import"./MultiSelect-C8zfQc50.js";import"./RangeSlider-DPi11dKG.js";import"./TimeRange-BYkBh0gt.js";import"./select-Dx3dTqXz.js";import"./WorkloadPicker-Bi9tT_P3.js";import"./NamespacePicker-my8PKnLF.js";import"./index-CMSqFLvx.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-VJO0GUDl.js";import"./TagList-B5FA-7SG.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-DFfEldqR.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./DropdownMenu-CRLAXTiF.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./format-2niohfpq.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./StatusDot-CrwAY-qs.js";import"./Clicky-BGvHS9IM.js";import"./queryClient-CGaE9-tu.js";import"./suspense-yabXK1kN.js";import"./useQuery-6zyjkH1I.js";import"./FilterForm-DhcqLpb7.js";import"./formMetadata-CpnEts6N.js";import"./apiClient-CY-NAGGf.js";import"./string-XSKS3ZaR.js";import"./operationErrorDiagnostics-CWyRPpPR.js";import"./ErrorDetails-B1QEtge0.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CVzpFtCq.js";import"./TreeNode-DwfXB92K.js";import"./ObjectGraph-Bx0I_V7r.js";import"./ExecutionTree-BSO_V7hL.js";import"./CodeBlock-BNi0pMSL.js";import"./CodeDiff-Y1v5LX7n.js";import"./SegmentedControl-CKXvowSa.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";import"./RenderedStackTrace-CsHvfAvH.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BaIi5t3a.js";import"./FrameSourceWindow-C7BkTYwa.js";import"./useDebugAction-P2jJcbfC.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Br={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},a={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var i,p,n;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=a.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Fr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,a as Loading,e as Table,s as Text,Fr as __namedExportsOrder,Br as default};
