import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./PatchActions-BciLk9XV.js";function a(e){let[t,n]=(0,o.useState)(900);return(0,s.jsx)(i,{...e,leaseSeconds:t,onLeaseSecondsChange:n})}var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{o=t(),r(),s=n(),{expect:c,fn:l,userEvent:u,within:d}=__STORYBOOK_MODULE_TEST__,f={title:`JVM/PatchActions`,component:a,args:{editing:!1,dirty:!1,compiledCurrent:!1,patched:!1,busy:null,canEdit:!0,mutationAllowed:!0,onEdit:l(),onCancel:l(),onCompile:l(),onApply:l(),onRestore:l()}},p={play:async({args:e,canvasElement:t})=>{await u.click(d(t).getByRole(`button`,{name:`Edit`})),await c(e.onEdit).toHaveBeenCalled()}},m={args:{patched:!0}},h={args:{patched:!0,mutationAllowed:!1}},g={args:{canEdit:!1,editDisabledReason:`This is a group of loaders; pick the loader that defines the class.`}},_={args:{editing:!0}},v={args:{editing:!0,dirty:!0}},y={args:{editing:!0,dirty:!0,compiledCurrent:!0},play:async({args:e,canvasElement:t})=>{let n=d(t);await u.selectOptions(n.getByRole(`combobox`,{name:`Restore original bytecode after`}),`300`),await u.click(n.getByRole(`button`,{name:`Apply patch`})),await c(e.onApply).toHaveBeenCalled()}},b={args:{editing:!0,dirty:!0,compiledCurrent:!0,mutationAllowed:!1}},x={args:{editing:!0,dirty:!0,busy:`compile`}},S={args:{editing:!0,dirty:!0,compiledCurrent:!0,busy:`patch`}},C=[`Reading`,`ReadingPatched`,`RestoreNeedsConsent`,`EditBlocked`,`EditingUnchanged`,`EditingNotCompiled`,`EditingReadyToApply`,`EditingGateClosed`,`Compiling`,`Applying`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: "Edit"
    }));
    await expect(args.onEdit).toHaveBeenCalled();
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    patched: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    patched: true,
    mutationAllowed: false
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    canEdit: false,
    editDisabledReason: "This is a group of loaders; pick the loader that defines the class."
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    editing: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    editing: true,
    dirty: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    editing: true,
    dirty: true,
    compiledCurrent: true
  },
  play: async ({
    args,
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole("combobox", {
      name: "Restore original bytecode after"
    }), "300");
    await userEvent.click(canvas.getByRole("button", {
      name: "Apply patch"
    }));
    await expect(args.onApply).toHaveBeenCalled();
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    editing: true,
    dirty: true,
    compiledCurrent: true,
    mutationAllowed: false
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    editing: true,
    dirty: true,
    busy: "compile"
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    editing: true,
    dirty: true,
    compiledCurrent: true,
    busy: "patch"
  }
}`,...S.parameters?.docs?.source}}}})))()}w();export{S as Applying,x as Compiling,g as EditBlocked,b as EditingGateClosed,v as EditingNotCompiled,y as EditingReadyToApply,_ as EditingUnchanged,p as Reading,m as ReadingPatched,h as RestoreNeedsConsent,C as __namedExportsOrder,f as default};