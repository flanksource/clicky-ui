import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./jsx-runtime-DKU1u6-r.js";import{i as n,u as r}from"./classes-BFK0cEJ7.js";import{n as i,t as a}from"./EvaluationResult-Bor4ufaf.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{r(),i(),o=t(),{expect:s,userEvent:c,within:l}=__STORYBOOK_MODULE_TEST__,u={title:`JVM/EvaluationResult`,component:a,decorators:[e=>(0,o.jsx)(`div`,{className:`max-w-3xl p-4`,children:(0,o.jsx)(e,{})})]},d={},f={args:{evaluation:{value:{id:`ORD-1042`,total:129.5},graph:n,elapsedMs:12}},play:async({canvasElement:e})=>{let t=l(e);await s(t.getByText(`@com.example.orders.model.Order`)).toBeInTheDocument(),await c.click(t.getByRole(`radio`,{name:`Raw`})),await s(t.getByRole(`region`,{name:`Raw result`})).toHaveTextContent(`ORD-1042`)}},p={args:{evaluation:{value:{"java.version":`21.0.5`,"os.name":`Linux`,"user.timezone":`UTC`}}}},m={args:{evaluation:{value:7,graph:n,stdout:`Inspecting order ORD-1042
3 line items
`,stderr:`WARNING: slow query (480 ms)
`,elapsedMs:1840}},play:async({canvasElement:e})=>{let t=l(e);await s(t.getByRole(`region`,{name:`Standard output`})).toHaveTextContent(`3 line items`),await s(t.getByRole(`region`,{name:`Standard error`})).toHaveTextContent(`slow query`),await s(t.getByText(`1.8 s`)).toBeInTheDocument()}},h={args:{evaluation:{stdout:`done
`,elapsedMs:3}}},g={args:{pending:!0}},_={args:{error:Error(`ognl.OgnlException: source is null for getProperty(null, "throw")`)},play:async({canvasElement:e})=>{await s(l(e).getByText(`Evaluation failed`)).toBeInTheDocument()}},v={args:{evaluation:{graph:{label:`missing id`}}}},y=[`Idle`,`ObjectGraphResult`,`PlainValue`,`GroovyWithOutput`,`NoValue`,`Running`,`Failed`,`UnreadableGraph`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    evaluation: {
      value: {
        id: "ORD-1042",
        total: 129.5
      },
      graph: EVALUATION_GRAPH,
      elapsedMs: 12
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("@com.example.orders.model.Order")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("radio", {
      name: "Raw"
    }));
    await expect(canvas.getByRole("region", {
      name: "Raw result"
    })).toHaveTextContent("ORD-1042");
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    evaluation: {
      value: {
        "java.version": "21.0.5",
        "os.name": "Linux",
        "user.timezone": "UTC"
      }
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    evaluation: {
      value: 7,
      graph: EVALUATION_GRAPH,
      stdout: "Inspecting order ORD-1042\\n3 line items\\n",
      stderr: "WARNING: slow query (480 ms)\\n",
      elapsedMs: 1840
    }
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("region", {
      name: "Standard output"
    })).toHaveTextContent("3 line items");
    await expect(canvas.getByRole("region", {
      name: "Standard error"
    })).toHaveTextContent("slow query");
    await expect(canvas.getByText("1.8 s")).toBeInTheDocument();
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    evaluation: {
      stdout: "done\\n",
      elapsedMs: 3
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    pending: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    error: new Error('ognl.OgnlException: source is null for getProperty(null, "throw")')
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Evaluation failed")).toBeInTheDocument();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    evaluation: {
      graph: {
        label: "missing id"
      }
    }
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{_ as Failed,m as GroovyWithOutput,d as Idle,h as NoValue,f as ObjectGraphResult,p as PlainValue,g as Running,v as UnreadableGraph,y as __namedExportsOrder,u as default};