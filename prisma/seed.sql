INSERT INTO "User" (id, name, email, password, "emailVerified", created_at, updated_at)
VALUES ('admin-001', 'محمد', 'abomrzk@gmail.com', '$2a$12$placeholder', NOW(), NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO profiles (id, role, full_name, is_active, created_at, updated_at)
VALUES ('admin-001', 'super_admin', 'محمد', true, NOW(), NOW())
ON CONFLICT DO NOTHING;
