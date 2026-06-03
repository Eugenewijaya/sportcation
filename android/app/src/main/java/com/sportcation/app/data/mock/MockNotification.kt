package com.sportcation.app.data.mock

typealias MockNotification = Notification
typealias MockNotificationType = NotificationType

object MockNotificationRepository {
    val notifications: List<Notification>
        get() = MockSportcationData.notifications
}
