import{r as w,j as n}from"./iframe-CcPM-cPW.js";import{J as f}from"./JsonSchemaForm-VWtWGSaC.js";import"./preload-helper-BZq7nIkI.js";import"./utils-DW-IJACk.js";import"./Icon-D84fH81s.js";import"./DropdownMenu-HxHzTLAX.js";import"./floating-ui.react-GwnkJcwj.js";import"./index-xfq7uwHx.js";import"./index-BVhCjt6c.js";import"./button-DdaTwSNy.js";import"./index-CPURVhFy.js";import"./loading-pjmE4eTk.js";import"./DropdownMenuSubmenu-0DvJxnuF.js";import"./modalStack-C4aKQWQ1.js";import"./zIndex-BGbNBNA8.js";import"./Properties-DGpFuxwE.js";import"./IconButton-C1RFRrox.js";import"./format-2niohfpq.js";import"./JsonView-BXn53cW-.js";import"./AccordionList-ClKkjR3g.js";import"./collections-CoHfwOze.js";import"./json-schema-form-size-E77C3uZS.js";import"./Badge-nx-gzT-b.js";import"./HoverCard-BIoavLKo.js";import"./json-schema-form-refs-Ri7m9AHd.js";import"./Modal-DrkQQzUz.js";import"./timestamp-format-DJzkpO9P.js";import"./Combobox-C_e4HsYa.js";import"./FilterPill-D8pQ_BuF.js";import"./DateField-yuESPGAs.js";import"./DatePicker-C-Znur6C.js";import"./DateTimePicker-BMsoOg_C.js";import"./SegmentedControl-C1m4tpZ9.js";import"./TreePickerField-BPGd8ZRI.js";import"./Tree-0MNtHW4W.js";import"./TreeNode-CVevEcMY.js";import"./InputField-CchQivy0.js";import"./use-hotkey-BFuqgySf.js";import"./ListMenu-Cb8iiDvX.js";import"./Markdown-B35E3XI8.js";import"./Callout-CNqQHHz_.js";import"./callout-tones-EFt49BYo.js";import"./CodeBlock-DBgncu36.js";import"./CodeDiff-CzMvQzR6.js";import"./code-diff-BUXB4Bx8.js";import"./code-highlight-BtMvzD9N.js";import"./HighlightedTokens-BJmABRuJ.js";const{expect:s,userEvent:m,within:p}=__STORYBOOK_MODULE_TEST__,e=t=>({type:"string",title:t}),v={type:"object",properties:{Beneficiaries:{type:"array",title:"Beneficiaries",items:{type:"object",properties:{Name:e("Name"),Relationship:e("Relationship"),Share:{type:"number",title:"Share %"}}}},Reinsurers:{type:"array",title:"Reinsurers",items:{type:"object",properties:{Name:e("Reinsurer"),Treaty:e("Treaty"),Share:{type:"number",title:"Share %"},Retention:{type:"number",title:"Retention"},Currency:e("Currency"),Effective:{type:"string",format:"date",title:"Effective"},Notes:e("Notes")}}}}},g={Beneficiaries:[{Name:"Ada Example",Relationship:"Spouse",Share:60},{Name:"Ben Example",Relationship:"Child",Share:40}],Reinsurers:[{Name:"Acme Re",Treaty:"QS-01",Share:50,Retention:1e5,Currency:"USD",Effective:"2026-01-01"},{Name:"Example Re",Treaty:"XL-02",Share:25,Retention:25e4,Currency:"USD",Effective:"2026-01-01"}]};function x({layout:t}){const[r,a]=w.useState(g);return n.jsxs("div",{className:"max-w-4xl space-y-4 p-4",children:[n.jsx(f,{schema:v,value:r,onChange:a,layout:t,showPreferencesMenu:!1}),n.jsx("pre",{className:"overflow-auto rounded-md border bg-muted/30 p-3 text-xs",children:JSON.stringify(r,null,2)})]})}const de={title:"JsonSchemaForm/Object array views",component:x,args:{layout:{mode:"stacked"}},parameters:{docs:{description:{component:"Object arrays with no display hint open as a grid while their visible columns fit (`x-table-max-columns`, default 4) and as the inline item form beyond that. `x-layout: table` and `x-array-display: accordion` pick the opening view explicitly. The ⋮ menu switches views in place."}}}},i={play:async({canvasElement:t,step:r})=>{const a=p(t);await r("the 3-column array opens as a grid, the 7-column one as item rows",async()=>{await s(a.getAllByRole("table")).toHaveLength(1)}),await r("the view menu switches the grid to the stack form",async()=>{await m.click(a.getByRole("button",{name:"View options for Beneficiaries"})),await m.click(p(document.body).getByRole("menuitem",{name:"Stack form"})),await s(a.queryByRole("table")).toBeNull()})}},o={args:{layout:{mode:"inline"}}};var c,l,u;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(u=(l=i.parameters)==null?void 0:l.docs)==null?void 0:u.source}}};var y,d,h;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    layout: {
      mode: "inline"
    }
  }
}`,...(h=(d=o.parameters)==null?void 0:d.docs)==null?void 0:h.source}}};const he=["NarrowAndWide","InlineForm"];export{o as InlineForm,i as NarrowAndWide,he as __namedExportsOrder,de as default};
