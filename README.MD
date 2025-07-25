# This is a demo for Airlines

## Use cases

### RCS Branded Text
Send
```
bt
```
Will respond with a simple text message and a URL you can click on.

### RCS Text & Suggestions
Send
```
t&s
```
Will respond with a text and 2 buttons.
One of the buttons will be a link to https://vonage.com

### RCS Rich Card
Send
```
rc
```
Will respond with a simple card and an image related to airline

### RCS Rich Card Carousel
Send
```
rcc
```
Will respond with a Carousel with images related to airline


# Airline Use Cases
Some use cases for airline business. All of them are in conversational mode.

# Late flight
Send
```
lf Walter
```
Will start a conversation about a flight being late.
Enter your name so it can be used in the conversation.

Agent will respond:

``` 
Hi, [Name]

We wanted to let you know that your flight VON-345 has been delayed.
We’re sorry for the inconvenience and will share the new departure time soon.

Would you like assistance with rebooking or airport lounge access?

[Buttons: Rebook / Lounge Access / No, thanks]
```

#### User selects ```Rebook```
Agent will respond:
```
Thanks, [Name]. Let’s help you find a new flight.

Can you please confirm your preferred departure time or let me know if you're flexible with travel times?

[Buttons: Morning / Afternoon / Evening/ I'm flexible]
```

#### User selects one of the times
Agents will respond:
```
Great. We’re checking for flights departing in the morning.
One moment...
```

#### User selects I'm Flexible
Agents will respond:
```
Thanks. We’ll show you the best available flights today.
Please hold while we search...
```

#### After brief delay with API result...
Message:
```
Here are available options:
Which one works best for you?

[ Buttons: Flight 123 / Flight 456 ]
```

#### User selects any of the options
The process should wait for some 2 seconds and then:
```
You're all set!

Your flight has been rebooked to Flight 123, departing at 08:10
We’ve sent your updated itinerary to your email.
Would you like help arranging transport to the airport?

[Buttons: Yes, book transport / Email me the details again / No, I’m good]
```

#### If user selects to book transform
The process should wait for some seconds and then:
```
Transport Confirmed

A private transport under your name will arrive outside the arrivals area.

- Driver’s Name: Carlos Mendes
- Plate Number: RWA-756G

You’ll receive a message when the vehicle is nearby.

Safe travels, [Name]! Let us know if you need anything else.
```

#### User selects ```Lounge Access```
Agent will respond:
```
We’d be happy to help you relax while you wait, [Name].
Would you prefer a lounge with food & drinks or one with a quiet workspace?

[Buttons: Food & Drinks / Quiet Workspace / Either is fine]
```

#### User selects any of the options
Agents responds (showing a Rich card with the Lounge entrance):
```
Thanks! We’ve reserved a spot for you at:

- SkyPort Lounge
- Access: From now until departure
- Includes: Food, drinks, Wi-Fi, and comfortable seating
📍 Location: Terminal 2, near Gate 14

You’ll receive a QR code shortly for entry.
Would you like a reminder 30 minutes before boarding?

[Buttons: Yes, please / No, thank you]
```

#### User selects "Yes, please"
Agents responds: 
```
Great! We’ll send you a boarding reminder 30 minutes before departure.
Enjoy the lounge, [Name], and don’t hesitate to reach out if you need anything.
```

#### User selects "No, thank you"
Agents responds: 
```
No problem. Your lounge access is confirmed.
Let us know if you’d like any other assistance while you wait.
```


# Flight Services
This example is for having a conversation to 
- Upsel seats.
- Set food preferences

Send:
```
fs Walter
```
Use your name so the message is personal.
Agent will answer with:
```
Hi [Name] 👋
Your flight VON-345 is confirmed! Would you like to:

[BUTTONS: Upgrade Your Seat / Set Food Preferences / No, thanks]
```

### User selects "Upgrade Your Seat" 
Agent responds:
```
We have a few premium seats available:

[Carousel with pictures of the seats: Extra legroom – £25 / Window + quiet zone – £30 / No thanks]
```

#### If a seat is selected:
Agent responds:
```
Great choice! We've reserved your upgraded seat.
A payment link has been sent to your email to complete the booking.
```

## If "Set Food Preferences" is selected
Agent responds:
```
Please choose your preferred in-flight meal:

[Carousel with a picture of the meals: Vegetarian / Chicken / Fish / No meal]
```

#### After food selection:
Agent says:
```
Thanks, [Name]. Your meal preference has been recorded.
You can update it anytime before check-in.
```

# Powerful Implementation
With RCS you can use powerful tools, like you do in your mobile or desktop application.

#### Read Business Cards
```
Upload any picture of a business card or anything with a clear text
```
Will read the text and return it back.

#### Show your address (PENDING)
Send
```
location
```
Will respond with a button to share your location.
Once you share your location, the system will respond with the closest address.



