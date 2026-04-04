type NotificationType = "success" | "error" | "info" | "warning"

type Notification = {
  type: NotificationType
  message: string
}

type Listener = (notification: Notification) => void

let listeners: Listener[] = []

export function subscribeToNotifications(listener: Listener) {
  listeners = [listener]
}

export function notify(notification: Notification) {
  listeners.forEach((listener) => listener(notification))
}