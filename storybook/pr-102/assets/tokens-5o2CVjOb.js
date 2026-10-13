function r(t){return t?t>=1e6?`${(t/1e6).toFixed(1)}M`:t>=1e3?`${Math.round(t/1e3)}k`:String(t):""}function n(t){return t<.01?`$${t.toFixed(4)}`:`$${t.toFixed(2)}`}export{r as c,n as f};
