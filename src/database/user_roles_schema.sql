USE crewnet;

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER password;

ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_superadmin TINYINT(1) DEFAULT 0 AFTER description;
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER is_superadmin;

UPDATE roles SET is_superadmin = 1 WHERE role_code = 'SUPER_ADMIN';
UPDATE roles SET is_superadmin = 0 WHERE role_code != 'SUPER_ADMIN';
UPDATE roles SET is_active = CASE WHEN status = 'Active' THEN 1 ELSE 0 END;

CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT NOT NULL,
  roleId BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by BIGINT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (userId, roleId),
  INDEX idx_userId (userId),
  INDEX idx_roleId (roleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO user_roles (userId, roleId, created_by)
SELECT 1, id, 1 FROM roles WHERE role_code = 'ESS';

INSERT IGNORE INTO user_roles (userId, roleId, created_by)
SELECT 2, id, 1 FROM roles WHERE role_code IN ('ESS', 'HR_ADMIN');

INSERT IGNORE INTO user_roles (userId, roleId, created_by)
SELECT 3, id, 1 FROM roles WHERE role_code IN ('SUPER_ADMIN', 'DEVELOPER');
