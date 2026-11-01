import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./AccessMark-D6CtgZpB.js";var i,a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),i=t(),{expect:a,within:o}=__STORYBOOK_MODULE_TEST__,s={title:`Data/AccessMark`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"How a name is accessed — read, written, or both — as the read and write icons the call graph draws its edges with. Merge what is known of one name with `mergeAccess`."}}},args:{access:`read`}},c={},l={args:{access:`write`}},u={args:{access:`readwrite`},play:async({canvasElement:e})=>{let t=o(e).getByRole(`img`,{name:`Read and written`});await a(t.querySelectorAll(`[data-access-icon]`)).toHaveLength(2)}},d={render:()=>(0,i.jsx)(`ul`,{className:`w-64 divide-y divide-border rounded-md border border-border text-xs`,children:[[`POLICYGUID`,`read`],[`STATUSCODE`,`readwrite`],[`UPDATEDGMT`,`write`]].map(([e,t])=>(0,i.jsxs)(`li`,{className:`flex items-center gap-2 px-2 py-1 font-mono`,children:[e,(0,i.jsx)(r,{access:t,className:`ml-auto`})]},e))})},f=[`Read`,`Written`,`ReadAndWritten`,`InARow`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    access: "write"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    access: "readwrite"
  },
  play: async ({
    canvasElement
  }) => {
    const mark = within(canvasElement).getByRole("img", {
      name: "Read and written"
    });
    await expect(mark.querySelectorAll("[data-access-icon]")).toHaveLength(2);
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <ul className="w-64 divide-y divide-border rounded-md border border-border text-xs">
      {([["POLICYGUID", "read"], ["STATUSCODE", "readwrite"], ["UPDATEDGMT", "write"]] as const).map(([name, access]) => <li key={name} className="flex items-center gap-2 px-2 py-1 font-mono">
          {name}
          <AccessMark access={access} className="ml-auto" />
        </li>)}
    </ul>
}`,...d.parameters?.docs?.source}}}})))()}p();export{d as InARow,c as Read,u as ReadAndWritten,l as Written,f as __namedExportsOrder,s as default};