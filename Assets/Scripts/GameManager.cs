using UnityEngine;
using UnityEngine.UI;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Links")]
    public PlayerController player;
    public EnemySpawner spawner;

    [Header("HUD (optional)")]
    public Text hpText;
    public Text killsText;
    public Text enemiesText;
    public Text centerMessage;

    private int _kills;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
    }

    private void Start()
    {
        _kills = 0;
        if (spawner != null)
            spawner.SpawnInitial();

        OnPlayerHealthChanged(player != null ? player.CurrentHealth : 0);
        OnEnemiesChanged(spawner != null ? spawner.AliveCount : 0);
        RefreshKills();
    }

    public void OnPlayerHealthChanged(int hp)
    {
        if (hpText != null)
            hpText.text = $"HP: {hp}";
    }

    public void OnEnemyKilled(EnemyController enemy)
    {
        _kills++;
        RefreshKills();
        spawner?.NotifyDead(enemy);
    }

    public void OnEnemiesChanged(int count)
    {
        if (enemiesText != null)
            enemiesText.text = $"Enemies: {count}";
    }

    public void OnPlayerDead()
    {
        if (centerMessage != null)
            centerMessage.text = "YOU DIED";
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
    }

    private void RefreshKills()
    {
        if (killsText != null)
            killsText.text = $"Kills: {_kills}";
    }
}
