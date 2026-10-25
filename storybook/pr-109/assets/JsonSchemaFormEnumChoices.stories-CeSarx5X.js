import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./JsonSchemaForm-Dkz3VWwd.js";function a(e){return{type:`object`,properties:{mode:{type:`string`,title:`Mode`,enum:[`insert`,`update`,`skip`],default:`insert`,"x-enum-display":e,"x-enum-descriptions":{insert:`Insert a new activity.`,update:`Update the existing activity.`,skip:`Leave the activity untouched.`}}}}}function o({display:e,initial:t}){let[n,r]=(0,s.useState)(t);return(0,c.jsxs)(`div`,{className:`max-w-2xl space-y-4 p-4`,children:[(0,c.jsx)(i,{schema:a(e),value:n,onChange:r,applyDefaults:!1,showPreferencesMenu:!1}),(0,c.jsx)(`pre`,{className:`overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs`,children:JSON.stringify(n,null,2)})]})}var s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{s=t(),r(),c=n(),{expect:l,userEvent:u,within:d}=__STORYBOOK_MODULE_TEST__,f={title:`JsonSchemaForm/Enum choices`,component:o,args:{display:`radio`,initial:{}},parameters:{docs:{description:{component:`Radio (\`x-enum-display: "radio"\`) and segmented enums show each option's
\`x-enum-descriptions\` entry as a native tooltip and mark the schema \`default\` option
with a muted **default** suffix, which is also the option's accessible description.

While the value is unset, the default option is drawn as the *implied* choice — a dashed
primary outline, distinct from the filled selection — and stays unchecked, because
nothing has been chosen yet. Choosing any option replaces the implied style with a real
selection; the default option keeps its marker.`}}}},p={play:async({canvasElement:e,step:t})=>{let n=d(e),r=n.getByRole(`radio`,{name:`insert`});await t(`the default option is implied but not checked`,async()=>{await l(r).not.toBeChecked(),await l(r.closest(`label`)).toHaveAttribute(`data-implied`,`true`),await l(r.closest(`label`)).toHaveAttribute(`title`,`Insert a new activity. (default)`),await l(r).toHaveAccessibleDescription(`default`)}),await t(`choosing an option replaces the implied state`,async()=>{await u.click(n.getByText(`skip`)),await l(n.getByRole(`radio`,{name:`skip`})).toBeChecked(),await l(e.querySelector(`[data-implied]`)).toBeNull()})}},m={args:{initial:{mode:`update`}},play:async({canvasElement:e})=>{let t=d(e);await l(t.getByRole(`radio`,{name:`update`})).toBeChecked(),await l(t.getByRole(`radio`,{name:`insert`})).toHaveAccessibleDescription(`default`),await l(e.querySelector(`[data-implied]`)).toBeNull()}},h={args:{display:`segmented`}},g={args:{display:`segmented`,initial:{mode:`update`}}},_=[`RadioDefaultUnset`,`RadioDefaultSet`,`SegmentedDefaultUnset`,`SegmentedDefaultSet`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const insert = canvas.getByRole("radio", {
      name: "insert"
    });
    await step("the default option is implied but not checked", async () => {
      await expect(insert).not.toBeChecked();
      await expect(insert.closest("label")).toHaveAttribute("data-implied", "true");
      await expect(insert.closest("label")).toHaveAttribute("title", "Insert a new activity. (default)");
      await expect(insert).toHaveAccessibleDescription("default");
    });
    await step("choosing an option replaces the implied state", async () => {
      await userEvent.click(canvas.getByText("skip"));
      await expect(canvas.getByRole("radio", {
        name: "skip"
      })).toBeChecked();
      await expect(canvasElement.querySelector("[data-implied]")).toBeNull();
    });
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    initial: {
      mode: "update"
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", {
      name: "update"
    })).toBeChecked();
    await expect(canvas.getByRole("radio", {
      name: "insert"
    })).toHaveAccessibleDescription("default");
    await expect(canvasElement.querySelector("[data-implied]")).toBeNull();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    display: "segmented"
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    display: "segmented",
    initial: {
      mode: "update"
    }
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{m as RadioDefaultSet,p as RadioDefaultUnset,g as SegmentedDefaultSet,h as SegmentedDefaultUnset,_ as __namedExportsOrder,f as default};