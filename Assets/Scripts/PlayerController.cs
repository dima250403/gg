using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    public float moveSpeed = 6f;
    public float jumpHeight = 1.4f;
    public float gravity = -20f;

    [Header("Look")]
    public Transform cameraRoot;
    public float mouseSensitivity = 160f;
    public float maxLookAngle = 85f;

    [Header("Combat")]
    public int maxHealth = 100;
    public int weaponDamage = 15;
    public float fireRate = 0.12f;
    public float shootDistance = 120f;

    private CharacterController _controller;
    private Camera _camera;
    private Vector3 _velocity;
    private float _xRotation;
    private float _nextShootTime;
    private int _currentHealth;

    public int CurrentHealth => _currentHealth;

    private void Awake()
    {
        _controller = GetComponent<CharacterController>();
        _camera = Camera.main;
        _currentHealth = maxHealth;

        LockCursor(true);
    }

    private void Update()
    {
        HandleMovement();
        HandleLook();
        HandleShoot();
        HandleCursor();
    }

    private void HandleMovement()
    {
        float x = Input.GetAxis("Horizontal");
        float z = Input.GetAxis("Vertical");

        Vector3 move = transform.right * x + transform.forward * z;
        _controller.Move(move * moveSpeed * Time.deltaTime);

        if (_controller.isGrounded && _velocity.y < 0f)
            _velocity.y = -2f;

        if (Input.GetButtonDown("Jump") && _controller.isGrounded)
            _velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);

        _velocity.y += gravity * Time.deltaTime;
        _controller.Move(_velocity * Time.deltaTime);
    }

    private void HandleLook()
    {
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity * Time.deltaTime;

        _xRotation -= mouseY;
        _xRotation = Mathf.Clamp(_xRotation, -maxLookAngle, maxLookAngle);

        if (cameraRoot != null)
            cameraRoot.localRotation = Quaternion.Euler(_xRotation, 0f, 0f);

        transform.Rotate(Vector3.up * mouseX);
    }

    private void HandleShoot()
    {
        if (!Input.GetMouseButton(0) || Time.time < _nextShootTime)
            return;

        _nextShootTime = Time.time + fireRate;

        if (_camera == null)
            _camera = Camera.main;

        if (_camera == null)
            return;

        Ray ray = new Ray(_camera.transform.position, _camera.transform.forward);
        if (Physics.Raycast(ray, out RaycastHit hit, shootDistance))
        {
            var damageable = hit.collider.GetComponentInParent<IDamageable>();
            damageable?.TakeDamage(weaponDamage);
        }
    }

    private void HandleCursor()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
            LockCursor(false);

        if (Input.GetMouseButtonDown(0))
            LockCursor(true);
    }

    private void LockCursor(bool locked)
    {
        Cursor.lockState = locked ? CursorLockMode.Locked : CursorLockMode.None;
        Cursor.visible = !locked;
    }

    public void TakeDamage(int value)
    {
        _currentHealth = Mathf.Max(0, _currentHealth - value);
        GameManager.Instance?.OnPlayerHealthChanged(_currentHealth);

        if (_currentHealth == 0)
            GameManager.Instance?.OnPlayerDead();
    }
}
