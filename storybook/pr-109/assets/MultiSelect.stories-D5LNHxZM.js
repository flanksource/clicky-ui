import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./MultiSelect-DKG5u5fT.js";function a(){let[e,t]=(0,s.useState)([`healthy`]);return(0,c.jsx)(i,{placeholder:`Status`,value:e,onChange:t,options:[{value:`healthy`,label:`Healthy`},{value:`degraded`,label:`Degraded`},{value:`pending`,label:`Pending`},{value:`unknown`,label:`Unknown`}]})}function o({value:e,...t}){let[n,r]=(0,s.useState)(e);return(0,c.jsxs)(`div`,{className:`space-y-3`,children:[(0,c.jsx)(i,{...t,value:n,onChange:r}),(0,c.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=[`,n.join(`, `)||`empty`,`]`]})]})}var s,c,l,u,d,f,p;function m(){return(m=e((()=>{s=t(),r(),c=n(),l={title:`Components/MultiSelect`,component:i,render:()=>(0,c.jsx)(a,{}),args:{options:[{value:`healthy`,label:`Healthy`},{value:`degraded`,label:`Degraded`},{value:`pending`,label:`Pending`}],value:[`healthy`],placeholder:`Status`,disabled:!1,onChange:()=>void 0},argTypes:{placeholder:{control:`text`,description:`Trigger text when nothing is selected; also labels the menu.`,table:{category:`Appearance`}},disabled:{control:`boolean`,description:`Disables opening and changing selections.`,table:{category:`Behavior`}},value:{control:!1,table:{category:`Value`}},options:{control:!1,table:{category:`Value`}},onChange:{control:!1,table:{category:`Events`}}},parameters:{docs:{description:{component:'Compact controlled multi-select menu used by filters and dense table chrome.\n\n**Controlled selection**\n- `value` is the complete array of selected option `value`s; `onChange` receives the full next array after each toggle.\n- `options` carry a stable `value` and a `label` (which may be a node). Use `disabled` per option to show but block a choice.\n- The trigger summarizes the selection: the labels when ≤2 are selected, otherwise an `N selected` count.\n\n**Usage**\n```tsx\nconst [value, setValue] = useState<string[]>(["healthy"]);\n<MultiSelect placeholder="Status" value={value} onChange={setValue}\n  options={[{ value: "healthy", label: "Healthy" }, ...]} />\n```\n\nOptions are objects, so they aren\'t editable from the controls panel — the **Playground** keeps live selection state while you toggle `placeholder` and `disabled`.'}}}},u={},d={render:e=>(0,c.jsx)(o,{...e})},f={render:e=>(0,c.jsx)(o,{...e}),args:{placeholder:`Columns`,value:[`operators`],facets:[{key:`change`,label:`Change`,labels:{changed:`Changed`,unchanged:`No changes`,added:`Added column`,removed:`Removed column`}}],options:[{value:`operators`,label:`Operators`,facets:{change:`changed`}},{value:`reviewers`,label:`Reviewers`,facets:{change:`unchanged`}},{value:`new`,label:`New`,facets:{change:`added`}},{value:`retired`,label:`Retired`,facets:{change:`removed`}}]}},p=[`Default`,`Playground`,`Faceted`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <MultiSelectPlayground {...args} />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: args => <MultiSelectPlayground {...args} />,
  args: {
    placeholder: "Columns",
    value: ["operators"],
    facets: [{
      key: "change",
      label: "Change",
      labels: {
        changed: "Changed",
        unchanged: "No changes",
        added: "Added column",
        removed: "Removed column"
      }
    }],
    options: [{
      value: "operators",
      label: "Operators",
      facets: {
        change: "changed"
      }
    }, {
      value: "reviewers",
      label: "Reviewers",
      facets: {
        change: "unchanged"
      }
    }, {
      value: "new",
      label: "New",
      facets: {
        change: "added"
      }
    }, {
      value: "retired",
      label: "Retired",
      facets: {
        change: "removed"
      }
    }]
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{u as Default,f as Faceted,d as Playground,p as __namedExportsOrder,l as default};