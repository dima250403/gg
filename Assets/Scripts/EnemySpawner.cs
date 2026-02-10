using System.Collections.Generic;
using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    public EnemyController enemyPrefab;
    public int startCount = 6;
    public float spawnRadius = 35f;

    private readonly List<EnemyController> _alive = new();

    public int AliveCount => _alive.Count;

    public void SpawnInitial()
    {
        for (int i = 0; i < startCount; i++)
            SpawnOne();
    }

    public void SpawnOne()
    {
        if (enemyPrefab == null)
            return;

        Vector2 circle = Random.insideUnitCircle.normalized * Random.Range(8f, spawnRadius);
        Vector3 pos = new Vector3(circle.x, 1f, circle.y);

        EnemyController enemy = Instantiate(enemyPrefab, pos, Quaternion.identity);
        _alive.Add(enemy);
        GameManager.Instance?.OnEnemiesChanged(_alive.Count);
    }

    public void NotifyDead(EnemyController enemy)
    {
        _alive.Remove(enemy);
        GameManager.Instance?.OnEnemiesChanged(_alive.Count);
        SpawnOne();
    }
}
