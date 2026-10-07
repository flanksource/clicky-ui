import{j as r}from"./iframe-DrKsS3M_.js";import{C as t}from"./CommandOutput-CzN63LWE.js";import{S as R}from"./rpc-story.fixtures-CCx_sU75.js";import"./preload-helper-CLP1olNy.js";import"./DataTable-By-pGdZy.js";import"./SortableHeader-BOYWiKnH.js";import"./utils-DW-IJACk.js";import"./loading-Zh7pc3Pa.js";import"./router-Dmz1SlkE.js";import"./Modal-D-bTTK8j.js";import"./index-B7F1fGYx.js";import"./index-kSQoS_dD.js";import"./Icon-5YnqmjaE.js";import"./button-C3u2SMij.js";import"./index-CPURVhFy.js";import"./modalStack-BXNp3ooX.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CYPIRBf7.js";import"./floating-ui.react-BaraekBC.js";import"./FilterPill-ffMsgFpu.js";import"./Combobox-BOBKHCDA.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-CAOmef3v.js";import"./MultiSelect-C6WkU-2I.js";import"./RangeSlider-BRFzD7SU.js";import"./TimeRange-CnG90otP.js";import"./select-BsRobnSb.js";import"./WorkloadPicker-DAf8hPAI.js";import"./NamespacePicker-Cva3-Knl.js";import"./index-Bj-SsGaM.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-BcIqcr2w.js";import"./TagList-BQG912nO.js";import"./Badge-DTWOliSA.js";import"./HoverCard-cLbGEJn3.js";import"./Properties-Dhxum7ig.js";import"./IconButton-B3W2TRe_.js";import"./DropdownMenu-BPEvBj-S.js";import"./DropdownMenuSubmenu-BmCuQSFk.js";import"./StatusDot-BxkGi-sE.js";import"./Clicky-B9jKfuQ6.js";import"./queryClient-D7Tldrxf.js";import"./suspense-BbxoaRfr.js";import"./useQuery-CZ2xLKcL.js";import"./FilterForm-DeLrSMYa.js";import"./formMetadata-CLNzbBlD.js";import"./ErrorDetails-B_2DRmRg.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-AmYqt2D8.js";import"./TreeNode-BNOVU68K.js";import"./ObjectGraph-BjN4krmp.js";import"./ExecutionTree-BvWT9cPT.js";import"./CodeBlock-DuTAgM6o.js";import"./CodeDiff-DVg9mXJw.js";import"./SegmentedControl-DhvV8qek.js";import"./HighlightedTokens-ud36EFY8.js";import"./JsonView-C_xZ2Wh2.js";import"./AccordionList-CZ88uwbr.js";import"./collections-CoHfwOze.js";import"./RenderedStackTrace-DkfvAV6c.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-DrdMkZw9.js";import"./FrameSourceWindow-cBwyq5-K.js";import"./useDebugAction-BtQ9h0Ja.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
