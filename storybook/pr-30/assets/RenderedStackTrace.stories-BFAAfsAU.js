import{S as F,p as J}from"./RenderedStackTrace-DB41a0Q1.js";import"./iframe-arejdGqO.js";import"./preload-helper-D5l2DbWZ.js";import"./code-highlight-DzzumZyi.js";import"./Icon-C86pXtXX.js";import"./utils-BLSKlp9E.js";import"./UiError-eq_G-vIY.js";import"./UiStackFrameDot-LpXj24UA.js";import"./UiChip-CrwhQpxc.js";import"./UiDebugStepOver-B2-YUohg.js";import"./UiMethod-AfeGjUqh.js";const X={title:"Data/Diagnostics/StackTrace",component:F,parameters:{layout:"padded",docs:{description:{component:"Parses and renders a free-form Java stack trace. Pass `resolver` to attach inline source context (±N lines) under each frame. Pass `include`/`exclude` to filter frames by package prefix; `hideRuntimeOnly` mutes JDK/framework frames."}}}},e=`java.lang.NullPointerException: name must not be null
    at com.example.hello.Greeter.greet(Greeter.java:14)
    at com.example.hello.HelloWorld.main(HelloWorld.java:7)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)`,I={"com.example.hello.Greeter":{startLine:10,lines:["public class Greeter {","    private final String prefix;","    public Greeter(String prefix) { this.prefix = prefix; }","","    public String greet(String name) {",'        return prefix + ", " + name.toUpperCase() + "!";',"    }","}"]},"com.example.hello.HelloWorld":{startLine:4,lines:["public class HelloWorld {","    public static void main(String[] args) {",'        Greeter g = new Greeter("Hello");',"        System.out.println(g.greet(null));","    }","}"]}},c=m=>{if(!m.class)return;const u=I[m.class];if(u)return{lines:u.lines,startLine:u.startLine,language:"java"}},M=I["com.example.hello.Greeter"],r={args:{input:e}},a={args:{input:e,resolver:c,contextLines:3}},t={args:{input:e,hideRuntimeOnly:!0,resolver:c}},s={args:{input:e,include:["com.example.hello."],resolver:c}},n={args:{input:e,exclude:["java.","sun.","com.sun."],resolver:c}},o={args:{input:J(e)}},l={args:{input:{exceptionClass:"java.lang.NullPointerException",message:"name must not be null",causedBy:["com.example.ServiceException: request failed"],language:"java",frames:[{functionName:"com.example.hello.Greeter.greet",displayName:"Greeter.greet",class:"com.example.hello.Greeter",method:"greet",kind:"frame",runtime:!1,nativeMethod:!1,file:"Greeter.java",line:14,location:"Greeter.java:14",sourceLines:M.lines,sourceLineNumbers:[10,11,12,13,14,15,16,17],sourceStartLine:10,sourceLanguage:"java"}]}}},i={args:{input:"POST /api/v1/things → 200 in 42ms"}};var p,d,g;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    input: sample
  }
}`,...(g=(d=r.parameters)==null?void 0:d.docs)==null?void 0:g.source}}};var v,x,f;a.parameters={...a.parameters,docs:{...(v=a.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    input: sample,
    resolver: fixtureResolver,
    contextLines: 3
  }
}`,...(f=(x=a.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var S,h,j;t.parameters={...t.parameters,docs:{...(S=t.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    input: sample,
    hideRuntimeOnly: true,
    resolver: fixtureResolver
  }
}`,...(j=(h=t.parameters)==null?void 0:h.docs)==null?void 0:j.source}}};var G,y,P;s.parameters={...s.parameters,docs:{...(G=s.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    input: sample,
    include: ["com.example.hello."],
    resolver: fixtureResolver
  }
}`,...(P=(y=s.parameters)==null?void 0:y.docs)==null?void 0:P.source}}};var k,L,N;n.parameters={...n.parameters,docs:{...(k=n.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    input: sample,
    exclude: ["java.", "sun.", "com.sun."],
    resolver: fixtureResolver
  }
}`,...(N=(L=n.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var R,b,E;o.parameters={...o.parameters,docs:{...(R=o.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    input: parseJavaStackTrace(sample)
  }
}`,...(E=(b=o.parameters)==null?void 0:b.docs)==null?void 0:E.source}}};var T,H,O;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(O=(H=l.parameters)==null?void 0:H.docs)==null?void 0:O.source}}};var W,C,D;i.parameters={...i.parameters,docs:{...(W=i.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    input: "POST /api/v1/things → 200 in 42ms"
  }
}`,...(D=(C=i.parameters)==null?void 0:C.docs)==null?void 0:D.source}}};const Y=["Default","WithSourceResolver","HideRuntimeOnly","IncludeFilter","ExcludeFilter","PreParsedInput","ClickyHtmlPayload","NotAStackTrace"];export{l as ClickyHtmlPayload,r as Default,n as ExcludeFilter,t as HideRuntimeOnly,s as IncludeFilter,i as NotAStackTrace,o as PreParsedInput,a as WithSourceResolver,Y as __namedExportsOrder,X as default};
