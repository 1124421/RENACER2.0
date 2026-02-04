// Navegación simple entre pasos simulando backend
(function(){
  function go(url){ window.location.href = url; }

  // Paso 1: enviar correo
  const emailForm = document.getElementById('reset-email-form');
  if(emailForm){
    emailForm.addEventListener('submit', function(e){
      e.preventDefault();
      // Aquí llamarías a tu backend para enviar el código
      go('cambio-contrasena-2.html');
    });
  }

  // Paso 2: verificación de código
  const codeForm = document.getElementById('reset-code-form');
  if(codeForm){
    const inputs = Array.from(codeForm.querySelectorAll('.reset__code-inputs input'));
    inputs.forEach((inp, idx)=>{
      inp.addEventListener('input', function(){
        this.value = this.value.replace(/\D/g,'').slice(0,1);
        if(this.value && idx < inputs.length-1){ inputs[idx+1].focus(); }
      });
      inp.addEventListener('keydown', function(ev){
        if(ev.key === 'Backspace' && !this.value && idx>0){ inputs[idx-1].focus(); }
      });
    });

    codeForm.addEventListener('submit', function(e){
      e.preventDefault();
      const code = inputs.map(i=>i.value).join('');
      if(code.length !== inputs.length){
        alert('Completa el código.');
        return;
      }
      // Aquí validarías el código con tu backend
      go('cambio-contrasena-3.html');
    });
  }

  // Paso 3: nueva contraseña
  const newpassForm = document.getElementById('reset-newpass-form');
  if(newpassForm){
    newpassForm.addEventListener('submit', function(e){
      e.preventDefault();
      const p1 = document.getElementById('newpass').value;
      const p2 = document.getElementById('newpass2').value;
      if(p1.length < 6){ alert('La contraseña debe tener al menos 6 caracteres.'); return; }
      if(p1 !== p2){ alert('Las contraseñas no coinciden.'); return; }
      // Aquí llamarías a tu backend para guardar la nueva contraseña
      alert('Contraseña cambiada correctamente.');
      go('index.html');
    });
  }
})();
