import{j as n}from"./iframe-Bfqmb9is.js";import{S as w,p as B}from"./RenderedStackTrace-Cogclpan.js";import"./preload-helper-B2LPdJL4.js";import"./frame-heuristics-D62qKi0n.js";import"./Icon-CIXlnKq1.js";import"./utils-DW-IJACk.js";import"./StackFrameRow-DtDEci4W.js";import"./FrameSourceWindow-Cju4iMWY.js";import"./HighlightedTokens-BZpO2Voi.js";const ee={title:"Data/Diagnostics/StackTrace",component:w,parameters:{layout:"padded",docs:{description:{component:"Parses and renders a free-form Java stack trace. Pass `resolver` to attach inline source context (±N lines) under each frame. Pass `include`/`exclude` to filter frames by package prefix; `hideRuntimeOnly` mutes JDK/framework frames."}}}},e=`java.lang.NullPointerException: name must not be null
    at com.example.hello.Greeter.greet(Greeter.java:14)
    at com.example.hello.HelloWorld.main(HelloWorld.java:7)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)`,q={"com.example.hello.Greeter":{startLine:10,lines:["public class Greeter {","    private final String prefix;","    public Greeter(String prefix) { this.prefix = prefix; }","","    public String greet(String name) {",'        return prefix + ", " + name.toUpperCase() + "!";',"    }","}"]},"com.example.hello.HelloWorld":{startLine:4,lines:["public class HelloWorld {","    public static void main(String[] args) {",'        Greeter g = new Greeter("Hello");',"        System.out.println(g.greet(null));","    }","}"]}},a=t=>{if(!t.class)return;const r=q[t.class];if(r)return{sourceLines:r.lines,sourceStartLine:r.startLine,sourceLanguage:"java"}},_=q["com.example.hello.Greeter"],s={args:{input:e}},o={args:{input:e,resolver:a,contextLines:3}},c={args:{input:e,resolver:a,frameActions:t=>{var r;return(r=t.class)!=null&&r.startsWith("com.example.")?n.jsxs(n.Fragment,{children:[n.jsx("button",{type:"button",className:"rounded border border-border px-1.5 py-px text-[10px] text-muted-foreground hover:bg-accent",children:"Trace"}),n.jsx("button",{type:"button",className:"rounded border border-border px-1.5 py-px text-[10px] text-muted-foreground hover:bg-accent",children:"Decompile"})]}):null}}},l={args:{input:e,hideRuntimeOnly:!0,resolver:a}},i={args:{input:e,include:["com.example.hello."],resolver:a}},u={args:{input:e,exclude:["java.","sun.","com.sun."],resolver:a}},m={args:{input:B(e)}},p={args:{input:{exceptionClass:"java.lang.NullPointerException",message:"name must not be null",causedBy:["com.example.ServiceException: request failed"],language:"java",frames:[{functionName:"com.example.hello.Greeter.greet",displayName:"Greeter.greet",class:"com.example.hello.Greeter",method:"greet",kind:"frame",runtime:!1,nativeMethod:!1,file:"Greeter.java",line:14,location:"Greeter.java:14",sourceLines:_.lines,sourceLineNumbers:[10,11,12,13,14,15,16,17],sourceStartLine:10,sourceLanguage:"java"}]}}},d={args:{input:"POST /api/v1/things → 200 in 42ms"}};var g,x,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    input: sample
  }
}`,...(v=(x=s.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var f,h,b;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    input: sample,
    resolver: fixtureResolver,
    contextLines: 3
  }
}`,...(b=(h=o.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};var S,y,j;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(j=(y=c.parameters)==null?void 0:y.docs)==null?void 0:j.source}}};var G,N,L;l.parameters={...l.parameters,docs:{...(G=l.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    input: sample,
    hideRuntimeOnly: true,
    resolver: fixtureResolver
  }
}`,...(L=(N=l.parameters)==null?void 0:N.docs)==null?void 0:L.source}}};var P,k,R;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    input: sample,
    include: ["com.example.hello."],
    resolver: fixtureResolver
  }
}`,...(R=(k=i.parameters)==null?void 0:k.docs)==null?void 0:R.source}}};var T,E,W;u.parameters={...u.parameters,docs:{...(T=u.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    input: sample,
    exclude: ["java.", "sun.", "com.sun."],
    resolver: fixtureResolver
  }
}`,...(W=(E=u.parameters)==null?void 0:E.docs)==null?void 0:W.source}}};var H,O,A;m.parameters={...m.parameters,docs:{...(H=m.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    input: parseJavaStackTrace(sample)
  }
}`,...(A=(O=m.parameters)==null?void 0:O.docs)==null?void 0:A.source}}};var D,F,C;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(C=(F=p.parameters)==null?void 0:F.docs)==null?void 0:C.source}}};var I,J,M;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    input: "POST /api/v1/things → 200 in 42ms"
  }
}`,...(M=(J=d.parameters)==null?void 0:J.docs)==null?void 0:M.source}}};const re=["Default","WithSourceResolver","WithFrameActions","HideRuntimeOnly","IncludeFilter","ExcludeFilter","PreParsedInput","ClickyHtmlPayload","NotAStackTrace"];export{p as ClickyHtmlPayload,s as Default,u as ExcludeFilter,l as HideRuntimeOnly,i as IncludeFilter,d as NotAStackTrace,m as PreParsedInput,c as WithFrameActions,o as WithSourceResolver,re as __namedExportsOrder,ee as default};
