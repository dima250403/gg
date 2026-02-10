from __future__ import annotations

import random
from dataclasses import dataclass

from ursina import (
    Ursina,
    Entity,
    Vec3,
    color,
    directional_light,
    ambient_light,
    Text,
    time,
    mouse,
    raycast,
    destroy,
    camera,
    held_keys,
    application,
)
from ursina.prefabs.first_person_controller import FirstPersonController


@dataclass
class Balance:
    player_health: int = 100
    enemy_health: int = 30
    enemy_speed: float = 1.8
    enemy_damage: float = 10
    shoot_cooldown: float = 0.15
    shoot_distance: float = 80


BALANCE = Balance()


class Enemy(Entity):
    def __init__(self) -> None:
        super().__init__(
            model="cube",
            color=color.rgb(220, 70, 70),
            collider="box",
            scale=(1.2, 1.8, 1.2),
            y=1,
        )
        self.max_hp = BALANCE.enemy_health
        self.hp = self.max_hp
        self.hit_timer = 0.0

    def hurt(self, damage: int) -> bool:
        self.hp -= damage
        self.color = color.orange
        self.hit_timer = 0.12
        return self.hp <= 0

    def update(self, player: FirstPersonController) -> None:
        if not player.enabled:
            return

        delta = player.position - self.position
        distance = delta.length()
        if distance > 0.1:
            self.position += delta.normalized() * BALANCE.enemy_speed * time.dt

        self.look_at(player.position + Vec3(0, 0.8, 0))
        self.rotation_x = 0

        if distance < 1.4:
            game.damage_player(BALANCE.enemy_damage * time.dt)

        if self.hit_timer > 0:
            self.hit_timer -= time.dt
            if self.hit_timer <= 0:
                self.color = color.rgb(220, 70, 70)


class Game:
    def __init__(self) -> None:
        self.app = Ursina(title="3D Shooter (Python)")
        window = self.app.window
        window.fullscreen = False
        window.exit_button.visible = False
        window.fps_counter.enabled = True

        self.player = FirstPersonController(
            y=2,
            speed=7,
            jump_height=1.5,
            gravity=1,
            collider="box",
        )
        self.player.cursor.visible = False

        self.health = BALANCE.player_health
        self.kills = 0
        self.last_shot = 0.0

        self.hud = Text(
            text="",
            x=-0.87,
            y=0.45,
            origin=(0, 0),
            scale=1.3,
            background=True,
        )
        self.crosshair = Text(text="+", origin=(0, 0), scale=2, color=color.white)

        Entity(
            model="plane",
            texture="white_cube",
            texture_scale=(60, 60),
            scale=120,
            collider="box",
            color=color.rgb(80, 110, 80),
        )

        for _ in range(36):
            Entity(
                model="cube",
                color=color.rgb(90, 90, 95),
                scale=(2, random.uniform(2, 9), 2),
                position=(random.uniform(-55, 55), 0, random.uniform(-55, 55)),
                collider="box",
            ).y += 0.5

        directional_light(parent=camera, y=2, z=3, shadows=True)
        ambient_light(color=color.rgba(120, 120, 140, 0.5))

        self.enemies: list[Enemy] = []
        for _ in range(6):
            self.spawn_enemy()

        self.update_hud()

    def spawn_enemy(self) -> None:
        enemy = Enemy()
        enemy.position = Vec3(
            random.uniform(-35, 35),
            1,
            random.uniform(-35, 35),
        )
        self.enemies.append(enemy)

    def update_hud(self) -> None:
        self.hud.text = f"HP: {int(self.health)}\nKills: {self.kills}\nEnemies: {len(self.enemies)}"

    def damage_player(self, amount: float) -> None:
        self.health -= amount
        if self.health <= 0:
            self.health = 0
            self.player.enabled = False
            mouse.locked = False
            self.crosshair.text = "YOU DIED"
            self.crosshair.scale = 1.5
            self.crosshair.color = color.red
        self.update_hud()

    def shoot(self) -> None:
        if time.time() - self.last_shot < BALANCE.shoot_cooldown:
            return
        self.last_shot = time.time()

        hit = raycast(
            camera.world_position,
            camera.forward,
            distance=BALANCE.shoot_distance,
            ignore=(self.player,),
        )

        if hit.hit and isinstance(hit.entity, Enemy):
            dead = hit.entity.hurt(15)
            if dead:
                self.kills += 1
                self.enemies.remove(hit.entity)
                destroy(hit.entity)
                self.spawn_enemy()
            self.update_hud()

    def update(self) -> None:
        if held_keys["escape"]:
            application.quit()

        if self.player.enabled and held_keys["left mouse"]:
            self.shoot()

        for enemy in self.enemies:
            enemy.update(self.player)


game = Game()


def update() -> None:
    game.update()


if __name__ == "__main__":
    game.app.run()
