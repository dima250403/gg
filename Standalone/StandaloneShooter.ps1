Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Shooter - No Unity Needed'
$form.ClientSize = New-Object System.Drawing.Size(960, 640)
$form.StartPosition = 'CenterScreen'
$form.DoubleBuffered = $true
$form.KeyPreview = $true

$bmp = New-Object System.Drawing.Bitmap(960, 640)
$keys = @{}

$map = @(
    '111111111111',
    '100000000001',
    '101111111101',
    '100010000001',
    '100010111101',
    '100000100001',
    '101110101101',
    '100000001001',
    '111111111111'
)
$mapW = $map[0].Length
$mapH = $map.Count

$playerX = 2.5
$playerY = 2.5
$playerA = 0.2
$fov = [Math]::PI / 3.0
$moveSpeed = 0.08
$rotSpeed = 0.055

$enemyX = 8.5
$enemyY = 6.2
$enemyHp = 8
$kills = 0
$health = 100
$attackCooldown = 0
$message = 'W/S move, A/D rotate, SPACE shoot, ESC exit'

function IsWall([double]$x, [double]$y) {
    $mx = [int][Math]::Floor($x)
    $my = [int][Math]::Floor($y)
    if ($mx -lt 0 -or $my -lt 0 -or $mx -ge $mapW -or $my -ge $mapH) { return $true }
    return $map[$my][$mx] -eq '1'
}

function RespawnEnemy {
    param([ref]$ex,[ref]$ey,[ref]$ehp)
    $spots = @(
        @(8.5, 6.2), @(9.2, 2.3), @(5.3, 7.2), @(2.4, 6.7)
    )
    $idx = Get-Random -Minimum 0 -Maximum $spots.Count
    $ex.Value = $spots[$idx][0]
    $ey.Value = $spots[$idx][1]
    $ehp.Value = 8
}

$form.add_KeyDown({ param($s,$e) $keys[$e.KeyCode] = $true })
$form.add_KeyUp({ param($s,$e) $keys[$e.KeyCode] = $false })

$form.add_Paint({
    param($sender, $e)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighSpeed'

    $g.Clear([System.Drawing.Color]::Black)
    $g.FillRectangle([System.Drawing.Brushes]::DarkSlateBlue, 0, 0, 960, 320)
    $g.FillRectangle([System.Drawing.Brushes]::DarkOliveGreen, 0, 320, 960, 320)

    for ($x = 0; $x -lt 960; $x++) {
        $rayA = $playerA - ($fov / 2.0) + ($x / 960.0) * $fov
        $dist = 0.02
        $hit = $false
        while (-not $hit -and $dist -lt 20.0) {
            $tx = $playerX + [Math]::Cos($rayA) * $dist
            $ty = $playerY + [Math]::Sin($rayA) * $dist
            if (IsWall $tx $ty) { $hit = $true } else { $dist += 0.03 }
        }

        $wallH = [int](520 / [Math]::Max(0.1, $dist))
        if ($wallH -gt 620) { $wallH = 620 }
        $top = 320 - [int]($wallH / 2)
        $shade = [int](255 - [Math]::Min(220, $dist * 20))
        $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb($shade, $shade, $shade))
        $g.DrawLine($pen, $x, $top, $x, $top + $wallH)
        $pen.Dispose()
    }

    # enemy billboard
    if ($enemyHp -gt 0) {
        $dx = $enemyX - $playerX
        $dy = $enemyY - $playerY
        $distE = [Math]::Sqrt($dx*$dx + $dy*$dy)
        $angE = [Math]::Atan2($dy, $dx) - $playerA
        while ($angE -gt [Math]::PI) { $angE -= 2*[Math]::PI }
        while ($angE -lt -[Math]::PI) { $angE += 2*[Math]::PI }

        if ([Math]::Abs($angE) -lt ($fov / 2.2) -and $distE -gt 0.2) {
            $sx = [int]((($angE + $fov/2) / $fov) * 960)
            $size = [int](420 / $distE)
            if ($size -gt 260) { $size = 260 }
            if ($size -lt 16) { $size = 16 }
            $rect = New-Object System.Drawing.Rectangle($sx - [int]($size/2), 320 - [int]($size/2), $size, $size)
            $g.FillEllipse([System.Drawing.Brushes]::Crimson, $rect)
            $g.DrawEllipse([System.Drawing.Pens]::Black, $rect)
        }
    }

    # HUD
    $font = New-Object System.Drawing.Font('Consolas', 14, [System.Drawing.FontStyle]::Bold)
    $g.DrawString("HP: $health", $font, [System.Drawing.Brushes]::White, 12, 10)
    $g.DrawString("Kills: $kills", $font, [System.Drawing.Brushes]::White, 12, 35)
    $g.DrawString("Enemy HP: $enemyHp", $font, [System.Drawing.Brushes]::White, 12, 60)
    $g.DrawString($message, (New-Object System.Drawing.Font('Consolas', 11)), [System.Drawing.Brushes]::Gainsboro, 12, 600)

    # crosshair
    $g.DrawLine([System.Drawing.Pens]::White, 475, 320, 485, 320)
    $g.DrawLine([System.Drawing.Pens]::White, 480, 315, 480, 325)

    $e.Graphics.DrawImageUnscaled($bmp, 0, 0)
    $g.Dispose()
})

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 16
$timer.Add_Tick({
    if ($keys[[System.Windows.Forms.Keys]::Escape]) { $form.Close(); return }

    if ($keys[[System.Windows.Forms.Keys]::A]) { $playerA -= $rotSpeed }
    if ($keys[[System.Windows.Forms.Keys]::D]) { $playerA += $rotSpeed }

    $nx = $playerX
    $ny = $playerY
    if ($keys[[System.Windows.Forms.Keys]::W]) {
        $nx += [Math]::Cos($playerA) * $moveSpeed
        $ny += [Math]::Sin($playerA) * $moveSpeed
    }
    if ($keys[[System.Windows.Forms.Keys]::S]) {
        $nx -= [Math]::Cos($playerA) * $moveSpeed
        $ny -= [Math]::Sin($playerA) * $moveSpeed
    }
    if (-not (IsWall $nx $ny)) { $playerX = $nx; $playerY = $ny }

    # enemy chase + hit
    if ($enemyHp -gt 0) {
        $dx = $playerX - $enemyX
        $dy = $playerY - $enemyY
        $dist = [Math]::Sqrt($dx*$dx + $dy*$dy)
        if ($dist -gt 0.4) {
            $step = 0.03
            $exn = $enemyX + ($dx / $dist) * $step
            $eyn = $enemyY + ($dy / $dist) * $step
            if (-not (IsWall $exn $eyn)) { $enemyX = $exn; $enemyY = $eyn }
        }
        if ($dist -lt 0.75 -and $attackCooldown -le 0) {
            $health = [Math]::Max(0, $health - 8)
            $attackCooldown = 25
            if ($health -le 0) {
                $message = 'YOU DIED. Press ESC'
            }
        }
    }

    if ($attackCooldown -gt 0) { $attackCooldown-- }

    # shoot
    if ($keys[[System.Windows.Forms.Keys]::Space] -and $health -gt 0) {
        $keys[[System.Windows.Forms.Keys]::Space] = $false
        if ($enemyHp -gt 0) {
            $dx = $enemyX - $playerX
            $dy = $enemyY - $playerY
            $dist = [Math]::Sqrt($dx*$dx + $dy*$dy)
            $angE = [Math]::Atan2($dy, $dx) - $playerA
            while ($angE -gt [Math]::PI) { $angE -= 2*[Math]::PI }
            while ($angE -lt -[Math]::PI) { $angE += 2*[Math]::PI }
            if ([Math]::Abs($angE) -lt 0.12 -and $dist -lt 8.0) {
                $enemyHp -= 2
                $message = 'Hit!'
                if ($enemyHp -le 0) {
                    $kills++
                    $message = 'Enemy down!'
                    RespawnEnemy ([ref]$enemyX) ([ref]$enemyY) ([ref]$enemyHp)
                }
            } else {
                $message = 'Miss'
            }
        }
    }

    $form.Invalidate()
})

$timer.Start()
[void]$form.ShowDialog()
