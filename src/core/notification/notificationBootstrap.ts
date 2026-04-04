import { toast } from "sonner"
import { subscribeToNotifications } from "./notificationHandler"

subscribeToNotifications((notification) => {
  if (notification.type === "error") {
    toast.error(notification.message)
  } else if (notification.type === "success") {
    toast.success(notification.message)
  } else {
    toast(notification.message)
  }
})