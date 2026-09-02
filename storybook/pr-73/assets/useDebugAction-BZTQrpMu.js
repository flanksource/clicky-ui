import{r as o,a0 as a}from"./iframe-z_87u_i8.js";import{s as n,d as s,r}from"./debugConsoleSignal-B72erEWu.js";function t(){const e=o.useSyncExternalStore(n,s,()=>!1);return o.useMemo(()=>e?{id:"show-query",label:"Debug",icon:a,section:"",onSelect:()=>r({tab:"queries"})}:void 0,[e])}try{t.displayName="useDebugAction",t.__docgenInfo={description:`Puts "Debug" in a result table's overflow menu.

It reveals the console rather than opening a dialog. The dialog it replaces
had to *re-run the query* to say what it ran, so what you inspected was never
the execution you were looking at — and it closed the moment you changed a
filter, which is precisely when you wanted to compare two runs. The console
already holds the record for the run that happened.

The action is absent when no console is mounted. A menu item that silently
does nothing reads as broken; an absent one reads as a feature this app does
not have, which is the truth.`,displayName:"useDebugAction",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/data/useDebugAction.tsx",methods:[],props:{},tags:{}}}catch{}export{t as u};
