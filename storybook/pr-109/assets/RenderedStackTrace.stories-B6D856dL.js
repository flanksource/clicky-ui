import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{i as n,n as r,r as i,t as a}from"./RenderedStackTrace-Ci9QzCPL.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;function S(){return(S=e((()=>{r(),i(),o=t(),s={title:`Data/Diagnostics/StackTrace`,component:a,parameters:{layout:`padded`,docs:{description:{component:"Parses and renders a free-form Java stack trace. Pass `resolver` to attach inline source context (±N lines) under each frame. Pass `include`/`exclude` to filter frames by package prefix; `hideRuntimeOnly` mutes JDK/framework frames."}}}},c=`java.lang.NullPointerException: name must not be null
    at com.example.hello.Greeter.greet(Greeter.java:14)
    at com.example.hello.HelloWorld.main(HelloWorld.java:7)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)`,l={"com.example.hello.Greeter":{startLine:10,lines:[`public class Greeter {`,`    private final String prefix;`,`    public Greeter(String prefix) { this.prefix = prefix; }`,``,`    public String greet(String name) {`,`        return prefix + ", " + name.toUpperCase() + "!";`,`    }`,`}`]},"com.example.hello.HelloWorld":{startLine:4,lines:[`public class HelloWorld {`,`    public static void main(String[] args) {`,`        Greeter g = new Greeter("Hello");`,`        System.out.println(g.greet(null));`,`    }`,`}`]}},u=e=>{if(!e.class)return;let t=l[e.class];if(t)return{sourceLines:t.lines,sourceStartLine:t.startLine,sourceLanguage:`java`}},d=l[`com.example.hello.Greeter`],f={args:{input:c}},p={args:{input:c,resolver:u,contextLines:3}},m={args:{input:c,resolver:u,frameActions:e=>e.class?.startsWith(`com.example.`)?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(`button`,{type:`button`,className:`rounded border border-border px-1.5 py-px text-[10px] text-muted-foreground hover:bg-accent`,children:`Trace`}),(0,o.jsx)(`button`,{type:`button`,className:`rounded border border-border px-1.5 py-px text-[10px] text-muted-foreground hover:bg-accent`,children:`Decompile`})]}):null}},h={args:{input:c,hideRuntimeOnly:!0,resolver:u}},g={args:{input:c,include:[`com.example.hello.`],resolver:u}},_={args:{input:c,exclude:[`java.`,`sun.`,`com.sun.`],resolver:u}},v={args:{input:n(c)}},y={args:{input:{exceptionClass:`java.lang.NullPointerException`,message:`name must not be null`,causedBy:[`com.example.ServiceException: request failed`],language:`java`,frames:[{functionName:`com.example.hello.Greeter.greet`,displayName:`Greeter.greet`,class:`com.example.hello.Greeter`,method:`greet`,kind:`frame`,runtime:!1,nativeMethod:!1,file:`Greeter.java`,line:14,location:`Greeter.java:14`,sourceLines:d.lines,sourceLineNumbers:[10,11,12,13,14,15,16,17],sourceStartLine:10,sourceLanguage:`java`}]}}},b={args:{input:`POST /api/v1/things → 200 in 42ms`}},x=[`Default`,`WithSourceResolver`,`WithFrameActions`,`HideRuntimeOnly`,`IncludeFilter`,`ExcludeFilter`,`PreParsedInput`,`ClickyHtmlPayload`,`NotAStackTrace`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    input: sample
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    input: sample,
    resolver: fixtureResolver,
    contextLines: 3
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    input: sample,
    resolver: fixtureResolver,
    frameActions: frame => frame.class?.startsWith("com.example.") ? <>
          <button type="button" className="rounded border border-border px-1.5 py-px text-[10px] text-muted-foreground hover:bg-accent">
            Trace
          </button>
          <button type="button" className="rounded border border-border px-1.5 py-px text-[10px] text-muted-foreground hover:bg-accent">
            Decompile
          </button>
        </> : null
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    input: sample,
    hideRuntimeOnly: true,
    resolver: fixtureResolver
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    input: sample,
    include: ["com.example.hello."],
    resolver: fixtureResolver
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    input: sample,
    exclude: ["java.", "sun.", "com.sun."],
    resolver: fixtureResolver
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    input: parseJavaStackTrace(sample)
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    input: {
      exceptionClass: "java.lang.NullPointerException",
      message: "name must not be null",
      causedBy: ["com.example.ServiceException: request failed"],
      language: "java",
      frames: [{
        functionName: "com.example.hello.Greeter.greet",
        displayName: "Greeter.greet",
        class: "com.example.hello.Greeter",
        method: "greet",
        kind: "frame",
        runtime: false,
        nativeMethod: false,
        file: "Greeter.java",
        line: 14,
        location: "Greeter.java:14",
        sourceLines: greeterSource.lines,
        sourceLineNumbers: [10, 11, 12, 13, 14, 15, 16, 17],
        sourceStartLine: 10,
        sourceLanguage: "java"
      }]
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    input: "POST /api/v1/things → 200 in 42ms"
  }
}`,...b.parameters?.docs?.source}}}})))()}S();export{y as ClickyHtmlPayload,f as Default,_ as ExcludeFilter,h as HideRuntimeOnly,g as IncludeFilter,b as NotAStackTrace,v as PreParsedInput,m as WithFrameActions,p as WithSourceResolver,x as __namedExportsOrder,s as default};