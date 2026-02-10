# 3D Shooter на Unity (не HTML)

> Есть режим запуска **без Unity Hub** — см. раздел ниже.

Сделал версию шутера под **Unity 3D** (URP/Standard — без привязки к HTML).

## Что внутри
- FPS-управление (WASD + мышь + прыжок)
- Стрельба через `Raycast`
- Враги с HP, преследованием и уроном по игроку
- Спавнер врагов
- HUD (HP, kills, enemies)

## Как запустить в Unity
1. Открой Unity Hub.
2. `Add project from disk` и выбери эту папку.
3. Создай сцену `MainScene`.
4. Добавь:
   - `Player` (Capsule + CharacterController + `PlayerController.cs`)
   - Камеру как child объекта `Player`.
   - `GameManager` (пустой объект + `GameManager.cs`)
   - `EnemySpawner` (пустой объект + `EnemySpawner.cs`)
   - `Ground` (Plane с Collider)
5. Создай prefab `Enemy`:
   - Cube/Capsule + Collider + (опционально) Rigidbody (isKinematic=true)
   - добавь `EnemyController.cs`.
6. На `EnemySpawner` укажи prefab врага и число стартовых врагов.
7. На `Player` в поле `cameraRoot` укажи Transform камеры.
8. На `GameManager` привяжи ссылки на `PlayerController` и `EnemySpawner`.
9. Нажми Play.

## Управление
- `W/A/S/D` — движение
- `Mouse` — обзор
- `Space` — прыжок
- `Left Mouse` — выстрел
- `Esc` — разблокировать курсор


## Файл запуска
- Linux/macOS: `./start_unity_project.sh`
- Windows: `start_unity_project.bat`

Если Unity не найден в PATH, укажи путь к бинарнику через переменную `UNITY_BIN`.


## Готовый запуск как EXE (Windows)
Теперь проект поддерживает полноценную сборку в `.exe` и запуск как обычной игры.

1. Укажи Unity executable:
   - `set UNITY_BIN=C:\Program Files\Unity\Hub\Editor\2022.3.0f1\Editor\Unity.exe`
2. Собери игру:
   - `build_windows.bat`
3. Запусти EXE:
   - `run_game.bat`

Итоговый файл игры:
- `Build/Windows/UnityShooter.exe`

## Что важно для сборки
- Сцена должна быть сохранена как: `Assets/Scenes/MainScene.unity`
- Добавлен Unity build script: `Assets/Editor/BuildWindows.cs`
- Сборка выполняется через Unity batchmode (`BuildWindows.Build`)


## Запуск без Unity Hub (просто запустить и играть)
Если у тебя нет Unity Hub, используй готовый standalone-рантайм на Windows:

- Запусти `play_now.bat`

Это запустит мини-шутер из `Standalone/StandaloneShooter.ps1` без Unity и без сборки проекта.


## Unity Hub обязателен?
**Нет, не обязателен.**

Тебе нужен только **Unity Editor** (сам `Unity.exe`), Hub можно не ставить.

Варианты:
- Открыть проект без Hub: `open_unity_no_hub.bat`
- Если путь нестандартный — задай переменную:
  - `set UNITY_BIN=C:\Path\To\Unity.exe`
  - `open_unity_no_hub.bat`
- Если хочешь просто играть без Unity: `play_now.bat`


## HTML версия (3D в браузере)
Теперь есть полноценная web-версия игры на HTML/CSS/JS:

- Открой `web/index.html` напрямую, или
- Запусти локальный сервер:
  - Windows: `start_html.bat`
  - Linux/macOS: `./start_html.sh`
- Затем открой `http://localhost:8080/web/`

Управление в HTML-версии:
- `W/S` — движение
- `A/D` — поворот
- `Mouse` — обзор (после Start)
- `Space` — выстрел
- `Esc` — отпустить курсор
