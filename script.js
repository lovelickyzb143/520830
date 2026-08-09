(function(){
  const $ = (id) => document.getElementById(id);
  const frame = $('frame');

  /* LOCKSCREEN PHOTO */
  const LOCKSCREEN_IMAGE_SRC = 'assets/gyubrik_lotte.jpg';

  /* 520 REVEAL PHOTO */
  const REVEAL_IMAGE_SRC = 'assets/gyubrik_kiss.jpg';
  let uploadedImg = REVEAL_IMAGE_SRC || null;

  /* SECOND REVEAL PHOTO */
  const REVEAL2_IMAGE_SRC = 'assets/gyubrikhehe.jpg';

  /* RICKY CAMERA PHOTO */
  const RICKY_VIDEO_SRC = 'assets/ricky_cam.mp4';

  /* Audio Playlist */
  const BG_TRACKS = [
    'assets/music/lovepocalypse.mp3', 
    'assets/music/roses.mp3', 
    'assets/music/lovesickgame.mp3', 
    'assets/music/eternity.mp3', 
    'assets/music/forever.mp3' 
  ].filter(Boolean);

  /* Spotify playlist*/
  const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/6vfZIRqI0Nm1dBTx9R7uLB?si=JO7js4SVTHa8AJJYvBEFSg';


  /* Mesuem Pictures */
  const museumPhotos = [
    { src: 'assets/museum1.png', caption: "5201314", date: '20260520.', note: "520 I love you ♡", tally: '||||  ||||  |' },
    { src: 'assets/museum2.png', caption: "my wife", date: '20260530.', note: "let's get married, rwik ♡", tally: '||||  |||' },
    { src: 'assets/museum3.png', caption: "always you", date: '20260607.', note: "always and forever ♡", tally: '||||  ||' },
    { src: 'assets/museum4.png', caption: "just one, please", date: '20260624.', note: "let me kiss you ♡", tally: '||||  |' },
    { src: 'assets/museum5.jpg', caption: "엔더블네 강아지 고양이", date: '20260706.', note: "puppy kitty ♡", tally: '||||' },
    { src: 'assets/museum6.png', caption: "I love RIKI", date: '20260709.', note: "what a coincidence, rwik ♡", tally: '|||' },
    { src: 'assets/museum7.png', caption: "we're the perfect match", date: '20260710.', note: "you're looking at me, aren't you? ♡", tally: '||||  ||||  ||' },
    { src: 'assets/museum8.png', caption: 'wo de xiao mao.', date: '20260731.', note: 'my very adorable, precious kitty ♡', tally: '||||  ||||' }
  ];

  function goTo(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    $(id).classList.add('active');
    $('exitBtn').style.display = (id === 'sayback') ? 'flex' : 'none';
  }

  function tick(){
    const d = new Date();

    // Real time
    let h = d.getHours() % 12;
    if(h === 0) h = 12;

    const m = String(d.getMinutes()).padStart(2,'0');
    $('clock').textContent = h + ':' + m;

    // Real date
    $('date').textContent = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }).toUpperCase();
  }

  tick();
  setInterval(tick, 15000);

  /* cursor glow */
  let gx=180, gy=380, tx=180, ty=380;
  frame.addEventListener('mousemove', (e)=>{
    const r = frame.getBoundingClientRect();
    tx = e.clientX - r.left; ty = e.clientY - r.top;
    $('cursorGlow').style.opacity = '.9';
  });
  frame.addEventListener('mouseleave', ()=>{ $('cursorGlow').style.opacity = '0'; });
  frame.addEventListener('touchmove', (e)=>{
    const r = frame.getBoundingClientRect(); const t = e.touches[0];
    tx = t.clientX - r.left; ty = t.clientY - r.top;
    $('cursorGlow').style.opacity = '.9';
  }, {passive:true});
  function glowLoop(){
    gx += (tx-gx)*0.12; gy += (ty-gy)*0.12;
    $('cursorGlow').style.transform = 'translate('+gx+'px,'+gy+'px) translate(-50%,-50%)';
    requestAnimationFrame(glowLoop);
  }
  glowLoop();

  /* BACKGROUND MUSIC*/
  (function(){
    const audio = $('bgAudio');
    const widget = $('musicWidget');
    const toggle = $('musicToggle');
    const label = $('musicLabel');
    const spotifyLink = $('spotifyLink');

    if(SPOTIFY_PLAYLIST_URL){ spotifyLink.href = SPOTIFY_PLAYLIST_URL; }
    else { spotifyLink.style.display = 'none'; }

    if(BG_TRACKS.length === 0){
      toggle.style.display = 'none';
      label.textContent = SPOTIFY_PLAYLIST_URL ? 'play on spotify' : '';
      if(!SPOTIFY_PLAYLIST_URL) widget.style.display = 'none';
      return;
    }

    audio.volume = 0.5;
    let trackIndex = 0;
    let started = false;
    let muted = false;

    function loadTrack(i){
      audio.src = BG_TRACKS[i % BG_TRACKS.length];
    }
    function playCurrent(){
      loadTrack(trackIndex);
      audio.play().catch(()=>{
       });
    }
    audio.addEventListener('ended', ()=>{
      trackIndex = (trackIndex + 1) % BG_TRACKS.length;
      playCurrent();
    });

    function startMusic(){
      if(started) return;
      started = true;
      playCurrent();
      toggle.classList.add('playing');
      label.textContent = 'now playing';
    }

    function firstInteraction(){
      startMusic();
      document.removeEventListener('click', firstInteraction);
      document.removeEventListener('touchstart', firstInteraction);
    }
    document.addEventListener('click', firstInteraction, {once:true});
    document.addEventListener('touchstart', firstInteraction, {once:true, passive:true});

    toggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(!started){ startMusic(); return; }
      muted = !muted;
      audio.muted = muted;
      toggle.classList.toggle('playing', !muted);
      label.textContent = muted ? 'tap to unmute' : 'now playing';
    });
  })();


  /* Lockscreen Background */
  if(LOCKSCREEN_IMAGE_SRC){
    $('lock').style.backgroundImage = "url('" + LOCKSCREEN_IMAGE_SRC + "')";
}

  $('swipeUp').addEventListener('click', ()=>{ goTo('pin'); resetPin(); });

  /* Swipe Up */
  (function(){
    const lockScreen = $('lock');
    let startY = null, startX = null, tracking = false;
    const SWIPE_THRESHOLD = 60; // px of upward movement to count as a swipe

    function onStart(x, y){ startX = x; startY = y; tracking = true; }
    function onMove(x, y){
      if(!tracking) return;
      const dy = startY - y, dx = Math.abs(x - startX);
      if(dy > SWIPE_THRESHOLD && dy > dx){
        tracking = false;
        goTo('pin'); resetPin();
      }
    }
    function onEnd(){ tracking = false; }

    lockScreen.addEventListener('touchstart', (e)=>{
      const t = e.touches[0]; onStart(t.clientX, t.clientY);
    }, {passive:true});
    lockScreen.addEventListener('touchmove', (e)=>{
      const t = e.touches[0]; onMove(t.clientX, t.clientY);
    }, {passive:true});
    lockScreen.addEventListener('touchend', onEnd);

    
    lockScreen.addEventListener('mousedown', (e)=>{ onStart(e.clientX, e.clientY); });
    lockScreen.addEventListener('mousemove', (e)=>{ onMove(e.clientX, e.clientY); });
    lockScreen.addEventListener('mouseup', onEnd);
    lockScreen.addEventListener('mouseleave', onEnd);
  })();

  /* CAMERA POV (Decorative. No real camera access) */
  const camVF = $('camViewfinder');
  const video = $('camPhoto');
  const camThumb = $('camThumb');

  if (RICKY_VIDEO_SRC) {

    video.src = RICKY_VIDEO_SRC;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    video.load();
    video.play().catch(() => {});

  } else {
    camVF.classList.add('empty');
  }

  $('lockCam').addEventListener('click', () => {
    goTo('camview');

    video.play().catch(() => {});
  });

  $('camClose').addEventListener('click', () => goTo('lock'));

  const camLines = [
    "아이구 예쁘다~!!",
    "So adorable!",
    "Smile more, Rwik.",
    "Beautiful."
  ];

  let camShots = 0;

  $('camShutter').addEventListener('click', () => {

    /*capture current video frame*/
    if (video.readyState >= 2 && camThumb) {

      const canvas = document.createElement('canvas');

      canvas.width = video.videoWidth || 280;
      canvas.height = video.videoHeight || 500;

      const ctx = canvas.getContext('2d');

      ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const capturedPhoto = document.createElement('img');

      capturedPhoto.src = canvas.toDataURL('image/jpeg', 0.9);
      capturedPhoto.alt = 'captured';

      camThumb.innerHTML = '';
      camThumb.appendChild(capturedPhoto);
    }

    /* Camera Flash */
    camVF.classList.add('flash');

    setTimeout(() => {
      camVF.classList.remove('flash');
    }, 220);

    /* Change Caption */
    $('camCaption').textContent =
      camLines[camShots % camLines.length];

    camShots++;

  });

  /* PIN */
  const REAL_PIN = '520830';
  let pinVal = '';
  const pinTaunts = ["Wrong. Try again.","It's our number. Think.","Mm, not quite. I'll wait.","You're close. I can feel it."];
  let taunt = 0;
  function renderDots(){
    const row = $('dotsRow'); row.innerHTML = '';
    for(let i=0;i<6;i++){ const d=document.createElement('div'); d.className='pdot'+(i<pinVal.length?' filled':''); row.appendChild(d); }
  }
  function resetPin(){ pinVal=''; renderDots(); $('pinTitle').textContent='Enter the password.'; }
  $('pad').addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const k = btn.dataset.k;
    if(k === 'back'){ pinVal = pinVal.slice(0,-1); renderDots(); return; }
    if(pinVal.length >= 6) return;
    pinVal += k; renderDots();
    if(pinVal.length === 6){
      setTimeout(()=>{
        if(pinVal === REAL_PIN){ goTo('reveal'); runReveal(); }
        else {
          $('pinTitle').textContent = pinTaunts[taunt % pinTaunts.length]; taunt++;
          frame.classList.add('shake'); setTimeout(()=>frame.classList.remove('shake'), 400);
          pinVal=''; renderDots();
        }
      }, 220);
    }
  });

  /* REVEAL*/
  function heartPositions(n){
    const pts = [];
    for(let i=0;i<n;i++){
      const t = i * (2*Math.PI/n);
      const x = 16*Math.pow(Math.sin(t),3);
      const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
      pts.push({x:(130 + x*8)*1.92, y:(150 - y*8)*1.92, brightness: 40 + 60*Math.abs(Math.sin(i*0.3))});
    }
    return pts;
  }
  function runReveal(){
    const canvas = $('revealCanvas'); const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,500,500); ctx.fillStyle = '#000'; ctx.fillRect(0,0,500,500);
    $('revealCaption').style.opacity = '0';

    // matches: pixels[x,y] < 120 sampled every 8px on a 500x500 grayscale image
    const RES = 500, STEP = 8, THRESHOLD = 120, SPEED = 10, TICK_MS = 20;

    function animatePositions(positions){
      let i = 0;
      ctx.font = 'bold 7px Arial, sans-serif';
      ctx.textAlign = 'center';
      (function step(){
        for(let k=0; k<SPEED && i<positions.length; k++, i++){
          const p = positions[i];
          const red = 255 - Math.round(p.brightness);
          ctx.fillStyle = 'rgb('+red+',0,0)';         
          ctx.fillText('520', p.x, p.y);
        }
        if(i < positions.length) setTimeout(step, TICK_MS);
        else { $('revealCaption').style.opacity = '1'; setTimeout(()=>{ goTo('ask'); startAsk(); }, 2500); }
      })();
    }

    function fromImage(img){
      const off = document.createElement('canvas'); off.width = RES; off.height = RES;
      const octx = off.getContext('2d');
      octx.drawImage(img, 0, 0, RES, RES);
      const data = octx.getImageData(0, 0, RES, RES).data;
      const positions = [];
      for(let y=0; y<RES; y+=STEP){
        for(let x=0; x<RES; x+=STEP){
          const idx = (y*RES + x) * 4;
          const brightness = 0.299*data[idx] + 0.587*data[idx+1] + 0.114*data[idx+2];
          if(brightness < THRESHOLD) positions.push({x, y, brightness});
        }
      }
      animatePositions(positions);
    }

    if(uploadedImg){
      const img = new Image();
      img.onload = ()=> fromImage(img);
      img.onerror = ()=> animatePositions(heartPositions(300));
      img.src = uploadedImg;
    } else {
      animatePositions(heartPositions(300));
    }
  }

  /* REVEAL 2*/
  function circlePositions(size, radius, step){
    const cx = size/2, cy = size/2;
    const pts = [];
    for(let y=0; y<size; y+=step){
      for(let x=0; x<size; x+=step){
        const dx = x-cx, dy = y-cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist <= radius){
          const brightness = (dist/radius) * 115;
          pts.push({x, y, brightness});
        }
      }
    }
    return pts;
  }
  function runReveal2(){
    const canvas = $('revealCanvas2'); const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,500,500); ctx.fillStyle = '#000'; ctx.fillRect(0,0,500,500);
    $('revealCaption2').style.opacity = '0';

    const RES = 500, STEP = 8, THRESHOLD = 120, SPEED = 10, TICK_MS = 20;

    function animatePositions(positions){
      let i = 0;
      ctx.font = 'bold 7px Arial, sans-serif';
      ctx.textAlign = 'center';
      (function step(){
        for(let k=0; k<SPEED && i<positions.length; k++, i++){
          const p = positions[i];
          const red = 255 - Math.round(p.brightness);
          ctx.fillStyle = 'rgb('+red+',0,0)';
          ctx.fillText('520', p.x, p.y);
        }
        if(i < positions.length) setTimeout(step, TICK_MS);
        else { $('revealCaption2').style.opacity = '1'; setTimeout(()=>{ goTo('ending2'); startEnding2(); }, 1400); }
      })();
    }

    function fromImage(img){
      const off = document.createElement('canvas'); off.width = RES; off.height = RES;
      const octx = off.getContext('2d');
      octx.drawImage(img, 0, 0, RES, RES);
      const data = octx.getImageData(0, 0, RES, RES).data;
      const positions = [];
      for(let y=0; y<RES; y+=STEP){
        for(let x=0; x<RES; x+=STEP){
          const idx = (y*RES + x) * 4;
          const brightness = 0.299*data[idx] + 0.587*data[idx+1] + 0.114*data[idx+2];
          if(brightness < THRESHOLD) positions.push({x, y, brightness});
        }
      }
      animatePositions(positions);
    }

    if(REVEAL2_IMAGE_SRC){
      const img = new Image();
      img.onload = ()=> fromImage(img);
      img.onerror = ()=> animatePositions(circlePositions(500, 190, STEP));
      img.src = REVEAL2_IMAGE_SRC;
    } else {
      animatePositions(circlePositions(500, 190, STEP));
    }
  }

  /* ENDING 2 */
  const ending2Line = "That's the whole of it, Rwick. 520. I love you. There's not one second where I didn't love you. So, let me ask you properly, just once more.";
  function startEnding2(){
    $('ending2Typed').textContent = ''; $('ending2Continue').classList.remove('show');
    let i = 0;
    (function type(){
      if(i<=ending2Line.length){ $('ending2Typed').textContent = ending2Line.slice(0,i); i++; setTimeout(type,22); }
      else setTimeout(()=> $('ending2Continue').classList.add('show'), 300);
    })();
  }
  $('ending2Continue').addEventListener('click', ()=>{ goTo('ask2'); startAsk2(); });



  /* ASK 2 */
  const messages2 = [
  "So, do you love me? ❤",
  "Rwick, don't tease me like that.",
  "Rwick.",
  "Just say yes.",
  "SAY YES, RWICK.",
  "Please.",
  "Please say it back."
  ];

  let noCount2 = 0;
  function startAsk2(){
    noCount2 = 0;
    $('askMsg2').textContent = messages2[0]; $('askMsg2').style.fontSize='22px'; $('askMsg2').classList.remove('chroma');
    frame.classList.remove('glitching'); $('grain').style.opacity='0'; $('scan').style.opacity='0';
    $('noBtn2').style.display=''; $('noBtn2').classList.remove('disintegrate');
    $('yesBtn2').classList.remove('final-yes');
  }
  function calmDown2(){
    frame.classList.remove('glitching'); $('grain').style.opacity='0'; $('scan').style.opacity='0';
    $('askMsg2').classList.remove('chroma');
  }
  $('yesBtn2').addEventListener('click', ()=>{ calmDown2(); goTo('release'); });
  $('noBtn2').addEventListener('click', ()=>{
    noCount2++;
    frame.classList.add('shake'); setTimeout(()=>frame.classList.remove('shake'), 400);
    $('grain').style.opacity = Math.min(noCount2*0.12, 0.6);
    $('scan').style.opacity = Math.min(noCount2*0.15, 0.7);
    if(noCount2>=2) $('askMsg2').classList.add('chroma');
    if(noCount2>=3) frame.classList.add('glitching');
    if(noCount2 < messages2.length) $('askMsg2').textContent = messages2[noCount2];
    $('askMsg2').style.fontSize = Math.min(22+noCount2*1.8, 32)+'px';
    if(noCount2 >= messages2.length){
      $('askMsg2').textContent = "...there's only one answer, Rwick.";
      $('noBtn2').classList.add('disintegrate');
      setTimeout(()=>{ $('noBtn2').style.display='none'; }, 700);
      $('yesBtn2').classList.add('final-yes');
    }
  });

  /* ASK */
  const messages = ["Do you love me? ❤","Rwick, do you love me?","Why no? 🥺","Say yes, Rwick.","SAY YES, RWICK.","Love me. Love me. Love me."];
  let noCount = 0;
  function startAsk(){
    noCount = 0;
    $('askMsg').textContent = messages[0]; $('askMsg').style.fontSize='22px'; $('askMsg').classList.remove('chroma');
    frame.classList.remove('glitching'); $('grain').style.opacity='0'; $('scan').style.opacity='0';
    $('noBtn').style.display=''; $('noBtn').classList.remove('disintegrate');
    $('yesBtn').classList.remove('final-yes');
  }
  function calmDown(){
    frame.classList.remove('glitching'); $('grain').style.opacity='0'; $('scan').style.opacity='0';
    $('askMsg').classList.remove('chroma');
  }
  $('yesBtn').addEventListener('click', ()=>{
    calmDown(); goTo('reward');
    startReward("My Rwick, since you love me... here's a little reward. I made it just for you. Just for us.");
  });
  $('noBtn').addEventListener('click', ()=>{
    noCount++;
    frame.classList.add('shake'); setTimeout(()=>frame.classList.remove('shake'), 400);
    $('grain').style.opacity = Math.min(noCount*0.12, 0.6);
    $('scan').style.opacity = Math.min(noCount*0.15, 0.7);
    if(noCount>=2) $('askMsg').classList.add('chroma');
    if(noCount>=3) frame.classList.add('glitching');
    if(noCount < messages.length) $('askMsg').textContent = messages[noCount];
    $('askMsg').style.fontSize = Math.min(22+noCount*1.8, 32)+'px';
    if(noCount >= messages.length){
      $('askMsg').textContent = "...there's only one answer, Rwick.";
      $('noBtn').classList.add('disintegrate');
      setTimeout(()=>{ $('noBtn').style.display='none'; }, 700);
      $('yesBtn').classList.add('final-yes');
    }
  });

  /* REWARD / MUSEUM */
  function startReward(line){
    $('vnTyped').textContent=''; $('museum').innerHTML=''; $('museumContinue').classList.remove('show');
    let i=0;
    (function type(){
      if(i<=line.length){ $('vnTyped').textContent=line.slice(0,i); i++; setTimeout(type,24); }
      else buildMuseum();
    })();
  }
  function buildMuseum(){
    const grid = $('museum');
    museumPhotos.forEach((photo, i)=>{
      const wrap = document.createElement('div'); wrap.className = 'frame-photo';
      const inner = document.createElement('div'); inner.className = 'frame-inner';
      const src = photo.src || uploadedImg;
      if(src){
        const img = document.createElement('img'); img.src = src; img.alt = photo.caption || '';
        inner.appendChild(img);
      } else {
        inner.classList.add('placeholder');
        inner.textContent = photo.caption || '520';
      }
      wrap.appendChild(inner);
      ['tl','tr','bl','br'].forEach(c=>{ const cor=document.createElement('div'); cor.className='corner '+c; wrap.appendChild(cor); });
      const plaque = document.createElement('div'); plaque.className = 'plaque'; plaque.textContent = photo.caption || '';
      wrap.appendChild(plaque);
      wrap.style.cursor = 'pointer';
      wrap.addEventListener('click', ()=> openLightbox(photo, src));
      grid.appendChild(wrap);
      setTimeout(()=> wrap.classList.add('show'), 90*i);
    });
    setTimeout(()=> $('museumContinue').classList.add('show'), 90*museumPhotos.length + 500);
  }
  $('museumContinue').addEventListener('click', ()=>{ goTo('flood'); initFlood(); });

  /* MUSEUM + flip */
  function openLightbox(photo, src){
    const front = $('lbFront');
    front.innerHTML = '';
    if(src){
      const img = document.createElement('img'); img.src = src; img.alt = photo.caption || '';
      front.appendChild(img);
    } else {
      const ph = document.createElement('div'); ph.className = 'lb-placeholder';
      ph.textContent = photo.caption || '520';
      front.appendChild(ph);
    }
    $('lbDate').textContent = photo.date || photo.caption || '';
    $('lbNote').textContent = photo.note || '';
    $('lbTally').textContent = photo.tally || '';
    $('lbCard').classList.remove('flipped');
    $('lbHint').textContent = 'tap to flip';
    $('photoLightbox').classList.add('show');
  }
  function closeLightbox(){
    $('photoLightbox').classList.remove('show');
    setTimeout(()=> $('lbCard').classList.remove('flipped'), 400);
  }
  $('lbCard').addEventListener('click', ()=>{
    const flipped = $('lbCard').classList.toggle('flipped');
    $('lbHint').textContent = flipped ? 'tap to flip back' : 'tap to flip';
  });
  $('lbClose').addEventListener('click', (e)=>{ e.stopPropagation(); closeLightbox(); });
  $('photoLightbox').addEventListener('click', (e)=>{
    if(e.target.id === 'photoLightbox') closeLightbox();
  });

  /* heart bursts */
  let floodClicks = 0;
  function initFlood(){
    floodClicks = 0;
    $('floodContinue').classList.remove('show');
    const wall = $('floodWall'); wall.innerHTML = '';
    const phrases = ['i love you','love you','i love you','say it back','love you'];
    const rowCount = 8;
    const wordsPerRow = 8;
    for(let r=0; r<rowCount; r++){
      const row = document.createElement('div');
      row.className = 'flood-row ' + (r % 2 === 0 ? 'dir-left' : 'dir-right');
      row.style.animationDuration = (17 + Math.random()*16).toFixed(1) + 's';
      const half = [];
      for(let i=0; i<wordsPerRow; i++){
        const span = document.createElement('span');
        span.textContent = phrases[(r+i) % phrases.length];
        span.style.fontSize = (16 + Math.random()*16).toFixed(0) + 'px';
        span.style.animationDuration = (2.4 + Math.random()*2.6).toFixed(1) + 's';
        span.style.animationDelay = '-' + (Math.random()*4).toFixed(1) + 's';
        row.appendChild(span);
        half.push(span);
      }
      // clone the exact half so the loop tiles seamlessly at translateX(-50%)
      half.forEach(s => row.appendChild(s.cloneNode(true)));
      wall.appendChild(row);
    }
  }
  $('flood').addEventListener('click', (e)=>{
    if(e.target.closest('.flood-continue')) return;
    const r = frame.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    burstHearts(x,y);
    floodClicks++;
    if(floodClicks >= 3) $('floodContinue').classList.add('show');
  });
  function burstHearts(x,y){
    const n = 10;
    for(let i=0;i<n;i++){
      const h = document.createElement('div');
      h.className = 'heart-particle';
      h.textContent = Math.random() > 0.3 ? '❤' : '💗';
      const angle = Math.random()*Math.PI*2;
      const dist = 40 + Math.random()*60;
      h.style.setProperty('--dx', Math.cos(angle)*dist + 'px');
      h.style.setProperty('--dy', (Math.sin(angle)*dist - 20) + 'px');
      h.style.setProperty('--rot', (Math.random()*80-40) + 'deg');
      h.style.left = x+'px'; h.style.top = y+'px';
      h.style.color = Math.random() > 0.5 ? 'var(--blood)' : 'var(--ember)';
      frame.appendChild(h);
      setTimeout(()=> h.remove(), 1000);
    }
  }
  $('floodContinue').addEventListener('click', (e)=>{
    e.stopPropagation(); goTo('sayback'); startSayback();
  });

  /* SAY IT BACK */
  const sbLine = "Before I let you go... one question. I love you. Say it back.";
  let sbAnswered = false;
  const sbWrongLines = ["That's not it. Say it back.","Try again, Rwick.","You know the words.","Say. It. Back.","I'm not letting this go."];
  let sbWrongCount = 0;
  function normalize(s){ return s.toLowerCase().replace(/[^a-z]/g,''); }
  function checkAnswer(s){ return normalize(s).includes('iloveyou'); }
  function sbCalmDown(){
    frame.classList.remove('glitching'); $('grain').style.opacity='0'; $('scan').style.opacity='0';
    $('sbQ').classList.remove('chroma');
  }
  function startSayback(){
    sbAnswered = false; sbWrongCount = 0;
    sbCalmDown();
    $('sbInput').value=''; $('sbWrong').textContent=''; $('sbWrong').classList.remove('sb-success');
    $('sbTyped').textContent=''; let i=0;
    (function type(){ if(i<=sbLine.length){ $('sbTyped').textContent = sbLine.slice(0,i); i++; setTimeout(type,26); } })();
  }
  function handleAnswer(text){
    if(sbAnswered) return;
    if(checkAnswer(text)){
      sbAnswered = true;
      sbCalmDown();
      $('sbWrong').textContent = 'I love you too. Always.';
      $('sbWrong').classList.add('sb-success');
      setTimeout(()=>{ goTo('reveal2'); runReveal2(); }, 1600);
    } else {
      sbWrongCount++;
      frame.classList.add('shake'); setTimeout(()=>frame.classList.remove('shake'), 400);
      // tremble / vibrate
      $('grain').style.opacity = Math.min(sbWrongCount*0.1, 0.55);
      $('scan').style.opacity = Math.min(sbWrongCount*0.13, 0.65);
      if(sbWrongCount>=2) $('sbQ').classList.add('chroma');
      if(sbWrongCount>=3) frame.classList.add('glitching');
      $('sbWrong').textContent = sbWrongLines[Math.min(sbWrongCount-1, sbWrongLines.length-1)];
    }
  }
  $('sbSubmit').addEventListener('click', ()=> handleAnswer($('sbInput').value));
  $('sbInput').addEventListener('keydown', (e)=>{ if(e.key==='Enter') handleAnswer($('sbInput').value); });

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SR){
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    $('sbMicBtn').addEventListener('click', ()=>{
      if(sbAnswered) return;
      $('sbMicBtn').classList.add('listening');
      try{ rec.start(); }catch(err){}
    });
    rec.onresult = (e)=>{
      $('sbMicBtn').classList.remove('listening');
      const transcript = e.results[0][0].transcript;
      handleAnswer(transcript);
    };
    rec.onerror = ()=>{ $('sbMicBtn').classList.remove('listening'); $('sbWrong').textContent = "didn't catch that. try typing instead."; };
    rec.onend = ()=>{ $('sbMicBtn').classList.remove('listening'); };
  } else {
    $('sbMicRow').innerHTML = "<span style=\"font-size:10px;color:var(--dim);\">voice input isn't supported here. type it instead</span>";
  }

  let exitTries = 0;
  const exitLines = ["where are you going?","you don't want to leave.","stay a little longer, Rwick.","...okay. go, if you have to."];
  $('exitBtn').addEventListener('click', ()=>{
    exitTries++;
    const toastEl = $('exitToast');
    toastEl.textContent = exitLines[Math.min(exitTries-1, exitLines.length-1)];
    toastEl.classList.add('show');
    frame.classList.add('shake'); setTimeout(()=>frame.classList.remove('shake'), 400);
    setTimeout(()=>toastEl.classList.remove('show'), 1700);
    if(exitTries >= 4){ exitTries = 0; goTo('release'); }
  });

  $('resetBtn').addEventListener('click', ()=>{
    taunt = 0; exitTries = 0; sbCalmDown(); resetPin(); goTo('lock');
  });
})();
