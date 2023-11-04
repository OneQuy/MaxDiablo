// https://notifee.app/react-native/docs

import notifee, { Notification, TimestampTrigger, TriggerType } from '@notifee/react-native';

export type NotificationOption = {
  message: string,
  title: string,
  timestamp?: number,
}

var channelId: string
var inited: boolean = false

export const initNotificationAsync = async () => {
  if (inited)
    return

  inited = true

  // Create a channel (required for Android)
  channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Request permissions (required for iOS)
  await notifee.requestPermission()
}

export const cancelAllLocalNotifications = () => {
  notifee.cancelAllNotifications()
}

export const setNotification = (option: NotificationOption) => { // main
  if (typeof option.timestamp !== 'number' ||
    !option.message ||
    !option.title)
    throw 'Notification option is invalid'

  if (option.timestamp < Date.now())
    return

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: option.timestamp,
  }

  notifee.createTriggerNotification(
    {
      title: option.title,
      body: option.message,
      android: { channelId },
    } as Notification,

    trigger,
  );
}

export const setNotification_RemainSeconds = (  // sub
  seconds: number,
  option: NotificationOption) => {
  setNotification({
    ...option,
    timestamp: Date.now() + seconds * 1000
  })
}