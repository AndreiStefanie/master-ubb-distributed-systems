# Smart Sound System

## Problem Statement

The main selling point of the smart sound system is that it adjusts the music volume based on the environment. It has two data sources:

- A motion sensor so it knows to slightly raise the volume when the owner is in another room
- A watch so it knows when to start/stop playing music.

The smart sound system will automatically increase the volume by 20% when it detects that there is no one in the room and reduce it to the initial value when movement is detected. It also has a buffer of 5 seconds before it adjusts the volume.

Additionally, the smart sound system will automatically turn itself on at 08:00 and turn itself off at 22:00.
