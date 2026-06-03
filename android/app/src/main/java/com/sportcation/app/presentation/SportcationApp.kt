package com.sportcation.app.presentation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.navigation.SportcationNavGraph
import com.sportcation.app.ui.theme.SportcationTheme

@Composable
fun SportcationApp() {
    SportcationTheme {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            SportcationNavGraph()
        }
    }
}
