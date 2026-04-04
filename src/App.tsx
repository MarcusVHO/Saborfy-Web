import {RouterProvider } from "react-router-dom";
import { router } from "./core/routes/routes";
import { toast, Toaster } from "sonner";
import { subscribeToNotifications } from "./core/notification/notificationHandler";

function App() {
  subscribeToNotifications((notification) => {
  console.log("🔥 chegou notificação:", notification)

  if (notification.type === "error") {
    toast.error(notification.message)
  } else if (notification.type === "success") {
    toast.success(notification.message)
  } else {
    toast(notification.message)
  }
})
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />

    </>

  )
}

export default App
