import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./StatusDot-BMsxwjyw.js";var i,a,o,s,c,l;function u(){return(u=e((()=>{n(),i=t(),a={title:`Data/Cells/StatusDot`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"A small colored status dot with an optional inline label, for table cells and dense lists. Color maps from the shared `BadgeStatus` palette (success/error/warning/info). The dot carries an accessible name via `aria-label`."}}},argTypes:{status:{control:`inline-radio`,options:[`success`,`error`,`warning`,`info`]},size:{control:`inline-radio`,options:[`xs`,`sm`,`md`]},label:{control:`text`}},args:{status:`success`,size:`sm`,label:`Healthy`}},o={},s={render:()=>(0,i.jsxs)(`div`,{className:`flex flex-col gap-2`,children:[(0,i.jsx)(r,{status:`success`,label:`Healthy`}),(0,i.jsx)(r,{status:`warning`,label:`Degraded`}),(0,i.jsx)(r,{status:`error`,label:`Down`}),(0,i.jsx)(r,{status:`info`,label:`Provisioning`})]})},c={args:{label:void 0},render:()=>(0,i.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,i.jsx)(r,{status:`success`,size:`xs`}),(0,i.jsx)(r,{status:`warning`,size:`sm`}),(0,i.jsx)(r,{status:`error`,size:`md`})]})},l=[`Default`,`AllStatuses`,`DotOnly`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <StatusDot status="success" label="Healthy" />
      <StatusDot status="warning" label="Degraded" />
      <StatusDot status="error" label="Down" />
      <StatusDot status="info" label="Provisioning" />
    </div>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: undefined
  },
  render: () => <div className="flex items-center gap-3">
      <StatusDot status="success" size="xs" />
      <StatusDot status="warning" size="sm" />
      <StatusDot status="error" size="md" />
    </div>
}`,...c.parameters?.docs?.source}}}})))()}u();export{s as AllStatuses,o as Default,c as DotOnly,l as __namedExportsOrder,a as default};