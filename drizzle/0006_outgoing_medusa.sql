ALTER TABLE `agreements` MODIFY COLUMN `status` enum('draft','pending','active','completed','cancelled') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `agreements` ADD `draftToken` varchar(64);--> statement-breakpoint
ALTER TABLE `agreements` ADD `pdfUrl` text;--> statement-breakpoint
ALTER TABLE `agreements` ADD `emailSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `agreements` ADD `emailSentTo` text;--> statement-breakpoint
ALTER TABLE `agreements` ADD `renewalDate` timestamp;--> statement-breakpoint
ALTER TABLE `agreements` ADD `reminderSentAt` timestamp;--> statement-breakpoint
ALTER TABLE `agreements` ADD CONSTRAINT `agreements_draftToken_unique` UNIQUE(`draftToken`);