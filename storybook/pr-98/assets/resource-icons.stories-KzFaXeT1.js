import{j as e,bt as m,bj as p}from"./iframe-Bk9swcUR.js";import"./preload-helper-BpddQVpQ.js";const{expect:t,within:g}=__STORYBOOK_MODULE_TEST__,b=[{id:"cloud-resources",label:"Cloud resources"},{id:"kubernetes",label:"Kubernetes"}];function x(s){return typeof s=="function"&&"__source"in s&&"__group"in s&&(s.__group==="cloud-resources"||s.__group==="kubernetes")}const y=Object.entries(p).filter(s=>x(s[1])).sort(([s],[o])=>s.localeCompare(o));function h({size:s}){return e.jsxs("div",{className:"space-y-8",children:[e.jsx("div",{className:"grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",children:Object.entries(m).map(([o,r])=>e.jsxs("div",{className:"rounded border border-border p-3",children:[e.jsxs("div",{className:"mb-2 flex gap-1",children:[e.jsx("span",{className:"h-6 w-6 rounded",style:{background:r.primary}}),e.jsx("span",{className:"h-6 w-6 rounded",style:{background:r.accent}})]}),e.jsx("span",{className:"text-xs capitalize",children:o})]},o))}),b.map(({id:o,label:r})=>{const c=y.filter(([,n])=>n.__group===o);return e.jsxs("section",{className:"space-y-2",children:[e.jsxs("header",{className:"flex items-baseline justify-between gap-3",children:[e.jsx("h2",{className:"text-sm font-semibold",children:r}),e.jsx("span",{className:"text-xs text-muted-foreground",children:c.length})]}),e.jsx("div",{className:"grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:c.map(([n,u])=>e.jsxs("div",{className:"flex min-w-0 items-center gap-2 rounded border border-border bg-background px-2 py-1.5",children:[e.jsx(u,{size:s,title:n,className:"shrink-0"}),e.jsx("span",{className:"truncate font-mono text-[11px] text-foreground",children:n})]},n))})]},o)})]})}const w={title:"Foundations/Resource Icons",component:h,args:{size:32},argTypes:{size:{control:{type:"number",min:16,max:64,step:1}}}},a={name:"Cloud and Kubernetes resources",play:async({canvasElement:s})=>{const o=g(s);for(const r of["compute","network","config","policy","storage","security"])await t(o.getByText(r)).toBeVisible();await t(o.getByRole("img",{name:"UiCloudVmAws"})).toBeVisible(),await t(o.getByRole("img",{name:"UiKubePod"})).toBeVisible()},parameters:{docs:{description:{story:"Shared semantic colors for 12 cloud resource glyphs, AWS/Azure/Google Cloud badge variants, and 39 Kubernetes Community glyphs shown bare and on reproducible octagons."}}}};var i,l,d;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  name: "Cloud and Kubernetes resources",
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    for (const category of ["compute", "network", "config", "policy", "storage", "security"]) {
      await expect(canvas.getByText(category)).toBeVisible();
    }
    await expect(canvas.getByRole("img", {
      name: "UiCloudVmAws"
    })).toBeVisible();
    await expect(canvas.getByRole("img", {
      name: "UiKubePod"
    })).toBeVisible();
  },
  parameters: {
    docs: {
      description: {
        story: "Shared semantic colors for 12 cloud resource glyphs, AWS/Azure/Google Cloud badge variants, and 39 Kubernetes Community glyphs shown bare and on reproducible octagons."
      }
    }
  }
}`,...(d=(l=a.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};const _=["Catalog"];export{a as Catalog,_ as __namedExportsOrder,w as default};
