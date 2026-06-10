UPDATE `users`
SET `auth_created_at` = COALESCE(CAST(strftime('%s', `created_at`) AS INTEGER), CAST(strftime('%s', 'now') AS INTEGER))
WHERE `auth_created_at` = 0;
--> statement-breakpoint
UPDATE `users`
SET `auth_updated_at` = COALESCE(CAST(strftime('%s', `updated_at`) AS INTEGER), CAST(strftime('%s', 'now') AS INTEGER))
WHERE `auth_updated_at` = 0;
