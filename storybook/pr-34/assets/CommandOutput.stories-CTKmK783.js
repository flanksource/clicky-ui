import{j as r}from"./iframe-B-R1GM9F.js";import{C as t}from"./CommandOutput-IL1Jy8-W.js";import{S as R}from"./rpc-story.fixtures-DEM-Mt_1.js";import"./preload-helper-B4w--iqy.js";import"./DataTable-2Y1MJOi5.js";import"./SortableHeader-D0bX4wQ5.js";import"./utils-BLSKlp9E.js";import"./Modal-BBnmngDy.js";import"./index-DJve4rSX.js";import"./index-BWgeyKN8.js";import"./Icon-GOgSuK4c.js";import"./button-BuoaacKd.js";import"./index-1evVQkiP.js";import"./loading-BCTdXuAj.js";import"./modalStack-DOuKvvHi.js";import"./zIndex-CigQ76av.js";import"./UiFullscreen-DRoUwqMZ.js";import"./UiClose-CK_Ztmv-.js";import"./FilterBar-21ArzBc1.js";import"./floating-ui.react-DPNvzpty.js";import"./FilterPill-B0MqmF1U.js";import"./UiAdd-6kIRNr7o.js";import"./UiRemove--q7Gi2Ve.js";import"./UiCheck-BThsfaV8.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-C9l65XcX.js";import"./json-schema-form-size-DYVq0lph.js";import"./UiChevronDown-7vVXchWm.js";import"./DateTimePicker-B0j7YdiF.js";import"./UiCalendar-DDvtnKAI.js";import"./MultiSelect-Cc6heG-4.js";import"./UiChevronUp-CLDIgOUp.js";import"./RangeSlider-CzZT_vpQ.js";import"./TimeRange-DWYtJWrH.js";import"./select-DNUjaytE.js";import"./UiWatch-ByqfI7k3.js";import"./UiArrowRight-D7ofd1mB.js";import"./UiSearch-Dqhkv3lF.js";import"./UiFilter-BqfpJlnE.js";import"./UiChevronRight-DlnTuw8_.js";import"./Timestamp-bK5phihc.js";import"./TagList-BhgBI0V5.js";import"./Badge-CK8uPcJn.js";import"./HoverCard-Z0LuUJti.js";import"./Properties-CrFcwj5b.js";import"./UiZoomOut-CEYCLvgw.js";import"./UiCopy-Byj5yeWV.js";import"./StatusDot-D5Py_f3C.js";import"./UiEllipsis-DEWe1IUa.js";import"./UiArrowLeft-CS77UkjV.js";import"./UiRows-d_Tnxw1N.js";import"./UiListFlat-DDh1pslz.js";import"./UiSun-C8IWEqEW.js";import"./Clicky-Dit_yD_O.js";import"./suspense-D_05-LsV.js";import"./useQuery-BND5mFfD.js";import"./FilterForm-rhY6_hOE.js";import"./types-BHfRQr8X.js";import"./Tree-CNR-aI_S.js";import"./TreeNode-DILBuW5l.js";import"./UiExpandAll-B7qJCf5A.js";import"./ObjectGraph-DadM7ZBO.js";import"./ExecutionTree-Crfu7LoI.js";import"./CodeBlock-DqZJwvDF.js";import"./JsonView-D1yOhbs5.js";import"./code-highlight-Bt3LUeeQ.js";import"./RenderedStackTrace-S98UBBCr.js";import"./UiError-CaOzkxg2.js";import"./UiStackFrameDot-CFTwM_oD.js";import"./UiChip-DwHiBPkK.js";import"./UiDebugStepOver-BFToaf21.js";import"./UiMethod-CGp_KMSe.js";import"./UiCloudDownload-Cpbmb27Q.js";import"./UiComment-595kckvH.js";import"./UiTable-BUfEIsg1.js";import"./UiFileCode-BdPkWE9L.js";import"./UiFileSpreadsheet-BPM56lLR.js";import"./UiMarkdown-BdLWOQGb.js";import"./UiFileText-CKs6Vk3p.js";import"./UiJson-Bw6nisQg.js";const v={success:!0,exit_code:0,contentType:"text/plain",stdout:`rollout restarted: deployment/payments-api
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
