import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./JsonSchemaForm-Dk_oRcVG.js";function a({className:e=`max-w-3xl`}){let[t,n]=(0,o.useState)({fieldRef:{kind:`policy`}});return(0,s.jsxs)(`div`,{className:e,children:[(0,s.jsx)(i,{schema:d,value:t,onChange:n,persistPreferences:!1}),(0,s.jsx)(`output`,{className:`mt-4 block font-mono text-xs`,children:JSON.stringify(t)})]})}var o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{o=t(),r(),s=n(),{expect:c,fireEvent:l,within:u}=__STORYBOOK_MODULE_TEST__,d={properties:{fieldRef:{title:`Field reference`,description:`Identity of a stored field.`,type:`object`,"x-object-display":`row`,"x-order":[`kind`,`name`,`binding`],required:[`kind`,`name`],properties:{kind:{title:`Kind`,"x-enum-display":`combobox`,"x-enum-labels":{plan:`Plan`,policy:`Policy`,client:`Client`},enum:[`plan`,`policy`,`client`]},name:{title:`Name`,type:`string`,examples:[`StartDate`]},binding:{title:`Binding`,type:`string`,examples:[`item`]}}}}},f={title:`JsonSchemaForm/Object row`,component:a},p={play:async({canvasElement:e})=>{let t=u(e);l.change(t.getByRole(`textbox`,{name:/^Name/}),{target:{value:`StartDate`}}),await c(t.getByRole(`status`)).toHaveTextContent(`{"fieldRef":{"kind":"policy","name":"StartDate"}}`)}},m={tags:[`browser`],args:{className:`w-[22rem]`},play:async({canvasElement:e})=>{let t=Array.from(e.querySelectorAll(`[data-jsf-row-cell]`));await c(t).toHaveLength(3);let n=new Set(t.map(e=>Math.round(e.getBoundingClientRect().top)));await c(n.size).toBe(1)}},h=[`ReferenceRow`,`NarrowColumn`],p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    fireEvent.change(canvas.getByRole("textbox", {
      name: /^Name/
    }), {
      target: {
        value: "StartDate"
      }
    });
    await expect(canvas.getByRole("status")).toHaveTextContent('{"fieldRef":{"kind":"policy","name":"StartDate"}}');
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  tags: ["browser"],
  args: {
    className: "w-[22rem]"
  },
  play: async ({
    canvasElement
  }) => {
    const cells = Array.from(canvasElement.querySelectorAll("[data-jsf-row-cell]"));
    await expect(cells).toHaveLength(3);
    const tops = new Set(cells.map(cell => Math.round(cell.getBoundingClientRect().top)));
    await expect(tops.size).toBe(1);
  }
}`,...m.parameters?.docs?.source}}}})))()}g();export{m as NarrowColumn,p as ReferenceRow,h as __namedExportsOrder,f as default};