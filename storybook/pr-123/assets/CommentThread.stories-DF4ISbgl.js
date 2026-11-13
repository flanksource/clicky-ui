import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{Et as n,Q as r,Wt as i,Xt as a,xt as o}from"./LexicalDragon.prod-5Z119fUC.js";import{n as s,t as c}from"./CommentThread-Cvi8jL2B.js";import{i as l,n as u,r as d,t as f}from"./comment-fixtures-B0mTO-FT.js";function p({autoFocusComposer:e=!1}){let{comments:t,callbacks:n}=l(u);return(0,m.jsx)(`div`,{className:`max-w-xl`,children:(0,m.jsx)(c,{comments:t,config:d,autoFocusComposer:e,...n})})}var m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{a(),s(),f(),m=t(),{expect:h,userEvent:g,within:_}=__STORYBOOK_MODULE_TEST__,v={title:`Comments/CommentThread`,component:c,parameters:{layout:`padded`},tags:[`autodocs`]},y={render:()=>(0,m.jsx)(p,{})},b={render:()=>(0,m.jsx)(p,{autoFocusComposer:!0}),tags:[`browser`],play:async({canvasElement:e})=>{let t=await _(e).findByTestId(`comment-compose-input`);await g.click(t);let a=i(t);if(!a)throw Error(`comment-compose-input is not inside a Lexical editor`);a.update(()=>{let e=o(`Looks good @cl`);n().clear().append(r().append(e)),e.selectEnd()},{discrete:!0});let s=await _(document.body).findByRole(`listbox`,{name:`Vocabulary and mentions`});await h(s).toBeInTheDocument();let c=await _(s).findByRole(`option`,{name:/claude/});await g.click(c),await h(t).toHaveTextContent(`@claude`)}},x=[`Default`,`WithMentionAutocomplete`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Demo />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <Demo autoFocusComposer />,
  // The Lexical composer needs a real DOM selection and layout.
  tags: ["browser"],
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByTestId("comment-compose-input");
    await userEvent.click(input);
    // The composer is a Lexical editor, which ignores user-event's synthetic
    // keystrokes, so the draft is typed through the editor's model.
    const editor = getNearestEditorFromDOMNode(input);
    if (!editor) throw new Error("comment-compose-input is not inside a Lexical editor");
    editor.update(() => {
      const text = $createTextNode("Looks good @cl");
      $getRoot().clear().append($createParagraphNode().append(text));
      text.selectEnd();
    }, {
      discrete: true
    });
    // The composer's mention list is portaled to document.body.
    const popover = await within(document.body).findByRole("listbox", {
      name: "Vocabulary and mentions"
    });
    await expect(popover).toBeInTheDocument();
    const option = await within(popover).findByRole("option", {
      name: /claude/
    });
    await userEvent.click(option);
    await expect(input).toHaveTextContent("@claude");
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{y as Default,b as WithMentionAutocomplete,x as __namedExportsOrder,v as default};