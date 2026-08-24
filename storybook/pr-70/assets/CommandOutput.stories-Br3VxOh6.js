import{j as r}from"./iframe-CiHj_drq.js";import{C as e}from"./CommandOutput-v2YtIFQV.js";import{S as R}from"./rpc-story.fixtures-3zZ43tDt.js";import"./preload-helper-C9Uksf5K.js";import"./DataTable-DDfDt-sz.js";import"./SortableHeader-loDSAR1A.js";import"./utils-DW-IJACk.js";import"./loading-CvQxXIfs.js";import"./Modal-CiRTtmCj.js";import"./index-D-c_5Z52.js";import"./index-BTP8oBdU.js";import"./Icon-B8CHvJLE.js";import"./button-CF8Oad92.js";import"./index-CPURVhFy.js";import"./modalStack-BxawZIg3.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DGHJFTaL.js";import"./floating-ui.react-CdsFUqBP.js";import"./FilterPill-Cd01icRX.js";import"./Combobox-BeG22V1s.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BLABB2Ii.js";import"./MultiSelect-bpx4mBh0.js";import"./RangeSlider-Cyidobpc.js";import"./TimeRange-KTlWidEX.js";import"./select-BS0Fe7RG.js";import"./WorkloadPicker-CyS_JrPw.js";import"./NamespacePicker-XKgMl5_i.js";import"./index-JYe4JoQ1.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-Bquiqu9t.js";import"./TagList-DQ0BBwqx.js";import"./Badge-ap7M4ZBa.js";import"./HoverCard-BD4fAzxG.js";import"./Properties-CWtEUSYZ.js";import"./IconButton-CduQ6f0Q.js";import"./DropdownMenu-DKU5huRk.js";import"./DropdownMenuSubmenu-BhgkJeya.js";import"./StatusDot-DCaLEXDq.js";import"./Clicky-YbVBnhJW.js";import"./queryClient-DwOJ7SpZ.js";import"./suspense-3w3a1LEC.js";import"./useQuery-C_mp4XbG.js";import"./FilterForm-CUyV2ayM.js";import"./formMetadata-CGf803wG.js";import"./ErrorDetails-DiVf2Che.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-BRz2UhTv.js";import"./TreeNode-CFqnHS1i.js";import"./ObjectGraph-BsHvJPMN.js";import"./ExecutionTree-BRGq9CcJ.js";import"./CodeBlock-DGXNpTk9.js";import"./CodeDiff-D0i-M3bf.js";import"./SegmentedControl-46VZUa35.js";import"./HighlightedTokens-BKwT3Lug.js";import"./JsonView-BHVT7TW6.js";import"./RenderedStackTrace-Ci79PygC.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BitX2zSV.js";import"./FrameSourceWindow-DUrEOG2b.js";import"./useDebugAction-Z2-YNnwA.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
