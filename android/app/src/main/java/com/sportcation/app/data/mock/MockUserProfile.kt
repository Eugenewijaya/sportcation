package com.sportcation.app.data.mock

typealias MockUserProfile = User

object MockUserProfileRepository {
    val profile: User
        get() = MockSportcationData.user
}
