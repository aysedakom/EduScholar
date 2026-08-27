-- backend/db/triggers.sql
-- PostgreSQL LISTEN/NOTIFY trigger functions for real-time EduScholar event bus

-- Generic notify function that emits JSON payload over the 'eduscholar_events' channel
CREATE OR REPLACE FUNCTION notify_eduscholar_event()
RETURNS trigger AS $$
DECLARE
  payload JSONB;
BEGIN
  payload = jsonb_build_object(
    'table', TG_TABLE_NAME,
    'action', TG_OP,
    'timestamp', CURRENT_TIMESTAMP,
    'record', CASE 
      WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)
      ELSE row_to_json(NEW)
    END
  );

  PERFORM pg_notify('eduscholar_events', payload::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for applications
DROP TRIGGER IF EXISTS trg_applications_notify ON applications;
CREATE TRIGGER trg_applications_notify
AFTER INSERT OR UPDATE OR DELETE ON applications
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_event();

-- Trigger for notifications
DROP TRIGGER IF EXISTS trg_notifications_notify ON notifications;
CREATE TRIGGER trg_notifications_notify
AFTER INSERT OR UPDATE OR DELETE ON notifications
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_event();

-- Trigger for school aid distributions
DROP TRIGGER IF EXISTS trg_distributions_notify ON school_aid_distributions;
CREATE TRIGGER trg_distributions_notify
AFTER INSERT OR UPDATE OR DELETE ON school_aid_distributions
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_event();

-- Trigger for student registry
DROP TRIGGER IF EXISTS trg_registry_notify ON student_registry;
CREATE TRIGGER trg_registry_notify
AFTER INSERT OR UPDATE OR DELETE ON student_registry
FOR EACH ROW EXECUTE FUNCTION notify_eduscholar_event();
