CREATE TABLE `guest` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL,
	`recovery_token_hash` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `list`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `guest_recovery_token_hash_unique` ON `guest` (`recovery_token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `guest_list_name_idx` ON `guest` (`list_id`,`name_key`);--> statement-breakpoint
CREATE TABLE `guest_device` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`guest_id`) REFERENCES `guest`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `login_token` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `login_token_email_idx` ON `login_token` (`email`);--> statement-breakpoint
CREATE TABLE `reservation` (
	`wish_id` text PRIMARY KEY NOT NULL,
	`guest_id` text NOT NULL,
	`bought_at` integer,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`wish_id`) REFERENCES `wish`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`guest_id`) REFERENCES `guest`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `list` ADD `share_token` text;--> statement-breakpoint
CREATE UNIQUE INDEX `list_share_token_unique` ON `list` (`share_token`);