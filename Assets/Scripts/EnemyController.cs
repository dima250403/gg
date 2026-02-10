using UnityEngine;

public class EnemyController : MonoBehaviour, IDamageable
{
    public int maxHealth = 30;
    public float moveSpeed = 2f;
    public float attackDistance = 1.4f;
    public float attackCooldown = 0.5f;
    public int attackDamage = 8;

    private int _health;
    private float _nextAttackTime;
    private Transform _player;

    private void OnEnable()
    {
        _health = maxHealth;
        _player = GameObject.FindWithTag("Player")?.transform;
    }

    private void Update()
    {
        if (_player == null)
            return;

        Vector3 target = _player.position;
        target.y = transform.position.y;

        Vector3 dir = (target - transform.position);
        float dist = dir.magnitude;

        if (dist > 0.05f)
        {
            Vector3 step = dir.normalized * moveSpeed * Time.deltaTime;
            transform.position += step;
            transform.forward = dir.normalized;
        }

        if (dist <= attackDistance && Time.time >= _nextAttackTime)
        {
            _nextAttackTime = Time.time + attackCooldown;
            var player = _player.GetComponent<PlayerController>();
            if (player != null)
                player.TakeDamage(attackDamage);
        }
    }

    public void TakeDamage(int damage)
    {
        _health -= damage;
        if (_health <= 0)
        {
            GameManager.Instance?.OnEnemyKilled(this);
            Destroy(gameObject);
        }
    }
}
