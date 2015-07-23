/***************************** 
  actual game mechanics 
*****************************/
var row = 6, col = 7, board = {}, turn = 'A', victor, localPlay = true, lastPlacement, info;
var teamVotes = {'A': {votes: {}}, 'B': {votes: {}}};
function keyStr (r, c) { return (r.toString() + c.toString()); }

function buildBoard() {
  var r = row, c = col, key='';
  while (c) {
    while (r) {
      key = keyStr(r, c);
      board[key] = ' ';
      r -=1;
    }
    r = row; c -= 1;
  }
}

function showBoard() {
  board = board || {};
  var p = ("\n_______________\n");
  for(var key in board) {
    board[key] = board[key] || ' ';
    p += ('|' + board[key]);
    if (key[1] >= col) {
      p += ('|\n---------------\n');
    }
  }
  console.log(p);
}

function turnCheck(team) {
  if (turn != team) {
    console.log(turn + "'s turn");
    return false;
  } else {
    return true;
  }
}

function placeCheck(placementRow) {
  if (placementRow > 7) { console.log('Too high'); return false; }
  if (placementRow < 0) { console.log('Too low'); return false; }
  if (typeof placementRow !== "number" || placementRow % 1 > 0) {
    console.log('Not an int'); return false;
  }
  return true;
}

function place(team, placementRow) {
  var c = col, key;
  if (!placeCheck(placementRow)) {
    console.log("Must place again");
    return false; 
  }
  while ((turn === team) && c && c <= col) {
    key = keyStr(c, placementRow);
    if (board[key] === ' ') {
      board[key] = team;
      lastPlacement = key;
      if (localPlay) {
        return isWin(team, maxDistance(team, key) > 3); 
      }
    }
    c -= 1;
  }
  return false;
}

function maxDistance(team, key) {
  var checkR, checkC, checkKey, diff = 0, max = 0,
      point0, point1;
  var dirs = [[[-1, 0], [1, 0]],
              [[0, -1], [0, 1]],
              [[-1, -1], [1, 1]],
              [[-1, 1], [1, -1]]];
  
  // move out in each direction
  dirs.forEach( function(current, index, arr) {
    current.forEach ( function(c, i, a) {
      dirs[index][i][2] = lengthCheck(team, key, c[0], c[1]);
    });
  });
  
  // measure each directional difference
  dirs.forEach( function(current, index, arr) {
    point0 = (current[0][2]).toString();
    point1 = (current[1][2]).toString();
    diffCol = Math.abs(point0[0] - point1[0]);
    diffRow = Math.abs(point0[1] - point1[1]);
    max = (diffCol > max) ? diffCol : max;
    max = diffRow > max ? diffRow : max;
  });
  return (max + 1);
}

// determine the match that is the maximum distance in a given direction
function lengthCheck(team, key, c, r) {
  max = key;
  do {
    checkKey = keyStr(parseInt(max[0]) + c, parseInt(max[1]) + r);
    if (board[checkKey] === team) {
      max = checkKey;
      flag = true;
    } else { flag = false; }
  } while (flag);    
  return max;   
}

function isWin(team, win) {
  win = win || false;
  if (!win) {
    showBoard();
    return false;
  } else {
    showBoard();
    console.log(team + " wins!");
    (window.updates || function() {})();
    //buildBoard();
    return team;
  }
}

function play(team, placementRow) {
  if (Object.getOwnPropertyNames(board).length === 0) {  
    buildBoard (); 
  }
  if (!turnCheck(team)) { return; }
  var isWon = place(team, placementRow);
  turn = (turn == 'A') ? 'B' : 'A';
  return isWon;
}


/***************************** 
  two person game play
*****************************/

function console4 () {
  var winner;
  var loopProtection = 42;
  while (loopProtection) {
    // noprotect
    if (play('A', prompt("A's turn. Which column?"))) { break; }
    if (play('B', prompt("B's turn. Which column?"))) { break; }
    loopProtection -= 1;
  }
  console.log('GAME OVER!');
}

//console4();


/***************************** 
  team game play
*****************************/

function tallyVotes(votes) {
  var votesObj = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 };
  var maxVal = 0, maxVotes = 0, tieFlag = false, self;
  votes.forEach(function (current, index, array) {
		if(current){ // SEAN! This is where we ignore nulls!
			votesObj[current] += 1;
		}
  });
  for (var obj in votesObj) {
    if (maxVotes > votesObj[obj]) {
    } else if ( maxVotes == votesObj[obj] ) { 
      tieFlag = 'tie';
    } else { 
      tieFlag = false; 
      maxVal = obj;
      maxVotes = votesObj[obj];
    }
  }
  self = tieFlag ? tieFlag : maxVal;
  return self;
}

function teamPlay(team, votes) {
  var teamVote = tallyVotes(votes);
  if (teamVote == 'tie' || !teamVote) {
    console.log(info = teamVote + " : Must vote again");
    return 'tie'; 
  } else {
    return play(team, parseInt(teamVote));
  }
}
                              
function teamVoting(id, team, vote, members) {
  if (!team) { return 'MUST HAVE A TEAM AFFILIATION'; }
  if (!vote) { return 'MUST HAVE A MEMBER VOTE'; }
  if(!members){ return 'MUST HAVE MEMBER COUNT'; }
  
  teamVotes[team].votes[id] = vote;
	
	var count = 0;
	var m = teamVotes[team].votes;
	for(var id in m){ count++ }
  
  if ((members/2) < count) { 
    console.log('playing ...');
    var votes = [];
    for (var voter in teamVotes[team].votes) {
			votes.push(teamVotes[team].votes[voter]);
    }
    teamPlay(team, votes); // Sean: return from teamPlay success/failure.
    //teamVotes[team].votes = {};
		info = '';
  } else {
    console.log(info = 'not enough votes yet; standing by');
  }
}





