3D Shooter на Unity

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
