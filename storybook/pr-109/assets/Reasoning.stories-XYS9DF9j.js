import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./Reasoning-DPjWcibh.js";var i,a,o,s,c;function l(){return(l=e((()=>{n(),i=t(),a={title:`Chat/Reasoning`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:'A collapsible block showing the model\'s reasoning ("thinking") trace, kept out of the way of the answer. Collapsed by default; renders nothing when `text` is empty.'}}},argTypes:{defaultOpen:{control:`boolean`}},args:{text:`The user wants the pods in the default namespace. I'll call listPods with namespace=default, then summarize the names and count in the answer.`,defaultOpen:!1}},o={render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},s={args:{defaultOpen:!0},render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},c=[`Collapsed`,`Expanded`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: args => <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
}`,...s.parameters?.docs?.source}}}})))()}l();export{o as Collapsed,s as Expanded,c as __namedExportsOrder,a as default};