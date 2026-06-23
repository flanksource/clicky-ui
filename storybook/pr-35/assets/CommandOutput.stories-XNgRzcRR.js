import{j as r}from"./iframe-BbITQAD0.js";import{C as t}from"./CommandOutput-CVZtitlF.js";import{S as R}from"./rpc-story.fixtures-cljx7hNu.js";import"./preload-helper-C67fKNjI.js";import"./DataTable-Cm37vJzG.js";import"./SortableHeader-CR4hiA_9.js";import"./utils-BLSKlp9E.js";import"./Modal-CeEpv3W_.js";import"./index-DTeCgtpZ.js";import"./index-KB5QQAds.js";import"./Icon-BV_HrUof.js";import"./button-Tq_nwknb.js";import"./index-1evVQkiP.js";import"./loading-3eAvRO6U.js";import"./modalStack-B9-B99Xv.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-DZWM2Cir.js";import"./UiClose-ChsFmnC8.js";import"./FilterBar-Cf8AUM0R.js";import"./floating-ui.react-CvnH8rJ_.js";import"./FilterPill-DNkaBjCB.js";import"./UiAdd-CG6_cPco.js";import"./UiRemove-CCRnh8gM.js";import"./UiCheck-Dc-rEWul.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-JSQNUqLg.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-B6dH09FW.js";import"./DateTimePicker-BXfSh-9E.js";import"./UiCalendar-Di_gX8EH.js";import"./MultiSelect-Bu6L3IQZ.js";import"./UiChevronUp-Bug5esHK.js";import"./RangeSlider-aQi5TfIl.js";import"./TimeRange-CkEpMXp_.js";import"./select-DRRJU6MQ.js";import"./UiWatch-B2dL1GP7.js";import"./UiArrowRight-yOyPIjzp.js";import"./UiSearch-B6ZPcCcQ.js";import"./UiFilter-CLtgbvNe.js";import"./UiChevronRight-YoKvm1yT.js";import"./Timestamp-BGfQMUrG.js";import"./TagList-XVuVCXwT.js";import"./Badge-0VTPnFgW.js";import"./HoverCard-D12YyofN.js";import"./Properties-DQjEvby7.js";import"./UiZoomOut-BC9XsBnd.js";import"./UiCopy-B4oai1-v.js";import"./StatusDot-CpLCS-mB.js";import"./UiEllipsis-Br5DZIfb.js";import"./UiArrowLeft-C2DLIPbm.js";import"./UiRows-ySjkTtfS.js";import"./UiListFlat-_1xFFtuy.js";import"./UiSun-DjaA7q5p.js";import"./Clicky-31FuQk4U.js";import"./suspense-tpZvsOY-.js";import"./useQuery-DcFKviWQ.js";import"./FilterForm-DkVGmF6I.js";import"./types-BHfRQr8X.js";import"./Tree-BY7naUxm.js";import"./TreeNode-B6rylUdN.js";import"./UiExpandAll-EYyRMouF.js";import"./ObjectGraph-DBB1uZl3.js";import"./ExecutionTree-WRJfBC10.js";import"./CodeBlock-CjXJ674M.js";import"./JsonView-Bc4K0aEo.js";import"./code-highlight-gMz6DzC7.js";import"./RenderedStackTrace-C7lf7HE_.js";import"./UiError-CoIZd9H0.js";import"./UiStackFrameDot-CPH7Up9f.js";import"./UiChip-BwBwcM0o.js";import"./UiDebugStepOver-Dm33gOh-.js";import"./UiMethod-Dxuiuh1S.js";import"./UiCloudDownload-D18X1WSF.js";import"./UiComment-DzN113l0.js";import"./UiTable-PfBrm4BC.js";import"./UiFileCode-B9EDSftm.js";import"./UiFileSpreadsheet-DMb-yEVN.js";import"./UiMarkdown-Bc9qys6R.js";import"./UiFileText-NHzgiAxq.js";import"./UiJson-BtCDl3-L.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
3 pods updated`},N={success:!1,exit_code:1,contentType:"text/plain",stdout:"",stderr:"Error: forbidden — token lacks scope deployments:write"},Ur={title:"Clicky-RPC/CommandOutput",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders an operation's `ExecutionResponse`: a Clicky document (e.g. a table) is rendered richly via `Clicky`/`DataTable`; plain text and JSON fall back to their viewers. Handles loading and empty states. Pure — pass the response in."}}},argTypes:{response:{control:!1},loading:{control:"boolean"}},args:{response:R}},e={render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},s={args:{response:v},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},m={args:{response:N},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})},i={args:{response:null,loading:!0,loadingMessage:"Running command…"},render:o=>r.jsx("div",{className:"max-w-3xl",children:r.jsx(t,{...o})})};var p,a,n;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(n=(a=e.parameters)==null?void 0:a.docs)==null?void 0:n.source}}};var d,c,l;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
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
}`,...(g=(x=m.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var E,S,O;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    response: null,
    loading: true,
    loadingMessage: "Running command…"
  },
  render: args => <div className="max-w-3xl">
      <CommandOutput {...args} />
    </div>
}`,...(O=(S=i.parameters)==null?void 0:S.docs)==null?void 0:O.source}}};const Vr=["Table","Text","ErrorOutput","Loading"];export{m as ErrorOutput,i as Loading,e as Table,s as Text,Vr as __namedExportsOrder,Ur as default};
