// https://github.com/zo0r/react-native-push-notification (main)
// https://github.com/react-native-push-notification

/* GUIDE:

1. install:
   import PushNotificationIOS from "@react-native-community/push-notification-ios";
   import PushNotification from "react-native-push-notification";

2. npx pod-install

3. AppDelegate.h:
    add to top: #import <UserNotifications/UNUserNotificationCenter.h>
    edit: @interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate>

4. AppDelegate.mm:
    https://github.com/react-native-push-notification/ios#update-appdelegatem-or-appdelegatemm

5. add Push Notification on XCode

6. (options?) add to plist: NSUserNotificationsUsageDescription

*/

// import PushNotificationIOS from "@react-native-community/push-notification-ios";

// @ts-ignore
import PushNotification from "react-native-push-notification";

export type NotificationOption = {
  msg: string,
}

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
  // // (optional) Called when Token is generated (iOS and Android)
  // onRegister: function (token) {
  //   console.log("TOKEN:", token);
  // },

  // // (required) Called when a remote is received or opened, or local notification is opened
  // onNotification: function (notification) {
  //   console.log("NOTIFICATION:", notification);

  //   // process the notification

  //   // (required) Called when a remote is received or opened, or local notification is opened
  //   notification.finish(PushNotificationIOS.FetchResult.NoData);
  // },

  // // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  // onAction: function (notification) {
  //   console.log("ACTION:", notification.action);
  //   console.log("NOTIFICATION:", notification);

  //   // process the action
  // },

  // // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  // onRegistrationError: function (err) {
  //   console.error(err.message, err);
  // },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },

  // Should the initial notification be popped automatically
  // default: true
  popInitialNotification: true,

  /**
   * (optional) default: true
   * - Specified if permissions (ios) and token (android and ios) will requested or not,
   * - if not, you must call PushNotificationsHandler.requestPermissions() later
   * - if you are not using remote notification or do not have Firebase installed, use this:
   *     requestPermissions: Platform.OS === 'ios'
   */
  requestPermissions: true,
});

export const cancelAllLocalNotifications = () => {
  PushNotification.cancelAllLocalNotifications()
}

/**
 * https://github.com/zo0r/react-native-push-notification#scheduled-notifications
 */
export const setNotification = ( // main
  targetTimeMS: number, 
  msgOrOptions: string | NotificationOption) => {
  const msg = typeof msgOrOptions === 'string' ? msgOrOptions : msgOrOptions.msg

  if (!msg)
    throw 'Notification msg is undefined!'

  if (targetTimeMS < Date.now())
    return

  PushNotification.localNotificationSchedule({
    message: msg,
    date: new Date(targetTimeMS),
  });
}

/**
 * 
 * @param {*} options { msg: 'Hihi' }
 */
export const setNotification_RemainSeconds = (  // sub
  seconds: number,
  msgOrOptions: string | NotificationOption) => {
  setNotification(Date.now() + seconds * 1000, msgOrOptions)
}