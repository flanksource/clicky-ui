import{j as c}from"./iframe-49i2VeV0.js";import{A as y}from"./AccessMark-Dn6Dmt-B.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";const{expect:R,within:S}=__STORYBOOK_MODULE_TEST__,O={title:"Data/AccessMark",component:y,tags:["autodocs"],parameters:{docs:{description:{component:"How a name is accessed — read, written, or both — as the read and write icons the call graph draws its edges with. Merge what is known of one name with `mergeAccess`."}}},args:{access:"read"}},a={},r={args:{access:"write"}},s={args:{access:"readwrite"},play:async({canvasElement:e})=>{const n=S(e).getByRole("img",{name:"Read and written"});await R(n.querySelectorAll("[data-access-icon]")).toHaveLength(2)}},t={render:()=>c.jsx("ul",{className:"w-64 divide-y divide-border rounded-md border border-border text-xs",children:[["POLICYGUID","read"],["STATUSCODE","readwrite"],["UPDATEDGMT","write"]].map(([e,n])=>c.jsxs("li",{className:"flex items-center gap-2 px-2 py-1 font-mono",children:[e,c.jsx(y,{access:n,className:"ml-auto"})]},e))})};var o,d,i;a.parameters={...a.parameters,docs:{...(o=a.parameters)==null?void 0:o.docs,source:{originalSource:"{}",...(i=(d=a.parameters)==null?void 0:d.docs)==null?void 0:i.source}}};var m,p,l;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    access: "write"
  }
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var w,u,g;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(g=(u=s.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var x,A,h;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <ul className="w-64 divide-y divide-border rounded-md border border-border text-xs">
      {([["POLICYGUID", "read"], ["STATUSCODE", "readwrite"], ["UPDATEDGMT", "write"]] as const).map(([name, access]) => <li key={name} className="flex items-center gap-2 px-2 py-1 font-mono">
          {name}
          <AccessMark access={access} className="ml-auto" />
        </li>)}
    </ul>
}`,...(h=(A=t.parameters)==null?void 0:A.docs)==null?void 0:h.source}}};const f=["Read","Written","ReadAndWritten","InARow"];export{t as InARow,a as Read,s as ReadAndWritten,r as Written,f as __namedExportsOrder,O as default};
