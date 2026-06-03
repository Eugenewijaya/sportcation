# UI/UX Flow: Sportcation Android MVP

## Purpose

This document defines the screen structure, navigation model, and user experience flow for the Sportcation Android MVP. It is product and UX documentation only. It does not define implementation code.

Sportcation is a mobile-first Android app for sports venue discovery and booking. The current Next.js landing app is used only as concept reference for brand tone, content direction, and feature ideas.

## 1. App Navigation Structure

### Navigation Principles

- The app should feel fast, direct, and mobile-first.
- Guests can discover venues but must authenticate before creating a booking.
- The primary booking path should be short: Explore -> Venue Detail -> Slot Selection -> Checkout -> Payment Simulation -> Booking Success.
- Bottom navigation is available only after splash and onboarding.
- Auth screens are outside the bottom navigation shell.
- Booking and profile flows use stack navigation on top of the bottom navigation shell.

### Root Navigation

Root navigation decides where the user starts.

1. Splash Screen.
2. If first app launch: Onboarding Screen.
3. If onboarding complete and user session exists: Home Screen.
4. If onboarding complete and no user session: Home Screen as guest.

### Bottom Navigation

Bottom navigation should contain five tabs:

1. Home.
2. Explore.
3. My Bookings.
4. Notifications.
5. Profile.

Behavior:

- Home and Explore are available to guests.
- My Bookings, Notifications, and Profile are protected.
- If a guest taps a protected tab, show an authentication prompt and route to Login or Register.
- After successful OTP verification, return the user to the originally requested tab or action.

### Stack Navigation

Main stack paths:

- Home -> Venue Detail -> Slot Selection -> Checkout -> Payment Simulation -> Booking Success -> QR Ticket.
- Explore -> Search Result -> Filter -> Venue Detail -> Slot Selection -> Checkout.
- My Bookings -> Booking Detail -> QR Ticket.
- Notifications -> Booking Detail.
- Profile -> Edit Profile.
- Profile -> Settings.
- Settings -> Login after logout.

Back behavior:

- Back from detail screens returns to the previous screen.
- Back from Checkout returns to Slot Selection.
- Back from Payment Simulation should be disabled while processing.
- Back from Booking Success should not return to Payment Simulation. It should go to Home or My Bookings.
- Back from QR Ticket returns to Booking Detail or Booking Success depending on entry point.

### Authentication Navigation

Authentication screens:

- Login Screen.
- Register Screen.
- OTP Verification Screen.

Auth flow:

1. User opens Login or Register.
2. User enters phone number or email.
3. App opens OTP Verification.
4. User enters OTP.
5. App validates OTP simulation.
6. App creates session.
7. App routes to the saved return destination or Home.

### Protected Screens

Protected screens require a registered session:

- Checkout Screen.
- Payment Simulation Screen.
- Booking Success Screen.
- QR Ticket Screen.
- My Bookings Screen.
- Booking Detail Screen.
- Notification Screen.
- Profile Screen.
- Edit Profile Screen.
- Settings Screen.

Slot Selection can be visible to guests for discovery, but continuing to Checkout requires authentication.

## 2. Screen List

### 1. Splash Screen

**Purpose**

Initialize app state and route users to onboarding, home, or restored session.

**Main Content**

- Sportcation logo.
- Short loading indicator.
- Optional brand tagline.

**Primary Actions**

- No manual action in normal flow.
- Auto-route after initialization.

**Empty State**

- Not applicable.

**Error State**

- If initialization fails, show "We could not start Sportcation. Please try again."
- Provide Retry button.

**Loading State**

- Show centered logo and progress indicator.

**Wireframe**

```text
[ Splash ]

        SPORTCATION
        Loading...

```

### 2. Onboarding Screen

**Purpose**

Introduce the value proposition and prepare the user for discovery and booking.

**Main Content**

- 2 to 3 slides.
- Slide 1: discover sports venues.
- Slide 2: choose available slots.
- Slide 3: checkout and receive booking code.
- Progress dots.

**Primary Actions**

- Continue.
- Skip.
- Get Started on final slide.

**Empty State**

- Not applicable.

**Error State**

- If onboarding content fails to load, show fallback local copy.

**Loading State**

- Usually not needed because content should be local.

**Wireframe**

```text
[ Onboarding ]

  [ Illustration / venue image ]

  Find sports venues near you
  Search, compare, and book courts in minutes.

        o  o  o

  [ Skip ]                    [ Continue ]
```

### 3. Login Screen

**Purpose**

Allow existing users to start authentication.

**Main Content**

- App logo.
- Phone/email input.
- Login CTA.
- Link to Register.
- Short terms text.

**Primary Actions**

- Continue to OTP.
- Navigate to Register.

**Empty State**

- Not applicable.

**Error State**

- Invalid phone/email: "Enter a valid phone number or email."
- Network/auth failure: "We could not send the OTP. Please try again."

**Loading State**

- Disable CTA and show "Sending OTP..."

**Wireframe**

```text
[ Login ]

  SPORTCATION

  Welcome back
  Phone number or email
  [ input field ]

  [ Send OTP ]

  New here? Create account
```

### 4. Register Screen

**Purpose**

Allow new users to create an account before OTP verification.

**Main Content**

- Name input.
- Phone/email input.
- Register CTA.
- Link to Login.

**Primary Actions**

- Continue to OTP.
- Navigate to Login.

**Empty State**

- Not applicable.

**Error State**

- Missing name: "Enter your name."
- Invalid phone/email: "Enter a valid phone number or email."
- Existing account: "This account already exists. Try logging in."

**Loading State**

- Disable CTA and show "Creating account..."

**Wireframe**

```text
[ Register ]

  Create your account

  Name
  [ input field ]

  Phone number or email
  [ input field ]

  [ Create Account ]

  Already registered? Login
```

### 5. OTP Verification Screen

**Purpose**

Verify user identity using simulated OTP for MVP.

**Main Content**

- OTP input.
- Destination label, such as phone/email.
- Countdown or resend option.

**Primary Actions**

- Verify OTP.
- Resend OTP.
- Change phone/email.

**Empty State**

- Not applicable.

**Error State**

- Wrong OTP: "That code is incorrect. Check and try again."
- Expired OTP: "This code has expired. Request a new one."

**Loading State**

- Disable input and show "Verifying..."

**Wireframe**

```text
[ OTP Verification ]

  Enter verification code
  Sent to user@email.com

  [ _ ] [ _ ] [ _ ] [ _ ] [ _ ] [ _ ]

  Resend in 00:30

  [ Verify ]
```

### 6. Home Screen

**Purpose**

Serve as the main dashboard and discovery entry point.

**Main Content**

- Location header.
- Greeting.
- Search entry.
- Sport category shortcuts.
- Featured venues.
- Recommended venues.
- Promotional placeholder.

**Primary Actions**

- Search venue.
- Open Explore.
- Tap category.
- Open venue detail.

**Empty State**

- If no featured venues exist, show "No featured venues yet. Explore all venues."

**Error State**

- If venue data fails, show retry card without blocking bottom navigation.

**Loading State**

- Skeleton cards for categories and venue cards.

**Wireframe**

```text
[ Home ]

  Jakarta                 [ bell ] [ avatar ]
  SPORTCATION

  [ Search venue, sport, or area ]

  Categories
  [Padel] [Futsal] [Tennis] [Badminton]

  Featured
  [ Venue card ]
  [ Venue card ]

  Recommended
  [ Wide venue card ]

  Bottom Nav: Home | Explore | Bookings | Notifications | Profile
```

### 7. Explore Screen

**Purpose**

Show the main venue browsing experience.

**Main Content**

- Search bar.
- Filter button.
- Sport chips.
- Venue list.

**Primary Actions**

- Search.
- Open Filter.
- Select sport chip.
- Open venue detail.

**Empty State**

- "No venues found. Try changing filters."

**Error State**

- "Could not load venues. Try again."

**Loading State**

- Venue card skeleton list.

**Wireframe**

```text
[ Explore ]

  Find Your Next Arena

  [ Search venues, sports, or areas ] [ Filter ]

  [All] [Padel] [Futsal] [Tennis]

  [ Venue card: image, name, rating, price ]
  [ Venue card: image, name, rating, price ]
  [ Venue card: image, name, rating, price ]

  Bottom Nav
```

### 8. Search Result Screen

**Purpose**

Display focused search results from a keyword or selected category.

**Main Content**

- Search query field.
- Result count.
- Active filter chips.
- Result list.

**Primary Actions**

- Edit search query.
- Clear query.
- Open Filter.
- Open venue detail.

**Empty State**

- "No result for this search. Try another sport, area, or venue name."

**Error State**

- "Search failed. Please try again."

**Loading State**

- Search results skeleton.

**Wireframe**

```text
[ Search Results ]

  [ padel jakarta              x ]
  12 results

  Active filters: [Padel] [Jakarta] [Under Rp 400k]

  [ Venue result card ]
  [ Venue result card ]
  [ Venue result card ]
```

### 9. Filter Screen

**Purpose**

Let users refine venue results.

**Main Content**

- Sport type selector.
- Location/area selector.
- Price range.
- Rating selector.
- Date selector.
- Time availability selector.

**Primary Actions**

- Apply filters.
- Reset filters.
- Close.

**Empty State**

- Not applicable.

**Error State**

- Invalid filter combination should show "No venues match these filters. Try broadening your search."

**Loading State**

- Not needed unless filter options come from remote data.

**Wireframe**

```text
[ Filter ]

  Sport
  [Padel] [Futsal] [Tennis] [Badminton]

  Area
  [ Jakarta Selatan v ]

  Price
  Rp 0 ---------------- Rp 500.000+

  Rating
  [4.0+] [4.5+] [Any]

  Date
  [ Today ] [ Tomorrow ] [ Pick date ]

  [ Reset ]                 [ Apply Filters ]
```

### 10. Venue Detail Screen

**Purpose**

Show all venue information needed before slot selection.

**Main Content**

- Venue hero image.
- Name, sport type, rating, location.
- Price per hour.
- Facility chips.
- Description.
- Address/map placeholder.
- Preview of available dates or slots.

**Primary Actions**

- Select slot.
- Favorite venue if included later.
- Share venue if included later.

**Empty State**

- If venue data is missing, show "Venue details are unavailable."

**Error State**

- "Could not load venue detail. Try again."

**Loading State**

- Hero image skeleton and text skeleton.

**Wireframe**

```text
[ Venue Detail ]

  < Back                  [ share ] [ heart ]

  [ Large venue image ]

  PadelHub Jakarta Selatan
  4.9 rating   Kebayoran Baru
  Rp 350.000 / hour

  Facilities
  [Parking] [Locker] [Shower] [Indoor]

  About
  Premium padel facility with indoor courts.

  Location
  [ Map placeholder ]

  [ Select Slot ]
```

### 11. Slot Selection Screen

**Purpose**

Let users choose date and time before checkout.

**Main Content**

- Selected venue summary.
- Horizontal date selector.
- Slot grid.
- Slot status legend.
- Selected slot summary.

**Primary Actions**

- Select date.
- Select available slot.
- Continue to checkout.

**Empty State**

- "No slots available for this date. Try another day."

**Error State**

- "Could not load slot availability. Try again."

**Loading State**

- Date and slot skeleton blocks.

**Wireframe**

```text
[ Slot Selection ]

  PadelHub Jakarta Selatan
  Rp 350.000 / hour

  Choose date
  [Oct 24] [Oct 25] [Oct 26] [Oct 27]

  Choose time
  [08:00 Available] [09:00 Booked]
  [10:00 Selected ] [11:00 Available]
  [12:00 Available] [13:00 Booked]

  Selected: Oct 24, 10:00 - 11:00

  [ Continue ]
```

### 12. Checkout Screen

**Purpose**

Let the user review booking details and choose payment simulation method.

**Main Content**

- Booking summary.
- Venue name and address.
- Date and time.
- Court/facility label.
- Voucher placeholder.
- Payment method selector.
- Price breakdown.

**Primary Actions**

- Select payment method.
- Pay now.
- Go back to slot selection.

**Empty State**

- If no booking draft exists, show "No booking to checkout. Choose a venue first."

**Error State**

- Missing payment method: "Choose a payment method to continue."
- Expired slot: "This slot is no longer available. Pick another slot."

**Loading State**

- Booking summary skeleton.

**Wireframe**

```text
[ Checkout ]

  Review & Checkout

  Booking
  Padel Arena
  Sat, 24 Oct
  10:00 - 11:00

  Voucher
  [ Enter promo code ] [ Apply ]

  Payment Method
  ( ) QRIS / OVO
  ( ) Virtual Account

  Summary
  Court fee       Rp 350.000
  Service fee     Rp 15.000
  Total           Rp 365.000

  [ Pay Now ]
```

### 13. Payment Simulation Screen

**Purpose**

Simulate payment processing and route to success or failure.

**Main Content**

- Selected payment method.
- Total amount.
- Payment instruction placeholder.
- Processing status.

**Primary Actions**

- Simulate success.
- Simulate failure for testing if enabled.
- Retry after failure.

**Empty State**

- If no active checkout exists, show "No payment session found."

**Error State**

- "Payment failed. You can retry or choose another method."

**Loading State**

- "Processing payment..." with disabled back and disabled CTA.

**Wireframe**

```text
[ Payment Simulation ]

  Payment

  QRIS / OVO
  Total Rp 365.000

  [ QR / instruction placeholder ]

  Status: Waiting for payment

  [ Simulate Success ]
  [ Simulate Failure ]
```

### 14. Booking Success Screen

**Purpose**

Confirm successful booking and guide user to ticket or home.

**Main Content**

- Success icon.
- Booking ID.
- Venue summary.
- Date and time.
- Total payment.

**Primary Actions**

- View Ticket.
- View My Bookings.
- Back to Home.

**Empty State**

- Not applicable.

**Error State**

- If booking confirmation cannot be retrieved, show "Payment succeeded, but we could not load booking details. Check My Bookings."

**Loading State**

- Confirmation loading state after payment success.

**Wireframe**

```text
[ Booking Success ]

       [ Check icon ]

  Booking Confirmed
  ID: SP-77291

  Padel Arena
  24 Oct 2026
  10:00 - 11:00

  Total Rp 365.000

  [ View Ticket ]
  [ Back to Home ]
```

### 15. QR Ticket Screen

**Purpose**

Show proof of booking for venue check-in.

**Main Content**

- Booking code.
- QR placeholder or generated QR from booking code.
- Venue name.
- Date and time.
- Check-in instructions.

**Primary Actions**

- Show ticket.
- Save/share if added later.
- Back to booking detail.

**Empty State**

- If booking is not confirmed, show "Ticket is available after booking confirmation."

**Error State**

- "Could not load ticket. Try again."

**Loading State**

- QR placeholder skeleton.

**Wireframe**

```text
[ QR Ticket ]

  Booking Code
  SP-77291

  [ QR Code Placeholder ]

  Padel Arena
  24 Oct 2026, 10:00

  Show this code to venue staff at check-in.

  [ Done ]
```

### 16. My Bookings Screen

**Purpose**

Let users view upcoming, past, and cancelled bookings.

**Main Content**

- Tabs: Upcoming, Past, Cancelled.
- Booking cards.
- Status labels.

**Primary Actions**

- Open booking detail.
- View ticket for confirmed upcoming booking.
- Start exploring if no bookings.

**Empty State**

- "No bookings yet. Find a venue and book your first slot."

**Error State**

- "Could not load bookings. Try again."

**Loading State**

- Booking card skeleton list.

**Wireframe**

```text
[ My Bookings ]

  My Bookings

  [Upcoming] [Past] [Cancelled]

  [ Confirmed ]
  PadelHub Senayan
  Sat, 24 Oct   08:00 - 10:00
  Rp 350.000
  [ Manage ] [ Ticket ]

  [ Completed ]
  Arena Soccer Park
```

### 17. Booking Detail Screen

**Purpose**

Show complete booking information and available management actions.

**Main Content**

- Booking status.
- Venue summary.
- Date and time.
- Payment summary.
- Booking code.
- Ticket entry.
- Cancellation information.

**Primary Actions**

- View QR Ticket.
- Cancel booking if allowed by MVP rules.
- Contact support placeholder.

**Empty State**

- If booking no longer exists, show "Booking not found."

**Error State**

- "Could not load booking detail. Try again."

**Loading State**

- Booking detail skeleton.

**Wireframe**

```text
[ Booking Detail ]

  Confirmed

  PadelHub Senayan
  Court 04
  Sat, 24 Oct 2026
  08:00 - 10:00

  Payment
  Court fee       Rp 350.000
  Service fee     Rp 15.000
  Total           Rp 365.000

  Booking Code: SP-77291

  [ View QR Ticket ]
  [ Cancel Booking ]
```

### 18. Notification Screen

**Purpose**

Show in-app updates related to booking and payment activity.

**Main Content**

- Notification list.
- Read/unread indicators.
- Notification type icons.
- Timestamp.

**Primary Actions**

- Open related booking.
- Mark all as read.
- Refresh.

**Empty State**

- "No notifications yet. Booking updates will appear here."

**Error State**

- "Could not load notifications. Try again."

**Loading State**

- Notification item skeletons.

**Wireframe**

```text
[ Notifications ]

  Updates                  [ Mark all read ]

  [ unread ] Booking Confirmed
  Your session at Padel Arena is locked in.
  2m ago

  [ read ] Payment Successful
  Payment for SP-77291 was confirmed.
  1h ago
```

### 19. Profile Screen

**Purpose**

Show user account summary and entry points to account features.

**Main Content**

- Avatar placeholder.
- Name.
- Email/phone.
- Booking count.
- Menu items.

**Primary Actions**

- Edit profile.
- Open Settings.
- Open Notifications.
- Logout.

**Empty State**

- If profile is incomplete, show prompt to complete profile.

**Error State**

- "Could not load profile. Try again."

**Loading State**

- Profile header and menu skeletons.

**Wireframe**

```text
[ Profile ]

  [ Avatar ]
  Alex Rivera
  alex@sportcation.com

  [ 12 Bookings ] [ 4 Upcoming ]

  > Edit Profile
  > Payment Methods Placeholder
  > Notifications
  > Settings
  > Help Center

  [ Logout ]
```

### 20. Edit Profile Screen

**Purpose**

Allow users to update basic account information.

**Main Content**

- Avatar placeholder.
- Name input.
- Email or phone display.
- Optional city/location field.

**Primary Actions**

- Save changes.
- Cancel.

**Empty State**

- Not applicable.

**Error State**

- Missing name: "Name cannot be empty."
- Save failure: "Could not save profile. Try again."

**Loading State**

- Disable Save and show "Saving..."

**Wireframe**

```text
[ Edit Profile ]

  [ Avatar ]  Change photo placeholder

  Name
  [ Alex Rivera ]

  Email
  [ alex@sportcation.com ]

  City
  [ Jakarta ]

  [ Save Changes ]
```

### 21. Settings Screen

**Purpose**

Provide basic app preferences and account management.

**Main Content**

- Personal info entry.
- Notification preference.
- Language placeholder.
- Privacy and security placeholder.
- Help center placeholder.
- Logout.

**Primary Actions**

- Toggle notifications.
- Open privacy/help placeholders.
- Logout.

**Empty State**

- Not applicable.

**Error State**

- If settings fail to save, show "Could not update settings. Try again."

**Loading State**

- Settings list skeleton if remote settings are used later.

**Wireframe**

```text
[ Settings ]

  Account
  > Personal Info

  Preferences
  Notifications        [ on/off ]
  Language             English

  Privacy & Security
  > Privacy Center
  > Change Password Placeholder

  Support
  > Help Center

  [ Logout ]
```

## 3. Main User Journeys

### First-Time User Journey

1. User opens app.
2. Splash loads app state.
3. Onboarding appears.
4. User reviews value proposition or skips.
5. User lands on Home as guest.
6. User browses featured venues or opens Explore.
7. User can view venue detail.
8. User is prompted to log in or register when trying to continue booking.

### Returning User Journey

1. User opens app.
2. Splash checks saved onboarding and session state.
3. If session exists, user lands on Home.
4. User can continue discovery, view bookings, open notifications, or manage profile.
5. If session expired, protected routes redirect to Login.

### Explore and Booking Journey

1. User opens Explore.
2. User searches by sport, venue name, or area.
3. User applies filters.
4. User selects a venue.
5. User reviews venue detail.
6. User opens Slot Selection.
7. User selects date and available slot.
8. User continues to Checkout.
9. If guest, user completes Login/Register/OTP first.

### Payment Journey

1. User reviews booking on Checkout.
2. User selects simulated payment method.
3. User taps Pay Now.
4. Payment Simulation screen opens.
5. App shows payment instructions and processing state.
6. User triggers success in simulation.
7. App confirms booking.
8. Booking Success screen appears.
9. User opens QR Ticket or My Bookings.

### Booking Cancellation Journey

MVP cancellation should be simple and rule-based.

1. User opens My Bookings.
2. User opens an upcoming booking.
3. User taps Cancel Booking if cancellation is allowed.
4. App shows confirmation dialog.
5. User confirms cancellation.
6. Booking status changes to Cancelled.
7. Notification is created.
8. User returns to Booking Detail or My Bookings.

If cancellation is not included in the first build, show cancellation as a disabled action with "Cancellation will be available soon."

### Profile Update Journey

1. User opens Profile.
2. User taps Edit Profile.
3. User updates name or city.
4. User taps Save Changes.
5. App validates input.
6. App saves locally or through backend when available.
7. User returns to Profile with updated data.

## 4. UX Rules

### Mobile-First Layout

- Use one primary column.
- Keep main CTAs reachable near the bottom.
- Use sticky bottom CTAs for booking steps.
- Avoid dense tables.
- Use cards, chips, segmented tabs, and bottom sheets for mobile ergonomics.
- Keep touch targets at least 44dp.

### Clear CTA

- Each screen should have one obvious primary action.
- Booking steps should use direct CTAs: Select Slot, Continue, Pay Now, View Ticket.
- Avoid vague CTA labels.
- Use disabled states when required inputs are missing.

### Minimal Booking Steps

The ideal MVP booking flow:

1. Select venue.
2. Select slot.
3. Review checkout.
4. Simulate payment.
5. Receive booking code.

Do not add resell, auction, wallet, or voucher complexity into the primary MVP booking path.

### User-Friendly Error Messages

- Use plain language.
- Explain what happened and what the user can do next.
- Avoid technical error messages.
- Keep error messages short.

Examples:

- "This slot is no longer available. Pick another time."
- "We could not load venues. Check your connection and try again."
- "Choose a payment method to continue."
- "Your code is incorrect. Check and try again."

### Consistent Navigation

- Use bottom navigation for top-level areas only.
- Use back navigation for detail and booking stack screens.
- Do not show bottom navigation on Login, Register, OTP, Splash, or Onboarding.
- Payment processing should prevent accidental back navigation.
- Booking Success should route forward to Home, My Bookings, or QR Ticket, not back to Payment Simulation.

### State Consistency

- Loading states should appear before empty or error states.
- Empty states should always include a useful next action.
- Error states should include Retry when the issue can be retried.
- Protected screens should never show partial private data to guests.

## 5. Wireframe Description

### Global Layout Pattern

Most authenticated screens should follow this layout:

```text
[ Top App Bar ]
[ Main content area ]
[ Sticky CTA when needed ]
[ Bottom Navigation for top-level screens ]
```

### Splash Screen Wireframe

```text
Full screen
- Center logo
- Small loading indicator below logo
- No bottom navigation
```

### Onboarding Screen Wireframe

```text
Full screen
- Illustration area at top
- Headline and body text in middle
- Progress dots below copy
- Skip on left, Continue/Get Started on right
- No bottom navigation
```

### Login Screen Wireframe

```text
Full screen
- Logo at top
- Welcome headline
- Phone/email input
- Send OTP CTA
- Register link
- Terms text at bottom
```

### Register Screen Wireframe

```text
Full screen
- Create account headline
- Name input
- Phone/email input
- Create Account CTA
- Login link
```

### OTP Verification Screen Wireframe

```text
Full screen
- Verification headline
- Destination text
- Six-digit OTP input
- Resend timer
- Verify CTA
```

### Home Screen Wireframe

```text
Bottom nav screen
- Location and profile header
- Search entry
- Horizontal sport category shortcuts
- Featured promotion or venue carousel
- Recommended venue cards
- Bottom navigation
```

### Explore Screen Wireframe

```text
Bottom nav screen
- Page headline
- Search bar and filter button
- Horizontal sport chips
- Vertical venue cards
- Bottom navigation
```

### Search Result Screen Wireframe

```text
Stack screen
- Back button
- Search field with current query
- Result count
- Active filter chips
- Result list
```

### Filter Screen Wireframe

```text
Modal or full screen
- Close button
- Filter sections
- Sport chips
- Area selector
- Price slider
- Rating options
- Date/time options
- Reset and Apply buttons
```

### Venue Detail Screen Wireframe

```text
Stack screen
- Back button over or above hero image
- Large venue image
- Venue title and metadata
- Facility chips
- Description
- Address/map placeholder
- Sticky Select Slot CTA
```

### Slot Selection Screen Wireframe

```text
Stack screen
- Venue summary
- Date selector row
- Slot grid
- Status legend
- Selected slot summary
- Sticky Continue CTA
```

### Checkout Screen Wireframe

```text
Stack screen
- Review title
- Booking summary card
- Voucher placeholder
- Payment method list
- Payment summary card
- Sticky Pay Now CTA
```

### Payment Simulation Screen Wireframe

```text
Stack screen
- Payment method title
- Total amount
- Instruction/QR placeholder
- Payment status
- Simulation actions
- Back disabled during processing
```

### Booking Success Screen Wireframe

```text
Full screen confirmation
- Success icon
- Booking confirmed headline
- Booking ID
- Booking summary card
- View Ticket CTA
- Back to Home secondary action
```

### QR Ticket Screen Wireframe

```text
Stack screen
- Booking code
- QR code area
- Venue/date/time summary
- Check-in instruction
- Done CTA
```

### My Bookings Screen Wireframe

```text
Bottom nav screen
- Page title
- Tabs for Upcoming, Past, Cancelled
- Booking cards
- Empty state card when no bookings
- Bottom navigation
```

### Booking Detail Screen Wireframe

```text
Stack screen
- Status badge
- Venue and schedule section
- Payment section
- Booking code section
- View Ticket CTA
- Cancel Booking action when allowed
```

### Notification Screen Wireframe

```text
Bottom nav screen
- Page title
- Mark all read action
- Notification list
- Empty state when no notifications
- Bottom navigation
```

### Profile Screen Wireframe

```text
Bottom nav screen
- Avatar
- Name and email/phone
- Simple stats
- Menu list
- Logout button
- Bottom navigation
```

### Edit Profile Screen Wireframe

```text
Stack screen
- Avatar placeholder
- Name input
- Email/phone display
- City input
- Save Changes CTA
```

### Settings Screen Wireframe

```text
Stack screen
- Account section
- Preferences section
- Privacy and security section
- Support section
- Logout button
```

## MVP UX Boundaries

- Do not include auction, wallet, voucher redemption, or resale as primary MVP screens.
- Voucher can appear only as a disabled or placeholder field in Checkout.
- Payment is simulation-only.
- QR ticket can start as a booking-code-based placeholder.
- Profile and Settings should be functional but minimal.
- Venue owner and admin screens are out of scope for the Android MVP app flow.
