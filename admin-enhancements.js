/* AGULIBRARY SAFE ADMIN ENHANCEMENTS
   Loaded AFTER the existing admin.js.
   Existing upload, invitation and login code is preserved.

   CHANGES:
   - Removed the extra Admin sign-in confirmation gate.
   - Registered students are loaded through the secure
     public.admin_list_students() Supabase function.
   - Existing notification system is preserved.
   - Existing Google Authenticator / 2FA system is preserved.
*/

(function(){
  'use strict';

  let db = null;
  let students = [];
  let securityTimer = null;

  const TWO_FACTOR_WINDOW = 12 * 60 * 60 * 1000;
  const TWO_FACTOR_KEY = 'AGU_ADMIN_TOTP_VERIFIED_AT';

  function getDB(){
    try{
      return typeof getSupabase === 'function'
        ? getSupabase()
        : null;
    }catch(e){
      return null;
    }
  }

  function esc(v){
    return String(v ?? '').replace(
      /[&<>"']/g,
      c => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#039;'
      }[c])
    );
  }

  function adminUser(){
    return db?.auth
      ? db.auth.getUser().then(r => r.data?.user || null)
      : Promise.resolve(null);
  }

  function addStyles(){
    if(document.getElementById('aguAdminEnhancementStyles')) return;

    const style = document.createElement('style');

    style.id = 'aguAdminEnhancementStyles';

    style.textContent = `
      .agu-admin-extra{
        margin-top:28px;
        padding:24px;
        background:#f4faf7;
        border:1px solid #cfe5da;
        border-radius:20px;
      }

      .agu-admin-extra h2{
        margin:4px 0 8px;
        color:#173b2d;
      }

      .agu-admin-extra p{
        color:#71847b;
        line-height:1.6;
      }

      .agu-grid{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:16px;
      }

      .agu-card{
        padding:18px;
        background:#fff;
        border:1px solid #dce8e2;
        border-radius:16px;
      }

      .agu-card strong{
        color:#173b2d;
      }

      .agu-toolbar{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin:14px 0;
      }

      .agu-toolbar input,
      .agu-toolbar select,
      .agu-message-form input,
      .agu-message-form textarea{
        width:100%;
        padding:12px 13px;
        border:1px solid #cfe5da;
        border-radius:10px;
        background:#fff;
      }

      .agu-toolbar .grow{
        flex:1;
        min-width:190px;
      }

      .agu-student{
        padding:14px;
        margin-top:9px;
        border:1px solid #dce8e2;
        border-radius:13px;
        background:#fff;
      }

      .agu-student small{
        color:#71847b;
      }

      .agu-message-form{
        display:grid;
        gap:12px;
      }

      .agu-message-form textarea{
        min-height:120px;
        resize:vertical;
      }

      .agu-message-target{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:12px;
      }

      .agu-security{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:14px;
        flex-wrap:wrap;
      }

      .agu-status{
        font-weight:800;
        color:#087f55;
      }

      .agu-status.warn{
        color:#b42323;
      }

      .agu-totp-box{
        display:none;
        margin-top:15px;
        padding:16px;
        border:1px dashed #b9daca;
        border-radius:14px;
        background:#f8fcfa;
      }

      .agu-totp-box.show{
        display:block;
      }

      .agu-totp-box img{
        max-width:220px;
        background:#fff;
        padding:10px;
        border-radius:10px;
      }

      .agu-code{
        font-family:monospace;
        font-size:18px;
        font-weight:900;
        letter-spacing:2px;
        word-break:break-all;
      }

      @media(max-width:700px){
        .agu-grid,
        .agu-message-target{
          grid-template-columns:1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function mount(){

    const panel = document.getElementById('dashboardPanel');

    if(!panel || document.getElementById('aguAdminTools')){
      return;
    }

    addStyles();

    const wrap = document.createElement('section');

    wrap.id = 'aguAdminTools';
    wrap.className = 'agu-admin-extra';

    wrap.innerHTML = `
      <span class="eyebrow">ADMIN CONTROL CENTER</span>

      <h2>Student & Security Management</h2>

      <p>
        These controls are added without replacing the existing
        AGULIBRARY upload and invitation system.
      </p>

      <div class="agu-grid">

        <!-- ADMINISTRATOR SECURITY -->

        <div class="agu-card">

          <div class="agu-security">

            <div>

              <strong>
                🔐 Administrator verification
              </strong>

              <p id="aguSecurityText">
                Checking administrator security...
              </p>

            </div>

            <button
              id="aguVerify2FA"
              class="btn primary"
              type="button"
            >
              Verify 2FA
            </button>

          </div>

          <div
            id="aguTotpBox"
            class="agu-totp-box"
          >

            <strong id="aguTotpTitle">
              Google Authenticator
            </strong>

            <p id="aguTotpHelp">
              Enter the 6-digit code from your authenticator app.
            </p>

            <div id="aguTotpSetup"></div>

            <input
              id="aguTotpCode"
              inputmode="numeric"
              maxlength="6"
              autocomplete="one-time-code"
              placeholder="6-digit code"
              style="
                width:100%;
                padding:12px;
                border:1px solid #cfe5da;
                border-radius:10px;
                margin-top:10px
              "
            >

            <button
              id="aguTotpSubmit"
              class="btn primary"
              type="button"
              style="margin-top:10px"
            >
              Confirm code
            </button>

          </div>

        </div>

        <!-- REGISTERED STUDENTS -->

        <div class="agu-card">

          <strong>
            👥 Registered students
          </strong>

          <p id="aguStudentCount">
            Loading student list...
          </p>

          <div class="agu-toolbar">

            <input
              id="aguStudentSearch"
              class="grow"
              type="search"
              placeholder="Search students by name or email"
            >

          </div>

          <div id="aguStudentList"></div>

        </div>

      </div>

      <!-- STUDENT NOTIFICATIONS -->

      <div
        class="agu-card"
        style="margin-top:16px"
      >

        <strong>
          📢 Student Notifications
        </strong>

        <p>
          Send a website notification to every student
          or to one specific student.
        </p>

        <form
          id="aguMessageForm"
          class="agu-message-form"
        >

          <input
            id="aguMessageTitle"
            required
            maxlength="160"
            placeholder="Notification title"
          >

          <textarea
            id="aguMessageBody"
            required
            placeholder="Write the message students should see..."
          ></textarea>

          <div class="agu-message-target">

            <select id="aguMessageTarget">

              <option value="all">
                👥 All registered students
              </option>

            </select>

            <button
              class="btn primary"
              type="submit"
            >
              📢 Send Notification
            </button>

          </div>

        </form>

        <div
          id="aguMessageStatus"
          style="margin-top:12px;font-weight:800"
        ></div>

      </div>
    `;

    panel.appendChild(wrap);

    db = getDB();

    bind();

    refreshStudents();

    refreshSecurity();

    setTimeout(
      enforceTwoFactorWindow,
      450
    );
  }

  function bind(){

    document
      .getElementById('aguStudentSearch')
      ?.addEventListener(
        'input',
        renderStudents
      );

    document
      .getElementById('aguMessageForm')
      ?.addEventListener(
        'submit',
        sendMessage
      );

    document
      .getElementById('aguVerify2FA')
      ?.addEventListener(
        'click',
        beginTwoFactor
      );

    document
      .getElementById('aguTotpSubmit')
      ?.addEventListener(
        'click',
        confirmTwoFactor
      );
  }

  /*
   * TWO-FACTOR SECURITY
   */

  function enforceTwoFactorWindow(){

    const dashboard =
      document.getElementById('dashboardPanel');

    if(
      !dashboard ||
      dashboard.classList.contains('hidden') ||
      !db
    ){
      return;
    }

    const last =
      Number(
        localStorage.getItem(
          TWO_FACTOR_KEY
        ) || 0
      );

    if(
      last &&
      Date.now() - last < TWO_FACTOR_WINDOW
    ){
      return;
    }

    if(
      document.getElementById(
        'aguAdmin2faGate'
      )
    ){
      return;
    }

    const gate =
      document.createElement('div');

    gate.id = 'aguAdmin2faGate';

    gate.style.cssText =
      'position:fixed;inset:0;' +
      'background:rgba(8,25,18,.78);' +
      'z-index:5000;' +
      'display:grid;' +
      'place-items:center;' +
      'padding:20px';

    gate.innerHTML = `

      <div
        style="
          width:min(520px,100%);
          background:#fff;
          border-radius:20px;
          padding:25px;
          box-shadow:0 25px 70px rgba(0,0,0,.25)
        "
      >

        <h2
          style="
            margin-top:0;
            color:#173b2d
          "
        >
          🔐 Administrator verification
        </h2>

        <p
          style="
            color:#71847b;
            line-height:1.6
          "
        >
          Your 12-hour Google Authenticator
          verification window has expired.
          Verify your 6-digit code to continue
          using the Admin dashboard.
        </p>

        <button
          id="aguGateVerify"
          class="btn primary"
          type="button"
        >
          Verify Google Authenticator
        </button>

        <p
          id="aguGateStatus"
          style="font-weight:800"
        ></p>

      </div>
    `;

    document.body.appendChild(gate);

    document
      .getElementById('aguGateVerify')
      .addEventListener(
        'click',
        async () => {

          document
            .getElementById('aguTotpBox')
            ?.classList.add('show');

          await beginTwoFactor();

          const old =
            document.getElementById(
              'aguTotpSubmit'
            );

          if(old){

            const clone =
              old.cloneNode(true);

            old.replaceWith(clone);

            clone.addEventListener(
              'click',
              async () => {

                await confirmTwoFactor();

                if(
                  Number(
                    localStorage.getItem(
                      TWO_FACTOR_KEY
                    ) || 0
                  ) > 0
                ){
                  gate.remove();
                }

              }
            );
          }

        }
      );
  }

  /*
   * REGISTERED STUDENTS
   *
   * Uses the secure Supabase RPC:
   *
   * public.admin_list_students()
   *
   * This avoids querying the nonexistent
   * student_profiles.user_id column.
   */

  async function refreshStudents(){

    if(!db){
      return;
    }

    const list =
      document.getElementById(
        'aguStudentList'
      );

    const count =
      document.getElementById(
        'aguStudentCount'
      );

    try{

      const r =
        await db.rpc(
          'admin_list_students'
        );

      if(r.error){
        throw r.error;
      }

      students =
        (r.data || []).map(
          s => ({

            user_id:
              s.id,

            email:
              s.email || '',

            full_name:
              s.full_name || '',

            created_at:
              s.created_at || null,

            phone:
              '',

            first_name:
              '',

            last_name:
              '',

            middle_name:
              ''
          })
        );

      if(count){

        count.textContent =
          students.length +
          ' registered student' +
          (
            students.length === 1
              ? ''
              : 's'
          ) +
          '.';
      }

      const target =
        document.getElementById(
          'aguMessageTarget'
        );

      if(target){

        target.innerHTML =
          '<option value="all">' +
          '👥 All registered students' +
          '</option>' +

          students
            .map(
              s =>
                `<option value="${esc(s.user_id)}">` +
                `${esc(s.full_name || 'Student')} — ` +
                `${esc(s.email || '')}` +
                `</option>`
            )
            .join('');
      }

      renderStudents();

    }catch(e){

      console.warn(
        'Student registry unavailable:',
        e
      );

      if(count){

        count.textContent =
          'Unable to load registered students.';
      }

      if(list){

        list.innerHTML =
          '<p style="' +
          'color:#b42323;' +
          'font-weight:700' +
          '">' +
          'Unable to load the student registry. ' +
          'Please check that the administrator account ' +
          'is authorized.' +
          '</p>';
      }
    }
  }

  /*
   * DISPLAY STUDENTS
   */

  function renderStudents(){

    const list =
      document.getElementById(
        'aguStudentList'
      );

    if(!list){
      return;
    }

    const q =
      (
        document.getElementById(
          'aguStudentSearch'
        )?.value || ''
      )
      .toLowerCase()
      .trim();

    const rows =
      students.filter(
        s =>
          (
            String(
              s.full_name || ''
            ) +
            ' ' +
            String(
              s.email || ''
            )
          )
          .toLowerCase()
          .includes(q)
      );

    list.innerHTML =
      rows.length

        ? rows
            .map(
              s =>
                `
                <div class="agu-student">

                  <strong>
                    ${esc(
                      s.full_name ||
                      (
                        (s.first_name || '') +
                        ' ' +
                        (s.last_name || '')
                      ).trim() ||
                      'Student'
                    )}
                  </strong>

                  <br>

                  <small>

                    ${esc(
                      s.email ||
                      'No email'
                    )}

                    ${
                      s.phone
                        ? `<br>Phone: ${esc(s.phone)}`
                        : ''
                    }

                    <br>

                    Registered:
                    ${
                      s.created_at
                        ? new Date(
                            s.created_at
                          ).toLocaleString()
                        : '—'
                    }

                  </small>

                </div>
                `
            )
            .join('')

        : '<p>No matching students.</p>';
  }

  /*
   * SEND WEBSITE NOTIFICATION
   */

  async function sendMessage(e){

    e.preventDefault();

    if(!db){
      return;
    }

    const status =
      document.getElementById(
        'aguMessageStatus'
      );

    const title =
      document.getElementById(
        'aguMessageTitle'
      )
      .value
      .trim();

    const body =
      document.getElementById(
        'aguMessageBody'
      )
      .value
      .trim();

    const target =
      document.getElementById(
        'aguMessageTarget'
      )
      .value;

    if(!title || !body){
      return;
    }

    status.textContent =
      'Sending notification...';

    status.style.color =
      '#087f55';

    try{

      const user =
        await adminUser();

      if(!user){
        throw new Error(
          'Administrator session is unavailable.'
        );
      }

      const row = {

        title,

        body,

        created_by:
          user.id,

        send_to_all:
          target === 'all',

        recipient_user_id:
          target === 'all'
            ? null
            : target
      };

      const r =
        await db
          .from('admin_messages')
          .insert(row);

      if(r.error){
        throw r.error;
      }

      document
        .getElementById(
          'aguMessageForm'
        )
        .reset();

      status.textContent =
        '✅ Notification sent successfully.';

      status.style.color =
        '#087f55';

    }catch(e){

      status.textContent =
        '❌ ' +
        (
          e.message ||
          'Unable to send notification.'
        ) +
        ' If this is the first setup, check the Supabase system setup.';

      status.style.color =
        '#b42323';
    }
  }

  /*
   * SECURITY STATUS
   */

  async function refreshSecurity(){

    const text =
      document.getElementById(
        'aguSecurityText'
      );

    if(!text || !db){
      return;
    }

    try{

      const aal =
        await db.auth.mfa
          .getAuthenticatorAssuranceLevel();

      const last =
        Number(
          localStorage.getItem(
            TWO_FACTOR_KEY
          ) || 0
        );

      const fresh =
        last &&
        Date.now() - last <
          TWO_FACTOR_WINDOW;

      if(
        aal?.data?.currentLevel ===
          'aal2' &&
        fresh
      ){

        text.innerHTML =
          '<span class="agu-status">' +
          '2FA verified — valid for this ' +
          '12-hour window.' +
          '</span>';

      }else if(fresh){

        text.innerHTML =
          '<span class="agu-status">' +
          '2FA verification recorded for ' +
          'this 12-hour window.' +
          '</span>';

      }else{

        text.innerHTML =
          '<span class="agu-status warn">' +
          '2FA verification required.' +
          '</span>';
      }

    }catch(e){

      text.textContent =
        'Supabase Auth MFA status could not be read.';
    }
  }

  /*
   * GOOGLE AUTHENTICATOR SETUP
   */

  async function beginTwoFactor(){

    if(!db){
      return;
    }

    const box =
      document.getElementById(
        'aguTotpBox'
      );

    const setup =
      document.getElementById(
        'aguTotpSetup'
      );

    const help =
      document.getElementById(
        'aguTotpHelp'
      );

    box.classList.add('show');

    setup.innerHTML = '';

    try{

      const factors =
        await db.auth.mfa
          .listFactors();

      const totp =
        (
          factors.data?.totp || []
        )
        .find(
          f =>
            f.status ===
            'verified'
        );

      if(totp){

        document.getElementById(
          'aguTotpTitle'
        ).textContent =
          'Google Authenticator verification';

        help.textContent =
          'Enter the current 6-digit code from your verified authenticator app.';

        box.dataset.factorId =
          totp.id || '';

        return;
      }

      document.getElementById(
        'aguTotpTitle'
      ).textContent =
        'Set up Google Authenticator';

      help.textContent =
        'Scan the QR code with Google Authenticator, then enter the 6-digit code to finish setup.';

      const r =
        await db.auth.mfa.enroll({
          factorType:'totp',
          friendlyName:'AGULIBRARY Admin'
        });

      if(r.error){
        throw r.error;
      }

      const d =
        r.data;

      setup.innerHTML =
        `${
          d.totp?.qr_code
            ? `
              <img
                src="${esc(d.totp.qr_code)}"
                alt="Authenticator QR code"
              >
            `
            : ''
        }
        <p>
          Secret:
          <span class="agu-code">
            ${esc(d.totp?.secret || '')}
          </span>
        </p>`;

      box.dataset.factorId =
        d.id || '';

    }catch(e){

      help.textContent =
        'Unable to start authenticator setup: ' +
        (
          e.message ||
          'Unknown error'
        );
    }
  }

  /*
   * CONFIRM GOOGLE AUTHENTICATOR
   */

  async function confirmTwoFactor(){

    if(!db){
      return;
    }

    const code =
      document.getElementById(
        'aguTotpCode'
      )
      .value
      .trim();

    if(!/^\d{6}$/.test(code)){

      alert(
        'Enter the 6-digit authenticator code.'
      );

      return;
    }

    const box =
      document.getElementById(
        'aguTotpBox'
      );

    let factorId =
      box.dataset.factorId || '';

    try{

      if(!factorId){

        const factors =
          await db.auth.mfa
            .listFactors();

        const totp =
          (
            factors.data?.totp || []
          )
          .find(
            f =>
              f.status ===
              'verified'
          );

        factorId =
          totp?.id || '';
      }

      if(!factorId){

        throw new Error(
          'No TOTP authenticator is enrolled. Use Set up Google Authenticator first.'
        );
      }

      const r =
        await db.auth.mfa
          .challengeAndVerify({
            factorId,
            code
          });

      if(r.error){
        throw r.error;
      }

      localStorage.setItem(
        TWO_FACTOR_KEY,
        String(Date.now())
      );

      box.classList.remove(
        'show'
      );

      document.getElementById(
        'aguTotpCode'
      ).value = '';

      refreshSecurity();

      const gate =
        document.getElementById(
          'aguAdmin2faGate'
        );

      if(gate){
        gate.remove();
      }

    }catch(e){

      alert(
        '2FA verification failed: ' +
        (
          e.message ||
          'Invalid code'
        )
      );
    }
  }

  /*
   * START
   */

  document.addEventListener(
    'DOMContentLoaded',
    () => {

      setTimeout(
        mount,
        250
      );

      securityTimer =
        setInterval(
          () => {

            const dashboard =
              document.getElementById(
                'dashboardPanel'
              );

            if(
              dashboard &&
              !dashboard.classList.contains(
                'hidden'
              )
            ){

              refreshSecurity();

            }

          },
          60000
        );
    }
  );

})();
