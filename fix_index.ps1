$p='index.html'
$c=Get-Content -Raw $p
$c = [regex]::Replace($c,'<title>.*?</title>','<title>StandStrong - POTS Fitness</title>',1)
$c = [regex]::Replace($c,'<meta property="og:title" content=".*?">','<meta property="og:title" content="StandStrong - POTS Fitness">',1)
$c = $c.Replace('</ul>`r`n</nav>','</ul>' + "`r`n" + '</nav>')
$c = $c.Replace('Â·','·').Replace('â†’','→').Replace('â€“','-').Replace('Â©','©')
$bad = [string]([char]0xFFFD) + '?'
$c = $c.Replace($bad,'-')
$c = [regex]::Replace($c,'<div class="card-meta"><span>[^<]*12 min</span><span>[^<]*Lying down</span><span>[^<]*Low intensity</span></div>','<div class="card-meta"><span>12 min</span><span>Lying down</span><span>Low intensity</span></div>',1)
$c = [regex]::Replace($c,'<div class="card-meta"><span>[^<]*8 min</span><span>[^<]*Any position</span><span>[^<]*Rest level</span></div>','<div class="card-meta"><span>8 min</span><span>Any position</span><span>Rest level</span></div>',1)
$c = [regex]::Replace($c,'<div class="card-meta"><span>[^<]*18 min</span><span>[^<]*Chair</span><span>[^<]*Light</span></div>','<div class="card-meta"><span>18 min</span><span>Chair</span><span>Light</span></div>',1)
$c = [regex]::Replace($c,'<div class="card-meta"><span>[^<]*22 min</span><span>[^<]*Light resistance</span><span>[^<]*Moderate</span></div>','<div class="card-meta"><span>22 min</span><span>Light resistance</span><span>Moderate</span></div>',1)
$c = [regex]::Replace($c,'<div class="card-meta"><span>[^<]*15 min</span><span>[^<]*Wall support</span><span>[^<]*Moderate</span></div>','<div class="card-meta"><span>15 min</span><span>Wall support</span><span>Moderate</span></div>',1)
$c = [regex]::Replace($c,'<div class="card-meta"><span>[^<]*25 min</span><span>[^<]*Water</span><span>[^<]*Low</span></div>','<div class="card-meta"><span>25 min</span><span>Water</span><span>Low</span></div>',1)
$gearBlock = @"
    <div class="sidebar-card">
      <div class="sidebar-title">Recommended Gear</div>
      <div class="affiliate-item">
        <div class="aff-icon" style="background:#e8f5e9">🧦</div>
        <div class="aff-info"><div class="aff-name">Compression Stockings</div><div class="aff-desc">20-30mmHg graduated, knee-high</div></div>
        <a href="#" class="aff-link">Shop →</a>
      </div>
      <div class="affiliate-item">
        <div class="aff-icon" style="background:#e3f2fd">🚴</div>
        <div class="aff-info"><div class="aff-name">Recumbent Bike</div><div class="aff-desc">Schwinn 230, PT-recommended</div></div>
        <a href="#" class="aff-link">Shop →</a>
      </div>
      <div class="affiliate-item">
        <div class="aff-icon" style="background:#fff3e0">💪</div>
        <div class="aff-info"><div class="aff-name">Resistance Bands Set</div><div class="aff-desc">5-level loop bands for lower body</div></div>
        <a href="#" class="aff-link">Shop →</a>
      </div>
      <div class="affiliate-item">
        <div class="aff-icon" style="background:#fce4ec">💧</div>
        <div class="aff-info"><div class="aff-name">Electrolyte Powder</div><div class="aff-desc">LMNT - high sodium for POTS</div></div>
        <a href="#" class="aff-link">Shop →</a>
      </div>
      <div class="affiliate-item">
        <div class="aff-icon" style="background:#f3e5f5">📐</div>
        <div class="aff-info"><div class="aff-name">Incline Wedge Pillow</div><div class="aff-desc">Head-of-bed elevation for POTS</div></div>
        <a href="#" class="aff-link">Shop →</a>
      </div>
    </div>
"@
$c = [regex]::Replace($c,'\s*<div class="sidebar-card">\s*<div class="sidebar-title">Recommended Gear</div>[\s\S]*?<\/div>\s*<div class="sidebar-card">',$gearBlock + "`r`n" + '    <div class="sidebar-card">',1)
$c = [regex]::Replace($c,'<div class="disclaimer">[\s\S]*?<\/div>','<div class="disclaimer">⚠️ <strong>Medical Disclaimer:</strong> StandStrong provides general fitness information for educational purposes only. Always consult your cardiologist or dysautonomia specialist before starting any exercise program. This site does not provide medical advice.</div>',1)
$c = [regex]::Replace($c,'<div>.*?StandStrong POTS Fitness.*?<\/div>','<div>© 2026 StandStrong POTS Fitness · <a href="#">Privacy</a> · <a href="#">Affiliate Disclosure</a> · <a href="#">Terms</a></div>',1)
[System.IO.File]::WriteAllText((Resolve-Path $p),$c,[System.Text.UTF8Encoding]::new($false))