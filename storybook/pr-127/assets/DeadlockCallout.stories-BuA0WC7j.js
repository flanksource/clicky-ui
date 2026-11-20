import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{r as t,t as n}from"./threads-ccOpv6A7.js";import{n as r,t as i}from"./DeadlockCallout-BU7Thxdm.js";var a,o,s,c,l,u,d,f;function p(){return(p=e((()=>{t(),r(),{expect:a,fn:o,userEvent:s,within:c}=__STORYBOOK_MODULE_TEST__,l={title:`JVM/DeadlockCallout`,component:i,args:{deadlocked:[22,23],threads:n,onSelect:o()}},u={play:async({canvasElement:e,args:t})=>{let n=c(e);await a(n.getByRole(`alert`)).toHaveTextContent(`2 threads are each waiting`),await s.click(n.getByRole(`button`,{name:`http-nio-8080-exec-2`})),await a(t.onSelect).toHaveBeenCalledWith(22)}},d={args:{deadlocked:[22,99]}},f=[`TwoThreads`,`ThreadMissingFromSnapshot`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement,
    args
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("alert")).toHaveTextContent("2 threads are each waiting");
    await userEvent.click(canvas.getByRole("button", {
      name: "http-nio-8080-exec-2"
    }));
    await expect(args.onSelect).toHaveBeenCalledWith(22);
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    deadlocked: [22, 99]
  }
}`,...d.parameters?.docs?.source}}}})))()}p();export{d as ThreadMissingFromSnapshot,u as TwoThreads,f as __namedExportsOrder,l as default};