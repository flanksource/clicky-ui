import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{c as r,u as i}from"./classes-BeUaZMhY.js";import{n as a,t as o}from"./MethodPicker-CpHZ4ILd.js";function s({initial:e,methods:t}){let[n,r]=(0,c.useState)(e);return(0,l.jsx)(`div`,{className:`w-72`,children:(0,l.jsx)(o,{forClass:f,methods:t,value:n,onChange:r})})}var c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{c=t(),i(),a(),l=n(),{expect:u,within:d}=__STORYBOOK_MODULE_TEST__,f=`com.example.orders.OrderService`,p=r(f,`6d06d69c`).methods,m=[...p,{name:`price`,descriptor:`(Ljava/lang/String;)D`,line:25,endLine:27},{name:`price`,descriptor:`(Ljava/lang/String;ILjava/util/Map;)D`,line:29,endLine:31}],h={title:`JVM/MethodPicker`,component:s,args:{initial:``,methods:p}},g={},_={args:{initial:`checkout(Ljava/lang/String;)D`},play:async({canvasElement:e})=>{await u(d(e).getByRole(`combobox`,{name:`Jump to method`})).toHaveValue(`checkout(Ljava/lang/String;)D`)}},v={args:{initial:`cancel`}},y={args:{methods:m,initial:`price(Ljava/lang/String;ILjava/util/Map;)D`}},b={args:{methods:[]}},x=[`WholeClass`,`Selected`,`BareNameFromLink`,`Overloads`,`NoMethods`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    initial: "checkout(Ljava/lang/String;)D"
  },
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("combobox", {
      name: "Jump to method"
    })).toHaveValue("checkout(Ljava/lang/String;)D");
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    initial: "cancel"
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    methods: OVERLOADS,
    initial: "price(Ljava/lang/String;ILjava/util/Map;)D"
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    methods: []
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{v as BareNameFromLink,b as NoMethods,y as Overloads,_ as Selected,g as WholeClass,x as __namedExportsOrder,h as default};