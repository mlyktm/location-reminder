# location-reminder
Customizable reminders to set off when user arrives at specified location

Problem: On my commute to and from school, I always spend at least 3 minutes trying to curate the perfect queue of songs or select the right playlist for my mood. This can lead to me running late to classes, or listening to the same songs over and over again that don't always match what I'm feeling.

Solution: I want to quickly depict how I'm feeling and what type of music I'm looking for with a simple emoji. With _____, I can type in an emoji representing what I want to listen to, the duration of my drive, and receive a list of songs to queue for the commute.

Steps:
1. User inputs emoji and x duration (minutes)
2. System analyzes the emoji and converts it to key words using Gemini API
3. System uses the list of keywords to create a playlist of x minutes
4. Website will display the list of songs for the user
5. Website will also store the input emoji and the list of songs into a database for history tracking