import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./button-CLtlb14M.js";import{n as a,t as o}from"./Combobox-D1mX6Vnj.js";var s,c,l,u,d,f,p;function m(){return(m=e((()=>{s=t(),a(),r(),c=n(),l=[{value:`primary`,label:`Primary database`,group:`Live`},{value:`reporting`,label:`Reporting database`,group:`Live`},{value:`archive`,label:`Archive database`,group:`Historical`}],u={title:`Components/Combobox/Menu filter`,component:o,parameters:{docs:{description:{component:`Set searchPlacement to menu to show a compact selection button with filtering inside its grouped popup. Typing leaves the selection unchanged; choose an option to commit, or dismiss to discard the search.`}}}},d={render:()=>{let[e,t]=(0,s.useState)(`primary`);return(0,c.jsx)(`div`,{className:`w-64`,children:(0,c.jsx)(o,{ariaLabel:`Database`,searchPlacement:`menu`,options:l,value:e,onChange:t,allowCustomValue:!1})})}},f={render:()=>{let[e,t]=(0,s.useState)(`primary`),[n,r]=(0,s.useState)(!1);return(0,c.jsxs)(`div`,{className:`w-64 space-y-2`,children:[(0,c.jsx)(o,{ariaLabel:`Database`,searchPlacement:`menu`,options:l,value:e,onChange:t,allowCustomValue:!1,menuHeader:(0,c.jsx)(i,{size:`sm`,variant:`outline`,onClick:()=>r(!0),children:`New database…`})}),n&&(0,c.jsx)(`p`,{role:`status`,children:`Creation requested`})]})}},p=[`Grouped`,`HeaderAction`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("primary");
    return <div className="w-64">
        <Combobox ariaLabel="Database" searchPlacement="menu" options={OPTIONS} value={value} onChange={setValue} allowCustomValue={false} />
      </div>;
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState("primary");
    const [created, setCreated] = useState(false);
    return <div className="w-64 space-y-2">
      <Combobox ariaLabel="Database" searchPlacement="menu" options={OPTIONS} value={value} onChange={setValue} allowCustomValue={false} menuHeader={<Button size="sm" variant="outline" onClick={() => setCreated(true)}>New database…</Button>} />
      {created && <p role="status">Creation requested</p>}
    </div>;
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{d as Grouped,f as HeaderAction,p as __namedExportsOrder,u as default};