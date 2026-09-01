import{j as r}from"./iframe-9kVTKmJ0.js";import{C as e}from"./CommandOutput-BKy-ZDvv.js";import{S as R}from"./rpc-story.fixtures-lLoUYDUC.js";import"./preload-helper-95TtevsV.js";import"./DataTable-uV5sRdY5.js";import"./SortableHeader-DLQcNgJx.js";import"./utils-DW-IJACk.js";import"./loading-MkmNbgtg.js";import"./Modal-BbLdbhrq.js";import"./index-Cr37FOZC.js";import"./index-BTeDEC8L.js";import"./Icon-CvI4mGjv.js";import"./button-BPQ9SyIv.js";import"./index-CPURVhFy.js";import"./modalStack-CNqfYGm3.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CXhcWigS.js";import"./floating-ui.react-BUMPLM4a.js";import"./FilterPill-DQt4CJ8q.js";import"./Combobox-D7J1PGfl.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BbOmlTv2.js";import"./MultiSelect-CSjhdo7W.js";import"./RangeSlider-ClpMy-rf.js";import"./TimeRange-M6wT7L0F.js";import"./select-DuAtkH3m.js";import"./WorkloadPicker-DlkRC9Xa.js";import"./NamespacePicker-D8blYim1.js";import"./index-CX2ajmSK.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-BRT7w1kY.js";import"./TagList-DnY7mgYd.js";import"./Badge-BcfKC88e.js";import"./HoverCard-CPC5ZKyE.js";import"./Properties-BnqeAvxD.js";import"./IconButton-DFVj-CAC.js";import"./DropdownMenu-BNM_4WBn.js";import"./DropdownMenuSubmenu-YGHNpTO4.js";import"./StatusDot-DP4lLckB.js";import"./Clicky-NP4fxVv9.js";import"./queryClient-BjzZNByS.js";import"./suspense-Dukvb27Z.js";import"./useQuery-BJZS2b_G.js";import"./FilterForm-CqhhJ8OF.js";import"./formMetadata-43fCqczO.js";import"./ErrorDetails-Bdrs4mEC.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-CXwRPIFB.js";import"./TreeNode-B6KeLSnw.js";import"./ObjectGraph-2XgCUd7C.js";import"./ExecutionTree-DidylC_M.js";import"./CodeBlock-DOHQkbgd.js";import"./CodeDiff-BUOlpDf-.js";import"./SegmentedControl-BHY99hW3.js";import"./HighlightedTokens-Dt7UGLXQ.js";import"./JsonView-CM3u8QOF.js";import"./RenderedStackTrace-BFKbjF_7.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-Dquz2HaD.js";import"./FrameSourceWindow-1MJtx6ur.js";import"./useDebugAction-CSO0ZmU2.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
