import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./JsonSchemaForm-DcQ4gGYX.js";function a(){let[e,t]=(0,o.useState)({});return(0,s.jsxs)(`div`,{className:`max-w-xl space-y-3`,children:[(0,s.jsx)(i,{schema:d,value:e,onChange:t,showPreferencesMenu:!1}),(0,s.jsx)(`pre`,{role:`status`,className:`text-xs`,children:JSON.stringify(e)})]})}var o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{o=t(),r(),s=n(),{expect:c,fireEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={properties:{dueDate:{title:`Due date`,oneOf:[{title:`Date answer`,oneOf:[{title:`Field Answer`,type:`object`,unevaluatedProperties:!1,required:[`type`,`fieldRef`],properties:{type:{title:`Type`,const:`field`},fieldRef:{title:`Field reference`,type:`object`,additionalProperties:!1,required:[`kind`,`name`],properties:{kind:{title:`Kind`,enum:[`policy`,`plan`]},name:{title:`Name`,type:`string`}}}}},{allOf:[{title:`Calculation Answer`,type:`object`,unevaluatedProperties:!1,required:[`type`,`calculation`],properties:{type:{title:`Type`,const:`calculation`},calculation:{title:`Calculation`,type:`string`}}}]}]},{title:`Open questions`,type:`object`,additionalProperties:!1,required:[`open`],properties:{open:{title:`Open`,type:`array`,items:{type:`string`}}}},{title:`Not applicable`,type:`object`,additionalProperties:!1,required:[`notApplicable`],properties:{notApplicable:{title:`Reason`,type:`string`}}}]}}},f={title:`JsonSchemaForm/Union`,component:a},p={play:async({canvasElement:e})=>{let t=u(e),n=t.getByRole(`radiogroup`,{name:`Due date format`});await c(u(n).getAllByRole(`radio`).map(e=>e.textContent)).toEqual([`Field Answer`,`Calculation Answer`,`Open questions`,`Not applicable`]),l.click(u(n).getByRole(`radio`,{name:`Field Answer`})),l.change(t.getByRole(`textbox`,{name:/^Name/}),{target:{value:`DueDate`}}),await c(t.getByRole(`radio`,{name:`Field Answer`})).toBeChecked(),await c(t.queryByRole(`textbox`,{name:/^Type/})).not.toBeInTheDocument(),await c(t.getByRole(`status`)).toHaveTextContent(`{"dueDate":{"type":"field","fieldRef":{"name":"DueDate"}}}`)}},m=[`NestedObjectBranches`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const format = canvas.getByRole("radiogroup", {
      name: "Due date format"
    });
    await expect(within(format).getAllByRole("radio").map(option => option.textContent)).toEqual(["Field Answer", "Calculation Answer", "Open questions", "Not applicable"]);
    fireEvent.click(within(format).getByRole("radio", {
      name: "Field Answer"
    }));
    fireEvent.change(canvas.getByRole("textbox", {
      name: /^Name/
    }), {
      target: {
        value: "DueDate"
      }
    });
    await expect(canvas.getByRole("radio", {
      name: "Field Answer"
    })).toBeChecked();
    await expect(canvas.queryByRole("textbox", {
      name: /^Type/
    })).not.toBeInTheDocument();
    await expect(canvas.getByRole("status")).toHaveTextContent('{"dueDate":{"type":"field","fieldRef":{"name":"DueDate"}}}');
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{p as NestedObjectBranches,m as __namedExportsOrder,f as default};