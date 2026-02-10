# 3D Shooter (Python, не HTML)

Простой прототип шутера от первого лица на **Python + Ursina**.

## Что есть
- 3D-сцена с освещением и полом
- Управление от первого лица (WASD + мышь + Space)
- Стрельба ЛКМ (hit-scan)
- Враги-кубы, которые идут к игроку
- Здоровье игрока и HUD
- Респавн врагов

## Запуск
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python shooter3d.py
```

## Управление
- `W/A/S/D` — движение
- `Mouse` — обзор
- `Left Click` — выстрел
- `Space` — прыжок
- `Esc` — выход
