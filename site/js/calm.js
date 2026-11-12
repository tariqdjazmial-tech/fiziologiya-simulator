/* Спокоен, „учебников“ вид: по-малко декорация, по-малко цветни плочки, повече типография. */
(function(){const css=`
:root{--r:8px;--r2:6px}
/* начална страница */
.intro{padding:6px 0 4px;margin:0 0 18px;border-bottom:1px solid var(--line)}
.intro h1{font:600 clamp(40px,5.6vw,60px)/1.02 var(--serif,Georgia,serif);letter-spacing:-.02em;margin:0 0 10px}
.intro p{margin:0 0 18px;max-width:58ch;color:var(--muted);font-size:16.5px;line-height:1.55}
.cont2{display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;padding:16px 18px;margin:0 0 28px;border:1px solid var(--line);border-left:3px solid var(--sec);border-radius:8px;background:var(--panel);color:var(--ink);text-decoration:none}
.cont2:hover{border-color:color-mix(in srgb,var(--sec) 45%,var(--line));border-left-color:var(--sec)}
.cont2 .cn{font:600 22px/1 var(--serif,Georgia,serif);color:var(--sec);min-width:34px}
.cont2 small{display:block;font-size:13px;color:var(--muted);margin-bottom:2px}
.cont2 b{display:block;font:600 19px/1.25 var(--serif,Georgia,serif)}
.cont2 em{display:block;font-style:normal;font-size:13px;color:var(--muted);margin-top:4px}
.cont2 .cg{background:var(--ink);color:var(--panel);border-radius:6px;padding:10px 16px;font-weight:650;font-size:14.5px;white-space:nowrap}
@media (max-width:600px){.cont2{grid-template-columns:auto 1fr;padding:14px}.cont2 .cg{grid-column:1/-1;text-align:center}}
.hsec h3{font:600 22px/1.2 var(--serif,Georgia,serif)}
.homefoot{display:flex;flex-wrap:wrap;gap:6px 20px}
/* раздели: без цветни плочки, номерът е просто римска цифра */
.nsh .n,.ns .nsh .n{background:none!important;color:var(--sec)!important;font:600 15px/1 var(--serif,Georgia,serif)!important;border-radius:0!important;height:auto!important;justify-content:start}
.nsh{border-radius:6px}
.ns.open{background:none}
.sec{border-radius:8px!important;box-shadow:none!important;border-top-width:1px!important;border-top-color:var(--line)!important}
.sec .n{background:none!important;border-radius:0!important;height:auto!important;min-width:30px!important;padding:0!important;font:600 22px/1 var(--serif,Georgia,serif)!important;color:var(--sec)!important}
.sec h4{font-family:var(--serif,Georgia,serif);font-size:17px}
.sec li a{border-radius:6px}
/* долу в менюто: обикновена връзка вместо тъмно хапче */
.navfoot .pm{background:none!important;color:var(--ink)!important;border:1px solid var(--line);border-radius:6px!important}
.navfoot .pm small{opacity:1;color:var(--muted)}
/* покупка */
.pw-card .ecg{display:none}
.pw-card{border-radius:10px;box-shadow:none;padding-top:20px}
.pw-k{color:var(--ink);font:600 18px/1.3 var(--serif,Georgia,serif);margin-bottom:8px}
.buy-cta{border-radius:7px}
.buy-cta b{border-radius:5px}
.fa-hero{background:var(--panel);border-radius:10px}
.fa-num div{border-left:1px solid var(--line)}
.fa-map li{border-radius:6px;border-left-width:3px}
.fa-map li.free{background:var(--panel)}
.pw-shot{border-radius:8px}
.pw-shot::after{display:none}
.pw-shot figcaption{position:static;background:none;color:var(--muted);padding:10px 12px;border-top:1px solid var(--line);border-radius:0;backdrop-filter:none;font-size:13.5px}
.fa-gal a{border-radius:8px;background:var(--panel)}
.fa-gal span{position:static;display:block;background:none;color:var(--ink);padding:8px 10px;border-top:1px solid var(--line);border-radius:0;font-size:13.5px}
.fa-gal a:hover img{transform:none}
.pw-free{border-style:solid;border-radius:8px}
.fa-ok{border-radius:10px}
.pw-sec b{border:0;padding:0;min-width:0;font-size:17px}
@media (prefers-color-scheme:dark){
 .nsh .n,.ns .nsh .n,.sec .n{color:color-mix(in srgb,var(--sec) 55%,#fff)!important}
 .cont2 .cn,.pw-sec b,.fa-map li b{color:color-mix(in srgb,var(--sec,var(--c)) 55%,#fff)}
 .fa-map li b,.pw-sec b{color:color-mix(in srgb,var(--c) 55%,#fff)}
 .cont2{border-left-color:color-mix(in srgb,var(--sec) 70%,#fff)}
}
`;const st=document.createElement("style");st.id="calm-css";st.textContent=css;document.head.appendChild(st)})();
