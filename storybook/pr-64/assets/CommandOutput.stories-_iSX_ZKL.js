import{j as r}from"./iframe-DdBTgIYo.js";import{C as e}from"./CommandOutput-iHLW2nbN.js";import{S as R}from"./rpc-story.fixtures-krC_FG39.js";import"./preload-helper-BAJsONWX.js";import"./DataTable-ByDorNyw.js";import"./SortableHeader-DWx_ri3P.js";import"./utils-DW-IJACk.js";import"./loading-BHoHZ-Ia.js";import"./Modal-t7pClsp8.js";import"./index-C-GJeFIY.js";import"./index-BPZKakeu.js";import"./Icon-DVutFXv6.js";import"./button-Csh7yOII.js";import"./index-CPURVhFy.js";import"./modalStack-z0EYZXej.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BJzgkdAr.js";import"./floating-ui.react-BKPEba8r.js";import"./FilterPill-B1Axt51T.js";import"./Combobox-K6sNSfFF.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-Bxl4VJsP.js";import"./MultiSelect-wGQyphSt.js";import"./RangeSlider-sFyfnIF_.js";import"./TimeRange-DFwTBjKM.js";import"./select-B5Vlyk4t.js";import"./WorkloadPicker-CQ6caaXP.js";import"./NamespacePicker-BVqkvn5K.js";import"./index-CyvEMwTT.js";import"./format-2niohfpq.js";import"./data-table-filter-values-BjWgdAnO.js";import"./Timestamp-QUnN1oFx.js";import"./TagList-DG4QixnE.js";import"./Badge-DJyQ-bFB.js";import"./HoverCard-CIwH93z_.js";import"./Properties-CAK_qQQT.js";import"./IconButton-C_5LgRo7.js";import"./DropdownMenu-DtqJruug.js";import"./DropdownMenuSubmenu-CauiYosP.js";import"./StatusDot-2XUG_rS3.js";import"./Clicky-Dif5QILa.js";import"./queryClient-B-PxxOWu.js";import"./suspense-D31nPUIC.js";import"./useQuery-Cm0qbWno.js";import"./FilterForm-Up1wVv8X.js";import"./formMetadata-CnjicyNT.js";import"./types-BHfRQr8X.js";import"./ErrorDetails-CBAfJRck.js";import"./callout-tones-DN7X2Ehz.js";import"./Tree-PxKd47v-.js";import"./TreeNode-BCgmgps8.js";import"./ObjectGraph-BQ9DkVjH.js";import"./ExecutionTree-DEDunqs7.js";import"./CodeBlock-DHyZ9UF4.js";import"./CodeDiff-co-9s8so.js";import"./SegmentedControl-DghUBfcF.js";import"./code-highlight-DknG25m0.js";import"./JsonView-BoDIrp0X.js";import"./RenderedStackTrace-DTmfY1og.js";import"./useQueryInfo-Bv33e4K8.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Pr={title:"Clicky-RPC/CommandOutput",component:e,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},t={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},a={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})},m={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(e,{...o})})};var i,n,p;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(O=(S=m.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const br=["Table","Text","ErrorOutput","Loading"];export{a as ErrorOutput,m as Loading,t as Table,s as Text,br as __namedExportsOrder,Pr as default};
