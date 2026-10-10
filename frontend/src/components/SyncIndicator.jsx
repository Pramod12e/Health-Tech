import { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SyncIcon from "@mui/icons-material/Sync";
import { useTranslation } from "react-i18next";
import { getAllQueued } from "../offline/db";
import { syncQueuedRequests } from "../offline/syncManager";

function SyncIndicator() {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);

  const refresh = async () => {
    const items = await getAllQueued();
    setCount(items.length);
  };

  useEffect(() => {
    refresh();

    const onQueueChange = () => refresh();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("queue-changed", onQueueChange);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("queue-changed", onQueueChange);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // everything synced and online -> show nothing
  if (online && count === 0) return null;

  if (!online) {
    return (
      <Chip
        size="small"
        icon={<CloudOffIcon />}
        label={count > 0 ? `${t("offline")} • ${count} ${t("waiting")}` : t("offline")}
        color="warning"
        sx={{ marginRight: 1 }}
      />
    );
  }

  // online, but items still waiting -> tap to retry now
  return (
    <Chip
      size="small"
      icon={<SyncIcon />}
      label={`${count} ${t("waitingToSync")}`}
      color="info"
      onClick={syncQueuedRequests}
      sx={{ marginRight: 1 }}
    />
  );
}
export default SyncIndicator;