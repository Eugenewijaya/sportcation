package com.sportcation.app.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Search venues, sports, or areas",
    onSearchClick: (() -> Unit)? = null
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Bottom,
        horizontalArrangement = Arrangement.spacedBy(AppSpacing.sm)
    ) {
        AppTextField(
            value = query,
            onValueChange = onQueryChange,
            label = "Search",
            placeholder = placeholder,
            modifier = Modifier.weight(1f)
        )
        if (onSearchClick != null) {
            AppButton(
                label = "Search",
                onClick = onSearchClick,
                modifier = Modifier.height(56.dp)
            )
        }
    }
}
