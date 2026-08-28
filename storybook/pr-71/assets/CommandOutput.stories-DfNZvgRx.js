import{j as r}from"./iframe-CmyXO54k.js";import{C as e}from"./CommandOutput-DYGh0wEt.js";import{S as R}from"./rpc-story.fixtures-C1AFjt5r.js";import"./preload-helper-CrzHa85r.js";import"./DataTable-ls0Cr0Ws.js";import"./SortableHeader-Dyvpd5fh.js";import"./utils-DW-IJACk.js";import"./loading-DtL9kt7i.js";import"./Modal-DYutI5j-.js";import"./index-93oggNQY.js";import"./index-CZqGiS_m.js";import"./Icon-Cn5Qjct9.js";import"./button-FnyWyL3m.js";import"./index-CPURVhFy.js";import"./modalStack-BYsPhtu4.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CR3SYMoz.js";import"./floating-ui.react-DYdEGXOX.js";import"./FilterPill-BwfzPWF4.js";import"./Combobox-BaA3oC34.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CQH9V_hE.js";import"./MultiSelect-DbRXyI3L.js";import"./RangeSlider-DMwlpwrM.js";import"./TimeRange-B0wkt0iH.js";import"./select-CV4LZDDf.js";import"./WorkloadPicker-CnCrR_XI.js";import"./NamespacePicker-DByGFZpM.js";import"./index-BLrjPNKr.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-4zGK6vx5.js";import"./TagList-mb0KmnHB.js";import"./Badge-B0-F_vJj.js";import"./HoverCard-C7V5FEHF.js";import"./Properties-AYLkT0zl.js";import"./IconButton-BmkZZsr-.js";import"./DropdownMenu-DVDI-rKa.js";import"./DropdownMenuSubmenu-BL4qtYMJ.js";import"./StatusDot-D6bBtyb-.js";import"./Clicky-Q5xo3ylT.js";import"./queryClient-B2Xv_EHK.js";import"./suspense-BOS34ZdN.js";import"./useQuery-BPPYtObm.js";import"./FilterForm-D8UwS8Z2.js";import"./formMetadata-Do1EDjnJ.js";import"./ErrorDetails-Cf1Hf7OK.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-DQA2bLnF.js";import"./TreeNode-Db7H-uYm.js";import"./ObjectGraph-CH_OOmVU.js";import"./ExecutionTree-9E9MBWsY.js";import"./CodeBlock-GGT34NA8.js";import"./CodeDiff-FPsEM8TE.js";import"./SegmentedControl-D4w90S4E.js";import"./HighlightedTokens-RUXfQsDG.js";import"./JsonView-CeZOxYv_.js";import"./RenderedStackTrace-D_Dac_D0.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-CML7Dyof.js";import"./FrameSourceWindow-DD3hRGyF.js";import"./useDebugAction-DiuYXeDJ.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
