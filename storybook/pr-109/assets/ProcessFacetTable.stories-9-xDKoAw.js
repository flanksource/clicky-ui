import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{_ as n,a as r,o as i,r as a,v as o}from"./fixtures-DQ4-m9zu.js";import{n as s,t as c}from"./ProcessFacetTable-CyGkizOJ.js";var l,u,d,f,p,m,h,g,_,v,y,b,x,S;function C(){return(C=e((()=>{a(),n(),s(),l=t(),{expect:u,within:d}=__STORYBOOK_MODULE_TEST__,f=(e,t=12)=>o(i.filter(e=>e.tick<=t),`101:100`,e),p={title:`Data/Traces/ProcessFacetTable`,component:c,args:{facet:`openFiles`,reading:f(`openFiles`)},decorators:[e=>(0,l.jsx)(`div`,{className:`max-w-3xl rounded-md border border-border p-density-3`,children:(0,l.jsx)(e,{})})],parameters:{docs:{description:{component:"One facet of a process as the trace stored it, in a filterable table: the latest stored list of its open files, sockets, listening ports or connections (with the time that list was read), or the environment recorded on its `process_tree` node. Nothing is fetched."}}}},m={play:async({canvasElement:e})=>{await u(d(e).getByText(`/dev/null`)).toBeInTheDocument()}},h={args:{facet:`sockets`,reading:f(`sockets`,8)}},g={args:{facet:`ports`,reading:f(`ports`)}},_={args:{facet:`connections`,reading:f(`connections`,8)}},v={args:{facet:`sockets`,reading:f(`sockets`,12)}},y={args:{reading:void 0}},b={args:{facet:`env`,environment:r}},x={args:{facet:`env`,error:`permission denied reading the environment of pid 102`}},S=[`OpenFiles`,`Sockets`,`Ports`,`Connections`,`EmptyAfterClosing`,`NothingStored`,`Environment`,`EnvironmentUnreadable`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("/dev/null")).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    facet: "sockets",
    reading: reading("sockets", 8)
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    facet: "ports",
    reading: reading("ports")
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    facet: "connections",
    reading: reading("connections", 8)
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    facet: "sockets",
    reading: reading("sockets", 12)
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    reading: undefined
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    facet: "env",
    environment: processEnvFixture
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    facet: "env",
    error: "permission denied reading the environment of pid 102"
  }
}`,...x.parameters?.docs?.source}}}})))()}C();export{_ as Connections,v as EmptyAfterClosing,b as Environment,x as EnvironmentUnreadable,y as NothingStored,m as OpenFiles,g as Ports,h as Sockets,S as __namedExportsOrder,p as default};