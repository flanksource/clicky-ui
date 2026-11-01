import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./Timestamp-RN6HaF94.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),a=`2026-06-02T09:30:00Z`,o={title:`Data/Cells/Timestamp`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Formats any parseable timestamp value for table cells, with the full ISO time on hover. `format` selects the display style; unparseable values render an em dash. Note `relative` formats against the real current time, so its output changes over time."}}},argTypes:{value:{control:`text`},format:{control:`inline-radio`,options:[`relative`,`time`,`short`,`iso`]},showTitleOnHover:{control:`boolean`}},args:{value:a,format:`short`,showTitleOnHover:!0}},s={},c={render:()=>(0,i.jsx)(`table`,{className:`text-sm`,children:(0,i.jsx)(`tbody`,{children:[`relative`,`time`,`short`,`iso`].map(e=>(0,i.jsxs)(`tr`,{children:[(0,i.jsx)(`td`,{className:`pr-4 font-mono text-xs text-muted-foreground`,children:e}),(0,i.jsx)(`td`,{children:(0,i.jsx)(r,{value:a,format:e})})]},e))})})},l={args:{value:`not-a-date`}},u=[`Default`,`Formats`,`Invalid`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <table className="text-sm">
      <tbody>
        {(["relative", "time", "short", "iso"] as const).map(f => <tr key={f}>
            <td className="pr-4 font-mono text-xs text-muted-foreground">{f}</td>
            <td>
              <Timestamp value={SAMPLE} format={f} />
            </td>
          </tr>)}
      </tbody>
    </table>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: "not-a-date"
  }
}`,...l.parameters?.docs?.source}}}})))()}d();export{s as Default,c as Formats,l as Invalid,u as __namedExportsOrder,o as default};