Install node modules:

`npm install`



Run the project using: `npm start`



for player 1, you can access the page  though:

http://127.0.0.1:990/17Soldier/gameId1



for player 2:

http://127.0.0.1:990/17Soldier/gameId1



for player3 the same URL will show an error 





You can start multiple games in parallel at the same time.

for game 2 you can use another URL:

http://127.0.0.1:990/17Soldier/<unique_game_id>



The only limitation is that you cannot revisit any of the URLs that you used previously until you close the ruining server and restart them.

and it's happening because when a user closes the tab, I am not destroying the existing room attached to those players.

so the system always thinks that the user still inside the room.

