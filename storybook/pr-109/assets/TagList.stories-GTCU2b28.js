import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{a as n,i as r,n as i,o as a}from"./TagList-DJs3vDYD.js";var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{r(),n(),o=t(),s=a([`env=production`,`team=payments`,`region=us-east-1`,`tier=critical`,`owner=ada`]),c={title:`Data/Cells/TagList`,component:i,tags:[`autodocs`],parameters:{docs:{description:{component:"Renders normalized `key=value` tags as compact badges for table cells. By default it shows `maxVisible` inline and collapses the rest into a `+N` hover popover; `wrap` lays them out across lines instead. Hovering a badge reveals include/exclude/copy actions (wired via `TagActionsProvider`). Build the input with `normalizeTags`."}}},argTypes:{maxVisible:{control:{type:`number`,min:1,max:6}},actions:{control:`inline-radio`,options:[`hover`,`inline`]},compact:{control:`boolean`},wrap:{control:`boolean`},tags:{control:!1}},args:{tags:s,maxVisible:3,actions:`hover`,wrap:!1}},l={render:e=>(0,o.jsx)(`div`,{className:`w-80`,children:(0,o.jsx)(i,{...e})})},u={args:{wrap:!0},render:e=>(0,o.jsx)(`div`,{className:`w-80`,children:(0,o.jsx)(i,{...e})})},d={args:{compact:!0},render:e=>(0,o.jsx)(`div`,{className:`w-80`,children:(0,o.jsx)(i,{...e})})},f={args:{tags:[]}},p=[`Default`,`Wrapped`,`Compact`,`Empty`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-80">
      <TagList {...args} />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    wrap: true
  },
  render: args => <div className="w-80">
      <TagList {...args} />
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  },
  render: args => <div className="w-80">
      <TagList {...args} />
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tags: []
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{d as Compact,l as Default,f as Empty,u as Wrapped,p as __namedExportsOrder,c as default};