import{j as r}from"./iframe-Cco5TqZn.js";import{C as e}from"./CommandOutput-BflblxzF.js";import{S as R}from"./rpc-story.fixtures-DrorMC2Z.js";import"./preload-helper-CW1BdeJu.js";import"./DataTable-BUdHoCkv.js";import"./SortableHeader-DtCNn_uR.js";import"./utils-DW-IJACk.js";import"./loading-CtZM3MTb.js";import"./router-DHJSI_n5.js";import"./Modal-BfOLI4vX.js";import"./index-D2E1Pu38.js";import"./index-BboRCSKy.js";import"./Icon-C6Dn9DLx.js";import"./button-DNj3-z2W.js";import"./index-CPURVhFy.js";import"./modalStack-ZpK0V3tF.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DVdHLQod.js";import"./floating-ui.react-Dpy7yByO.js";import"./FilterPill-BVle6yuL.js";import"./Combobox-DPrIRjAr.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-Dy4sFFgJ.js";import"./MultiSelect-CeyhHNCi.js";import"./RangeSlider-Da0vSqmc.js";import"./TimeRange-DlEhKiKb.js";import"./select-DyfR_FV4.js";import"./WorkloadPicker-Y9hi9dEd.js";import"./NamespacePicker-BzzNcGfX.js";import"./index-CBZ8Tip2.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-FGKuMYnS.js";import"./TagList-DUTVq46U.js";import"./Badge-BsNPFd1h.js";import"./HoverCard-D8KXkP_9.js";import"./Properties-Did90PaB.js";import"./IconButton-BQqpNww-.js";import"./DropdownMenu-w_RgGUTs.js";import"./DropdownMenuSubmenu-B3RQvvTh.js";import"./StatusDot-BZGJhrC1.js";import"./Clicky-BR958FM8.js";import"./queryClient-wsiT9jxi.js";import"./suspense-BDHMT-c8.js";import"./useQuery-Cw-7fZrp.js";import"./FilterForm-C8Ix4e5_.js";import"./formMetadata-2inmewgJ.js";import"./ErrorDetails-44GfVE44.js";import"./callout-tones-EFt49BYo.js";import"./Tree-BRZblghw.js";import"./TreeNode-LqK2sArM.js";import"./ObjectGraph-DgQa-TFG.js";import"./ExecutionTree-B-Y3H11P.js";import"./CodeBlock-BYcrzBK4.js";import"./CodeDiff-BKgy3UT_.js";import"./SegmentedControl-qK3H5opf.js";import"./HighlightedTokens-DbGRJ7uL.js";import"./JsonView-BazgrdGA.js";import"./RenderedStackTrace---7-vBhX.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Bh3qnMVs.js";import"./FrameSourceWindow-C7WAdttz.js";import"./useDebugAction-2WpJUhB3.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
