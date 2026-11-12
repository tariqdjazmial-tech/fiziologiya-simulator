/* ===== Правни страници: поверителност и условия (BG/EN). Данните за контакт са в PHYS_CFG. ===== */
window.PHYS_CFG=Object.assign({owner:"Тарик Халид Насър Ал Джазми",email:"",price:"20 €",updated:"12.11.2026"},window.PHYS_CFG||{});
(function(){if(typeof VIEWS==="undefined")return;
const C=window.PHYS_CFG,en=()=>window.PHYS_LANG==="en";
const mail=()=>C.email?`<a href="mailto:${C.email}">${C.email}</a>`:(en()?"[contact e-mail — to be added]":"[имейл за контакт — предстои]");
const page=(main,h,body)=>{main.innerHTML=`<h2>${h}</h2><p class="small">${en()?"Last updated":"Последна промяна"}: ${C.updated}</p><div class="card legal" style="max-width:78ch">${body}</div>`;main.querySelectorAll(".legal").forEach(e=>e.setAttribute("data-noi18n","1"))};
const PRIV_BG=()=>`
<h3>Кой обработва данните</h3><p>Администратор на личните данни е ${C.owner} (физическо лице), автор на приложението „Физиология — симулатор“. Връзка: ${mail()}.</p>
<h3>Какви данни събираме</h3><ul>
<li><b>При регистрация:</b> име, фамилия, имейл, институция, цел на ползване, избран език, парола (пази се само като криптографски хеш).</li>
<li><b>При ползване:</b> кои теми си отворил и завършил, брой решени въпроси, брой дни с активност, вид устройство (напр. iPad, Android), дата на регистрация и на последно влизане.</li>
<li><b>При покупка:</b> плащането се обработва от Stripe. Ние получаваме само потвърждение, сума, дата и имейл — <b>не</b> виждаме и не пазим данни за карта.</li>
<li><b>Код за безплатен достъп:</b> пазим кой код с кой профил е използван.</li></ul>
<h3>За какво ги ползваме</h3><ul><li>За да имаш профил, да пазим напредъка ти и да отключим платения достъп (изпълнение на договора).</li><li>За обобщена статистика колко и как се ползва приложението, за да го подобряваме (легитимен интерес). Не правим профилиране и не продаваме данни.</li><li>За счетоводни и данъчни задължения при покупка (законово задължение).</li></ul>
<h3>Кой друг ги вижда</h3><p>Само доставчици, които ни помагат да работи приложението: Supabase (база данни и вход, сървъри в ЕС — Париж), Netlify (хостинг на сайта), Stripe (плащания), Google (само ако влезеш с Google). Те обработват данните по наше указание и по своите политики за защита на данните.</p>
<h3>Колко дълго</h3><p>Докато имаш профил. Ако го изтриеш или ни поискаш, изтриваме данните до 30 дни. Данните за покупки пазим толкова, колкото изисква счетоводният закон.</p>
<h3>Бисквитки и локално хранилище</h3><p>Не използваме рекламни или проследяващи бисквитки. В браузъра пазим само необходимото: вход в профила, език и напредък.</p>
<h3>Твоите права</h3><p>Имаш право на достъп, поправка, изтриване, ограничаване, преносимост и възражение. Пиши ни на ${mail()}. Можеш да подадеш жалба до Комисията за защита на личните данни (cpdp.bg).</p>
<h3>Деца</h3><p>Приложението е за студенти и преподаватели. Ако си под 16 години, регистрирай се само със съгласие на родител.</p>`;
const PRIV_EN=()=>`
<h3>Who processes the data</h3><p>The data controller is ${C.owner} (a private individual), author of the “Physiology — simulator” app. Contact: ${mail()}.</p>
<h3>What we collect</h3><ul>
<li><b>At registration:</b> first and last name, e-mail, institution, purpose of use, chosen language, password (stored only as a cryptographic hash).</li>
<li><b>While you use the app:</b> which topics you opened and completed, number of questions answered, number of active days, device type (e.g. iPad, Android), date of registration and last visit.</li>
<li><b>When you buy:</b> payments are processed by Stripe. We receive only the confirmation, amount, date and e-mail — we do <b>not</b> see or store card details.</li>
<li><b>Free-access code:</b> we store which code was used by which account.</li></ul>
<h3>Why we use it</h3><ul><li>To give you an account, keep your progress and unlock paid access (performance of the contract).</li><li>For aggregated statistics on how the app is used, so we can improve it (legitimate interest). No profiling, no selling of data.</li><li>For accounting and tax duties when you buy (legal obligation).</li></ul>
<h3>Who else sees it</h3><p>Only providers that run the app for us: Supabase (database and sign-in, EU servers — Paris), Netlify (website hosting), Stripe (payments), Google (only if you sign in with Google). They process data on our instructions and under their own data-protection policies.</p>
<h3>How long</h3><p>For as long as you have an account. If you delete it or ask us, we erase your data within 30 days. Purchase records are kept as long as accounting law requires.</p>
<h3>Cookies and local storage</h3><p>We use no advertising or tracking cookies. The browser keeps only what is needed: sign-in, language and progress.</p>
<h3>Your rights</h3><p>You have the right of access, rectification, erasure, restriction, portability and objection. Write to ${mail()}. You may complain to the Bulgarian Commission for Personal Data Protection (cpdp.bg) or your local authority.</p>
<h3>Children</h3><p>The app is for students and teachers. If you are under 16, register only with a parent's consent.</p>`;
const TERMS_BG=()=>`
<h3>Какво е приложението</h3><p>„Физиология — симулатор“ е неофициално учебно помагало с теория, 3D модели, симулации и тестове. Не е издание на университет или издателство, не замества лекциите и учебника и <b>не е предназначено за клинични решения</b>.</p>
<h3>Профил</h3><p>Отговаряш за паролата си и за верността на данните при регистрация. Един профил е за един човек.</p>
<h3>Безплатна и платена част</h3><p>Раздел I е безплатен. Пълният достъп до разделите II–XII струва <b>${C.price}</b> еднократно — 20 € + ДДС; за България с 20% ДДС това са 24 €, за други държави ДДС се изчислява от Stripe по местната ставка и сумата се вижда преди плащане, без абонамент, за неограничено време, докато приложението се поддържа. Плащането и продажбата се извършват от Stripe като търговец (merchant of record): Stripe издава фактурата, начислява ДДС според държавата ти и отговаря за въпроси по самото плащане. Достъпът се отключва за профила, с който си платил.</p>
<h3>Право на отказ</h3><p>Като потребител в ЕС по принцип имаш 14 дни да се откажеш от покупка. При цифрово съдържание това право отпада, ако <b>изрично се съгласиш</b> достъпът да започне веднага и потвърдиш, че така губиш правото си на отказ. Условията за отказ и съгласието се показват от Stripe при плащането. Ако има технически проблем, който не можем да оправим, ще ти върнем парите.</p>
<h3>Кодове за безплатен достъп</h3><p>Кодовете се дават по преценка на автора, важат за един профил и не могат да се продават. Злоупотребен код може да бъде спрян.</p>
<h3>Авторски права</h3><p>Текстовете, въпросите, графиките и симулациите са авторски. 3D моделите от други автори се ползват по техните лицензи — вж. „За приложението“. Не копирай и не разпространявай съдържанието без разрешение.</p>
<h3>Отговорност</h3><p>Стараем се стойностите да съвпадат с учебниците, но моделите опростяват реалните процеси и може да има грешки. Ако забележиш такава, пиши ни. Не отговаряме за решения, взети само въз основа на приложението.</p>
<h3>Промени и приложимо право</h3><p>Може да променяме условията; за съществени промени ще те уведомим. Прилага се българското право. Връзка: ${mail()}. Онлайн решаване на спорове: ec.europa.eu/consumers/odr.</p>`;
const TERMS_EN=()=>`
<h3>What the app is</h3><p>“Physiology — simulator” is an unofficial study aid with theory, 3D models, simulations and tests. It is not published by a university or publisher, does not replace lectures or the textbook and is <b>not intended for clinical decisions</b>.</p>
<h3>Account</h3><p>You are responsible for your password and for accurate registration details. One account is for one person.</p>
<h3>Free and paid parts</h3><p>Section I is free. Full access to sections II–XII costs <b>${C.price}</b> once — €20 + VAT; with Bulgaria's 20% VAT that is €24, for other countries Stripe adds the local VAT rate and shows the total before you pay, with no subscription, for as long as the app is maintained. Payment and sale are handled by Stripe as merchant of record: Stripe issues the invoice, charges VAT for your country and handles questions about the payment itself. Access is unlocked for the account you paid with.</p>
<h3>Right of withdrawal</h3><p>As an EU consumer you normally have 14 days to withdraw from a purchase. For digital content this right ends if you <b>expressly agree</b> that access starts immediately and acknowledge that you thereby lose the right of withdrawal. The withdrawal terms and consent are shown by Stripe at checkout. If there is a technical problem we cannot fix, we will refund you.</p>
<h3>Free-access codes</h3><p>Codes are given at the author's discretion, are valid for one account and may not be sold. A misused code may be revoked.</p>
<h3>Copyright</h3><p>The texts, questions, graphics and simulations are original works. 3D models by other authors are used under their licences — see “About”. Do not copy or redistribute the content without permission.</p>
<h3>Liability</h3><p>We take care that values match the textbooks, but the models simplify real processes and errors are possible. If you notice one, let us know. We are not liable for decisions based only on the app.</p>
<h3>Changes and governing law</h3><p>We may update these terms and will notify you of significant changes. Bulgarian law applies. Contact: ${mail()}. Online dispute resolution: ec.europa.eu/consumers/odr.</p>`;
VIEWS.privacy=main=>page(main,en()?"Privacy policy":"Поверителност",en()?PRIV_EN():PRIV_BG());
VIEWS.terms=main=>page(main,en()?"Terms of use":"Условия за ползване",en()?TERMS_EN():TERMS_BG());
if(/^#(privacy|terms)$/.test(location.hash)&&typeof route==="function")try{route();if(typeof after==="function")after()}catch(e){}
})();
