DROP INDEX `booking_items_slot_unique`;--> statement-breakpoint
CREATE INDEX `booking_items_slot_idx` ON `booking_items` (`slot_id`);