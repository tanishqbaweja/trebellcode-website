(function(){
  var root=document.documentElement;
  var btn=document.getElementById('themeToggle');
  function current(){ return root.getAttribute('data-theme')==='light'?'light':'dark'; }
  function updateButton(){
    if(!btn) return;
    var light=current()==='light';
    btn.setAttribute('aria-pressed',String(light));
    btn.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
    btn.setAttribute('title',light?'Switch to dark mode':'Switch to light mode');
  }
  function setTheme(theme,persist){
    root.setAttribute('data-theme',theme);
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',theme==='light'?'#f7f5f1':'#141318');
    if(persist){ try{ localStorage.setItem('trebell-theme',theme); }catch(e){} }
    updateButton();
  }
  if(btn){
    btn.addEventListener('click',function(){ setTheme(current()==='light'?'dark':'light',true); });
  }
  updateButton();
})();