CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`metadata` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_created_idx` ON `audit_logs` (`actor_user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `booking_items` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`slot_id` text NOT NULL,
	`court_name` text NOT NULL,
	`slot_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`price` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`slot_id`) REFERENCES `slots`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_items_slot_unique` ON `booking_items` (`slot_id`);--> statement-breakpoint
CREATE INDEX `booking_items_booking_idx` ON `booking_items` (`booking_id`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_code` text NOT NULL,
	`user_id` text NOT NULL,
	`venue_id` text NOT NULL,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`subtotal` integer NOT NULL,
	`platform_fee` integer DEFAULT 0 NOT NULL,
	`total_amount` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_code_unique` ON `bookings` (`booking_code`);--> statement-breakpoint
CREATE INDEX `bookings_user_status_idx` ON `bookings` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `bookings_venue_status_idx` ON `bookings` (`venue_id`,`status`);--> statement-breakpoint
CREATE TABLE `courts` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`name` text NOT NULL,
	`surface` text,
	`is_indoor` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courts_venue_name_unique` ON `courts` (`venue_id`,`name`);--> statement-breakpoint
CREATE INDEX `courts_venue_status_idx` ON `courts` (`venue_id`,`status`);--> statement-breakpoint
CREATE TABLE `merchant_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`business_name` text NOT NULL,
	`legal_name` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `merchant_profiles_owner_idx` ON `merchant_profiles` (`owner_user_id`);--> statement-breakpoint
CREATE INDEX `merchant_profiles_status_idx` ON `merchant_profiles` (`status`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`action_url` text,
	`read_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_read_idx` ON `notifications` (`user_id`,`read_at`,`created_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`booking_id` text NOT NULL,
	`user_id` text NOT NULL,
	`method` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`amount` integer NOT NULL,
	`provider_reference` text,
	`paid_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_booking_unique` ON `payments` (`booking_id`);--> statement-breakpoint
CREATE INDEX `payments_user_status_idx` ON `payments` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `slots` (
	`id` text PRIMARY KEY NOT NULL,
	`venue_id` text NOT NULL,
	`court_id` text NOT NULL,
	`slot_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`price` integer NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`court_id`) REFERENCES `courts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `slots_court_date_time_unique` ON `slots` (`court_id`,`slot_date`,`start_time`,`end_time`);--> statement-breakpoint
CREATE INDEX `slots_venue_date_status_idx` ON `slots` (`venue_id`,`slot_date`,`status`);--> statement-breakpoint
CREATE INDEX `slots_court_date_idx` ON `slots` (`court_id`,`slot_date`);--> statement-breakpoint
CREATE TABLE `sport_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sport_categories_slug_unique` ON `sport_categories` (`slug`);--> statement-breakpoint
CREATE INDEX `sport_categories_active_idx` ON `sport_categories` (`is_active`,`sort_order`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`avatar_url` text,
	`city` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`phone` text,
	`role` text DEFAULT 'customer' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `users_role_status_idx` ON `users` (`role`,`status`);--> statement-breakpoint
CREATE TABLE `venues` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`category_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`area` text,
	`price_from` integer DEFAULT 0 NOT NULL,
	`rating` integer DEFAULT 0 NOT NULL,
	`review_count` integer DEFAULT 0 NOT NULL,
	`image_url` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchant_profiles`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`category_id`) REFERENCES `sport_categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `venues_slug_unique` ON `venues` (`slug`);--> statement-breakpoint
CREATE INDEX `venues_merchant_idx` ON `venues` (`merchant_id`);--> statement-breakpoint
CREATE INDEX `venues_category_status_idx` ON `venues` (`category_id`,`status`);--> statement-breakpoint
CREATE INDEX `venues_city_area_idx` ON `venues` (`city`,`area`);