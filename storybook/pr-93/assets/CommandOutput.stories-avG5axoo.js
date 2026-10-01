import{j as r}from"./iframe-CLXtWVmt.js";import{C as e}from"./CommandOutput-DogXtIdy.js";import{S as R}from"./rpc-story.fixtures-9DmtFkSJ.js";import"./preload-helper-DmsBQNJi.js";import"./DataTable-BOj40Wo3.js";import"./SortableHeader-BfeSh8iX.js";import"./utils-DW-IJACk.js";import"./loading-B0OjGzLE.js";import"./router-cLtf9KDa.js";import"./Modal-BJ4XmsSf.js";import"./index-cL1Er3Pi.js";import"./index-99h8sS2h.js";import"./Icon-CpZ1luCu.js";import"./button-C8mx3enX.js";import"./index-CPURVhFy.js";import"./modalStack-gt8ROY-G.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-C2Q-Devo.js";import"./floating-ui.react-BEe3PkFT.js";import"./FilterPill-CM5YOpR7.js";import"./Combobox-BjmBMG3b.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-D0HzU81W.js";import"./MultiSelect-DPAp-DQX.js";import"./RangeSlider-CGfMpttY.js";import"./TimeRange-DVrCohNJ.js";import"./select-DRgcxFlV.js";import"./WorkloadPicker-BTu9Qda9.js";import"./NamespacePicker-Cmgc-Ss4.js";import"./index-D_IVmfEW.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Z2d1lWrF.js";import"./TagList-D195dBA2.js";import"./Badge-BeC-BgyT.js";import"./HoverCard-DRjWtDYf.js";import"./Properties-BFYUqXPk.js";import"./IconButton-Diyo__bS.js";import"./DropdownMenu-BfTU1-5e.js";import"./DropdownMenuSubmenu-DJ3OnS11.js";import"./StatusDot-CjkeL4mB.js";import"./Clicky-CKo5w4nc.js";import"./queryClient-B_e-mo7c.js";import"./suspense-BW0gHxq1.js";import"./useQuery-DpQJ-B2X.js";import"./FilterForm-BzcF3LX3.js";import"./formMetadata-Dj-DC5zZ.js";import"./ErrorDetails-DkO-bD-N.js";import"./string-Ye519DiV.js";import"./callout-tones-EFt49BYo.js";import"./Tree-CnzDD2rQ.js";import"./TreeNode-5m61ijv1.js";import"./ObjectGraph-C9-IC4Wr.js";import"./ExecutionTree-DZBVTsys.js";import"./CodeBlock-DOQ2p1GO.js";import"./CodeDiff-DDSLPz_c.js";import"./SegmentedControl-Dg191Kku.js";import"./HighlightedTokens-l_kw19vr.js";import"./JsonView-D5gKhrYL.js";import"./RenderedStackTrace-D0AsqLmY.js";import"./frame-heuristics-D62qKi0n.js";import"./StackFrameRow-BdcXQFCy.js";import"./FrameSourceWindow-D_8Zrr2S.js";import"./useDebugAction-Cst2JSdS.js";import"./debugConsoleSignal-B72erEWu.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Mr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,p,n;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Xr=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,Xr as __namedExportsOrder,Mr as default};
