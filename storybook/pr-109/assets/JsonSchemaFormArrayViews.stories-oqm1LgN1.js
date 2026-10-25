import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./JsonSchemaForm-Dkz3VWwd.js";function a({layout:e}){let[t,n]=(0,o.useState)(p);return(0,s.jsxs)(`div`,{className:`max-w-4xl space-y-4 p-4`,children:[(0,s.jsx)(i,{schema:f,value:t,onChange:n,layout:e,showPreferencesMenu:!1}),(0,s.jsx)(`pre`,{className:`overflow-auto rounded-md border bg-muted/30 p-3 text-xs`,children:JSON.stringify(t,null,2)})]})}var o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d=e=>({type:`string`,title:e}),f={type:`object`,properties:{Beneficiaries:{type:`array`,title:`Beneficiaries`,items:{type:`object`,properties:{Name:d(`Name`),Relationship:d(`Relationship`),Share:{type:`number`,title:`Share %`}}}},Reinsurers:{type:`array`,title:`Reinsurers`,items:{type:`object`,properties:{Name:d(`Reinsurer`),Treaty:d(`Treaty`),Share:{type:`number`,title:`Share %`},Retention:{type:`number`,title:`Retention`},Currency:d(`Currency`),Effective:{type:`string`,format:`date`,title:`Effective`},Notes:d(`Notes`)}}}}},p={Beneficiaries:[{Name:`Ada Example`,Relationship:`Spouse`,Share:60},{Name:`Ben Example`,Relationship:`Child`,Share:40}],Reinsurers:[{Name:`Acme Re`,Treaty:`QS-01`,Share:50,Retention:1e5,Currency:`USD`,Effective:`2026-01-01`},{Name:`Example Re`,Treaty:`XL-02`,Share:25,Retention:25e4,Currency:`USD`,Effective:`2026-01-01`}]},m={title:`JsonSchemaForm/Object array views`,component:a,args:{layout:{mode:`stacked`}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},h={play:async({canvasElement:e,step:t})=>{let n=u(e);await t(`the 3-column array opens as a grid, the 7-column one as item rows`,async()=>{await c(n.getAllByRole(`table`)).toHaveLength(1)}),await t(`the view menu switches the grid to the stack form`,async()=>{await l.click(n.getByRole(`button`,{name:`View options for Beneficiaries`})),await l.click(u(document.body).getByRole(`menuitem`,{name:`Stack form`})),await c(n.queryByRole(`table`)).toBeNull()})}},g={args:{layout:{mode:`inline`}}},_=[`NarrowAndWide`,`InlineForm`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("the 3-column array opens as a grid, the 7-column one as item rows", async () => {
      await expect(canvas.getAllByRole("table")).toHaveLength(1);
    });
    await step("the view menu switches the grid to the stack form", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "View options for Beneficiaries"
      }));
      await userEvent.click(within(document.body).getByRole("menuitem", {
        name: "Stack form"
      }));
      await expect(canvas.queryByRole("table")).toBeNull();
    });
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    layout: {
      mode: "inline"
    }
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{g as InlineForm,h as NarrowAndWide,_ as __namedExportsOrder,m as default};