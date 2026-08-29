/* AGULIBRARY AUTH SAFE ENHANCEMENT
   Drop-in script for the existing auth page.
   It does not replace the existing login/registration logic.
*/
(function(){
  'use strict';
  function db(){try{return typeof getSupabase==='function'?getSupabase():null}catch(e){return null}}
  function ready(){
    const client=db(); if(!client)return;
    // Find the existing password field and place a working forgot-password action beside it.
    const password=document.querySelector('input[type="password"]');
    if(password && !document.getElementById('aguForgotPassword')){
      const box=document.createElement('div');box.style.cssText='margin:8px 0 14px;text-align:right';
      box.innerHTML='<button id="aguForgotPassword" type="button" style="border:0;background:none;color:#087a4b;font-weight:800;cursor:pointer;padding:4px">Forgot password?</button>';
      password.parentElement?.appendChild(box);
      document.getElementById('aguForgotPassword').addEventListener('click',async()=>{
        const email=document.querySelector('input[type="email"]')?.value.trim();
        if(!email){alert('Enter your email address first.');return}
        try{
          const r=await client.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/auth.html?reset=1'});
          if(r.error)throw r.error;
          alert('Password reset instructions have been sent to your email.');
        }catch(e){alert('Unable to send password reset email: '+e.message)}
      });
    }
    // Show/hide password control without interfering with the current form.
    if(password && !password.parentElement.querySelector('.agu-password-toggle')){
      const b=document.createElement('button');b.type='button';b.className='agu-password-toggle';b.textContent='Show password';b.style.cssText='margin-top:7px;border:0;background:none;color:#087a4b;font-weight:800;cursor:pointer';
      password.parentElement.appendChild(b);b.addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';b.textContent=show?'Hide password':'Show password'});
    }
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(ready,150));
})();
