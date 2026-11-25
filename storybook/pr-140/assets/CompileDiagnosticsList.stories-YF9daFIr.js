import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{n,t as r}from"./CompileDiagnosticsList-RxQnyomi.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{n(),i=t(),{expect:a,fn:o,userEvent:s,within:c}=__STORYBOOK_MODULE_TEST__,l={title:`JVM/CompileDiagnosticsList`,component:r,decorators:[e=>(0,i.jsx)(`div`,{className:`w-[640px] border border-border`,children:(0,i.jsx)(e,{})})]},u={kind:`ERROR`,line:17,column:9,message:`incompatible types: java.lang.String cannot be converted to double`},d={kind:`WARNING`,line:1,column:1,message:`[deprecation] Order.load(String) in Order has been deprecated`},f={args:{compilation:{success:!0,diagnostics:[]}}},p={args:{compilation:{success:!0,diagnostics:[d]}}},m={args:{compilation:{success:!1,diagnostics:[u,d,{...u,line:21,message:`cannot find symbol: variable totl`}]},onSelectDiagnostic:o()},play:async({args:e,canvasElement:t})=>{await s.click(c(t).getByRole(`button`,{name:/17:9/})),await a(e.onSelectDiagnostic).toHaveBeenCalledWith(u)}},h={args:{compilation:{success:!1,diagnostics:[]}}},g={args:{compilation:{success:!0,applied:!0,diagnostics:[d]},appliedMessage:`Patch applied. The original bytecode is restored in 15 minutes.`}},_=[`CompilesCleanly`,`CompilesWithWarnings`,`Failed`,`FailedWithoutDiagnostics`,`Applied`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    compilation: {
      success: true,
      diagnostics: []
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    compilation: {
      success: true,
      diagnostics: [WARNING]
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    compilation: {
      success: false,
      diagnostics: [ERROR, WARNING, {
        ...ERROR,
        line: 21,
        message: "cannot find symbol: variable totl"
      }]
    },
    onSelectDiagnostic: fn()
  },
  play: async ({
    args,
    canvasElement
  }) => {
    await userEvent.click(within(canvasElement).getByRole("button", {
      name: /17:9/
    }));
    await expect(args.onSelectDiagnostic).toHaveBeenCalledWith(ERROR);
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    compilation: {
      success: false,
      diagnostics: []
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    compilation: {
      success: true,
      applied: true,
      diagnostics: [WARNING]
    },
    appliedMessage: "Patch applied. The original bytecode is restored in 15 minutes."
  }
}`,...g.parameters?.docs?.source}}}})))()}v();export{g as Applied,f as CompilesCleanly,p as CompilesWithWarnings,m as Failed,h as FailedWithoutDiagnostics,_ as __namedExportsOrder,l as default};